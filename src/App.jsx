import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ═══════════════════════════ THEME ═══════════════════════════ */
const T = {
  bg: "#F4F1EC", card: "#FFFFFF", green: "#1B4332", greenMid: "#2D6A4F",
  greenLight: "#52B788", gold: "#D4A853", goldLight: "#F0CB7A",
  text: "#1A1A1A", muted: "#6B7280", border: "#E2DDD6",
  red: "#C0392B", redLight: "#FDECEA", shadow: "0 2px 12px rgba(27,67,50,0.10)",
};

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans', sans-serif; background: ${T.bg}; color: ${T.text}; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.greenMid}; border-radius: 3px; }
  .syne { font-family: 'Syne', sans-serif; }
  .fade-in { animation: fadeIn .3s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { background: white; }
  }
`;

/* ═══════════════════════════ MOCK DATA ═══════════════════════════ */
const CATS = ["Schaukeln","Rutschen","Klettern","Sandspiel","Wipptiere","Karussell","Balancieren","Spielhäuser","Fallschutz"];
const AGES = ["Kleinkinder (1–3)","Kindergarten (3–6)","Schulkinder (6–12)","Jugendliche (12+)","Altersgemischt"];
const MATS = ["Robinie","Douglasie","KDI","Edelstahl","Pulverbeschichtet","Kombiniert"];
const FLOOR = ["Wiese (gebunden)","EPDM (gebunden)","Fallschutzplatten (gebunden)","Holzschnitzel (lose)","Rundkies (lose)"];
const LOCTYPES = ["Schule","Gemeindeplatz","Wohnüberbauung","Kirche","Restaurant","Schwimmbad","MFH","Privat"];
const ICONS = { Schaukeln:"🏗",Rutschen:"🛝",Klettern:"🧗",Sandspiel:"🏖",Wipptiere:"🐴",Karussell:"🎠",Balancieren:"⚖️",Spielhäuser:"🏠",Fallschutz:"🟩" };
const CAT_COLORS = { Schaukeln:"#3B82F6",Rutschen:"#EF4444",Klettern:"#8B5CF6",Sandspiel:"#F59E0B",Wipptiere:"#10B981",Karussell:"#EC4899",Balancieren:"#6366F1",Spielhäuser:"#D97706",Fallschutz:"#059669" };
const DYNAMIC_CATS = ["Schaukeln","Wipptiere","Karussell","Rutschen"];

const initEquipment = [
  { id:1, name:"Doppelschaukel Robinie",       cat:"Schaukeln",   age:"Schulkinder (6–12)",   mat:"Robinie",           mfr:1, price:2850, fallZone:2.5, size:[3.0,0.8], color:"#3B82F6", icon:"🏗", desc:"Klassische Doppelschaukel, 2 Sitze, Rahmen Robinie" },
  { id:2, name:"Röhrenrutsche 3m",              cat:"Rutschen",    age:"Schulkinder (6–12)",   mat:"Edelstahl",         mfr:2, price:4200, fallZone:2.0, size:[4.0,1.2], color:"#EF4444", icon:"🛝", desc:"Geschlossene Röhrenrutsche 3m, Edelstahlrutschbahn" },
  { id:3, name:"Kletterpyramide Holz",          cat:"Klettern",    age:"Altersgemischt",       mat:"KDI",               mfr:1, price:5600, fallZone:1.5, size:[3.5,3.5], color:"#8B5CF6", icon:"🧗", desc:"Kletterpyramide aus druckimprägniertem Holz, 4m hoch" },
  { id:4, name:"Sandkasten XL",                 cat:"Sandspiel",   age:"Kleinkinder (1–3)",    mat:"Robinie",           mfr:3, price:890,  fallZone:0,   size:[3.0,3.0], color:"#F59E0B", icon:"🏖", desc:"Grosser Sandkasten mit Abdeckung, Sitzkanten Robinie" },
  { id:5, name:"Federwipptier Elefant",         cat:"Wipptiere",   age:"Kleinkinder (1–3)",    mat:"Pulverbeschichtet", mfr:2, price:680,  fallZone:1.5, size:[1.2,0.8], color:"#10B981", icon:"🐴", desc:"Federwipptier Elefant, pulverbeschichtet, Sicherheitsfeder" },
  { id:6, name:"Karussell 2m",                  cat:"Karussell",   age:"Kindergarten (3–6)",   mat:"Edelstahl",         mfr:2, price:3200, fallZone:3.0, size:[2.2,2.2], color:"#EC4899", icon:"🎠", desc:"Drehteller Edelstahl, Ø 2m, Antirutschbelag" },
  { id:7, name:"Balancierbalken-Set",           cat:"Balancieren", age:"Kindergarten (3–6)",   mat:"Robinie",           mfr:3, price:1200, fallZone:1.0, size:[5.0,1.0], color:"#6366F1", icon:"⚖️", desc:"Kombination aus 5 Balancierelementen Robinie" },
  { id:8, name:"Spielhaus Ritterkastell",       cat:"Spielhäuser", age:"Schulkinder (6–12)",   mat:"Douglasie",         mfr:1, price:8900, fallZone:1.5, size:[4.5,4.0], color:"#D97706", icon:"🏠", desc:"Grosses Spielhaus 2-stöckig mit Rutsche und Kletter" },
  { id:9, name:"Wackelbrücke",                  cat:"Balancieren", age:"Schulkinder (6–12)",   mat:"Robinie",           mfr:1, price:1850, fallZone:1.5, size:[3.5,1.2], color:"#6366F1", icon:"⚖️", desc:"Hängebrücke mit Holzdielen und Stahlseilen" },
  { id:10,name:"EPDM Fallschutz (m²)",          cat:"Fallschutz",  age:"Altersgemischt",       mat:"Edelstahl",         mfr:4, price:85,   fallZone:0,   size:[1.0,1.0], color:"#059669", icon:"🟩", desc:"EPDM Fallschutzbelag, diverse Farben, 4cm" },
];

const initManufacturers = [
  { id:1, name:"Berliner Seilfabrik",  country:"DE", contact:"info@bsf.de",       web:"berliner-seilfabrik.de", note:"Premium Seilspielgeräte" },
  { id:2, name:"Lappset Group",        country:"FI", contact:"info@lappset.com",  web:"lappset.com",            note:"Innovative Spielkonzepte" },
  { id:3, name:"Richter Spielgeräte", country:"DE", contact:"info@richter.de",   web:"richter-spielgeraete.de",note:"Klassische Holzgeräte" },
  { id:4, name:"Playparc",             country:"DE", contact:"info@playparc.de",  web:"playparc.de",             note:"Fallschutz & Beläge" },
];

const initProjects = [
  { id:1, name:"Schulhausplatz Kreuzlingen", client:"Stadt Kreuzlingen", status:"Offerte", created:"2026-03-15",
    wizard:{ ages:["Schulkinder (6–12)","Altersgemischt"], users:120, locType:"Schule", mat:"Robinie", floor:"EPDM (gebunden)" },
    area:{ w:20, h:15 }, placed:[ {eqId:1,x:80,y:60,rot:0}, {eqId:3,x:200,y:120,rot:0}, {eqId:6,x:320,y:80,rot:0}, {eqId:7,x:160,y:220,rot:0} ],
    obstacles:[ {type:"tree",x:50,y:180,r:15,label:"Eiche"}, {type:"building",x:380,y:20,w:80,h:40,label:"Schulgebäude"} ] },
];

const initWorkPrices = [
  { id:1, name:"Geräteaufbau (Stunde)",      unit:"h",   price:95  },
  { id:2, name:"Fundamentarbeiten (m³)",      unit:"m³",  price:320 },
  { id:3, name:"Fallschutz verlegen (m²)",    unit:"m²",  price:45  },
  { id:4, name:"Erdarbeiten (m²)",            unit:"m²",  price:28  },
  { id:5, name:"Lieferpauschale",             unit:"pauschal", price:580 },
  { id:6, name:"Projektleitung",              unit:"pauschal", price:850 },
];

/* ═══════════════════════════ HELPERS ═══════════════════════════ */
function fmt(n) { return new Intl.NumberFormat("de-CH",{style:"currency",currency:"CHF"}).format(n); }
function uid() { return Date.now()+Math.random().toString(36).slice(2); }

/* ═══════════════════════════ SMALL COMPONENTS ═══════════════════════════ */
function Badge({color,children}) {
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
}
function Btn({children,onClick,variant="primary",size="md",style={}}) {
  const base = {cursor:"pointer",border:"none",borderRadius:8,fontFamily:"inherit",fontWeight:600,transition:"all .15s",display:"inline-flex",alignItems:"center",gap:6, ...style};
  const v = { primary:{background:T.green,color:"#fff"}, secondary:{background:"transparent",color:T.green,border:`1.5px solid ${T.green}`},
    gold:{background:T.gold,color:"#fff"}, danger:{background:T.red,color:"#fff"}, ghost:{background:"transparent",color:T.muted,border:`1px solid ${T.border}`} };
  const s = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} };
  return <button style={{...base,...v[variant],...s[size]}} onClick={onClick}>{children}</button>;
}
function Card({children,style={}}) {
  return <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:24,...style}}>{children}</div>;
}
function Input({label,value,onChange,type="text",placeholder="",required=false,style={}}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,...style}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>{label}{required&&<span style={{color:T.red}}> *</span>}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,outline:"none"}} />
    </div>
  );
}
function Select({label,value,onChange,options,style={}}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,...style}}>
      {label && <label style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,appearance:"none",cursor:"pointer",outline:"none"}}>
        {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}
function Modal({title,children,onClose,width=560}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.card,borderRadius:16,width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span className="syne" style={{fontWeight:700,fontSize:16}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.muted}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}
function StatusBadge({s}) {
  const m = {Offerte:{c:"#D97706",bg:"#FEF3C7"},Genehmigt:{c:"#059669",bg:"#D1FAE5"},Abgeschlossen:{c:"#1D4ED8",bg:"#DBEAFE"},Entwurf:{c:"#6B7280",bg:"#F3F4F6"}};
  const x = m[s]||m.Entwurf;
  return <span style={{background:x.bg,color:x.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{s}</span>;
}

/* ═══════════════════════════ SIDEBAR ═══════════════════════════ */
function Sidebar({page,setPage,projects,activeProjectId,setActiveProjectId}) {
  const navItems = [
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"catalog",icon:"📦",label:"Gerätekatalog"},
    {id:"manufacturers",icon:"🏭",label:"Hersteller"},
    {id:"workprices",icon:"🔧",label:"Arbeitspreise"},
    {id:"projects",icon:"📁",label:"Projekte"},
  ];
  return (
    <div style={{width:220,background:T.green,color:"#fff",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:100}}>
      <div style={{padding:"24px 20px 16px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div className="syne" style={{fontWeight:800,fontSize:18,letterSpacing:.5}}>🛝 PlayQuote</div>
        <div style={{fontSize:11,opacity:.6,marginTop:2}}>Spielplatz Offerttool</div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"12px 10px"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,opacity:.5,padding:"8px 10px",textTransform:"uppercase"}}>Verwaltung</div>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",border:"none",cursor:"pointer",borderRadius:8,
              background:page===n.id?"rgba(255,255,255,.15)":"transparent",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:page===n.id?600:400,
              transition:"background .15s",textAlign:"left",marginBottom:2}}>
            <span style={{fontSize:15}}>{n.icon}</span>{n.label}
          </button>
        ))}
        {projects.length>0&&<>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,opacity:.5,padding:"16px 10px 6px",textTransform:"uppercase"}}>Aktive Projekte</div>
          {projects.map(p=>(
            <button key={p.id} onClick={()=>{setActiveProjectId(p.id);setPage("planner");}}
              style={{width:"100%",padding:"8px 10px",border:"none",cursor:"pointer",borderRadius:8,
                background:(page==="planner"||page==="quote")&&activeProjectId===p.id?"rgba(255,255,255,.15)":"transparent",
                color:"#fff",fontFamily:"inherit",fontSize:12,fontWeight:400,textAlign:"left",lineHeight:1.3,marginBottom:2}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13}}>📐</span>
                <div><div style={{fontWeight:600,fontSize:12}}>{p.name.length>22?p.name.slice(0,22)+"…":p.name}</div>
                <div style={{opacity:.6,fontSize:10}}>{p.status}</div></div>
              </div>
            </button>
          ))}
        </>}
      </nav>
      <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.1)",fontSize:11,opacity:.4}}>v1.0 · Swiss Edition</div>
    </div>
  );
}

/* ═══════════════════════════ DASHBOARD ═══════════════════════════ */
function Dashboard({equipment,manufacturers,projects,setPage,setActiveProjectId}) {
  const totalVal = projects.reduce((s,p)=>{
    const eq = p.placed?.reduce((a,pl)=>{const e=equipment.find(x=>x.id===pl.eqId);return a+(e?.price||0);},0)||0;
    return s+eq;
  },0);
  const stats = [
    {label:"Projekte",value:projects.length,icon:"📁",color:T.green},
    {label:"Geräte",value:equipment.length,icon:"📦",color:T.gold},
    {label:"Hersteller",value:manufacturers.length,icon:"🏭",color:"#3B82F6"},
    {label:"Offertvolumen",value:fmt(totalVal),icon:"💰",color:"#8B5CF6"},
  ];
  return (
    <div className="fade-in">
      <div className="syne" style={{fontSize:26,fontWeight:800,marginBottom:6}}>Dashboard</div>
      <div style={{color:T.muted,marginBottom:24,fontSize:14}}>Willkommen im Spielplatz Offerttool — Ihre Übersicht</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
        {stats.map(s=>(
          <Card key={s.label} style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontSize:11,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{s.label}</div>
              <div className="syne" style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div></div>
              <span style={{fontSize:28}}>{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:16}}>Aktuelle Projekte</div>
          {projects.length===0?<div style={{color:T.muted,fontSize:13}}>Noch keine Projekte angelegt.</div>:
          projects.map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{p.name}</div>
              <div style={{fontSize:11,color:T.muted}}>{p.client} · {p.created}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <StatusBadge s={p.status}/>
                <Btn size="sm" variant="ghost" onClick={()=>{setActiveProjectId(p.id);setPage("planner");}}>Öffnen</Btn>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:16}}>Kategorien-Übersicht</div>
          {CATS.slice(0,7).map(c=>{
            const count = equipment.filter(e=>e.cat===c).length;
            return (
              <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:16}}>{ICONS[c]}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:600}}>{c}</span>
                    <span style={{fontSize:12,color:T.muted}}>{count} Geräte</span>
                  </div>
                  <div style={{height:5,background:T.border,borderRadius:3}}>
                    <div style={{height:5,background:CAT_COLORS[c],borderRadius:3,width:`${(count/equipment.length)*100}%`}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════ CATALOG ═══════════════════════════ */
function Catalog({equipment,setEquipment,manufacturers}) {
  const [filter,setFilter]=useState({cat:"Alle",search:"",age:"Alle"});
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:"",cat:"Schaukeln",age:"Altersgemischt",mat:"Robinie",mfr:1,price:0,fallZone:1.5,desc:"",size:[2,2]});

  const visible = equipment.filter(e=>{
    if(filter.cat!=="Alle"&&e.cat!==filter.cat) return false;
    if(filter.age!=="Alle"&&e.age!==filter.age) return false;
    if(filter.search&&!e.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  function openEdit(e) { setEditing(e.id); setForm({...e}); setShowForm(true); }
  function openNew() { setEditing(null); setForm({name:"",cat:"Schaukeln",age:"Altersgemischt",mat:"Robinie",mfr:1,price:0,fallZone:1.5,desc:"",size:[2,2]}); setShowForm(true); }
  function save() {
    if(editing) setEquipment(prev=>prev.map(e=>e.id===editing?{...form,id:editing,color:CAT_COLORS[form.cat],icon:ICONS[form.cat]}:e));
    else setEquipment(prev=>[...prev,{...form,id:Date.now(),color:CAT_COLORS[form.cat],icon:ICONS[form.cat]}]);
    setShowForm(false);
  }
  function del(id) { setEquipment(prev=>prev.filter(e=>e.id!==id)); }

  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div className="syne" style={{fontSize:24,fontWeight:800}}>Gerätekatalog</div>
          <div style={{color:T.muted,fontSize:13}}>{equipment.length} Geräte in der Datenbank</div>
        </div>
        <Btn onClick={openNew}>+ Gerät hinzufügen</Btn>
      </div>
      <Card style={{padding:"14px 16px",marginBottom:16}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <input value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} placeholder="🔍 Suchen..."
            style={{flex:1,minWidth:180,padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,outline:"none"}}/>
          <select value={filter.cat} onChange={e=>setFilter(f=>({...f,cat:e.target.value}))}
            style={{padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,cursor:"pointer",outline:"none"}}>
            {["Alle",...CATS].map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={filter.age} onChange={e=>setFilter(f=>({...f,age:e.target.value}))}
            style={{padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,cursor:"pointer",outline:"none"}}>
            {["Alle",...AGES].map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {visible.map(e=>(
          <Card key={e.id} style={{padding:18,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{width:48,height:48,borderRadius:12,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{e.icon}</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>✏️</button>
                <button onClick={()=>del(e.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>🗑️</button>
              </div>
            </div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{e.name}</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:10,lineHeight:1.4}}>{e.desc}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              <Badge color={e.color}>{e.cat}</Badge>
              <Badge color={T.greenMid}>{e.mat}</Badge>
              <Badge color="#6B7280">{e.age}</Badge>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.border}`,paddingTop:10}}>
              <span style={{fontSize:11,color:T.muted}}>Fallzone: {e.fallZone}m · {manufacturers.find(m=>m.id===e.mfr)?.name||"—"}</span>
              <span className="syne" style={{fontWeight:800,color:T.green,fontSize:16}}>{fmt(e.price)}</span>
            </div>
          </Card>
        ))}
      </div>
      {showForm&&(
        <Modal title={editing?"Gerät bearbeiten":"Neues Gerät"} onClose={()=>setShowForm(false)} width={600}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Input label="Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required style={{gridColumn:"1/-1"}}/>
            <Select label="Kategorie" value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))} options={CATS}/>
            <Select label="Altersgruppe" value={form.age} onChange={v=>setForm(f=>({...f,age:v}))} options={AGES}/>
            <Select label="Material" value={form.mat} onChange={v=>setForm(f=>({...f,mat:v}))} options={MATS}/>
            <Select label="Hersteller" value={String(form.mfr)} onChange={v=>setForm(f=>({...f,mfr:Number(v)}))} options={manufacturers.map(m=>({v:String(m.id),l:m.name}))}/>
            <Input label="Preis (CHF)" type="number" value={form.price} onChange={v=>setForm(f=>({...f,price:Number(v)}))}/>
            <Input label="Fallzone Radius (m)" type="number" value={form.fallZone} onChange={v=>setForm(f=>({...f,fallZone:Number(v)}))}/>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5}}>Beschreibung</label>
              <textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} rows={3}
                style={{marginTop:5,width:"100%",padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",resize:"vertical",background:T.bg,outline:"none"}}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:8}}>Bild / CAD-Datei hochladen</label>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",border:`2px dashed ${T.border}`,borderRadius:8,cursor:"pointer",fontSize:13,color:T.muted}}>
                <span style={{fontSize:20}}>📎</span> Datei wählen (JPG, PNG, DXF, OBJ, STL)
                <input type="file" accept=".jpg,.jpeg,.png,.dxf,.obj,.stl,.pdf" style={{display:"none"}}
                  onChange={e=>{if(e.target.files[0])setForm(f=>({...f,_file:e.target.files[0].name}));}}/>
              </label>
              {form._file&&<div style={{marginTop:6,fontSize:12,color:T.greenMid}}>✓ {form._file}</div>}
            </div>
          </div>
          <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:10}}>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Abbrechen</Btn>
            <Btn onClick={save}>Speichern</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════ MANUFACTURERS ═══════════════════════════ */
