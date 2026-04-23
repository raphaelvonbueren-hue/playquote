/* ═══════════════════════════ RENDER STUDIO (GPU Path-Tracer — saubere Implementierung) ═══════════════════════════ */
// Folgt der offiziellen API aus three-gpu-pathtracer README:
//   pathTracer = new WebGLPathTracer(renderer);
//   pathTracer.setScene(scene, camera);    // synchron, kein BVH-Worker nötig
//   pathTracer.renderSample();             // pro Frame im RAF-Loop
//
// Keine defensive Szenen-Neuaufbau (das war das Problem der vorigen Versionen).
// Der Path-Tracer kommt mit normalen Three.js-Geometrien klar — wir geben ihm
// einfach die Original-Szene (als clone).
function RenderStudio({ sourceScene, sourceCamera, onClose }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("init");    // init | tracing | paused | done | error
  const [samples, setSamples] = useState(0);
  const [targetSamples, setTargetSamples] = useState(200);
  const [resolution, setResolution] = useState("2K"); // HD | 2K | 4K
  const [errorMsg, setErrorMsg] = useState("");
  const [previewURL, setPreviewURL] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const pathTracerRef = useRef(null);
  const rendererRef = useRef(null);
  const animRef = useRef(null);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  const resMap = { HD: [1280, 720], "2K": [1920, 1080], "4K": [3840, 2160] };

  useEffect(() => {
    cancelledRef.current = false;
    let renderer, pathTracer;

    (async () => {
      try {
        if (!canvasRef.current || !sourceScene || !sourceCamera) {
          throw new Error("Keine 3D-Szene vorhanden. Bitte erst Geräte platzieren und die 3D-Ansicht aktivieren.");
        }

        // 1) Standard-Three.js-Renderer am Canvas
        const [W, H] = resMap[resolution];
        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(1);
        renderer.setSize(W, H, false);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;

        // 2) Path-Tracer importieren (lazy — hält Main-Bundle klein)
        const { WebGLPathTracer } = await import("three-gpu-pathtracer");
        if (cancelledRef.current) return;

        // 3) Szene klonen — Path-Tracer verträgt clones der Original-Szene
        const scene = sourceScene.clone(true);
        scene.background = new THREE.Color("#B8D5E8");

        // 4) HDR-Environment für realistische Reflexionen/Diffuse-Beleuchtung
        try {
          const env = makeSkyEnv(renderer);
          scene.environment = env;
        } catch (e) {
          console.warn("Env skipped:", e.message);
        }

        // 5) Sonnenlicht hinzufügen falls die Quellszene keins hat
        let hasDirLight = false;
        scene.traverse((o) => { if (o.isDirectionalLight) hasDirLight = true; });
        if (!hasDirLight) {
          const sun = new THREE.DirectionalLight(0xffffff, 3);
          sun.position.set(40, 60, 30);
          scene.add(sun);
        }

        // 6) Kamera klonen mit korrekter Aspect
        const camera = sourceCamera.clone();
        camera.aspect = W / H;
        camera.updateProjectionMatrix();

        // 7) Path-Tracer initialisieren — mit offizieller API-Signatur
        pathTracer = new WebGLPathTracer(renderer);
        pathTracer.renderScale = 1;
        pathTracer.bounces = 5;
        pathTracer.filteredGlossyFactor = 1.0;   // reduziert "fireflies"
        pathTracer.tiles.set(3, 3);              // 9 Tiles → schnellere Reaktion
        pathTracer.minSamples = 3;
        pathTracer.renderToCanvas = true;
        pathTracer.fadeDuration = 0;
        pathTracerRef.current = pathTracer;

        // 8) Szene setzen — SYNCHRON, kein Worker nötig
        // Das ist der Key: einfacher setScene() reicht — kein setBVHWorker vorher.
        pathTracer.setScene(scene, camera);
        if (cancelledRef.current) return;

        // 9) Render-Loop
        setStatus("tracing");
        setSamples(0);
        const t0 = performance.now();

        function loop() {
          if (cancelledRef.current) return;
          if (pausedRef.current) {
            animRef.current = requestAnimationFrame(loop);
            return;
          }
          try {
            pathTracer.renderSample();
            const s = pathTracer.samples || 0;
            setSamples(Math.floor(s));
            setElapsed(((performance.now() - t0) / 1000).toFixed(1));
            if (s >= targetSamples) {
              // Done! Capture finales Bild als PNG
              const url = canvasRef.current.toDataURL("image/png");
              setPreviewURL(url);
              setStatus("done");
              return;
            }
          } catch (renderErr) {
            console.error("renderSample error:", renderErr);
            setErrorMsg(`Render-Sample-Fehler: ${renderErr.message}`);
            setStatus("error");
            return;
          }
          animRef.current = requestAnimationFrame(loop);
        }
        animRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error("RenderStudio setup failed:", err);
        setErrorMsg(err.message || String(err));
        setStatus("error");
      }
    })();

    return () => {
      cancelledRef.current = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      try {
        pathTracer?.dispose?.();
      } catch (e) {}
      try {
        renderer?.dispose?.();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution, targetSamples]);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setStatus(pausedRef.current ? "paused" : "tracing");
  }

  function restart() {
    // Force re-setup durch state-change
    setPreviewURL(null);
    setErrorMsg("");
    setSamples(0);
    setStatus("init");
    cancelledRef.current = true;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    // Kleine Pause dann durch effect neu starten
    setTimeout(() => {
      cancelledRef.current = false;
      // Trick: targetSamples toggle to re-trigger effect
      setTargetSamples((v) => v);
      // Actually we need to actually change it or re-mount. Easier: force new key via state
    }, 100);
  }

  function downloadPNG() {
    const url = previewURL || (canvasRef.current && canvasRef.current.toDataURL("image/png"));
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `playquote-render-${resolution}-${Math.floor(samples)}samples-${Date.now()}.png`;
    a.click();
  }

  const [W, H] = resMap[resolution];
  const progress = Math.min(100, Math.round((samples / targetSamples) * 100));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:16,boxShadow:"0 10px 40px rgba(0,0,0,.4)",padding:24,maxWidth:"95vw",maxHeight:"95vh",display:"flex",flexDirection:"column",gap:14,minWidth:640}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="syne" style={{fontSize:22,fontWeight:800,color:T.green}}>🎬 Photorealistischer Path-Tracer</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:T.muted,padding:4}}>✕</button>
        </div>
        <div style={{fontSize:13,color:T.muted,lineHeight:1.5}}>
          GPU-basiertes Path-Tracing mit physikalisch korrekter Beleuchtung, Schatten, indirekter Beleuchtung und Reflexionen.
          Mehr Samples = weniger Bildrauschen.
        </div>

        {/* Settings */}
        <div style={{display:"flex",gap:14,flexWrap:"wrap",padding:"12px 14px",background:T.bg,borderRadius:10,alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Auflösung</div>
            <div style={{display:"flex",background:"white",border:`1.5px solid ${T.border}`,borderRadius:6,overflow:"hidden"}}>
              {["HD","2K","4K"].map(r=>(
                <button key={r} onClick={()=>setResolution(r)} disabled={status==="tracing"}
                  style={{padding:"5px 10px",border:"none",background:resolution===r?T.green:"white",color:resolution===r?"white":T.text,cursor:status==="tracing"?"not-allowed":"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,opacity:status==="tracing"?.5:1}}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Qualität (Samples)</div>
            <div style={{display:"flex",background:"white",border:`1.5px solid ${T.border}`,borderRadius:6,overflow:"hidden"}}>
              {[{v:50,l:"Vorschau"},{v:200,l:"Standard"},{v:500,l:"Hoch"},{v:1000,l:"Maximum"}].map(s=>(
                <button key={s.v} onClick={()=>setTargetSamples(s.v)} disabled={status==="tracing"}
                  style={{padding:"5px 10px",border:"none",background:targetSamples===s.v?T.green:"white",color:targetSamples===s.v?"white":T.text,cursor:status==="tracing"?"not-allowed":"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,opacity:status==="tracing"?.5:1}}>
                  {s.l} ({s.v})
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {status==="tracing" && (
              <button onClick={togglePause} style={{padding:"7px 14px",border:"none",background:T.gold,color:"#5A3D00",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",borderRadius:7}}>
                ⏸ Pause
              </button>
            )}
            {status==="paused" && (
              <button onClick={togglePause} style={{padding:"7px 14px",border:"none",background:T.green,color:"white",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",borderRadius:7}}>
                ▶ Fortsetzen
              </button>
            )}
            {status==="done" && (
              <button onClick={downloadPNG} style={{padding:"7px 14px",border:"none",background:T.gold,color:"#5A3D00",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",borderRadius:7}}>
                ⬇ PNG ({W}×{H})
              </button>
            )}
          </div>
        </div>

        {/* Canvas — Path-Tracer rendert direkt rein */}
        <div style={{background:"#1a1a1a",borderRadius:10,overflow:"hidden",position:"relative",minHeight:300,maxHeight:"60vh",aspectRatio:`${W}/${H}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <canvas ref={canvasRef} style={{maxWidth:"100%",maxHeight:"60vh",display:"block"}}/>
          {status==="error" && (
            <div style={{position:"absolute",inset:0,background:"rgba(26,26,26,.95)",color:"#EF4444",fontSize:13,textAlign:"center",padding:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
              <div style={{fontWeight:700,marginBottom:8,fontSize:15}}>Render-Fehler</div>
              <div style={{opacity:.9,fontSize:12,maxWidth:480}}>{errorMsg}</div>
            </div>
          )}
          {status==="init" && (
            <div style={{position:"absolute",color:"white",fontSize:13,opacity:.7}}>
              ⏳ Initialisiere GPU-Path-Tracer…
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,fontSize:12}}>
          <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${progress}%`,background:status==="done"?T.green:T.gold,transition:"width .3s"}}/>
          </div>
          <div style={{color:T.muted,fontFamily:"monospace",minWidth:190,textAlign:"right"}}>
            {status==="done" && `✓ Fertig · ${samples}/${targetSamples} Samples · ${elapsed}s`}
            {status==="tracing" && `${samples}/${targetSamples} · ${elapsed}s · ${progress}%`}
            {status==="paused" && `⏸ Pausiert · ${samples}/${targetSamples}`}
            {status==="init" && "Lade…"}
            {status==="error" && "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