function Manufacturers({manufacturers,setManufacturers}) {
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",country:"DE",contact:"",web:"",note:""});
  function save(){setManufacturers(p=>[...p,{...form,id:Date.now()}]);setShowForm(false);setForm({name:"",country:"DE",contact:"",web:"",note:""});}
  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Hersteller</div><div style={{color:T.muted,fontSize:13}}>Herstellerverwaltung</div></div>
        <Btn onClick={()=>setShowForm(true)}>+ Hersteller</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
        {manufacturers.map(m=>(
          <Card key={m.id} style={{padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
              <div style={{width:46,height:46,borderRadius:12,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏭</div>
              <div><div style={{fontWeight:700,fontSize:15}}>{m.name}</div>
              <div style={{fontSize:12,color:T.muted}}>{m.country} · {m.web}</div></div>
            </div>
            {m.note&&<div style={{background:T.bg,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.muted,marginBottom:10}}>{m.note}</div>}
            <div style={{fontSize:12,color:T.muted}}>✉️ {m.contact}</div>
          </Card>
        ))}
      </div>
      {showForm&&(
        <Modal title="Neuer Hersteller" onClose={()=>setShowForm(false)}>
          <div style={{display:"grid",gap:12}}>
            <Input label="Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Input label="Land (DE/CH/AT)" value={form.country} onChange={v=>setForm(f=>({...f,country:v}))}/>
              <Input label="Website" value={form.web} onChange={v=>setForm(f=>({...f,web:v}))}/>
            </div>
            <Input label="Kontakt E-Mail" value={form.contact} onChange={v=>setForm(f=>({...f,contact:v}))}/>
            <Input label="Notizen" value={form.note} onChange={v=>setForm(f=>({...f,note:v}))}/>
          </div>
          <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:10}}>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Abbrechen</Btn>
            <Btn onClick={save}>Speichern</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════ WORK PRICES ═══════════════════════════ */
function WorkPrices({workPrices,setWorkPrices}) {
  const [form,setForm]=useState({name:"",unit:"h",price:0});
  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Arbeitspreise</div><div style={{color:T.muted,fontSize:13}}>Montage & Aufbaukosten</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:14}}>Preisliste</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
              {["Leistung","Einheit","Preis",""].map(h=><th key={h} style={{padding:"8px 6px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",color:T.muted}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {workPrices.map(w=>(
                <tr key={w.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"10px 6px",fontWeight:600}}>{w.name}</td>
                  <td style={{padding:"10px 6px",color:T.muted}}>{w.unit}</td>
                  <td style={{padding:"10px 6px"}}><span className="syne" style={{fontWeight:700,color:T.green}}>{fmt(w.price)}</span></td>
                  <td style={{padding:"10px 6px"}}><button onClick={()=>setWorkPrices(p=>p.filter(x=>x.id!==w.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:14}}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:14}}>Neue Position</div>
          <div style={{display:"grid",gap:12}}>
            <Input label="Leistungsbezeichnung" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))}/>
            <Select label="Einheit" value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} options={["h","m²","m³","m","pauschal","Stk"]}/>
            <Input label="Preis (CHF)" type="number" value={form.price} onChange={v=>setForm(f=>({...f,price:Number(v)}))}/>
            <Btn onClick={()=>{if(form.name)setWorkPrices(p=>[...p,{...form,id:Date.now()}]);}}>+ Hinzufügen</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════ PROJECTS LIST ═══════════════════════════ */
function Projects({projects,setProjects,setPage,setActiveProjectId,setWizardMode}) {
  function del(id){setProjects(p=>p.filter(x=>x.id!==id));}
  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Projekte</div><div style={{color:T.muted,fontSize:13}}>{projects.length} Projekte</div></div>
        <Btn onClick={()=>{setWizardMode(true);setPage("wizard");}}>+ Neues Projekt</Btn>
      </div>
      {projects.length===0?
        <Card style={{textAlign:"center",padding:60}}>
          <div style={{fontSize:48,marginBottom:12}}>📁</div>
          <div className="syne" style={{fontWeight:700,fontSize:18,marginBottom:8}}>Noch keine Projekte</div>
          <div style={{color:T.muted,marginBottom:20}}>Erstellen Sie Ihr erstes Spielplatzprojekt</div>
          <Btn onClick={()=>{setWizardMode(true);setPage("wizard");}}>Projekt starten</Btn>
        </Card>:
      <div style={{display:"grid",gap:14}}>
        {projects.map(p=>(
          <Card key={p.id} style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:12,background:T.greenMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🛝</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div className="syne" style={{fontWeight:700,fontSize:16}}>{p.name}</div><StatusBadge s={p.status}/></div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{p.client} · Erstellt: {p.created}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Badge color={T.green}>{p.wizard?.locType}</Badge>
                    <Badge color={T.gold}>{p.wizard?.mat}</Badge>
                    <Badge color="#6B7280">{p.wizard?.floor}</Badge>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn size="sm" variant="secondary" onClick={()=>{setActiveProjectId(p.id);setPage("planner");}}>📐 Planer</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>{setActiveProjectId(p.id);setPage("quote");}}>📄 Offerte</Btn>
                <button onClick={()=>del(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.muted}}>🗑️</button>
              </div>
            </div>
          </Card>
        ))}
      </div>}
    </div>
  );
}

/* ═══════════════════════════ WIZARD ═══════════════════════════ */
function Wizard({projects,setProjects,setPage,setActiveProjectId}) {
  const [step,setStep]=useState(1);
  const [d,setD]=useState({name:"",client:"",address:"",locType:"Schule",ages:[],users:30,mat:"Robinie",floor:"EPDM (gebunden)",areaW:15,areaH:10,budget:0,notes:""});
  const STEPS=[{n:1,l:"Grundangaben"},{n:2,l:"Altersgruppen"},{n:3,l:"Standort"},{n:4,l:"Material & Boden"},{n:5,l:"Abschluss"}];
  function toggleAge(a){setD(x=>({...x,ages:x.ages.includes(a)?x.ages.filter(z=>z!==a):[...x.ages,a]}))}
  function finish(){
    const p={id:Date.now(),name:d.name||"Neuer Spielplatz",client:d.client||"Unbekannt",address:d.address,status:"Entwurf",
      created:new Date().toISOString().slice(0,10),wizard:{locType:d.locType,ages:d.ages,users:d.users,mat:d.mat,floor:d.floor,budget:d.budget,notes:d.notes},
      area:{w:d.areaW,h:d.areaH},placed:[],obstacles:[]};
    setProjects(prev=>[...prev,p]);setActiveProjectId(p.id);setPage("planner");
  }
  const progress=(step-1)/4*100;
  return (
    <div className="fade-in" style={{maxWidth:700,margin:"0 auto"}}>
      <div className="syne" style={{fontSize:24,fontWeight:800,marginBottom:4}}>Neues Projekt</div>
      <div style={{color:T.muted,marginBottom:24,fontSize:13}}>Schritt {step} von 5</div>
      <div style={{background:T.border,borderRadius:10,height:6,marginBottom:28}}>
        <div style={{background:T.green,height:6,borderRadius:10,width:`${progress}%`,transition:"width .3s"}}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:28}}>
        {STEPS.map(s=>(
          <div key={s.n} style={{flex:1,textAlign:"center"}}>
            <div style={{width:28,height:28,borderRadius:"50%",margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,
              background:step>s.n?T.green:step===s.n?T.gold:"transparent",color:step>=s.n?"#fff":T.muted,border:step<s.n?`2px solid ${T.border}`:"none"}}>
              {step>s.n?"✓":s.n}
            </div>
            <div style={{fontSize:10,color:step===s.n?T.green:T.muted,fontWeight:step===s.n?700:400}}>{s.l}</div>
          </div>
        ))}
      </div>
      <Card style={{padding:28}}>
        {step===1&&(
          <div style={{display:"grid",gap:14}}>
            <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:4}}>📋 Projektangaben</div>
            <Input label="Projektname" value={d.name} onChange={v=>setD(x=>({...x,name:v}))} placeholder="z.B. Spielplatz Dorfzentrum Münsingen" required/>
            <Input label="Kunde / Gemeinde" value={d.client} onChange={v=>setD(x=>({...x,client:v}))} placeholder="z.B. Gemeinde Münsingen"/>
            <Input label="Adresse / Ort" value={d.address} onChange={v=>setD(x=>({...x,address:v}))} placeholder="Musterstrasse 1, 3110 Münsingen"/>
          </div>
        )}
        {step===2&&(
          <div>
            <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:16}}>👧 Altersgruppen & Nutzer</div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Welche Altersgruppen sollen angesprochen werden?</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {AGES.map(a=>(
                  <button key={a} onClick={()=>toggleAge(a)} style={{padding:"8px 16px",border:`2px solid ${d.ages.includes(a)?T.green:T.border}`,borderRadius:24,background:d.ages.includes(a)?T.green+"15":"transparent",
                    color:d.ages.includes(a)?T.green:T.text,fontSize:13,fontWeight:d.ages.includes(a)?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{a}</button>
                ))}
              </div>
            </div>
            <Input label="Geschätzte Anzahl Nutzer" type="number" value={d.users} onChange={v=>setD(x=>({...x,users:Number(v)}))}/>
          </div>
        )}
        {step===3&&(
          <div style={{display:"grid",gap:14}}>
            <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:4}}>📍 Standorttyp & Fläche</div>
            <Select label="Standorttyp" value={d.locType} onChange={v=>setD(x=>({...x,locType:v}))} options={LOCTYPES}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Input label="Fläche Breite (m)" type="number" value={d.areaW} onChange={v=>setD(x=>({...x,areaW:Number(v)}))}/>
              <Input label="Fläche Tiefe (m)" type="number" value={d.areaH} onChange={v=>setD(x=>({...x,areaH:Number(v)}))}/>
            </div>
            <Input label="Budgetrahmen (CHF)" type="number" value={d.budget} onChange={v=>setD(x=>({...x,budget:Number(v)}))} placeholder="0 = kein Limit"/>
          </div>
        )}
        {step===4&&(
          <div style={{display:"grid",gap:14}}>
            <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:4}}>🪵 Material & Fallschutz</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Bevorzugtes Material</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {["Robinie","Douglasie","KDI","Edelstahl","Pulverbeschichtet","Kombiniert"].map(m=>(
                  <button key={m} onClick={()=>setD(x=>({...x,mat:m}))} style={{padding:"12px",border:`2px solid ${d.mat===m?T.gold:T.border}`,borderRadius:10,background:d.mat===m?T.gold+"15":"transparent",
                    color:d.mat===m?T.gold:T.text,fontWeight:d.mat===m?700:400,cursor:"pointer",fontFamily:"inherit",fontSize:12,transition:"all .15s",textAlign:"center"}}>
                    {m==="Robinie"||m==="Douglasie"||m==="KDI"?"🪵 ":"⚙️ "}{m}
                  </button>
                ))}
              </div>
            </div>
            <Select label="Fallschutzboden" value={d.floor} onChange={v=>setD(x=>({...x,floor:v}))} options={FLOOR}/>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:6}}>Bemerkungen</label>
              <textarea value={d.notes} onChange={e=>setD(x=>({...x,notes:e.target.value}))} rows={3} placeholder="Besondere Anforderungen, Wünsche..."
                style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",resize:"vertical",background:T.bg,outline:"none"}}/>
            </div>
          </div>
        )}
        {step===5&&(
          <div>
            <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:16}}>✅ Zusammenfassung</div>
            {[["Projekt",d.name||"—"],["Kunde",d.client||"—"],["Standort",d.locType],["Altersgruppen",d.ages.join(", ")||"—"],["Nutzer",d.users],["Material",d.mat],["Fallschutz",d.floor],["Fläche",`${d.areaW} × ${d.areaH} m`],["Budget",d.budget?fmt(d.budget):"Kein Limit"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                <span style={{color:T.muted,fontWeight:600}}>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        <Btn variant="ghost" onClick={()=>step===1?setPage("projects"):setStep(s=>s-1)}>{step===1?"Abbrechen":"← Zurück"}</Btn>
        {step<5?<Btn onClick={()=>setStep(s=>s+1)}>Weiter →</Btn>:<Btn variant="gold" onClick={finish}>🛝 Projekt & Planer starten</Btn>}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 2D PLANNER ═══════════════════════════ */
function Planner({project,equipment,setProjects,setPage,setActiveProjectId}) {
  const canvasRef=useRef(null);
  const [view,setView]=useState("2d");
  const [palette,setPalette]=useState(false);
  const [drag,setDrag]=useState(null);
  const [selected,setSelected]=useState(null);
  const [obstacleMode,setObstacleMode]=useState(null);
  const [conflicts,setConflicts]=useState([]);
  const threeRef=useRef(null);
  const animRef=useRef(null);

  const SCALE=20; // 1m = 20px
  const PAD=40;
  const CW=(project.area.w)*SCALE+PAD*2;
  const CH=(project.area.h)*SCALE+PAD*2;

  const placed=project.placed||[];
  const obstacles=project.obstacles||[];

  function updateProject(fn){
    setProjects(prev=>prev.map(p=>p.id===project.id?fn(p):p));
  }

  // Collision detection
  useEffect(()=>{
    const cs=[];
    const dyns=placed.filter(pl=>{const e=equipment.find(x=>x.id===pl.eqId);return e&&DYNAMIC_CATS.includes(e.cat)&&e.fallZone>0;});
    for(let i=0;i<dyns.length;i++){
      const a=dyns[i]; const ea=equipment.find(x=>x.id===a.eqId);
      for(let j=i+1;j<dyns.length;j++){
        const b=dyns[j]; const eb=equipment.find(x=>x.id===b.eqId);
        const dist=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
        const minDist=(ea.fallZone+eb.fallZone)*SCALE;
        if(dist<minDist) cs.push(a.id+"_"+b.id);
      }
    }
    setConflicts(cs);
  },[placed,equipment]);

  function draw(){
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    ctx.clearRect(0,0,CW,CH);
    // Background
    ctx.fillStyle="#e8f5e9"; ctx.fillRect(0,0,CW,CH);
    // Grid
    ctx.strokeStyle="#c8e6c9"; ctx.lineWidth=.5;
    for(let x=PAD;x<=CW-PAD;x+=SCALE){ctx.beginPath();ctx.moveTo(x,PAD);ctx.lineTo(x,CH-PAD);ctx.stroke();}
    for(let y=PAD;y<=CH-PAD;y+=SCALE){ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(CW-PAD,y);ctx.stroke();}
    // Area border
    ctx.strokeStyle=T.green; ctx.lineWidth=2;
    ctx.strokeRect(PAD,PAD,project.area.w*SCALE,project.area.h*SCALE);
    // Dimensions
    ctx.fillStyle=T.muted; ctx.font="11px IBM Plex Sans";
    ctx.fillText(`${project.area.w}m`,CW/2-10,CH-14);
    ctx.save();ctx.translate(12,CH/2);ctx.rotate(-Math.PI/2);ctx.fillText(`${project.area.h}m`,0,0);ctx.restore();

    // Obstacles
    obstacles.forEach(o=>{
      if(o.type==="tree"){
        ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
        ctx.fillStyle="rgba(34,139,34,.4)";ctx.fill();
        ctx.strokeStyle="#1a6e1a";ctx.lineWidth=1.5;ctx.stroke();
        ctx.fillStyle="#1a6e1a";ctx.font="10px IBM Plex Sans";ctx.fillText("🌳 "+o.label,o.x-16,o.y+o.r+12);
      } else {
        ctx.fillStyle="rgba(120,120,120,.3)";ctx.fillRect(o.x,o.y,o.w,o.h);
        ctx.strokeStyle="#555";ctx.lineWidth=1.5;ctx.strokeRect(o.x,o.y,o.w,o.h);
        ctx.fillStyle="#555";ctx.font="10px IBM Plex Sans";ctx.fillText("🏠 "+o.label,o.x+4,o.y-4);
      }
    });

    // Fall zones
    placed.forEach(pl=>{
      const e=equipment.find(x=>x.id===pl.eqId); if(!e||!e.fallZone||!DYNAMIC_CATS.includes(e.cat)) return;
      const isConflict=conflicts.some(c=>c.includes(pl.id));
      ctx.beginPath();ctx.arc(pl.x,pl.y,e.fallZone*SCALE,0,Math.PI*2);
      ctx.fillStyle=isConflict?"rgba(220,38,38,.15)":"rgba(255,165,0,.12)";ctx.fill();
      ctx.strokeStyle=isConflict?T.red:"#f59e0b";ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);
    });

    // Equipment
    placed.forEach(pl=>{
      const e=equipment.find(x=>x.id===pl.eqId); if(!e) return;
      const w=e.size[0]*SCALE; const h=e.size[1]*SCALE;
      const isSelected=selected===pl.id;
      ctx.fillStyle=e.color+"33";
      ctx.strokeStyle=isSelected?T.gold:e.color;
      ctx.lineWidth=isSelected?2.5:1.5;
      ctx.beginPath();ctx.roundRect(pl.x-w/2,pl.y-h/2,w,h,4);ctx.fill();ctx.stroke();
      ctx.font="bold 18px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle="#000";ctx.fillText(e.icon,pl.x,pl.y);
      ctx.font="bold 9px IBM Plex Sans";ctx.fillStyle=T.text;
      ctx.fillText(e.name.split(" ")[0],pl.x,pl.y+h/2+10);
    });
  }

  useEffect(()=>{draw();},[placed,obstacles,selected,conflicts,equipment]);

  function getCanvasPos(e){
    const rect=canvasRef.current.getBoundingClientRect();
    return{x:e.clientX-rect.left,y:e.clientY-rect.top};
  }
  function onMouseDown(e){
    const {x,y}=getCanvasPos(e);
    const hit=placed.slice().reverse().find(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return false;
      return Math.abs(x-pl.x)<eq.size[0]*SCALE/2+4&&Math.abs(y-pl.y)<eq.size[1]*SCALE/2+4;
    });
    if(hit){setDrag({id:hit.id,ox:x-hit.x,oy:y-hit.y});setSelected(hit.id);}
    else setSelected(null);
  }
  function onMouseMove(e){
    if(!drag) return;
    const {x,y}=getCanvasPos(e);
    const nx=Math.max(PAD,Math.min(CW-PAD,x-drag.ox));
    const ny=Math.max(PAD,Math.min(CH-PAD,y-drag.oy));
    updateProject(p=>({...p,placed:p.placed.map(pl=>pl.id===drag.id?{...pl,x:nx,y:ny}:pl)}));
  }
  function onMouseUp(){setDrag(null);}

  function addEquipment(eq){
    const pl={id:String(uid()),eqId:eq.id,x:CW/2+(Math.random()-0.5)*40,y:CH/2+(Math.random()-0.5)*40,rot:0};
    updateProject(p=>({...p,placed:[...p.placed,pl]}));
    setPalette(false);
  }
  function removeSelected(){
    if(selected){updateProject(p=>({...p,placed:p.placed.filter(pl=>pl.id!==selected)}));setSelected(null);}
  }
  function addObstacle(type){
    if(type==="tree") updateProject(p=>({...p,obstacles:[...p.obstacles,{type:"tree",x:CW/2,y:CH/2,r:15,label:"Baum"}]}));
    else updateProject(p=>({...p,obstacles:[...p.obstacles,{type:"building",x:CW/2-30,y:CH/2-20,w:60,h:40,label:"Gebäude"}]}));
    setObstacleMode(null);
  }
  function aiPlace(){
    const suitable=equipment.filter(e=>project.wizard?.ages?.some(a=>e.age===a||e.age==="Altersgemischt")).slice(0,5);
    const cols=Math.ceil(Math.sqrt(suitable.length));
    const newPlaced=suitable.map((eq,i)=>{
      const col=i%cols; const row=Math.floor(i/cols);
      const x=PAD+col*(project.area.w*SCALE/cols)+(project.area.w*SCALE/cols)/2;
      const y=PAD+row*(project.area.h*SCALE/Math.ceil(suitable.length/cols))+(project.area.h*SCALE/Math.ceil(suitable.length/cols))/2;
      return{id:String(uid()),eqId:eq.id,x,y,rot:0};
    });
    updateProject(p=>({...p,placed:newPlaced}));
  }

  // Three.js 3D view
  useEffect(()=>{
    if(view!=="3d"||!threeRef.current) return;
    const W=threeRef.current.clientWidth||600;
    const H=threeRef.current.clientHeight||400;
    const scene=new THREE.Scene();
    scene.background=new THREE.Color("#87CEEB");
    const camera=new THREE.PerspectiveCamera(50,W/H,.1,1000);
    camera.position.set(12,14,18);camera.lookAt(6,0,6);
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H);renderer.shadowMap.enabled=true;
    threeRef.current.innerHTML="";threeRef.current.appendChild(renderer.domElement);
    // Lights
    scene.add(new THREE.AmbientLight(0xffffff,.6));
    const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(10,20,10);sun.castShadow=true;scene.add(sun);
    // Ground
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(project.area.w,project.area.h),new THREE.MeshLambertMaterial({color:0x7ec850}));
    ground.rotation.x=-Math.PI/2;ground.position.set(project.area.w/2,0,project.area.h/2);ground.receiveShadow=true;scene.add(ground);
    // Border fence
    const fenceMat=new THREE.MeshLambertMaterial({color:0x8B4513});
    [[0,0,project.area.w,0.1],[0,0,0.1,project.area.h],[project.area.w,0,0.1,project.area.h],[0,project.area.h,project.area.w,0.1]].forEach(([x,z,w,d])=>{
      const f=new THREE.Mesh(new THREE.BoxGeometry(w,.6,d),fenceMat);f.position.set(x+w/2,.3,z+d/2);scene.add(f);
    });
    // Equipment
    const COL_MAP={Schaukeln:0x3B82F6,Rutschen:0xEF4444,Klettern:0x8B5CF6,Sandspiel:0xF59E0B,Wipptiere:0x10B981,Karussell:0xEC4899,Balancieren:0x6366F1,Spielhäuser:0xD97706,Fallschutz:0x059669};
    placed.forEach(pl=>{
      const e=equipment.find(x=>x.id===pl.eqId); if(!e) return;
      const rx=(pl.x-PAD)/SCALE; const rz=(pl.y-PAD)/SCALE;
      const col=COL_MAP[e.cat]||0x888888;
      const mat=new THREE.MeshLambertMaterial({color:col});
      let mesh;
      if(e.cat==="Schaukeln"){
        const g=new THREE.Group();
        [[-0.8,0],[0.8,0]].forEach(([ox])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.5),mat);p.position.set(ox,1.25,0);g.add(p);});
        const top=new THREE.Mesh(new THREE.BoxGeometry(1.8,.1,.1),mat);top.position.set(0,2.5,0);g.add(top);
        const seat=new THREE.Mesh(new THREE.BoxGeometry(.4,.08,.3),new THREE.MeshLambertMaterial({color:0xF59E0B}));seat.position.set(0,1,.0);g.add(seat);
        g.position.set(rx,0,rz);scene.add(g);mesh=g;
      } else if(e.cat==="Rutschen"){
        const g=new THREE.Group();
        const tower=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),mat);tower.position.set(0,1,0);g.add(tower);
        const slide=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,2),new THREE.MeshLambertMaterial({color:0xC0C0C0}));
        slide.position.set(0,1,-1.2);slide.rotation.x=-.5;g.add(slide);
        g.position.set(rx,0,rz);scene.add(g);mesh=g;
      } else if(e.cat==="Klettern"){
        const g=new THREE.Group();
        for(let i=0;i<4;i++){for(let j=0;j<4;j++){
          const bar=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.8),mat);
          bar.position.set(i*.8-.8+.4,j*.8+.4,i*.8-.8+.4);scene.add(bar);g.add(bar);
        }}
        g.position.set(rx,0,rz);scene.add(g);mesh=g;
      } else {
        const h=(e.cat==="Spielhäuser")?2.5:(e.cat==="Sandspiel")?.3:1.2;
        mesh=new THREE.Mesh(new THREE.BoxGeometry(e.size[0]*.8,h,e.size[1]*.8),mat);
        mesh.position.set(rx,h/2,rz);scene.add(mesh);
      }
    });
    // Trees
    obstacles.filter(o=>o.type==="tree").forEach(o=>{
      const rx=(o.x-PAD)/SCALE; const rz=(o.y-PAD)/SCALE;
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.2,1.2),new THREE.MeshLambertMaterial({color:0x8B4513}));
      trunk.position.set(rx,.6,rz);scene.add(trunk);
      const crown=new THREE.Mesh(new THREE.SphereGeometry(1,8,8),new THREE.MeshLambertMaterial({color:0x228B22}));
      crown.position.set(rx,2,rz);scene.add(crown);
    });
    let angle=0;
    function animate(){animRef.current=requestAnimationFrame(animate);angle+=.005;camera.position.x=Math.cos(angle)*22+project.area.w/2;camera.position.z=Math.sin(angle)*22+project.area.h/2;camera.position.y=14;camera.lookAt(project.area.w/2,0,project.area.h/2);renderer.render(scene,camera);}
    animate();
    return()=>{cancelAnimationFrame(animRef.current);renderer.dispose();};
  },[view,placed,obstacles,equipment,project.area]);

  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div className="syne" style={{fontSize:22,fontWeight:800}}>{project.name}</div>
          <div style={{color:T.muted,fontSize:13}}>{project.wizard?.locType} · {project.area.w}×{project.area.h}m · {placed.length} Geräte platziert</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,display:"flex",overflow:"hidden"}}>
            {["2d","3d"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"8px 18px",border:"none",background:view===v?T.green:"transparent",color:view===v?"#fff":T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,textTransform:"uppercase"}}>{v}</button>)}
          </div>
          <Btn size="sm" variant="secondary" onClick={aiPlace}>🤖 KI-Platzierung</Btn>
          <Btn size="sm" onClick={()=>setPalette(true)}>+ Gerät</Btn>
          {selected&&<Btn size="sm" variant="danger" onClick={removeSelected}>🗑 Entfernen</Btn>}
          <Btn size="sm" variant="ghost" onClick={()=>addObstacle("tree")}>🌳 Baum</Btn>
          <Btn size="sm" variant="ghost" onClick={()=>addObstacle("building")}>🏠 Gebäude</Btn>
          <Btn size="sm" variant="gold" onClick={()=>setPage("quote")}>📄 Offerte</Btn>
        </div>
      </div>
      {conflicts.length>0&&(
        <div style={{background:T.redLight,border:`1px solid ${T.red}`,borderRadius:8,padding:"10px 16px",marginBottom:12,fontSize:13,color:T.red,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontWeight:700}}>⚠️ Fallraumkonflikte!</span> {conflicts.length} Überschneidung(en) erkannt — bitte Geräte verschieben
        </div>
      )}
      <div style={{display:"flex",gap:16}}>
        <div style={{flex:1}}>
          {view==="2d"&&(
            <Card style={{padding:12,overflowAuto:"auto"}}>
              <canvas ref={canvasRef} width={CW} height={CH}
                style={{display:"block",cursor:drag?"grabbing":"default",borderRadius:8,maxWidth:"100%"}}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}/>
              <div style={{marginTop:8,display:"flex",gap:16,fontSize:11,color:T.muted,flexWrap:"wrap"}}>
                <span>🟡 Fallbereich (dynamisch)</span><span style={{color:T.red}}>🔴 Konflikt</span><span>🌳 Baum/Hindernis</span><span>Ziehen zum Verschieben</span>
              </div>
            </Card>
          )}
          {view==="3d"&&(
            <Card style={{padding:12}}>
              <div ref={threeRef} style={{width:"100%",height:500,borderRadius:8,overflow:"hidden",background:"#87CEEB"}}/>
              <div style={{marginTop:8,fontSize:11,color:T.muted}}>3D-Ansicht dreht sich automatisch · KI-generierte Geräteplatzierung</div>
            </Card>
          )}
        </div>
        <div style={{width:220}}>
          <Card style={{padding:14}}>
            <div className="syne" style={{fontWeight:700,marginBottom:12,fontSize:13}}>Platzierte Geräte ({placed.length})</div>
            {placed.length===0?<div style={{fontSize:12,color:T.muted}}>Noch keine Geräte. Klicke «+ Gerät» oder nutze die KI-Platzierung.</div>:
            placed.map(pl=>{const e=equipment.find(x=>x.id===pl.eqId);if(!e)return null;return(
              <div key={pl.id} onClick={()=>setSelected(pl.id)} style={{padding:"8px 10px",borderRadius:8,marginBottom:6,cursor:"pointer",border:`1.5px solid ${selected===pl.id?T.gold:T.border}`,background:selected===pl.id?T.gold+"10":"transparent",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{e.icon}</span>
                <div><div style={{fontSize:11,fontWeight:600,lineHeight:1.2}}>{e.name}</div>
                <div style={{fontSize:10,color:T.muted}}>{fmt(e.price)}</div></div>
              </div>
            );})}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:10,paddingTop:10}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Geräte Total</div>
              <div className="syne" style={{fontWeight:800,fontSize:18,color:T.green}}>
                {fmt(placed.reduce((s,pl)=>{const e=equipment.find(x=>x.id===pl.eqId);return s+(e?.price||0);},0))}
              </div>
            </div>
          </Card>
        </div>
      </div>
      {palette&&(
        <Modal title="Gerät hinzufügen" onClose={()=>setPalette(false)} width={700}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,maxHeight:400,overflowY:"auto"}}>
            {equipment.map(e=>(
              <button key={e.id} onClick={()=>addEquipment(e)} style={{padding:14,border:`1.5px solid ${T.border}`,borderRadius:10,cursor:"pointer",background:"white",textAlign:"left",fontFamily:"inherit",transition:"all .15s"}}
                onMouseEnter={ev=>ev.currentTarget.style.borderColor=T.green} onMouseLeave={ev=>ev.currentTarget.style.borderColor=T.border}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:20}}>{e.icon}</span><span style={{fontWeight:700,fontSize:12}}>{e.name}</span>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                  <Badge color={e.color}>{e.cat}</Badge>
                  <Badge color={T.gold}>{e.mat}</Badge>
                </div>
                <div className="syne" style={{fontWeight:800,color:T.green,fontSize:14}}>{fmt(e.price)}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════ QUOTE ═══════════════════════════ */
function Quote({project,equipment,manufacturers,workPrices}) {
  const placed=project.placed||[];
  const eqItems=placed.map(pl=>{const e=equipment.find(x=>x.id===pl.eqId);return e?{...e,placedId:pl.id}:null;}).filter(Boolean);
  const eqTotal=eqItems.reduce((s,e)=>s+e.price,0);
  const floorArea=project.area.w*project.area.h;
  const workItems=[
    {name:"Lieferpauschale",unit:"pauschal",qty:1,price:workPrices.find(w=>w.name.includes("Liefer"))?.price||580},
    {name:"Geräteaufbau (geschätzt)",unit:"h",qty:Math.ceil(placed.length*3),price:workPrices.find(w=>w.name.includes("Aufbau"))?.price||95},
    {name:"Fundamente",unit:"Stk",qty:placed.length,price:workPrices.find(w=>w.name.includes("Fundam"))?.price||320},
    {name:"Fallschutzbelag "+project.wizard?.floor,unit:"m²",qty:floorArea,price:45},
    {name:"Projektleitung",unit:"pauschal",qty:1,price:workPrices.find(w=>w.name.includes("Projekt"))?.price||850},
  ];
  const workTotal=workItems.reduce((s,w)=>s+w.qty*w.price,0);
  const subtotal=eqTotal+workTotal;
  const vat=subtotal*.081;
  const total=subtotal+vat;
  const today=new Date().toLocaleDateString("de-CH",{year:"numeric",month:"long",day:"numeric"});
  const validTil=new Date(Date.now()+60*86400000).toLocaleDateString("de-CH",{year:"numeric",month:"long",day:"numeric"});
  return (
    <div className="fade-in">
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Offerte</div><div style={{color:T.muted,fontSize:13}}>Drucken oder als PDF speichern</div></div>
        <Btn variant="gold" onClick={()=>window.print()}>🖨️ Drucken / PDF</Btn>
      </div>
      <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 4px 30px rgba(0,0,0,.1)",maxWidth:860,margin:"0 auto"}}>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg, ${T.green} 0%, ${T.greenMid} 100%)`,color:"white",padding:"32px 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div className="syne" style={{fontSize:28,fontWeight:800,letterSpacing:.5}}>🛝 PlayQuote</div>
              <div style={{opacity:.7,fontSize:13,marginTop:2}}>Spielplatz Offerte</div>
            </div>
            <div style={{textAlign:"right",opacity:.9}}>
              <div style={{fontSize:12}}>Offertnummer: OFR-{String(project.id).slice(-6)}</div>
              <div style={{fontSize:12}}>Datum: {today}</div>
              <div style={{fontSize:12}}>Gültig bis: {validTil}</div>
            </div>
          </div>
          <div style={{marginTop:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:"rgba(255,255,255,.12)",borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,opacity:.7,marginBottom:6,textTransform:"uppercase"}}>Projekt</div>
              <div style={{fontWeight:700,fontSize:16}}>{project.name}</div>
              <div style={{opacity:.8,fontSize:13,marginTop:2}}>{project.address||"—"}</div>
            </div>
            <div style={{background:"rgba(255,255,255,.12)",borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,opacity:.7,marginBottom:6,textTransform:"uppercase"}}>Auftraggeber</div>
              <div style={{fontWeight:700,fontSize:16}}>{project.client}</div>
              <div style={{opacity:.8,fontSize:13,marginTop:2}}>{project.wizard?.locType}</div>
            </div>
          </div>
        </div>
        {/* Project details */}
        <div style={{padding:"24px 40px",borderBottom:`1px solid ${T.border}`,background:"#F8FDF9"}}>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Fläche",`${project.area.w}×${project.area.h} m (${floorArea} m²)`],["Altersgruppen",(project.wizard?.ages||[]).join(", ")||"—"],["Material",project.wizard?.mat],["Fallschutz",project.wizard?.floor]].map(([k,v])=>(
              <div key={k} style={{minWidth:140}}>
                <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Equipment */}
        <div style={{padding:"24px 40px"}}>
          <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:14,color:T.green}}>🛝 Spielgeräte</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.bg}}>
                {["Pos","Gerät","Kategorie","Material","Hersteller","Preis CHF"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:h==="Preis CHF"?"right":"left",fontSize:11,fontWeight:700,textTransform:"uppercase",color:T.muted,letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eqItems.map((e,i)=>(
                <tr key={e.placedId} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"12px",color:T.muted,fontSize:12}}>{i+1}</td>
                  <td style={{padding:"12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:8,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{e.icon}</div>
                      <div><div style={{fontWeight:600}}>{e.name}</div><div style={{fontSize:11,color:T.muted}}>{e.desc?.slice(0,60)}…</div></div>
                    </div>
                  </td>
                  <td style={{padding:"12px"}}><Badge color={e.color}>{e.cat}</Badge></td>
                  <td style={{padding:"12px",color:T.muted,fontSize:12}}>{e.mat}</td>
                  <td style={{padding:"12px",color:T.muted,fontSize:12}}>{manufacturers.find(m=>m.id===e.mfr)?.name||"—"}</td>
                  <td style={{padding:"12px",textAlign:"right"}}><span className="syne" style={{fontWeight:700}}>{fmt(e.price)}</span></td>
                </tr>
              ))}
              <tr style={{background:"#F8FDF9"}}>
                <td colSpan={5} style={{padding:"12px",fontWeight:700,color:T.green}}>Geräte-Zwischentotal</td>
                <td style={{padding:"12px",textAlign:"right"}}><span className="syne" style={{fontWeight:800,color:T.green,fontSize:16}}>{fmt(eqTotal)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Work */}
        <div style={{padding:"0 40px 24px"}}>
          <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:14,color:T.green}}>🔧 Montage & Aufbau</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.bg}}>
                {["Pos","Leistung","Einheit","Menge","Einheitspreis","Total CHF"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:["Menge","Einheitspreis","Total CHF"].includes(h)?"right":"left",fontSize:11,fontWeight:700,textTransform:"uppercase",color:T.muted,letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workItems.map((w,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"10px 12px",color:T.muted,fontSize:12}}>{i+1}</td>
                  <td style={{padding:"10px 12px",fontWeight:600}}>{w.name}</td>
                  <td style={{padding:"10px 12px",color:T.muted}}>{w.unit}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",color:T.muted}}>{w.qty}</td>
                  <td style={{padding:"10px 12px",textAlign:"right",color:T.muted}}>{fmt(w.price)}</td>
                  <td style={{padding:"10px 12px",textAlign:"right"}}><span className="syne" style={{fontWeight:700}}>{fmt(w.qty*w.price)}</span></td>
                </tr>
              ))}
              <tr style={{background:"#F8FDF9"}}>
                <td colSpan={5} style={{padding:"12px",fontWeight:700,color:T.green}}>Montage-Zwischentotal</td>
                <td style={{padding:"12px",textAlign:"right"}}><span className="syne" style={{fontWeight:800,color:T.green,fontSize:16}}>{fmt(workTotal)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div style={{padding:"0 40px 32px"}}>
          <div style={{background:`linear-gradient(135deg, #F8FDF9, #EBF7EF)`,borderRadius:12,padding:"20px 24px",border:`1px solid ${T.greenLight}30`}}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <div style={{width:300}}>
                {[["Zwischentotal",fmt(subtotal)],["MWST 8.1%",fmt(vat)]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                    <span style={{color:T.muted}}>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",alignItems:"center"}}>
                  <span className="syne" style={{fontWeight:800,fontSize:16}}>TOTAL CHF</span>
                  <span className="syne" style={{fontWeight:800,fontSize:24,color:T.green}}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Notes */}
        {project.wizard?.notes&&(
          <div style={{padding:"0 40px 24px"}}>
            <div style={{background:T.bg,borderRadius:10,padding:"14px 18px",fontSize:13}}>
              <div style={{fontWeight:700,marginBottom:4,fontSize:12,textTransform:"uppercase",letterSpacing:.5,color:T.muted}}>Bemerkungen</div>
              {project.wizard.notes}
            </div>
          </div>
        )}
        {/* Footer */}
        <div style={{background:T.bg,padding:"20px 40px",borderTop:`1px solid ${T.border}`,fontSize:11,color:T.muted,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div>Preise exkl. MWST · Alle Geräte nach EN 1176/1177 · Lieferung ab Werk<br/>Diese Offerte ist {60} Tage gültig ab Ausstellungsdatum.</div>
          <div style={{textAlign:"right"}}>PlayQuote GmbH · info@playquote.ch<br/>www.playquote.ch · CHE-123.456.789</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ MAIN APP ═══════════════════════════ */
export default function App() {
  const [page,setPage]=useState("dashboard");
  const [equipment,setEquipment]=useState(initEquipment);
  const [manufacturers,setManufacturers]=useState(initManufacturers);
  const [projects,setProjects]=useState(initProjects);
  const [workPrices,setWorkPrices]=useState(initWorkPrices);
  const [activeProjectId,setActiveProjectId]=useState(initProjects[0]?.id||null);
  const [wizardMode]=useState(false);

  const activeProject=projects.find(p=>p.id===activeProjectId);

  useEffect(()=>{
    const s=document.createElement("style");s.textContent=G;document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  function renderPage(){
    switch(page){
      case"dashboard": return <Dashboard equipment={equipment} manufacturers={manufacturers} projects={projects} setPage={setPage} setActiveProjectId={setActiveProjectId}/>;
      case"catalog": return <Catalog equipment={equipment} setEquipment={setEquipment} manufacturers={manufacturers}/>;
      case"manufacturers": return <Manufacturers manufacturers={manufacturers} setManufacturers={setManufacturers}/>;
      case"workprices": return <WorkPrices workPrices={workPrices} setWorkPrices={setWorkPrices}/>;
      case"projects": return <Projects projects={projects} setProjects={setProjects} setPage={setPage} setActiveProjectId={setActiveProjectId} setWizardMode={()=>{}}/>;
      case"wizard": return <Wizard projects={projects} setProjects={setProjects} setPage={setPage} setActiveProjectId={setActiveProjectId}/>;
      case"planner": return activeProject?<Planner project={activeProject} equipment={equipment} setProjects={setProjects} setPage={setPage} setActiveProjectId={setActiveProjectId}/>:
        <div style={{textAlign:"center",padding:60}}><div style={{fontSize:48}}>📁</div><div className="syne" style={{fontWeight:700,fontSize:18,marginTop:12}}>Kein Projekt ausgewählt</div><div style={{color:T.muted,marginTop:8}}>Wähle ein Projekt aus der Seitenleiste</div></div>;
      case"quote": return activeProject?<Quote project={activeProject} equipment={equipment} manufacturers={manufacturers} workPrices={workPrices}/>:null;
      default: return null;
    }
  }

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"IBM Plex Sans, sans-serif"}}>
      <Sidebar page={page} setPage={setPage} projects={projects} activeProjectId={activeProjectId} setActiveProjectId={setActiveProjectId}/>
      <main style={{marginLeft:220,flex:1,padding:"32px 32px",minHeight:"100vh",maxWidth:"calc(100vw - 220px)"}}>
        {renderPage()}
      </main>
    </div>
  );
}
