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
const ICONS = { Schaukeln:"🪢",Rutschen:"🛝",Klettern:"🧗",Sandspiel:"🏖",Wipptiere:"🐴",Karussell:"🎠",Balancieren:"⚖️",Spielhäuser:"🏠",Fallschutz:"🟩" };
// Inline-SVG icons rendered inside Leaflet markers (crisp & scalable, always white on colored bg)
const SVG_ICONS = {
  Schaukeln: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4 L12 12 L20 4"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="9" y1="17" x2="9" y2="20"/><line x1="15" y1="17" x2="15" y2="20"/></svg>`,
  Rutschen: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1"/><path d="M6 9 L20 20"/><line x1="18" y1="17" x2="22" y2="20"/></svg>`,
  Karussell: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="2"/></svg>`,
  Klettern: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18"/><line x1="5" y1="8" x2="19" y2="8"/><line x1="5" y1="13" x2="19" y2="13"/><line x1="5" y1="18" x2="19" y2="18"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  Wipptiere: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L21 12"/><path d="M6 18 L6 12"/><circle cx="18" cy="9" r="2.5" fill="white"/></svg>`,
  Balancieren: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><path d="M8 12 L10 18 L14 18 L16 12"/></svg>`,
  Sandspiel: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="10" rx="1"/><path d="M7 10 C8 7 10 6 12 6 C14 6 16 7 17 10"/></svg>`,
  Spielhäuser: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12 L12 3 L21 12"/><path d="M5 10 L5 21 L19 21 L19 10"/><rect x="10" y="14" width="4" height="7"/></svg>`,
  Fallschutz: `<svg viewBox="0 0 24 24" width="22" height="22" fill="white" stroke="white" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" opacity=".7"/></svg>`,
};
const CAT_COLORS = { Schaukeln:"#3B82F6",Rutschen:"#EF4444",Klettern:"#8B5CF6",Sandspiel:"#F59E0B",Wipptiere:"#10B981",Karussell:"#EC4899",Balancieren:"#6366F1",Spielhäuser:"#D97706",Fallschutz:"#059669" };
const DYNAMIC_CATS = ["Schaukeln","Wipptiere","Karussell","Rutschen"];

const initEquipment = [
  // ══════════════════════════════════════════════════════════════════════════
  // KOMPAN – freistehende Spielgeräte | Quelle: kompan.com/de/de
  // ══════════════════════════════════════════════════════════════════════════

  // ── Schaukeln: Klassische A-Rahmen ────────────────────────────────────────
  { id:101, artNr:"KSW90010", name:"KOMPAN Doppelschaukel H:2,0m",             cat:"Schaukeln",   age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:1610,  fallZone:2.0, size:[3.4,1.0], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Doppelschaukel H:2,0m, 2 Sitze. 20,8m². 2 Nutzer." },
  { id:102, artNr:"KSW90014", name:"KOMPAN Doppelschaukel H:2,5m",             cat:"Schaukeln",   age:"Schulkinder (6–12)", mat:"Edelstahl", mfr:5, price:1740,  fallZone:2.5, size:[3.8,1.0], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Doppelschaukel H:2,5m, 2 Sitze. 23,3m². 2 Nutzer." },
  { id:103, artNr:"KSW90040", name:"KOMPAN Nestschaukel Seilnest H:2,5m",      cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:2850,  fallZone:2.5, size:[3.5,3.5], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Nestschaukel H:2,5m, Seilnest Ø100cm. 17,4m². 6 Nutzer." },
  { id:104, artNr:"KSW90062", name:"KOMPAN Nestschaukel Schalennest H:2,5m",   cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:3080,  fallZone:2.5, size:[3.5,3.5], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Nestschaukel H:2,5m, Schalennest Ø100cm. 6 Nutzer." },
  { id:105, artNr:"KSW90045", name:"KOMPAN Schaukel-Kombi Seilnest H:2,5m",    cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:5660,  fallZone:2.5, size:[7.2,2.0], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Schaukel-Kombi H:2,5m, Seilnest+2 Sitze. 40,7m². 8 Nutzer." },
  { id:106, artNr:"KSW90063", name:"KOMPAN Schaukel-Kombi Schalennest H:2,5m", cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:3920,  fallZone:2.5, size:[7.2,2.0], color:"#3B82F6", icon:"🏗", desc:"A-Rahmen Schaukel-Kombi H:2,5m, Schalennest+2 Sitze. 40,7m². 8 Nutzer." },
  // ── Schaukeln: Tor-Rahmen ─────────────────────────────────────────────────
  { id:111, artNr:"KSW92003", name:"KOMPAN Tor-Doppelschaukel H:2,5m",          cat:"Schaukeln",   age:"Schulkinder (6–12)", mat:"Edelstahl", mfr:5, price:2410,  fallZone:2.5, size:[4.0,1.2], color:"#2563EB", icon:"🏗", desc:"Tor-Rahmen Doppelschaukel H:2,5m. 24m². 2 Nutzer." },
  { id:112, artNr:"KSW92006", name:"KOMPAN Tor-Doppelschaukel Anti-Überschlag H:3m", cat:"Schaukeln", age:"Schulkinder (6–12)", mat:"Edelstahl", mfr:5, price:3050, fallZone:3.0, size:[4.5,1.2], color:"#2563EB", icon:"🏗", desc:"Tor-Rahmen Doppelschaukel H:3m mit Anti-Überschlag. 26,5m². 2 Nutzer." },
  { id:113, artNr:"KSW92007", name:"KOMPAN Tor-Nestschaukel Schalennest H:2,5m",cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:3080,  fallZone:2.5, size:[3.8,3.8], color:"#2563EB", icon:"🏗", desc:"Tor-Rahmen Nestschaukel H:2,5m, Schalennest. 17,5m². 6 Nutzer." },
  { id:114, artNr:"KSW92008", name:"KOMPAN Tor-Nestschaukel Seilnest H:2,5m",   cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:3540,  fallZone:2.5, size:[3.8,3.8], color:"#2563EB", icon:"🏗", desc:"Tor-Rahmen Nestschaukel H:2,5m, Seilnest. 17,5m². 6 Nutzer." },
  { id:115, artNr:"KSW92011", name:"KOMPAN Tor-Schaukel-Kombi Seilnest H:2,5m", cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:5250,  fallZone:2.5, size:[7.5,2.2], color:"#2563EB", icon:"🏗", desc:"Tor-Rahmen Schaukel-Kombi H:2,5m, Seilnest+2 Sitze. 41,5m². 8 Nutzer." },
  // ── Schaukeln: Besondere ──────────────────────────────────────────────────
  { id:121, artNr:"M98701",  name:"KOMPAN Kokoswellen-Schaukel",               cat:"Schaukeln",   age:"Altersgemischt",     mat:"Kombiniert",mfr:5, price:6860,  fallZone:2.5, size:[3.5,3.5], color:"#1D4ED8", icon:"🏗", desc:"Kokoswellen-Schaukel, Naturfaser federnd. 15,1m². 4 Nutzer. Ab 2J." },
  { id:122, artNr:"M984",    name:"KOMPAN Giant Kokoswellen-Schaukel",          cat:"Schaukeln",   age:"Altersgemischt",     mat:"Kombiniert",mfr:5, price:11100, fallZone:3.0, size:[5.0,4.0], color:"#1D4ED8", icon:"🏗", desc:"Giant Kokoswellen-Schaukel, XXL. 22,9m². 8 Nutzer. Ab 6J." },
  { id:123, artNr:"M978",    name:"KOMPAN Fünferschaukel",                      cat:"Schaukeln",   age:"Schulkinder (6–12)", mat:"Edelstahl", mfr:5, price:5580,  fallZone:2.5, size:[8.0,1.5], color:"#1D4ED8", icon:"🏗", desc:"5-er Schaukel, Stahlrahmen. 46,9m². 5 Nutzer." },
  { id:124, artNr:"M98002",  name:"KOMPAN Dinoschaukel",                        cat:"Schaukeln",   age:"Altersgemischt",     mat:"Kombiniert",mfr:5, price:7800,  fallZone:3.0, size:[8.0,5.0], color:"#1D4ED8", icon:"🏗", desc:"Dinoschaukel, Themengerät. 53,6m². 6 Nutzer." },
  { id:125, artNr:"M985",    name:"KOMPAN Mini-Dinoschaukel",                   cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3190,  fallZone:2.5, size:[5.0,4.5], color:"#1D4ED8", icon:"🏗", desc:"Mini-Dinoschaukel Kleinkinder. 51,2m². 1 Nutzer." },
  { id:126, artNr:"M983",    name:"KOMPAN Riesen-Schaukelnest",                 cat:"Schaukeln",   age:"Altersgemischt",     mat:"Kombiniert",mfr:5, price:13400, fallZone:3.5, size:[8.0,6.0], color:"#1D4ED8", icon:"🏗", desc:"Riesen-Schaukelnest. 61,4m². 7 Nutzer." },
  // ── Schaukelsitze ─────────────────────────────────────────────────────────
  { id:131, artNr:"SW990121", name:"KOMPAN You & Me Schaukelsitz H:2,5m",       cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:1070,  fallZone:2.5, size:[0.5,0.5], color:"#60A5FA", icon:"🏗", desc:"You & Me Schaukelsitz, 2 Kinder gleichzeitig, H:2,5m." },
  { id:132, artNr:"SW990026", name:"KOMPAN Kleinkind-Schaukelsitz H:2,5m",      cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:390,   fallZone:2.5, size:[0.5,0.5], color:"#60A5FA", icon:"🏗", desc:"Kleinkind-Schaukelsitz mit Sicherheitsbügel, H:2,5m." },
  { id:133, artNr:"SW990207", name:"KOMPAN Inklusiv-Schaukelsitz 4 Ketten",     cat:"Schaukeln",   age:"Altersgemischt",     mat:"Edelstahl", mfr:5, price:2110,  fallZone:2.5, size:[0.8,0.8], color:"#60A5FA", icon:"🏗", desc:"Inklusiv-Schaukelsitz 4-Punkt, barrierefrei, H:2,5m." },
  { id:134, artNr:"SW990091", name:"KOMPAN Schalennest Ø120cm",                 cat:"Schaukeln",   age:"Altersgemischt",     mat:"Kombiniert",mfr:5, price:1160,  fallZone:2.5, size:[1.2,1.2], color:"#60A5FA", icon:"🏗", desc:"Schalennest Ø120cm, Ersatz/Erweiterung für Nestschaukel." },

  // ── Rutschen ─────────────────────────────────────────────────────────────
  { id:201, artNr:"PCM110121", name:"KOMPAN Hangrutsche",                       cat:"Rutschen",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:4310,  fallZone:2.0, size:[5.0,1.5], color:"#EF4444", icon:"🛝", desc:"Hangrutsche, 4+J. 24,3m². 3 Nutzer." },
  { id:202, artNr:"PCM301",    name:"KOMPAN Rutsche H:120cm",                   cat:"Rutschen",    age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:2410,  fallZone:1.5, size:[3.5,1.0], color:"#EF4444", icon:"🛝", desc:"Rutsche H:120cm, 2+J. 17,5m². 2 Nutzer." },
  { id:203, artNr:"NRO310",    name:"KOMPAN Robinia Hangrutsche",               cat:"Rutschen",    age:"Kindergarten (3–6)", mat:"Robinie",   mfr:5, price:4230,  fallZone:2.0, size:[5.0,1.5], color:"#EF4444", icon:"🛝", desc:"Robinia Hangrutsche, 4+J. 24,1m². 2 Nutzer." },
  { id:204, artNr:"NRO308",    name:"KOMPAN Edelstahl-Hangrutsche",             cat:"Rutschen",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:3320,  fallZone:1.5, size:[4.0,1.2], color:"#EF4444", icon:"🛝", desc:"Edelstahl-Hangrutsche, 3+J. 14,1m². 3 Nutzer." },
  { id:205, artNr:"M351",      name:"KOMPAN Rutsche",                           cat:"Rutschen",    age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3930,  fallZone:2.0, size:[4.0,1.5], color:"#EF4444", icon:"🛝", desc:"KOMPAN Rutsche, 2+J. 19,6m². 3 Nutzer." },
  { id:206, artNr:"KSL30102",  name:"KOMPAN Hangrutsche 1,0m hoch, 1,0m breit",cat:"Rutschen",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:6390,  fallZone:2.0, size:[4.0,2.0], color:"#EF4444", icon:"🛝", desc:"Hangrutsche 1,0m hoch, 1,0m breit. 16,6m². 2 Nutzer." },
  { id:207, artNr:"KSL30902",  name:"KOMPAN Hangrutsche 3,0m hoch, 1,0m breit",cat:"Rutschen",    age:"Schulkinder (6–12)", mat:"Edelstahl", mfr:5, price:10900, fallZone:3.0, size:[7.0,2.0], color:"#EF4444", icon:"🛝", desc:"Hangrutsche 3,0m hoch, 1,0m breit. 25,7m². 2 Nutzer." },
  { id:208, artNr:"COR71009",  name:"KOMPAN Hang-Röhrenrutsche",               cat:"Rutschen",    age:"Schulkinder (6–12)", mat:"Kombiniert",mfr:5, price:10900, fallZone:2.5, size:[5.0,1.5], color:"#EF4444", icon:"🛝", desc:"Hang-Röhrenrutsche. 15m². 2 Nutzer." },
  { id:209, artNr:"KSL30304",  name:"KOMPAN Hangrutsche 1,5m hoch, 2,0m breit",cat:"Rutschen",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:13400, fallZone:2.0, size:[5.5,3.0], color:"#EF4444", icon:"🛝", desc:"Hangrutsche 1,5m hoch, 2,0m breit. 24,4m². 2 Nutzer." },

  // ── Wippen ───────────────────────────────────────────────────────────────
  { id:301, artNr:"PCM162",  name:"KOMPAN Multi-Wippe inklusiv",               cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:6200,  fallZone:2.0, size:[4.0,2.0], color:"#10B981", icon:"🐴", desc:"Multi-Wippe inklusiv, 3+J. 19,4m². 10 Nutzer." },
  { id:302, artNr:"KPL118",  name:"KOMPAN Vierer-Wippe mit Reifen",            cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:2030,  fallZone:1.5, size:[3.0,1.5], color:"#10B981", icon:"🐴", desc:"Vierer-Wippe mit Reifen, 3+J. 13,7m². 4 Nutzer." },
  { id:303, artNr:"M143",    name:"KOMPAN Doppel-Wippe Albatros mit Plattform",cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:2400,  fallZone:1.5, size:[3.5,1.5], color:"#10B981", icon:"🐴", desc:"Doppel-Wippe Albatros mit Plattform. 13,7m². 4 Nutzer." },
  { id:304, artNr:"M186",    name:"KOMPAN Sechser-Wippe",                      cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:4900,  fallZone:2.0, size:[4.5,2.0], color:"#10B981", icon:"🐴", desc:"Sechser-Wippe, 3+J. 17,8m². 10 Nutzer." },
  { id:305, artNr:"KPL111",  name:"KOMPAN Doppel-Wippe mit Federn",            cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:1920,  fallZone:1.5, size:[3.0,1.2], color:"#10B981", icon:"🐴", desc:"Doppel-Wippe mit Federn. 11,3m². 2 Nutzer." },
  { id:306, artNr:"KPL112",  name:"KOMPAN Doppel-Wippe mit Reifen",            cat:"Wipptiere",   age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:1530,  fallZone:1.5, size:[3.0,1.2], color:"#10B981", icon:"🐴", desc:"Doppel-Wippe mit Reifen. 11,3m². 2 Nutzer." },

  // ── Federwippgeräte ───────────────────────────────────────────────────────
  { id:311, artNr:"M101",    name:"KOMPAN Schaukelhahn",                       cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:650,   fallZone:1.0, size:[1.2,0.8], color:"#059669", icon:"🐴", desc:"Schaukelhahn Federwipper. 7,4m². 1 Nutzer. Ab 1J." },
  { id:312, artNr:"M128",    name:"KOMPAN Vierer-Wippe Kleeblatt",             cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:1080,  fallZone:1.0, size:[2.0,2.0], color:"#059669", icon:"🐴", desc:"Vierer-Wippe Kleeblatt. 9,6m². 4 Nutzer. Ab 1J." },
  { id:313, artNr:"M130",    name:"KOMPAN Motorrad Federwipper",               cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:970,   fallZone:1.0, size:[1.5,0.8], color:"#059669", icon:"🐴", desc:"Motorrad Federwipper. 7,4m². 2 Nutzer. Ab 1J." },
  { id:314, artNr:"M175",    name:"KOMPAN Vierer-Wippe Wasserlilien",          cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:1170,  fallZone:1.0, size:[2.0,2.0], color:"#059669", icon:"🐴", desc:"Vierer-Wippe Wasserlilien. 9,6m². 4 Nutzer. Ab 1J." },
  { id:315, artNr:"PCM103",  name:"KOMPAN Delfin Federwipper",                cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:800,   fallZone:1.0, size:[1.2,0.8], color:"#059669", icon:"🐴", desc:"Delfin Federwipper. 7,4m². 1 Nutzer. Ab 1J." },
  { id:316, artNr:"KPL101",  name:"KOMPAN Motorroller Federwipper",           cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:620,   fallZone:1.0, size:[1.2,0.8], color:"#059669", icon:"🐴", desc:"Motorroller Federwipper. 7,5m². 1 Nutzer. Ab 1J." },
  { id:317, artNr:"KPL102",  name:"KOMPAN Seelöwe Federwipper",               cat:"Wipptiere",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:650,   fallZone:1.0, size:[1.2,0.8], color:"#059669", icon:"🐴", desc:"Seelöwe Federwipper. Ab 1J." },

  // ── Karussells & Drehspielgeräte ──────────────────────────────────────────
  { id:401, artNr:"GXY916",    name:"KOMPAN Drehring Supernova",              cat:"Karussell",   age:"Jugendliche (12+)",  mat:"Edelstahl", mfr:5, price:5380,  fallZone:3.0, size:[5.5,5.5], color:"#EC4899", icon:"🎠", desc:"Drehring Supernova, 6+J. 28,9m². 8 Nutzer." },
  { id:402, artNr:"ELE400024", name:"KOMPAN Drehschüssel Spinner Bowl",       cat:"Karussell",   age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:710,   fallZone:1.5, size:[2.5,2.5], color:"#EC4899", icon:"🎠", desc:"Drehschüssel Spinner Bowl, 4+J. 9,8m². 1 Nutzer." },
  { id:403, artNr:"PCM157",    name:"KOMPAN Universal Karussell",             cat:"Karussell",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:9070,  fallZone:3.0, size:[5.5,5.5], color:"#EC4899", icon:"🎠", desc:"Universal Karussell, inklusiv, 2+J. 29,1m². 8 Nutzer." },
  { id:404, artNr:"ELE400065", name:"KOMPAN Tipi Karussell",                  cat:"Karussell",   age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:3930,  fallZone:2.5, size:[4.5,4.5], color:"#EC4899", icon:"🎠", desc:"Tipi Karussell mit Festhaltegeländer, 4+J. 21,3m². 8 Nutzer." },
  { id:405, artNr:"GXY8014",   name:"KOMPAN Drehkreisel Spica 1",             cat:"Karussell",   age:"Jugendliche (12+)",  mat:"Edelstahl", mfr:5, price:1400,  fallZone:2.0, size:[3.0,3.0], color:"#EC4899", icon:"🎠", desc:"Drehkreisel Spica 1, 6+J. 9,7m². 1 Nutzer." },
  { id:406, artNr:"KPL114",    name:"KOMPAN Karussell mit Bank",              cat:"Karussell",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:5700,  fallZone:3.0, size:[5.0,5.0], color:"#EC4899", icon:"🎠", desc:"Karussell mit Bank, 2+J. 24,2m². 8 Nutzer." },
  { id:407, artNr:"PCM159",    name:"KOMPAN WeHopper",                        cat:"Karussell",   age:"Jugendliche (12+)",  mat:"Edelstahl", mfr:5, price:4200,  fallZone:3.5, size:[7.0,4.0], color:"#EC4899", icon:"🎠", desc:"WeHopper Pendelkarussell, 6+J. 46,1m². 2 Nutzer." },
  { id:408, artNr:"ELE400066", name:"KOMPAN Springer Bowl",                   cat:"Karussell",   age:"Jugendliche (12+)",  mat:"Edelstahl", mfr:5, price:900,   fallZone:1.5, size:[2.5,2.5], color:"#EC4899", icon:"🎠", desc:"Springer Bowl Federwipper, 6+J. 7,4m². 1 Nutzer." },

  // ── Balancieren & Klettern ────────────────────────────────────────────────
  { id:501, artNr:"PCM803",    name:"KOMPAN Dreier-Turn-Reck",                cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:1040,  fallZone:1.5, size:[4.0,1.0], color:"#6366F1", icon:"⚖️", desc:"Dreier-Turn-Reck H:88/148/118cm. 17,5m². 3 Nutzer." },
  { id:502, artNr:"PCM802",    name:"KOMPAN Doppel-Turn-Reck",                cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:770,   fallZone:1.5, size:[3.0,1.0], color:"#6366F1", icon:"⚖️", desc:"Doppel-Turn-Reck H:88/148cm. 14,2m². 2 Nutzer." },
  { id:503, artNr:"PCM80721",  name:"KOMPAN Balancierbalken flach",           cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:760,   fallZone:1.0, size:[3.5,0.5], color:"#6366F1", icon:"⚖️", desc:"Balancierbalken flach. 14,4m². 2 Nutzer." },
  { id:504, artNr:"PCM80921",  name:"KOMPAN Balancier- und Wackelbrücke",    cat:"Balancieren", age:"Schulkinder (6–12)", mat:"Kombiniert",mfr:5, price:3060,  fallZone:1.5, size:[5.0,1.5], color:"#6366F1", icon:"⚖️", desc:"Balancier- und Wackelbrücke, 6+J. 19,8m². 2 Nutzer." },
  { id:505, artNr:"PCM80821",  name:"KOMPAN Reckring",                        cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:1750,  fallZone:2.0, size:[4.5,3.0], color:"#6366F1", icon:"⚖️", desc:"Reckring. 23,1m². 6 Nutzer." },
  { id:506, artNr:"M87402",    name:"KOMPAN Balancierstein 30cm",             cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:310,   fallZone:0.5, size:[1.0,1.0], color:"#6366F1", icon:"⚖️", desc:"Balancier- und Hüpfstein 30cm. 8,4m². 1 Nutzer." },
  { id:507, artNr:"PCM80621",  name:"KOMPAN Balancierbalken rund",            cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:550,   fallZone:1.0, size:[3.5,0.5], color:"#6366F1", icon:"⚖️", desc:"Balancierbalken rund. 14,3m². 2 Nutzer." },
  { id:508, artNr:"M87401",    name:"KOMPAN Balancierstein Bodenhöhe",        cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Kombiniert",mfr:5, price:280,   fallZone:0.5, size:[1.0,1.0], color:"#6366F1", icon:"⚖️", desc:"Balancier- und Hüpfstein Bodenhöhe. 8,4m². 1 Nutzer." },

  // ── Sand- & Wasserspiel ───────────────────────────────────────────────────
  { id:601, artNr:"PCM505",    name:"KOMPAN Wasserfall mit Sandtisch",        cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:9770,  fallZone:0, size:[4.0,3.0], color:"#F59E0B", icon:"🏖", desc:"Wasserfall mit Sandtisch, 1+J. 28,8m². 17 Nutzer." },
  { id:602, artNr:"PCM501",    name:"KOMPAN Drehbarer Sandtisch",             cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:1130,  fallZone:0, size:[2.0,2.0], color:"#F59E0B", icon:"🏖", desc:"Drehbarer Sandtisch. 10,5m². 2 Nutzer." },
  { id:603, artNr:"PCM504",    name:"KOMPAN Wasserwerk",                      cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:8070,  fallZone:0, size:[3.5,3.0], color:"#F59E0B", icon:"🏖", desc:"Wasserwerk Spielstation. 20,2m². 15 Nutzer." },
  { id:604, artNr:"MSC5419",   name:"KOMPAN Sand- und Wasser-Station",        cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3120,  fallZone:0, size:[3.0,2.5], color:"#F59E0B", icon:"🏖", desc:"Sand- und Wasser-Station. 17,4m². 5 Nutzer." },
  { id:605, artNr:"PCM503",    name:"KOMPAN Sandkasten",                      cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:1880,  fallZone:0, size:[4.0,3.0], color:"#F59E0B", icon:"🏖", desc:"Sandkasten. 20,9m². 8 Nutzer." },
  { id:606, artNr:"M593",      name:"KOMPAN Wasserhahn",                      cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:1100,  fallZone:0, size:[1.0,1.0], color:"#F59E0B", icon:"🏖", desc:"Wasserhahn Spielelement. 8,5m². 1 Nutzer." },
  { id:607, artNr:"MSC5425",   name:"KOMPAN Sand- und Wasserstation Delfin",  cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3310,  fallZone:0, size:[3.0,2.5], color:"#F59E0B", icon:"🏖", desc:"Sand- und Wasserstation Delfin. 17,3m². 6 Nutzer." },
  { id:608, artNr:"M584",      name:"KOMPAN Sand- und Spieltisch Seestern",   cat:"Sandspiel",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:420,   fallZone:0, size:[1.5,1.5], color:"#F59E0B", icon:"🏖", desc:"Sand- und Spieltisch Seestern. 11,3m². 2 Nutzer." },

  // ── Spielhäuser & Themenspiel ─────────────────────────────────────────────
  { id:701, artNr:"M7000",     name:"KOMPAN Villa Spielhaus",                 cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3230,  fallZone:1.0, size:[3.0,3.0], color:"#D97706", icon:"🏠", desc:"Villa Spielhaus, 1+J. 17,4m². 12 Nutzer." },
  { id:702, artNr:"KPB50101",  name:"KOMPAN Porsche 4Kids 911 Classic",       cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:5880,  fallZone:1.0, size:[3.5,2.5], color:"#D97706", icon:"🏠", desc:"Porsche 4Kids 911 Classic Spielgerät. 18,4m². 4 Nutzer." },
  { id:703, artNr:"M536",      name:"KOMPAN Lokomotive",                      cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3520,  fallZone:1.0, size:[3.5,2.5], color:"#D97706", icon:"🏠", desc:"Lokomotive Themengerät, 1+J. 14,8m². 4 Nutzer." },
  { id:704, artNr:"M525",      name:"KOMPAN Dampflok",                        cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:7710,  fallZone:1.5, size:[5.0,3.0], color:"#D97706", icon:"🏠", desc:"Dampflok, 2+J. 21,8m². 8 Nutzer." },
  { id:705, artNr:"M526",      name:"KOMPAN Eisenbahnwaggon",                 cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:8690,  fallZone:1.5, size:[5.0,3.0], color:"#D97706", icon:"🏠", desc:"Eisenbahnwaggon, 2+J. 22,1m². 8 Nutzer." },

  // ── Kleinkindgeräte ───────────────────────────────────────────────────────
  { id:801, artNr:"M951",      name:"KOMPAN Lernschaukel Sonnenblume",        cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:1680,  fallZone:1.5, size:[2.5,2.0], color:"#60A5FA", icon:"🏗", desc:"Lernschaukel Sonnenblume, 1+J. 8,4m². 1 Nutzer." },
  { id:802, artNr:"M952",      name:"KOMPAN Mini-Nestschaukel",               cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:1920,  fallZone:1.5, size:[3.0,2.5], color:"#60A5FA", icon:"🏗", desc:"Mini-Nestschaukel, 2+J. 11,3m². 6 Nutzer." },
  { id:803, artNr:"PCM804",    name:"KOMPAN Schaukelmatte",                   cat:"Schaukeln",   age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:940,   fallZone:1.5, size:[2.5,2.0], color:"#60A5FA", icon:"🏗", desc:"Schaukelmatte, 1+J. 11,2m². 1 Nutzer." },
  { id:804, artNr:"MSC5416",   name:"KOMPAN Wald & Giraffe Kleinkind",       cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:4240,  fallZone:1.0, size:[3.5,2.5], color:"#D97706", icon:"🏠", desc:"Wald & Giraffe Kleinkind-Spielkombination. 17,2m². 11 Nutzer." },
  { id:805, artNr:"MSC5414",   name:"KOMPAN Doppeltaxi Kleinkind",            cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:4320,  fallZone:1.0, size:[3.5,2.5], color:"#D97706", icon:"🏠", desc:"Doppeltaxi Kleinkind. 17,5m². Mehrere Nutzer." },

  // ── Seilbahnen ────────────────────────────────────────────────────────────
  { id:901, artNr:"KCW80101",  name:"KOMPAN Seilbahn Gefälle 25m",            cat:"Klettern",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:5900,  fallZone:3.0, size:[27.0,4.0], color:"#8B5CF6", icon:"🧗", desc:"Seilbahn für Gelände mit Gefälle, Fahrlänge 25m. 114,9m². 1 Nutzer." },
  { id:902, artNr:"KCW80201",  name:"KOMPAN Seilbahn Rampe eben 25m",         cat:"Klettern",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:6900,  fallZone:3.0, size:[27.0,4.0], color:"#8B5CF6", icon:"🧗", desc:"Seilbahn mit Rampe, ebenes Gelände, 25m. 116,2m². 1 Nutzer." },
  { id:903, artNr:"KCW80401",  name:"KOMPAN Doppelseilbahn Gefälle 25m",      cat:"Klettern",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:10000, fallZone:3.0, size:[27.0,7.0], color:"#8B5CF6", icon:"🧗", desc:"Doppelseilbahn, Gefälle, 25m. 175m². 2 Nutzer." },
  { id:904, artNr:"KCW80501",  name:"KOMPAN Doppelseilbahn eben 25m",         cat:"Klettern",    age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:11700, fallZone:3.0, size:[27.0,7.0], color:"#8B5CF6", icon:"🧗", desc:"Doppelseilbahn, ebenes Gelände, 25m. 177,3m². 2 Nutzer." },

  // ── Sprungflächen ─────────────────────────────────────────────────────────
  { id:911, artNr:"JUM104",    name:"KOMPAN Membran Jumper Quadrat 150x150cm",cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:7200,  fallZone:2.0, size:[4.0,4.0], color:"#6366F1", icon:"⚖️", desc:"Membran Jumper quadratisch 150×150cm. 26,8m². 1 Nutzer." },
  { id:912, artNr:"JUM102",    name:"KOMPAN Membran Jumper Rund Ø112cm",      cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:5500,  fallZone:1.5, size:[3.0,3.0], color:"#6366F1", icon:"⚖️", desc:"Membran Jumper rund Ø112cm. 13,4m². 1 Nutzer." },
  { id:913, artNr:"JUM105",    name:"KOMPAN Membran Jumper Rechteck 100x300cm",cat:"Balancieren",age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:11100, fallZone:2.0, size:[5.5,3.0], color:"#6366F1", icon:"⚖️", desc:"Membran Jumper rechteckig 100×300cm. 41,6m². 1 Nutzer." },
  { id:914, artNr:"JUM103",    name:"KOMPAN Membran Jumper Sechseck",         cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:4720,  fallZone:1.5, size:[3.0,3.0], color:"#6366F1", icon:"⚖️", desc:"Membran Jumper sechseitig 108cm. 13,3m². 1 Nutzer." },
  { id:915, artNr:"JUM101",    name:"KOMPAN Membran Jumper Quadrat 100x100cm",cat:"Balancieren", age:"Kindergarten (3–6)", mat:"Edelstahl", mfr:5, price:5020,  fallZone:1.5, size:[3.0,3.0], color:"#6366F1", icon:"⚖️", desc:"Membran Jumper quadratisch 100×100cm. 14,1m². 1 Nutzer." },

  // ── Spielwände & Spieltafeln ──────────────────────────────────────────────
  { id:921, artNr:"TPP280023",  name:"KOMPAN Multisensorik-Spielwand eckig",  cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:750,   fallZone:0, size:[2.0,0.5], color:"#D97706", icon:"🏠", desc:"Multisensorik-Spielwand, eckige Pfosten. 10,1m². 2 Nutzer." },
  { id:922, artNr:"PCM003621",  name:"KOMPAN Spielwand hoch Kreativ",         cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:1690,  fallZone:0, size:[2.5,0.5], color:"#D97706", icon:"🏠", desc:"Spielwand hoch, Kreativ. 11,2m². 4 Nutzer." },
  { id:923, artNr:"PCM003222",  name:"KOMPAN Spielwand Emotionen",            cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:2540,  fallZone:0, size:[3.0,0.5], color:"#D97706", icon:"🏠", desc:"Spielwand 2 – Emotionen. 14,2m². 9 Nutzer." },
  { id:924, artNr:"PCM0012",    name:"KOMPAN Kreidetafel groß",               cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Edelstahl", mfr:5, price:1830,  fallZone:0, size:[2.5,0.5], color:"#D97706", icon:"🏠", desc:"Kreidetafel (groß). 12,3m². 4 Nutzer." },
  { id:925, artNr:"NRO615",     name:"KOMPAN Lern-Spielwand 3",              cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Robinie",   mfr:5, price:2340,  fallZone:0, size:[3.5,0.5], color:"#D97706", icon:"🏠", desc:"Lern-Spielwand 3. 18m². 10 Nutzer." },
  { id:926, artNr:"NRO612",     name:"KOMPAN Musikwand",                      cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Robinie",   mfr:5, price:1310,  fallZone:0, size:[2.5,0.5], color:"#D97706", icon:"🏠", desc:"Musikwand 1. 10,9m². 4 Nutzer." },

  // ── Kleinkind Spielanlagen ────────────────────────────────────────────────
  { id:931, artNr:"MSV603",    name:"KOMPAN Kaufmannsladen & Küche",          cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3720,  fallZone:0, size:[3.5,2.0], color:"#D97706", icon:"🏠", desc:"Kaufmannsladen & Küche Spielstation. 14,9m². 8 Nutzer." },
  { id:932, artNr:"MSV601",    name:"KOMPAN Zuhause & Garten Spielstation",  cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3380,  fallZone:0, size:[3.5,2.0], color:"#D97706", icon:"🏠", desc:"Zuhause & Garten Spielstation. 14,8m². 8 Nutzer." },
  { id:933, artNr:"MSV602",    name:"KOMPAN Tankstelle & Werkstatt",         cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3990,  fallZone:0, size:[3.5,2.0], color:"#D97706", icon:"🏠", desc:"Tankstelle & Werkstatt. 15,1m². 8 Nutzer." },
  { id:934, artNr:"MSV604",    name:"KOMPAN Gewächshaus & Blumenladen",      cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:3530,  fallZone:0, size:[3.5,2.0], color:"#D97706", icon:"🏠", desc:"Gewächshaus & Blumenladen. 14,9m². 8 Nutzer." },

  // ── Modulares Multispiel (Kleinkind-Spielkombis) ──────────────────────────
  { id:941, artNr:"MSC542102",  name:"KOMPAN Haus & Garten Kleinkind-Kombi",  cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:6770,  fallZone:1.0, size:[4.0,3.5], color:"#D97706", icon:"🏠", desc:"Haus & Garten Kleinkind-Kombi. 22m². 16 Nutzer. Ab 1J." },
  { id:942, artNr:"PCM000421",  name:"KOMPAN Spielparadies mit Netz",         cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:4280,  fallZone:1.0, size:[4.5,3.5], color:"#D97706", icon:"🏠", desc:"Spielparadies mit Netz. 26,4m². 14 Nutzer." },
  { id:943, artNr:"PCM000321",  name:"KOMPAN Spielparadies",                  cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:2060,  fallZone:1.0, size:[3.5,2.5], color:"#D97706", icon:"🏠", desc:"Spielparadies. 16,7m². 8 Nutzer." },
  { id:944, artNr:"PCM000521",  name:"KOMPAN Spielparadies mit Tunnel",       cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:6420,  fallZone:1.0, size:[4.5,3.5], color:"#D97706", icon:"🏠", desc:"Spielparadies mit Tunnel. 26m². 13 Nutzer." },
  { id:945, artNr:"MSC5422",    name:"KOMPAN Minischloss mit Kletterwand",    cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:6250,  fallZone:1.5, size:[4.0,3.5], color:"#D97706", icon:"🏠", desc:"Minischloss mit Kletterwand. 20,4m². 12 Nutzer." },
  { id:946, artNr:"MSC5424",    name:"KOMPAN 2-Turm-Minischloss",             cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:9460,  fallZone:1.5, size:[5.0,4.0], color:"#D97706", icon:"🏠", desc:"2-Turm-Minischloss. 25,1m². 15 Nutzer." },
  { id:947, artNr:"MSC5417",    name:"KOMPAN Minischloss",                    cat:"Spielhäuser", age:"Kleinkinder (1–3)",  mat:"Kombiniert",mfr:5, price:6380,  fallZone:1.5, size:[4.0,3.5], color:"#D97706", icon:"🏠", desc:"Minischloss. 19,7m². 8 Nutzer." },
];

const initManufacturers = [
  { id:1, name:"Berliner Seilfabrik",  country:"DE", contact:"info@bsf.de",           web:"berliner-seilfabrik.de",  note:"Premium Seilspielgeräte" },
  { id:2, name:"Lappset Group",        country:"FI", contact:"info@lappset.com",      web:"lappset.com",             note:"Innovative Spielkonzepte" },
  { id:3, name:"Richter Spielgeräte",  country:"DE", contact:"info@richter.de",       web:"richter-spielgeraete.de", note:"Klassische Holzgeräte" },
  { id:4, name:"Playparc",             country:"DE", contact:"info@playparc.de",      web:"playparc.de",             note:"Fallschutz & Beläge" },
  { id:5, name:"KOMPAN",               country:"DK", contact:"info@kompan.de",        web:"kompan.com",              note:"Weltweiter Marktführer Spielplatzgeräte. Schaukeln, Klettergeräte, Karussells, Sportgeräte." },
];

const initProjects = [
  { id:1, name:"Schulhausplatz Kreuzlingen", client:"Stadt Kreuzlingen", status:"Offerte", created:"2026-03-15",
    wizard:{ ages:["Schulkinder (6–12)","Altersgemischt"], users:120, locType:"Schule", mat:"Robinie", floor:"EPDM (gebunden)" },
    geo:{ lat:47.6488, lng:9.1735, zoom:19 },
    area:{ w:20, h:15 },
    placed:[
      { id:"p1", eqId:102, lat:47.648810, lng:9.173490, rot:0 },
      { id:"p2", eqId:202, lat:47.648780, lng:9.173580, rot:0 },
      { id:"p3", eqId:501, lat:47.648760, lng:9.173400, rot:0 },
      { id:"p4", eqId:401, lat:47.648840, lng:9.173530, rot:0 },
    ],
    obstacles:[
      { id:"o1", type:"tree",     lat:47.648870, lng:9.173420, r:3, label:"Eiche" },
      { id:"o2", type:"building", lat:47.648910, lng:9.173620, w:8, h:5, label:"Schulgebäude" },
    ],
  },
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
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({cat:"Alle",age:"Alle",mat:"Alle",mfr:"Alle",priceMin:"",priceMax:""});
  const [sort,setSort]=useState("name-asc");
  const [showFilters,setShowFilters]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:"",cat:"Schaukeln",age:"Altersgemischt",mat:"Robinie",mfr:1,price:0,fallZone:1.5,desc:"",size:[2,2]});

  const allMats=[...new Set(equipment.map(e=>e.mat))].sort();
  const activeFilterCount=[filters.cat!=="Alle",filters.age!=="Alle",filters.mat!=="Alle",filters.mfr!=="Alle",filters.priceMin!=="",filters.priceMax!==""].filter(Boolean).length;

  const visible=equipment.filter(e=>{
    if(filters.cat!=="Alle"&&e.cat!==filters.cat) return false;
    if(filters.age!=="Alle"&&e.age!==filters.age) return false;
    if(filters.mat!=="Alle"&&e.mat!==filters.mat) return false;
    if(filters.mfr!=="Alle"&&String(e.mfr)!==filters.mfr) return false;
    if(filters.priceMin!==""&&e.price<Number(filters.priceMin)) return false;
    if(filters.priceMax!==""&&e.price>Number(filters.priceMax)) return false;
    if(search){
      const q=search.toLowerCase();
      const mfrName=manufacturers.find(m=>m.id===e.mfr)?.name||"";
      if(!e.name.toLowerCase().includes(q)&&!(e.artNr||"").toLowerCase().includes(q)&&!(e.desc||"").toLowerCase().includes(q)&&!mfrName.toLowerCase().includes(q)&&!e.cat.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>{
    switch(sort){
      case"name-asc":  return a.name.localeCompare(b.name,"de");
      case"name-desc": return b.name.localeCompare(a.name,"de");
      case"price-asc": return a.price-b.price;
      case"price-desc":return b.price-a.price;
      case"cat":       return a.cat.localeCompare(b.cat,"de")||a.name.localeCompare(b.name,"de");
      case"mfr":       return (manufacturers.find(m=>m.id===a.mfr)?.name||"").localeCompare(manufacturers.find(m=>m.id===b.mfr)?.name||"","de");
      default: return 0;
    }
  });

  function resetFilters(){ setFilters({cat:"Alle",age:"Alle",mat:"Alle",mfr:"Alle",priceMin:"",priceMax:""}); setSearch(""); }
  function openEdit(e) { setEditing(e.id); setForm({...e}); setShowForm(true); }
  function openNew() { setEditing(null); setForm({name:"",cat:"Schaukeln",age:"Altersgemischt",mat:"Robinie",mfr:1,price:0,fallZone:1.5,desc:"",size:[2,2]}); setShowForm(true); }
  function save() {
    if(editing) setEquipment(prev=>prev.map(e=>e.id===editing?{...form,id:editing,color:CAT_COLORS[form.cat],icon:ICONS[form.cat]}:e));
    else setEquipment(prev=>[...prev,{...form,id:Date.now(),color:CAT_COLORS[form.cat],icon:ICONS[form.cat]}]);
    setShowForm(false);
  }
  function del(id) { setEquipment(prev=>prev.filter(e=>e.id!==id)); }

  const selSt={padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,cursor:"pointer",outline:"none"};

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div className="syne" style={{fontSize:24,fontWeight:800}}>Gerätekatalog</div>
          <div style={{color:T.muted,fontSize:13}}>
            <span style={{color:T.green,fontWeight:700}}>{visible.length}</span> von {equipment.length} Geräten
          </div>
        </div>
        <Btn onClick={openNew}>+ Gerät hinzufügen</Btn>
      </div>

      {/* Search + Sort + Filter Bar */}
      <Card style={{padding:"14px 16px",marginBottom:12}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          {/* Search */}
          <div style={{flex:1,minWidth:220,position:"relative"}}>
            <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",color:T.muted}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Name, Art.-Nr., Beschreibung, Hersteller…"
              style={{width:"100%",padding:"8px 12px 8px 34px",border:`1.5px solid ${search?T.green:T.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",background:T.bg,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:T.muted}}>✕</button>}
          </div>
          {/* Sort */}
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:12,color:T.muted,whiteSpace:"nowrap"}}>↕️ Sortieren:</span>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={selSt}>
              <option value="name-asc">Name A→Z</option>
              <option value="name-desc">Name Z→A</option>
              <option value="price-asc">Preis ↑</option>
              <option value="price-desc">Preis ↓</option>
              <option value="cat">Kategorie</option>
              <option value="mfr">Hersteller</option>
            </select>
          </div>
          {/* Filter toggle */}
          <button onClick={()=>setShowFilters(v=>!v)}
            style={{padding:"8px 14px",borderRadius:8,border:`1.5px solid ${showFilters||activeFilterCount>0?T.green:T.border}`,background:showFilters||activeFilterCount>0?T.green+"15":"white",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:showFilters||activeFilterCount>0?T.green:T.text,display:"flex",alignItems:"center",gap:6,transition:"all .15s",flexShrink:0}}>
            ⚙️ Filter
            {activeFilterCount>0&&<span style={{background:T.green,color:"white",borderRadius:10,padding:"1px 7px",fontSize:11,fontWeight:700}}>{activeFilterCount}</span>}
          </button>
          {(activeFilterCount>0||search)&&
            <button onClick={resetFilters} style={{padding:"8px 12px",borderRadius:8,border:`1.5px solid ${T.border}`,background:"white",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:T.muted,flexShrink:0}}>✕ Reset</button>
          }
        </div>
        {/* Filter Panel */}
        {showFilters&&(
          <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
            {[
              {label:"Kategorie",key:"cat",opts:["Alle",...CATS]},
              {label:"Altersgruppe",key:"age",opts:["Alle",...AGES]},
              {label:"Material",key:"mat",opts:["Alle",...allMats]},
            ].map(({label,key,opts})=>(
              <div key={key}>
                <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>{label}</label>
                <select value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))} style={{...selSt,width:"100%"}}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Hersteller</label>
              <select value={filters.mfr} onChange={e=>setFilters(f=>({...f,mfr:e.target.value}))} style={{...selSt,width:"100%"}}>
                <option value="Alle">Alle</option>
                {manufacturers.map(m=><option key={m.id} value={String(m.id)}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Preis ab (CHF)</label>
              <input type="number" value={filters.priceMin} onChange={e=>setFilters(f=>({...f,priceMin:e.target.value}))}
                placeholder="z.B. 500" style={{...selSt,width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:5}}>Preis bis (CHF)</label>
              <input type="number" value={filters.priceMax} onChange={e=>setFilters(f=>({...f,priceMax:e.target.value}))}
                placeholder="z.B. 5000" style={{...selSt,width:"100%",boxSizing:"border-box"}}/>
            </div>
          </div>
        )}
      </Card>

      {/* Active Filter Chips */}
      {(activeFilterCount>0||search)&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {search&&<span style={{background:T.green+"18",color:T.green,border:`1px solid ${T.green}44`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>🔍 "{search}"</span>}
          {filters.cat!=="Alle"&&<span style={{background:T.gold+"22",color:"#B07C1C",border:`1px solid ${T.gold}66`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{filters.cat}</span>}
          {filters.age!=="Alle"&&<span style={{background:"#6B728018",color:"#6B7280",border:"1px solid #6B728055",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{filters.age}</span>}
          {filters.mat!=="Alle"&&<span style={{background:T.greenMid+"18",color:T.greenMid,border:`1px solid ${T.greenMid}55`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{filters.mat}</span>}
          {filters.mfr!=="Alle"&&<span style={{background:"#8B5CF618",color:"#8B5CF6",border:"1px solid #8B5CF655",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{manufacturers.find(m=>String(m.id)===filters.mfr)?.name}</span>}
          {(filters.priceMin||filters.priceMax)&&<span style={{background:"#EF444418",color:"#EF4444",border:"1px solid #EF444455",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>CHF {filters.priceMin||"0"} – {filters.priceMax||"∞"}</span>}
        </div>
      )}

      {/* Empty state */}
      {visible.length===0&&(
        <Card style={{padding:40,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔍</div>
          <div style={{fontWeight:700,marginBottom:6}}>Keine Geräte gefunden</div>
          <div style={{color:T.muted,fontSize:13,marginBottom:16}}>Passen Sie die Suchbegriffe oder Filter an.</div>
          <Btn variant="ghost" onClick={resetFilters}>Filter zurücksetzen</Btn>
        </Card>
      )}

      {/* Product Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {visible.map(e=>{
          const mfrName=manufacturers.find(m=>m.id===e.mfr)?.name||"—";
          const hl=(str)=>{
            if(!search||!str||typeof str!=="string") return str;
            const idx=str.toLowerCase().indexOf(search.toLowerCase());
            if(idx<0) return str;
            return <>{str.slice(0,idx)}<mark style={{background:T.gold+"66",borderRadius:2,padding:"0 1px"}}>{str.slice(idx,idx+search.length)}</mark>{str.slice(idx+search.length)}</>;
          };
          return (
            <Card key={e.id} style={{padding:18,position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:44,height:44,borderRadius:12,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{e.icon}</div>
                  {e.artNr&&<span style={{fontSize:10,color:T.muted,background:T.bg,border:`1px solid ${T.border}`,borderRadius:4,padding:"2px 6px",fontFamily:"monospace",letterSpacing:.3}}>{hl(e.artNr)}</span>}
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>openEdit(e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:T.muted,padding:4}}>✏️</button>
                  <button onClick={()=>del(e.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:T.muted,padding:4}}>🗑️</button>
                </div>
              </div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4,lineHeight:1.3}}>{hl(e.name)}</div>
              <div style={{fontSize:11.5,color:T.muted,marginBottom:10,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{e.desc}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                <Badge color={e.color}>{e.cat}</Badge>
                <Badge color={T.greenMid}>{e.mat}</Badge>
                <Badge color="#6B7280">{e.age}</Badge>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${T.border}`,paddingTop:10}}>
                <span style={{fontSize:11,color:T.muted}}>⬡ {e.fallZone}m · {mfrName}</span>
                <span className="syne" style={{fontWeight:800,color:T.green,fontSize:16}}>{fmt(e.price)}</span>
              </div>
            </Card>
          );
        })}
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
  const [editing,setEditing]=useState(null); // { id, field }

  function update(id,field,val){
    setWorkPrices(p=>p.map(w=>w.id===id?{...w,[field]:field==="price"?Number(val):val}:w));
  }
  const inputSt={width:"100%",padding:"5px 8px",border:`1px solid ${T.border}`,borderRadius:5,fontSize:13,fontFamily:"inherit",background:T.bg,outline:"none",boxSizing:"border-box"};
  const cellSt={padding:"8px 6px",verticalAlign:"middle"};

  return (
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Arbeitspreise</div><div style={{color:T.muted,fontSize:13}}>Montage- & Aufbaukosten — Klick in Feld zum Bearbeiten</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:20}}>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:14}}>Preisliste</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
              {["Leistung","Einheit","Preis",""].map(h=><th key={h} style={{padding:"8px 6px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",color:T.muted}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {workPrices.map(w=>(
                <tr key={w.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  {/* Name */}
                  <td style={cellSt}>
                    <input value={w.name} onChange={e=>update(w.id,"name",e.target.value)} style={{...inputSt,fontWeight:600}}/>
                  </td>
                  {/* Unit */}
                  <td style={{...cellSt,width:110}}>
                    <select value={w.unit} onChange={e=>update(w.id,"unit",e.target.value)} style={{...inputSt,cursor:"pointer"}}>
                      {["h","m²","m³","m","pauschal","Stk","Tag"].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </td>
                  {/* Price */}
                  <td style={{...cellSt,width:120}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <input type="number" value={w.price} onChange={e=>update(w.id,"price",e.target.value)}
                        style={{...inputSt,textAlign:"right",fontWeight:700,color:T.green}}/>
                      <span style={{fontSize:11,color:T.muted}}>CHF</span>
                    </div>
                  </td>
                  {/* Delete */}
                  <td style={{...cellSt,width:30,textAlign:"center"}}>
                    <button onClick={()=>setWorkPrices(p=>p.filter(x=>x.id!==w.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:14}} title="Löschen">🗑️</button>
                  </td>
                </tr>
              ))}
              {workPrices.length===0&&<tr><td colSpan={4} style={{padding:20,textAlign:"center",color:T.muted,fontSize:12}}>Keine Positionen — rechts neue hinzufügen</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="syne" style={{fontWeight:700,marginBottom:14}}>Neue Position</div>
          <div style={{display:"grid",gap:12}}>
            <Input label="Leistungsbezeichnung" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))}/>
            <Select label="Einheit" value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} options={["h","m²","m³","m","pauschal","Stk","Tag"]}/>
            <Input label="Preis (CHF)" type="number" value={form.price} onChange={v=>setForm(f=>({...f,price:Number(v)}))}/>
            <Btn onClick={()=>{if(form.name){setWorkPrices(p=>[...p,{...form,id:Date.now()}]);setForm({name:"",unit:"h",price:0});}}}>+ Hinzufügen</Btn>
            <div style={{fontSize:11,color:T.muted,lineHeight:1.5,marginTop:8,padding:"10px 12px",background:T.bg,borderRadius:8}}>
              💡 <b>Tipp:</b> Alle Felder in der Preisliste lassen sich direkt bearbeiten — einfach reinklicken und den Wert ändern. Änderungen wirken sich sofort auf alle Offerten aus.
            </div>
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
/* ═══════════════════════════ PROFESSIONAL PLANNER (Leaflet + Satellite) ═══════════════════════════ */
// Fall zone calculation per equipment category, following EN 1176 and KOMPAN specs.
// Returns {shape:"circle"|"rect", params} in METERS relative to equipment center.
function calcFallZone(eq) {
  if (!eq || !eq.fallZone || eq.fallZone <= 0) return null;
  const [w, h] = eq.size || [2, 2];
  const fz = eq.fallZone;
  // Swings: rectangular zone extending forward and backward of the swing direction
  if (eq.cat === "Schaukeln") {
    // Swing swings along h-axis; frontal clearance = 2× swing height (EN 1176)
    return { shape: "rect", w: w + 1.0, h: h + fz * 2 };
  }
  // Carousels: circular zone = radius of carousel + fallZone
  if (eq.cat === "Karussell") {
    const r = Math.max(w, h) / 2 + fz;
    return { shape: "circle", r };
  }
  // Slides: rectangle extending forward (in h-direction) from end of slide
  if (eq.cat === "Rutschen") {
    return { shape: "rect", w: w + 1.0, h: h + fz + 1.5 };
  }
  // All others (climbing, see-saws, houses, balance): rectangle equipment + fallZone margin
  return { shape: "rect", w: w + fz * 2, h: h + fz * 2 };
}

// Detect if 2 placed items' fall zones overlap (positions in lat/lng)
function zonesOverlap(a, ea, b, eb) {
  const za = calcFallZone(ea); const zb = calcFallZone(eb);
  if (!za || !zb) return false;
  const ra = za.shape === "circle" ? za.r : Math.max(za.w, za.h) / 2;
  const rb = zb.shape === "circle" ? zb.r : Math.max(zb.w, zb.h) / 2;
  if (a.lat == null || b.lat == null) return false;
  const mPerLat = 111320;
  const lat0 = (a.lat + b.lat) / 2;
  const mPerLng = 111320 * Math.cos(lat0 * Math.PI / 180);
  const dx = (a.lng - b.lng) * mPerLng;
  const dy = (a.lat - b.lat) * mPerLat;
  return Math.sqrt(dx * dx + dy * dy) < ra + rb;
}

// Ray-casting Point-in-Polygon (lat/lng koordinaten)
function pointInPolygon(lat, lng, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [lati, lngi] = poly[i];
    const [latj, lngj] = poly[j];
    const intersect = ((lati > lat) !== (latj > lat)) &&
      (lng < (lngj - lngi) * (lat - lati) / (latj - lati) + lngi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Prüft ob ein Gerät in ein Gebäude-Polygon oder zu nah an einen Baum platziert wird
function isBlockedByObstacle(lat, lng, obstacles) {
  if (!obstacles) return false;
  for (const ob of obstacles) {
    if (ob.type === "buildingPoly" && ob.polygon) {
      if (pointInPolygon(lat, lng, ob.polygon)) return { type: "building", label: ob.label };
    } else if (ob.type === "building") {
      // rechteckiges Gebäude (rotiert) — bbox-check in lokale meter
      const dx = (lng - ob.lng) * 111320 * Math.cos(ob.lat * Math.PI / 180);
      const dy = (lat - ob.lat) * 111320;
      const rot = -(ob.rot || 0) * Math.PI / 180;
      const lx = dx * Math.cos(rot) - dy * Math.sin(rot);
      const ly = dx * Math.sin(rot) + dy * Math.cos(rot);
      if (Math.abs(lx) <= (ob.w || 6) / 2 && Math.abs(ly) <= (ob.h || 4) / 2) {
        return { type: "building", label: ob.label };
      }
    }
  }
  return false;
}

/* Fallschutz-Flächenberechnung (EN 1177):
   - individualSum = Summe aller einzelnen Fallzonen (theoretisch, wenn Geräte isoliert wären)
   - mergedArea   = tatsächlich benötigter zusammenhängender Belag (inkl. ~30cm Verbindungs-Puffer
                    zwischen nahen Geräten und gerundete/saubere Schnittflächen). Wird durch
                    Grid-Rasterisierung mit morphologischem Closing berechnet.
   - perimeter    = äusserer Umfang (für Randabschluss-Berechnung in der Offerte)
*/
function computeFallProtectionArea(placed, equipment, projectCenter) {
  const BUFFER = 0.3;  // 30cm "clean edge" Puffer = realistisch für EPDM/Fallschutzbelag
  const CELL = 0.15;   // 15cm Rastergröße (gute Balance Genauigkeit vs. Performance)

  if (!placed || !placed.length) return { individualSum: 0, mergedArea: 0, clusters: 0, zones: 0 };

  // Sammle Fallzonen in lokalen Metern relativ zum Projektzentrum
  const zones = [];
  const mPerLat = 111320;
  const mPerLng = 111320 * Math.cos(projectCenter.lat * Math.PI / 180);

  for (const pl of placed) {
    const eq = equipment.find(x => x.id === pl.eqId);
    if (!eq || !eq.fallZone || eq.fallZone <= 0.6) continue;
    const zone = calcFallZone(eq);
    if (!zone) continue;
    const x = (pl.lng - projectCenter.lng) * mPerLng;
    const y = (pl.lat - projectCenter.lat) * mPerLat;
    zones.push({
      shape: zone.shape,
      r: zone.r,
      w: zone.w,
      h: zone.h,
      x, y,
      rot: (pl.rot || 0) * Math.PI / 180,
    });
  }

  if (zones.length === 0) return { individualSum: 0, mergedArea: 0, clusters: 0, zones: 0 };

  // Summe individueller Flächen (ohne Verbindung)
  const individualSum = zones.reduce((s, z) => {
    if (z.shape === "circle") return s + Math.PI * z.r * z.r;
    return s + z.w * z.h;
  }, 0);

  // Bounding box + Puffer
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const z of zones) {
    const rMax = z.shape === "circle" ? z.r : Math.hypot(z.w, z.h) / 2;
    const pad = rMax + BUFFER + CELL;
    minX = Math.min(minX, z.x - pad); maxX = Math.max(maxX, z.x + pad);
    minY = Math.min(minY, z.y - pad); maxY = Math.max(maxY, z.y + pad);
  }
  const cols = Math.ceil((maxX - minX) / CELL);
  const rows = Math.ceil((maxY - minY) / CELL);
  if (cols * rows > 500000) {
    // Too large; fall back to individual sum
    return { individualSum: Math.round(individualSum * 10) / 10, mergedArea: Math.round(individualSum * 10) / 10, clusters: zones.length, zones: zones.length };
  }
  const grid = new Uint8Array(cols * rows);

  // Rasterisiere jede Zone mit Puffer (= morphologische Dilation)
  for (const z of zones) {
    if (z.shape === "circle") {
      const rB = z.r + BUFFER;
      const iMin = Math.max(0, Math.floor((z.x - rB - minX) / CELL));
      const iMax = Math.min(cols - 1, Math.ceil((z.x + rB - minX) / CELL));
      const jMin = Math.max(0, Math.floor((z.y - rB - minY) / CELL));
      const jMax = Math.min(rows - 1, Math.ceil((z.y + rB - minY) / CELL));
      const r2 = rB * rB;
      for (let j = jMin; j <= jMax; j++) {
        for (let i = iMin; i <= iMax; i++) {
          const cx = minX + (i + 0.5) * CELL;
          const cy = minY + (j + 0.5) * CELL;
          const dx = cx - z.x, dy = cy - z.y;
          if (dx * dx + dy * dy <= r2) grid[j * cols + i] = 1;
        }
      }
    } else {
      const hw = z.w / 2 + BUFFER;
      const hh = z.h / 2 + BUFFER;
      const rMax = Math.hypot(hw, hh);
      const iMin = Math.max(0, Math.floor((z.x - rMax - minX) / CELL));
      const iMax = Math.min(cols - 1, Math.ceil((z.x + rMax - minX) / CELL));
      const jMin = Math.max(0, Math.floor((z.y - rMax - minY) / CELL));
      const jMax = Math.min(rows - 1, Math.ceil((z.y + rMax - minY) / CELL));
      const cos = Math.cos(-z.rot), sin = Math.sin(-z.rot);
      for (let j = jMin; j <= jMax; j++) {
        for (let i = iMin; i <= iMax; i++) {
          const cx = minX + (i + 0.5) * CELL;
          const cy = minY + (j + 0.5) * CELL;
          const dx = cx - z.x, dy = cy - z.y;
          const lx = dx * cos - dy * sin;
          const ly = dx * sin + dy * cos;
          if (Math.abs(lx) <= hw && Math.abs(ly) <= hh) grid[j * cols + i] = 1;
        }
      }
    }
  }

  // Zähle gefüllte Zellen + ermittle Cluster (zusammenhängende Flächen via Flood-Fill)
  let filled = 0;
  let clusters = 0;
  const visited = new Uint8Array(cols * rows);
  const stack = [];
  for (let idx = 0; idx < grid.length; idx++) {
    if (!grid[idx]) continue;
    filled++;
    if (visited[idx]) continue;
    clusters++;
    stack.push(idx);
    while (stack.length) {
      const k = stack.pop();
      if (visited[k] || !grid[k]) continue;
      visited[k] = 1;
      const j = Math.floor(k / cols), i = k % cols;
      if (i > 0) stack.push(k - 1);
      if (i < cols - 1) stack.push(k + 1);
      if (j > 0) stack.push(k - cols);
      if (j < rows - 1) stack.push(k + cols);
    }
  }
  const mergedArea = filled * CELL * CELL;

  return {
    individualSum: Math.round(individualSum * 10) / 10,
    mergedArea: Math.round(mergedArea * 10) / 10,
    clusters,
    zones: zones.length,
  };
}

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

// Helper: Create a simple gradient sky environment map (equirectangular) for IBL
function makeSkyEnv(renderer) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size*2; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0,"#4A7AB5");   // zenith
  grad.addColorStop(0.4,"#B8D5E8"); // sky
  grad.addColorStop(0.6,"#F0E8D8"); // horizon
  grad.addColorStop(1,"#8B9A7A");   // ground
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size*2, size);
  // Simple sun disc
  ctx.fillStyle = "rgba(255,230,180,0.95)";
  ctx.beginPath(); ctx.arc(size*1.4, size*0.3, 14, 0, Math.PI*2); ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Planner({project,equipment,setProjects,setPage,setActiveProjectId}) {
  const [view,setView]=useState("2d");
  const [selected,setSelected]=useState(null);
  const [tool,setTool]=useState("select"); // select | tree | building | measure
  const [libOpen,setLibOpen]=useState(true);
  const [libSearch,setLibSearch]=useState("");
  const [libCat,setLibCat]=useState("Alle");
  const [conflicts,setConflicts]=useState([]);
  const [mapStyle,setMapStyle]=useState("satellite"); // satellite | streets | hybrid
  const [addrQuery,setAddrQuery]=useState("");

  const mapContainerRef=useRef(null);
  const mapRef=useRef(null);
  const layersRef=useRef({ equipment:null, fallZones:null, obstacles:null, area:null, measure:null });
  const threeContainerRef=useRef(null);
  const threeRef=useRef(null);
  const animRef=useRef(null);
  const targetRef=useRef(new THREE.Vector3(0,1.5,0));
  // Refs to avoid stale closures in Leaflet event handlers
  const toolRef=useRef("select");
  const pendingEqRef=useRef(null); // equipment id to place on next map click
  const measureRef=useRef({first:null, layer:null});
  const [pendingEq,setPendingEq]=useState(null);
  const [measureInfo,setMeasureInfo]=useState(null);
  const [collisionWarning,setCollisionWarning]=useState(false);
  const [renderStudioOpen,setRenderStudioOpen]=useState(false);
  // Fallschutz-Darstellung
  const [fpMerged,setFpMerged]=useState(true);  // true = verschmolzen (mit Puffer), false = einzeln pro Gerät
  const [fpColor,setFpColor]=useState("#2A1F18"); // EPDM-Farbe (Bildschirm + Offerte-Info)
  const [fpColorPickerOpen,setFpColorPickerOpen]=useState(false);

  const placed=project.placed||[];
  const obstacles=project.obstacles||[];

  // Project location — saved per project, default Bern if missing
  const projectCenter = project.geo || { lat: 46.9480, lng: 7.4474, zoom: 19 };

  function updateProject(fn){
    setProjects(prev=>prev.map(p=>p.id===project.id?fn(p):p));
  }

  // Conflict detection between dynamic equipment
  useEffect(()=>{
    const conf=[];
    const dynamic=placed.filter(pl=>{
      const e=equipment.find(x=>x.id===pl.eqId);
      return e && DYNAMIC_CATS.includes(e.cat) && e.fallZone > 0;
    });
    for(let i=0;i<dynamic.length;i++){
      for(let j=i+1;j<dynamic.length;j++){
        const ea=equipment.find(x=>x.id===dynamic[i].eqId);
        const eb=equipment.find(x=>x.id===dynamic[j].eqId);
        if(zonesOverlap(dynamic[i],ea,dynamic[j],eb)) conf.push([dynamic[i].id,dynamic[j].id]);
      }
    }
    setConflicts(conf);
  },[placed,equipment]);

  /* ────── LEAFLET MAP INIT (einmal beim Mount) ────── */
  useEffect(()=>{
    if(!mapContainerRef.current||!window.L) return;
    if(mapRef.current) return;

    const L=window.L;
    const map=L.map(mapContainerRef.current,{
      center:[projectCenter.lat,projectCenter.lng],
      zoom:projectCenter.zoom,
      maxZoom:22, zoomControl:false, preferCanvas:false,
    });
    L.control.zoom({position:"topright"}).addTo(map);
    L.control.scale({imperial:false,position:"bottomright"}).addTo(map);

    // Tile layers
    const layers={
      satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom:22, maxNativeZoom:19, attribution:"Tiles © Esri" }
      ),
      streets: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom:19, attribution:"© OpenStreetMap" }
      ),
      hybrid: L.layerGroup([
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:22,maxNativeZoom:19}),
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:22,maxNativeZoom:19,opacity:.9}),
      ]),
    };
    layers[mapStyle].addTo(map);
    map._layerRefs=layers;

    // Layer groups for dynamic items
    layersRef.current.fallZones=L.layerGroup().addTo(map);
    layersRef.current.equipment=L.layerGroup().addTo(map);
    layersRef.current.obstacles=L.layerGroup().addTo(map);
    layersRef.current.area=L.layerGroup().addTo(map);

    // Click handler for tools — reads from refs for fresh values
    map.on("click",(e)=>{
      const t=toolRef.current;
      const pending=pendingEqRef.current;
      if(pending){
        // Check collision before placing
        const movedPl={id:"__tmp",eqId:pending.id,lat:e.latlng.lat,lng:e.latlng.lng,rot:0};
        const eq=pending;
        // In Gebäude?
        const blocker=isBlockedByObstacle(e.latlng.lat,e.latlng.lng,obstacles);
        if(blocker){
          setCollisionWarning(`Nicht auf Gebäude platzierbar: ${blocker.label}`);
          setTimeout(()=>setCollisionWarning(false),2500);
          return;
        }
        const hasConflict = placed.some(other=>{
          const otherEq=equipment.find(x=>x.id===other.eqId);
          if(!otherEq) return false;
          if(!DYNAMIC_CATS.includes(eq.cat)||!DYNAMIC_CATS.includes(otherEq.cat)) return false;
          if(!eq.fallZone||!otherEq.fallZone) return false;
          return zonesOverlap(movedPl,eq,other,otherEq);
        });
        if(hasConflict){
          setCollisionWarning("Fallräume dürfen sich nicht überschneiden");
          setTimeout(()=>setCollisionWarning(false),2500);
          return; // Stay in place-mode, let user try again
        }
        // Place the pending equipment here
        const id=uid();
        updateProject(p=>({...p,placed:[...(p.placed||[]),{id,eqId:pending.id,lat:e.latlng.lat,lng:e.latlng.lng,rot:0}]}));
        pendingEqRef.current=null;
        setPendingEq(null);
        setSelected({type:"eq",id});
      } else if(t==="tree"){
        const id=uid();
        updateProject(p=>({...p,obstacles:[...(p.obstacles||[]),{id,type:"tree",lat:e.latlng.lat,lng:e.latlng.lng,r:3,label:"Baum"}]}));
      } else if(t==="building"){
        const id=uid();
        updateProject(p=>({...p,obstacles:[...(p.obstacles||[]),{id,type:"building",lat:e.latlng.lat,lng:e.latlng.lng,w:6,h:4,label:"Gebäude"}]}));
      } else if(t==="measure"){
        const m=measureRef.current;
        if(!m.first){
          // first point
          m.first=e.latlng;
          if(m.layer){ m.layer.clearLayers(); } else { m.layer=L.layerGroup().addTo(map); }
          L.circleMarker(m.first,{radius:5,color:"#D4A853",fillColor:"#D4A853",fillOpacity:1,weight:2}).addTo(m.layer);
        } else {
          // second point — show distance
          const a=m.first, b=e.latlng;
          const R=6371000;
          const toRad=(d)=>d*Math.PI/180;
          const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
          const aa=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
          const dist=2*R*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));
          L.polyline([a,b],{color:"#D4A853",weight:3,dashArray:"6 6"}).addTo(m.layer);
          L.circleMarker(b,{radius:5,color:"#D4A853",fillColor:"#D4A853",fillOpacity:1,weight:2}).addTo(m.layer);
          const midLat=(a.lat+b.lat)/2, midLng=(a.lng+b.lng)/2;
          const label=dist<1?`${(dist*100).toFixed(0)} cm`:dist<1000?`${dist.toFixed(2)} m`:`${(dist/1000).toFixed(2)} km`;
          L.marker([midLat,midLng],{icon:L.divIcon({
            className:"",
            html:`<div style="background:#D4A853;color:white;padding:3px 9px;border-radius:4px;font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);">📏 ${label}</div>`,
            iconSize:[0,0], iconAnchor:[0,0],
          })}).addTo(m.layer);
          setMeasureInfo({distance:dist,label,a,b});
          m.first=null;
        }
      } else {
        setSelected(null);
      }
    });

    // Save view changes
    map.on("moveend zoomend",()=>{
      const c=map.getCenter();
      updateProject(p=>({...p,geo:{lat:c.lat,lng:c.lng,zoom:map.getZoom()}}));
    });

    mapRef.current=map;
    return ()=>{ if(mapRef.current){ map.remove(); mapRef.current=null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // View-change: resize renderer and map correctly (this was the 3D-sticky bug)
  useEffect(()=>{
    // Small delay so CSS display-toggle has taken effect before we query sizes
    const t=setTimeout(()=>{
      if(view==="2d"&&mapRef.current){
        mapRef.current.invalidateSize();
      }
      if(view==="3d"&&threeRef.current&&threeContainerRef.current){
        const { renderer, camera } = threeRef.current;
        const c=threeContainerRef.current;
        const w=c.clientWidth||800, h=c.clientHeight||500;
        renderer.setSize(w,h);
        camera.aspect=w/h; camera.updateProjectionMatrix();
        threeRef.current.render();
      }
    },80);
    return ()=>clearTimeout(t);
  },[view]);

  // Switch tile layer
  useEffect(()=>{
    if(!mapRef.current||!mapRef.current._layerRefs) return;
    const refs=mapRef.current._layerRefs;
    Object.values(refs).forEach(l=>{ try{ mapRef.current.removeLayer(l); }catch(e){} });
    refs[mapStyle].addTo(mapRef.current);
  },[mapStyle]);

  // Sync equipment / fallZones / obstacles
  useEffect(()=>{
    if(!mapRef.current||!window.L) return;
    const L=window.L;
    const map=mapRef.current;
    const { equipment:eqLayer, fallZones:fzLayer, obstacles:obLayer } = layersRef.current;
    if(!eqLayer) return;
    eqLayer.clearLayers(); fzLayer.clearLayers(); obLayer.clearLayers();

    const mToDeg=(m)=>m/111320; // approx at equator, good enough for small area

    // FALL PROTECTION SURFACE (EN 1177) – EPDM-Fläche unter Geräten mit Fallhöhe > 60cm.
    // Modus "merged" (Standard): 0.3m Puffer → nahe Geräte ergeben visuell eine zusammenhängende Fläche.
    // Modus "einzeln": exakte Fallzone pro Gerät (ohne Puffer), für nicht-zusammenhängende Planung.
    const FP_BUFFER = fpMerged ? 0.3 : 0;
    // Dunklere Farbe für Umrandung (für dunkle Farben Original, für helle Farben dunkel)
    function darken(hex){
      const c=parseInt(hex.slice(1),16);
      const r=Math.max(0,((c>>16)&255)-40);
      const g=Math.max(0,((c>>8)&255)-40);
      const b=Math.max(0,(c&255)-40);
      return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
    }
    const fpStrokeColor=darken(fpColor);
    placed.forEach(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return;
      if(!eq.fallZone||eq.fallZone<=0.6) return; // nur bei relevanter Fallhöhe
      const zone=calcFallZone(eq); if(!zone) return;
      const fpStyle={ color:fpStrokeColor, weight:1, fillColor:fpColor, fillOpacity:.88, opacity:.9 };
      if(zone.shape==="circle"){
        L.circle([pl.lat||projectCenter.lat,pl.lng||projectCenter.lng],{radius:zone.r+FP_BUFFER,...fpStyle}).addTo(fzLayer);
      } else {
        const rot=(pl.rot||0)*Math.PI/180;
        const hw=zone.w/2+FP_BUFFER, hh=zone.h/2+FP_BUFFER;
        const corners=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([x,y])=>{
          const rx=x*Math.cos(rot)-y*Math.sin(rot);
          const ry=x*Math.sin(rot)+y*Math.cos(rot);
          const lat=(pl.lat||projectCenter.lat)+mToDeg(ry);
          const lng=(pl.lng||projectCenter.lng)+mToDeg(rx)/Math.cos((pl.lat||projectCenter.lat)*Math.PI/180);
          return [lat,lng];
        });
        L.polygon(corners,fpStyle).addTo(fzLayer);
      }
    });

    // FALL ZONES outline (EN 1176) – auf Fallschutz, zeigt Sicherheitszone
    placed.forEach(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return;
      const zone=calcFallZone(eq); if(!zone) return;
      const inConflict=conflicts.some(c=>c.includes(pl.id));
      const col=inConflict?"#DC2626":"#F59E0B";
      const fill=inConflict?"#DC262633":"#F59E0B11";
      if(zone.shape==="circle"){
        L.circle([pl.lat||projectCenter.lat,pl.lng||projectCenter.lng],{
          radius:zone.r, color:col, weight:2, fillColor:fill, fillOpacity:.3, dashArray:"6 4",
        }).addTo(fzLayer);
      } else {
        // rectangle: compute corners at {w,h} in meters around center
        const rot=(pl.rot||0)*Math.PI/180;
        const hw=zone.w/2, hh=zone.h/2;
        const corners=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([x,y])=>{
          const rx=x*Math.cos(rot)-y*Math.sin(rot);
          const ry=x*Math.sin(rot)+y*Math.cos(rot);
          const lat=(pl.lat||projectCenter.lat)+mToDeg(ry);
          const lng=(pl.lng||projectCenter.lng)+mToDeg(rx)/Math.cos((pl.lat||projectCenter.lat)*Math.PI/180);
          return [lat,lng];
        });
        L.polygon(corners,{ color:col, weight:2, fillColor:fill, fillOpacity:.3, dashArray:"6 4" }).addTo(fzLayer);
      }
    });

    // EQUIPMENT MARKERS
    placed.forEach(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return;
      const isSel=selected&&selected.type==="eq"&&selected.id===pl.id;
      const rot=pl.rot||0;
      // Size of marker grows slightly with equipment size (visual hint only)
      const baseSize=44;
      const arrow=isSel?`<div style="
          position:absolute;left:50%;top:-14px;width:2px;height:22px;
          background:#1B4332;transform-origin:bottom center;
          transform:translateX(-50%) rotate(${rot}deg);pointer-events:none;
        "><div style="
          position:absolute;top:-6px;left:-5px;
          width:0;height:0;border-left:6px solid transparent;
          border-right:6px solid transparent;border-bottom:8px solid #1B4332;
        "></div></div>`:"";
      const iconContent=SVG_ICONS[eq.cat]||`<span style="font-size:21px">${eq.icon}</span>`;
      const icon=L.divIcon({
        className:"",
        html:`<div style="position:relative;width:${baseSize}px;height:${baseSize}px;">
          ${arrow}
          <div style="
            width:${baseSize}px;height:${baseSize}px;border-radius:50%;
            background:${eq.color};
            border:3px solid ${isSel?"#1B4332":"white"};
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            cursor:grab;
            transform:${isSel?"scale(1.15)":"scale(1)"} rotate(${rot}deg);
            transition:transform .15s ease;
          "><div style="transform:rotate(${-rot}deg);display:inline-flex;">${iconContent}</div></div>
        </div>`,
        iconSize:[baseSize,baseSize], iconAnchor:[baseSize/2,baseSize/2],
      });
      const m=L.marker([pl.lat||projectCenter.lat,pl.lng||projectCenter.lng],{
        icon, draggable:true, riseOnHover:true,
      }).addTo(eqLayer);
      m.bindTooltip(`<b>${eq.name}</b><br><small>${eq.cat} · ${fmt(eq.price)}${pl.rot?` · ${pl.rot}°`:""}</small>`,{direction:"top",offset:[0,-20]});
      m.on("click",()=>setSelected({type:"eq",id:pl.id}));
      // Store pre-drag position to revert on conflict
      m.on("dragstart",(e)=>{
        e.target._preDrag={lat:pl.lat,lng:pl.lng};
      });
      m.on("dragend",(e)=>{
        const ll=e.target.getLatLng();
        // In Gebäude?
        const blocker=isBlockedByObstacle(ll.lat,ll.lng,obstacles);
        if(blocker){
          const pd=e.target._preDrag||{lat:pl.lat,lng:pl.lng};
          e.target.setLatLng([pd.lat,pd.lng]);
          setCollisionWarning(`Nicht auf Gebäude: ${blocker.label}`);
          setTimeout(()=>setCollisionWarning(false),2500);
          return;
        }
        // Check if new position causes fall zone overlap with ANY other dynamic equipment
        const movedPl={...pl, lat:ll.lat, lng:ll.lng};
        const hasConflict = placed.some(other=>{
          if(other.id===pl.id) return false;
          const otherEq=equipment.find(x=>x.id===other.eqId);
          if(!otherEq) return false;
          // Only block when BOTH are dynamic (swings/carousels/etc.) AND both have fallZone
          if(!DYNAMIC_CATS.includes(eq.cat)||!DYNAMIC_CATS.includes(otherEq.cat)) return false;
          if(!eq.fallZone||!otherEq.fallZone) return false;
          return zonesOverlap(movedPl,eq,other,otherEq);
        });
        if(hasConflict){
          // Revert to pre-drag position
          const pd=e.target._preDrag||{lat:pl.lat,lng:pl.lng};
          e.target.setLatLng([pd.lat,pd.lng]);
          setCollisionWarning("Fallräume überschneiden sich");
          setTimeout(()=>setCollisionWarning(false),2500);
        } else {
          updateProject(p=>({...p,placed:p.placed.map(x=>x.id===pl.id?{...x,lat:ll.lat,lng:ll.lng}:x)}));
        }
      });
    });

    // OBSTACLES (trees, buildings)
    obstacles.forEach(ob=>{
      if(ob.type==="tree"){
        const isSel=selected&&selected.type==="ob"&&selected.id===ob.id;
        const icon=L.divIcon({
          className:"",
          html:`<div style="
            width:38px;height:38px;border-radius:50%;
            background:#065F46;border:3px solid ${isSel?"#D4A853":"white"};
            box-shadow:0 3px 8px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;cursor:grab;
          ">🌳</div>`,
          iconSize:[38,38], iconAnchor:[19,19],
        });
        const m=L.marker([ob.lat,ob.lng],{icon,draggable:true}).addTo(obLayer);
        m.bindTooltip(`${ob.label} (Ø${(ob.r||3)*2}m)`,{direction:"top",offset:[0,-16]});
        m.on("click",()=>setSelected({type:"ob",id:ob.id}));
        m.on("dragend",(e)=>{
          const ll=e.target.getLatLng();
          updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===ob.id?{...x,lat:ll.lat,lng:ll.lng}:x)}));
        });
        // Tree crown circle
        L.circle([ob.lat,ob.lng],{
          radius:ob.r||3, color:"#065F46", weight:1.5, fillColor:"#10B981", fillOpacity:.22,
        }).addTo(obLayer);
      } else if(ob.type==="greenArea" && ob.polygon){
        const isSel=selected&&selected.type==="ob"&&selected.id===ob.id;
        // Grünfläche (Wald, Park) — grüne transparente Zone, zur Info
        L.polygon(ob.polygon,{
          color:isSel?"#D4A853":"#14532D", weight:isSel?2.5:1.5,
          fillColor:"#22C55E", fillOpacity:.22, dashArray:"4 4",
        }).addTo(obLayer).on("click",()=>setSelected({type:"ob",id:ob.id}));
        const icon=L.divIcon({
          className:"",
          html:`<div style="
            background:rgba(21,83,45,0.88);color:white;padding:2px 7px;border-radius:4px;
            font-size:10.5px;font-weight:700;white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.4);
            transform:translate(-50%,-50%);
          ">🌲 ${ob.label}</div>`,
          iconSize:[0,0], iconAnchor:[0,0],
        });
        L.marker([ob.lat,ob.lng],{icon,interactive:false}).addTo(obLayer);
      } else if(ob.type==="buildingPoly"){
        const isSel=selected&&selected.type==="ob"&&selected.id===ob.id;
        // Gebäude-Polygon direkt aus OSM-Koordinaten
        L.polygon(ob.polygon,{
          color:isSel?"#D4A853":"#B91C1C", weight:isSel?3:2.5,
          fillColor:"#EF4444", fillOpacity:.35, dashArray:isSel?null:"6 3",
        }).addTo(obLayer).on("click",()=>setSelected({type:"ob",id:ob.id}));
        // Kleiner Label-Marker in der Mitte
        const icon=L.divIcon({
          className:"",
          html:`<div style="
            background:${isSel?"#D4A853":"rgba(185,28,28,0.92)"};
            color:white;padding:3px 8px;border-radius:4px;
            font-size:11px;font-weight:700;white-space:nowrap;
            box-shadow:0 2px 5px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.4);
            transform:translate(-50%,-50%);
          ">🏢 ${ob.label}</div>`,
          iconSize:[0,0], iconAnchor:[0,0],
        });
        L.marker([ob.lat,ob.lng],{icon,interactive:false}).addTo(obLayer);
      } else if(ob.type==="building"){
        const isSel=selected&&selected.type==="ob"&&selected.id===ob.id;
        const mToDegLat=(m)=>m/111320;
        const lat=ob.lat, lng=ob.lng;
        const hw=(ob.w||6)/2, hh=(ob.h||4)/2;
        const rot=((ob.rot||0)*Math.PI)/180;
        // Rotate corners around center
        const corners=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([x,y])=>{
          const rx=x*Math.cos(rot)-y*Math.sin(rot);
          const ry=x*Math.sin(rot)+y*Math.cos(rot);
          return [lat+mToDegLat(ry), lng+mToDegLat(rx)/Math.cos(lat*Math.PI/180)];
        });
        L.polygon(corners,{
          color:isSel?"#D4A853":"#374151", weight:isSel?2.5:2, fillColor:"#9CA3AF", fillOpacity:.6,
        }).addTo(obLayer);
        // Draggable center marker — icon rotates with building
        const icon=L.divIcon({
          className:"",
          html:`<div style="
            width:32px;height:32px;border-radius:6px;
            background:#374151;border:2px solid ${isSel?"#D4A853":"white"};
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            color:white;font-size:16px;cursor:grab;
            transform:rotate(${ob.rot||0}deg);
          "><span style="transform:rotate(${-(ob.rot||0)}deg);display:inline-block;">🏠</span></div>`,
          iconSize:[32,32], iconAnchor:[16,16],
        });
        const m=L.marker([lat,lng],{icon,draggable:true}).addTo(obLayer);
        m.bindTooltip(`${ob.label} (${ob.w||6}×${ob.h||4}m${ob.rot?` · ${ob.rot}°`:""})`,{direction:"top",offset:[0,-14]});
        m.on("click",()=>setSelected({type:"ob",id:ob.id}));
        m.on("dragend",(e)=>{
          const ll=e.target.getLatLng();
          updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===ob.id?{...x,lat:ll.lat,lng:ll.lng}:x)}));
        });
      }
    });
  },[placed,obstacles,selected,conflicts,equipment,view,fpMerged,fpColor]);

  // Cursor feedback + sync toolRef
  useEffect(()=>{
    toolRef.current=tool;
    if(!mapContainerRef.current) return;
    const cur={ select:"grab", tree:"copy", building:"copy", measure:"crosshair", place:"copy" }[tool]||"grab";
    mapContainerRef.current.style.cursor=cur;
    // When leaving measure tool, clear any half-drawn measurement
    if(tool!=="measure"&&measureRef.current.layer){
      measureRef.current.layer.clearLayers();
      measureRef.current.first=null;
      setMeasureInfo(null);
    }
  },[tool]);

  // Sync pendingEq ref whenever state changes
  useEffect(()=>{ pendingEqRef.current=pendingEq; },[pendingEq]);
  // Show crosshair cursor when ready to place equipment
  useEffect(()=>{
    if(!mapContainerRef.current) return;
    if(pendingEq) mapContainerRef.current.style.cursor="copy";
  },[pendingEq]);

  /* ────── ACTIONS ────── */
  function addEquipment(eq){
    if(!mapRef.current) return;
    // Arm for placement on next map click (visual cursor change)
    setPendingEq(eq);
    setTool("place");
    toolRef.current="place";
  }
  function rotateSelected(deg){
    if(!selected||selected.type!=="eq") return;
    const step=((deg%360)+360)%360;
    updateProject(p=>({...p,placed:p.placed.map(x=>x.id===selected.id?{...x,rot:((x.rot||0)+deg+360)%360}:x)}));
  }
  function deleteSelected(){
    if(!selected) return;
    if(selected.type==="eq") updateProject(p=>({...p,placed:p.placed.filter(x=>x.id!==selected.id)}));
    else updateProject(p=>({...p,obstacles:p.obstacles.filter(x=>x.id!==selected.id)}));
    setSelected(null);
  }
  function autoPlace(){
    if(!mapRef.current) return;
    const ages=project.wizard?.ages||[];
    const suitable=equipment.filter(e=>ages.length===0||ages.some(a=>e.age===a||e.age==="Altersgemischt")).slice(0,6);
    const c=mapRef.current.getCenter();
    const mToDeg=(m)=>m/111320;
    const cols=3;
    const newPlaced=suitable.map((eq,i)=>{
      const row=Math.floor(i/cols), col=i%cols;
      const dx=(col-1)*7, dy=(row-0.5)*7;
      return { id:uid(), eqId:eq.id,
        lat:c.lat+mToDeg(dy),
        lng:c.lng+mToDeg(dx)/Math.cos(c.lat*Math.PI/180),
        rot:0 };
    });
    updateProject(p=>({...p,placed:[...(p.placed||[]),...newPlaced]}));
  }
  async function searchAddress(){
    if(!addrQuery||!mapRef.current) return;
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addrQuery)}&countrycodes=ch,de,at,li&limit=1`);
      const data=await r.json();
      if(data[0]){
        mapRef.current.setView([parseFloat(data[0].lat),parseFloat(data[0].lon)],19);
      }
    }catch(e){ console.warn("geocode failed",e); }
  }

  const [osmLoading,setOsmLoading]=useState(false);
  const [osmStatus,setOsmStatus]=useState(null); // {type:"info"|"error", msg}

  // OSM-Features (Gebäude & Bäume) aus dem aktuellen Kartenausschnitt via Overpass API
  async function detectFromOrthophoto(){
    if(!mapRef.current) return;
    setOsmLoading(true); setOsmStatus({type:"info",msg:"Luftbild-Analyse läuft…"});
    try {
      const b=mapRef.current.getBounds();
      const south=b.getSouth(), west=b.getWest(), north=b.getNorth(), east=b.getEast();
      // Erweiterte Overpass-QL Query — deckt praktisch alle Arten von Vegetation + Gebäuden
      const bbox=`${south},${west},${north},${east}`;
      const query=`[out:json][timeout:30];
(
  way["building"](${bbox});
  relation["building"](${bbox});
  node["natural"="tree"](${bbox});
  way["natural"="tree_row"](${bbox});
  way["natural"="wood"](${bbox});
  relation["natural"="wood"](${bbox});
  way["natural"="scrub"](${bbox});
  way["natural"="shrubbery"](${bbox});
  way["natural"="grassland"](${bbox});
  way["natural"="heath"](${bbox});
  way["landuse"="forest"](${bbox});
  relation["landuse"="forest"](${bbox});
  way["landuse"="grass"](${bbox});
  way["landuse"="meadow"](${bbox});
  way["landuse"="recreation_ground"](${bbox});
  way["landuse"="village_green"](${bbox});
  way["leisure"="park"](${bbox});
  relation["leisure"="park"](${bbox});
  way["leisure"="garden"](${bbox});
  way["leisure"="nature_reserve"](${bbox});
  way["barrier"="hedge"](${bbox});
);
out geom;`;
      const response=await fetch("https://overpass-api.de/api/interpreter",{
        method:"POST",
        body:"data="+encodeURIComponent(query),
      });
      if(!response.ok) throw new Error(`Overpass ${response.status}`);
      const data=await response.json();

      const newObstacles=[];
      let nBuildings=0, nTrees=0, nTreeRows=0, nGreen=0;

      // Deterministisches "pseudo-random" für stabile Baumpositionen in Flächen
      function hashCoord(lat,lng,salt){
        let h=Math.sin((lat*1000+lng*1000+salt)*12.9898)*43758.5453;
        return h-Math.floor(h);
      }

      for(const el of (data.elements||[])){
        const tags=el.tags||{};

        // ── Gebäude (way oder relation) ────────────────────────────
        if(tags.building && el.geometry){
          const coords=el.geometry.map(g=>[g.lat,g.lon]);
          const cLat=coords.reduce((s,c)=>s+c[0],0)/coords.length;
          const cLng=coords.reduce((s,c)=>s+c[1],0)/coords.length;
          newObstacles.push({
            id:uid(), type:"buildingPoly",
            lat:cLat, lng:cLng, polygon:coords,
            label:tags.name||tags["addr:housename"]||"Gebäude",
            source:"osm", osmId:`${el.type}/${el.id}`,
          });
          nBuildings++;
        }
        // ── Einzelbaum ──────────────────────────────────────────────
        else if(el.type==="node" && tags.natural==="tree"){
          let r=3;
          if(tags.diameter_crown) r=parseFloat(tags.diameter_crown)/2||3;
          else if(tags.height) r=Math.max(2,parseFloat(tags.height)/3);
          newObstacles.push({
            id:uid(), type:"tree",
            lat:el.lat, lng:el.lon, r:Math.max(1.5,Math.min(8,r)),
            label:tags.species||tags.name||"Baum",
            source:"osm", osmId:`node/${el.id}`,
          });
          nTrees++;
        }
        // ── Baumreihe → Einzelbäume entlang der Linie ──────────────
        else if(el.type==="way" && tags.natural==="tree_row" && el.geometry){
          // Entlang des Way verteilte Bäume (alle ~6m)
          const pts=el.geometry;
          for(let i=0;i<pts.length-1;i++){
            const a=pts[i], b=pts[i+1];
            const mPerLat=111320, mPerLng=111320*Math.cos(a.lat*Math.PI/180);
            const dx=(b.lon-a.lon)*mPerLng, dy=(b.lat-a.lat)*mPerLat;
            const segLen=Math.sqrt(dx*dx+dy*dy);
            const nSeg=Math.max(1,Math.floor(segLen/6));
            for(let k=0;k<nSeg;k++){
              const t=k/nSeg;
              newObstacles.push({
                id:uid(), type:"tree",
                lat:a.lat+(b.lat-a.lat)*t, lng:a.lon+(b.lon-a.lon)*t,
                r:3, label:"Baum (Reihe)",
                source:"osm", osmId:`way/${el.id}/${i}/${k}`,
              });
              nTrees++;
            }
          }
          nTreeRows++;
        }
        // ── Hecke (Linie) ─────────────────────────────────────────────
        else if(el.type==="way" && tags.barrier==="hedge" && el.geometry){
          // Hecke als Serie von Einzelbaum-Hindernissen (kleinere Kronen) entlang der Linie
          const pts=el.geometry;
          for(let i=0;i<pts.length-1;i++){
            const a=pts[i], b=pts[i+1];
            const mPerLat=111320, mPerLng=111320*Math.cos(a.lat*Math.PI/180);
            const dx=(b.lon-a.lon)*mPerLng, dy=(b.lat-a.lat)*mPerLat;
            const segLen=Math.sqrt(dx*dx+dy*dy);
            const nSeg=Math.max(1,Math.floor(segLen/2.5));
            for(let k=0;k<nSeg;k++){
              const t=k/nSeg;
              newObstacles.push({
                id:uid(), type:"tree",
                lat:a.lat+(b.lat-a.lat)*t, lng:a.lon+(b.lon-a.lon)*t,
                r:1.2, label:"Hecke",
                source:"osm", osmId:`hedge/${el.id}/${i}/${k}`,
              });
              nTrees++;
            }
          }
        }
        // ── Alle Vegetations-/Grünflächen ─────────────────────────────
        else if(el.type==="way" && el.geometry && (
            tags.natural==="wood" || tags.natural==="scrub" || tags.natural==="shrubbery" ||
            tags.natural==="grassland" || tags.natural==="heath" ||
            tags.landuse==="forest" || tags.landuse==="grass" || tags.landuse==="meadow" ||
            tags.landuse==="recreation_ground" || tags.landuse==="village_green" ||
            tags.leisure==="park" || tags.leisure==="garden" || tags.leisure==="nature_reserve"
          )){
          const coords=el.geometry.map(g=>[g.lat,g.lon]);
          const cLat=coords.reduce((s,c)=>s+c[0],0)/coords.length;
          const cLng=coords.reduce((s,c)=>s+c[1],0)/coords.length;
          // Kategorie-Label
          let label;
          if(tags.name) label=tags.name;
          else if(tags.leisure==="park") label="Park";
          else if(tags.leisure==="garden") label="Garten";
          else if(tags.leisure==="nature_reserve") label="Naturschutz";
          else if(tags.landuse==="forest"||tags.natural==="wood") label="Wald";
          else if(tags.natural==="scrub"||tags.natural==="shrubbery") label="Sträucher";
          else if(tags.natural==="grassland"||tags.landuse==="grass"||tags.landuse==="meadow") label="Wiese";
          else if(tags.landuse==="recreation_ground") label="Freizeitfläche";
          else if(tags.landuse==="village_green") label="Dorfanger";
          else label="Grünfläche";
          newObstacles.push({
            id:uid(), type:"greenArea",
            lat:cLat, lng:cLng, polygon:coords, label,
            subtype:tags.natural||tags.landuse||tags.leisure,
            source:"osm", osmId:`${el.type}/${el.id}`,
          });
          nGreen++;
          // Dichte Vegetation (Wald/Sträucher): Beispielbäume als Hindernis streuen
          const denseVeg = tags.natural==="wood" || tags.natural==="scrub" ||
                           tags.natural==="shrubbery" || tags.landuse==="forest";
          const parkLike = tags.leisure==="park" || tags.leisure==="garden";
          if(denseVeg || parkLike){
            let minLat=Infinity,maxLat=-Infinity,minLng=Infinity,maxLng=-Infinity;
            for(const c of coords){
              if(c[0]<minLat) minLat=c[0]; if(c[0]>maxLat) maxLat=c[0];
              if(c[1]<minLng) minLng=c[1]; if(c[1]>maxLng) maxLng=c[1];
            }
            const nExample=denseVeg?6:3;
            const crownR=(tags.natural==="scrub"||tags.natural==="shrubbery")?1.8:3.5;
            for(let k=0;k<nExample;k++){
              const tlat=minLat+hashCoord(cLat,cLng,k*3.7)*(maxLat-minLat);
              const tlng=minLng+hashCoord(cLat,cLng,k*5.1+1)*(maxLng-minLng);
              newObstacles.push({
                id:uid(), type:"tree",
                lat:tlat, lng:tlng, r:crownR,
                label:(tags.natural==="scrub"||tags.natural==="shrubbery")?"Strauch":`Baum (${label})`,
                source:"osm", osmId:`${el.type}/${el.id}/est${k}`,
              });
              nTrees++;
            }
          }
        }
      }

      if(newObstacles.length===0){
        setOsmStatus({type:"error",msg:"Keine Gebäude/Bäume/Grünflächen in OSM an dieser Position gefunden. Zoom ggf. raus für mehr Kontext."});
        setTimeout(()=>setOsmStatus(null),5000);
        return;
      }

      // Merge in bestehende Hindernisse, OSM-Duplikate vermeiden
      updateProject(p=>{
        const existing=p.obstacles||[];
        const existingOsmIds=new Set(existing.filter(o=>o.source==="osm").map(o=>o.osmId));
        const toAdd=newObstacles.filter(o=>!existingOsmIds.has(o.osmId));
        return { ...p, obstacles:[...existing, ...toAdd] };
      });
      const parts=[];
      if(nBuildings) parts.push(`${nBuildings} Gebäude`);
      if(nTrees) parts.push(`${nTrees} Bäume${nTreeRows?` (+${nTreeRows} Reihe${nTreeRows>1?"n":""})`:""}`);
      if(nGreen) parts.push(`${nGreen} Grünfläche${nGreen>1?"n":""}`);
      setOsmStatus({type:"info",msg:`✓ Aus OSM erkannt: ${parts.join(" · ")}`});
      setTimeout(()=>setOsmStatus(null),5000);
    } catch(e){
      console.warn("Overpass failed",e);
      setOsmStatus({type:"error",msg:`Overpass-API Fehler: ${e.message}`});
      setTimeout(()=>setOsmStatus(null),4000);
    } finally {
      setOsmLoading(false);
    }
  }

  // ── Keyboard shortcuts ──
  useEffect(()=>{
    const h=(e)=>{
      const t=e.target.tagName;
      if(t==="INPUT"||t==="TEXTAREA"||t==="SELECT") return;
      if(e.key==="Escape"){
        setSelected(null);
        setPendingEq(null);
        setTool("select");
        return;
      }
      if(!selected) return;
      if(e.key==="r"||e.key==="R"){
        e.preventDefault();
        if(selected.type==="eq"){
          const step=e.shiftKey?-15:15;
          updateProject(p=>({...p,placed:p.placed.map(x=>x.id===selected.id?{...x,rot:((x.rot||0)+step+360)%360}:x)}));
        }
      } else if(e.key==="Delete"||e.key==="Backspace"){
        e.preventDefault();
        if(selected.type==="eq") updateProject(p=>({...p,placed:p.placed.filter(x=>x.id!==selected.id)}));
        else updateProject(p=>({...p,obstacles:p.obstacles.filter(x=>x.id!==selected.id)}));
        setSelected(null);
      }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selected]);

  /* ────── 3D VIEW (Three.js, robust) ────── */
  // Höhe aus Name/Desc parsen (KOMPAN Muster: "H:2,5m" / "Höhe: 3,0 m" / "3m hoch")
  function parseHeight(eq){
    const txt=`${eq.name||""} ${eq.desc||""}`;
    const m=txt.match(/H[öo]?he?:?\s*(\d+[.,]?\d*)\s*m/i)||txt.match(/(\d+[.,]?\d*)\s*m\s*hoch/i);
    if(m) return parseFloat(m[1].replace(",","."));
    const d={"Schaukeln":2.5,"Rutschen":1.5,"Karussell":0.25,"Wipptiere":0.9,
      "Spielhäuser":2.4,"Klettern":2.8,"Sandspiel":0.35,"Balancieren":0.4,"Fallschutz":0.04};
    return d[eq.cat]||1.5;
  }

  // Scene setup – ONCE on mount, updated on data changes
  useEffect(()=>{
    if(!threeContainerRef.current) return;
    const container=threeContainerRef.current;

    // CRITICAL: remove any residual children from prior renders
    while(container.firstChild) container.removeChild(container.firstChild);

    const W=container.clientWidth||800, H=container.clientHeight||500;

    const scene=new THREE.Scene();
    scene.background=new THREE.Color("#B8D5E8");
    scene.fog=new THREE.Fog("#B8D5E8",80,250);

    const camera=new THREE.PerspectiveCamera(50,W/H,0.1,500);
    camera.position.set(22,18,22);
    camera.lookAt(0,1.5,0);

    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    const hemi=new THREE.HemisphereLight(0xcfe2ff,0x6b7a52,0.55);
    scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xffffff,2.1);
    sun.position.set(30,45,20); sun.castShadow=true;
    sun.shadow.mapSize.width=2048; sun.shadow.mapSize.height=2048;
    sun.shadow.camera.left=-30; sun.shadow.camera.right=30;
    sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30;
    sun.shadow.camera.near=1; sun.shadow.camera.far=120;
    sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.03;
    scene.add(sun);
    const fill=new THREE.DirectionalLight(0xaabde0,0.35);
    fill.position.set(-20,15,-10); scene.add(fill);

    // Ground
    const groundSize=100;
    const groundMat=new THREE.MeshStandardMaterial({color:"#87986D",roughness:.95});
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(groundSize,groundSize),groundMat);
    ground.rotation.x=-Math.PI/2; ground.receiveShadow=true;
    scene.add(ground);
    const grid=new THREE.GridHelper(groundSize,50,0x3a4a35,0x5d7052);
    grid.material.opacity=.28; grid.material.transparent=true;
    grid.position.y=0.005; scene.add(grid);

    // Dynamic group for equipment + fall zones + obstacles
    const worldGroup=new THREE.Group();
    scene.add(worldGroup);

    // Orbit-Controls state
    const target=new THREE.Vector3(0,1.5,0);
    targetRef.current.copy(target);
    let radius=camera.position.distanceTo(target);
    let theta=Math.atan2(camera.position.x-target.x,camera.position.z-target.z);
    let phi=Math.acos(Math.max(-0.99,Math.min(0.99,(camera.position.y-target.y)/radius)));
    function updateCamera(){
      camera.position.x=target.x+radius*Math.sin(phi)*Math.sin(theta);
      camera.position.z=target.z+radius*Math.sin(phi)*Math.cos(theta);
      camera.position.y=target.y+radius*Math.cos(phi);
      camera.lookAt(target);
    }
    updateCamera();

    let dragging=false, panning=false, lastX=0, lastY=0;
    const dom=renderer.domElement;
    dom.style.cursor="grab"; dom.style.display="block";
    const onDown=(e)=>{
      dragging=true; panning=e.button===2||e.shiftKey;
      lastX=e.clientX; lastY=e.clientY;
      dom.style.cursor=panning?"move":"grabbing"; e.preventDefault();
    };
    const onMove=(e)=>{
      if(!dragging) return;
      const dx=e.clientX-lastX, dy=e.clientY-lastY;
      lastX=e.clientX; lastY=e.clientY;
      if(panning){
        const forward=new THREE.Vector3().subVectors(target,camera.position).normalize();
        const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize();
        const up=new THREE.Vector3().crossVectors(right,forward).normalize();
        const speed=radius*0.0015;
        target.addScaledVector(right,-dx*speed);
        target.addScaledVector(up,dy*speed);
      } else {
        theta-=dx*0.006;
        phi=Math.max(0.1,Math.min(Math.PI/2-0.05,phi-dy*0.005));
      }
      updateCamera();
    };
    const onUp=()=>{ dragging=false; dom.style.cursor="grab"; };
    const onWheel=(e)=>{
      radius*=e.deltaY>0?1.08:0.92;
      radius=Math.max(4,Math.min(120,radius));
      updateCamera(); e.preventDefault();
    };
    const onContext=(e)=>e.preventDefault();
    dom.addEventListener("pointerdown",onDown);
    window.addEventListener("pointermove",onMove);
    window.addEventListener("pointerup",onUp);
    dom.addEventListener("wheel",onWheel,{passive:false});
    dom.addEventListener("contextmenu",onContext);

    function animate(){
      animRef.current=requestAnimationFrame(animate);
      // Skip render when container hidden (saves GPU, avoids compositor glitches)
      if(container.offsetParent===null||container.clientWidth===0) return;
      renderer.render(scene,camera);
    }
    animate();

    // Expose to outside: reset camera, render, export photo
    function resetCamera(){
      // Fit to content
      const box=new THREE.Box3().setFromObject(worldGroup);
      if(!box.isEmpty()){
        const c=box.getCenter(new THREE.Vector3());
        const s=box.getSize(new THREE.Vector3());
        const dist=Math.max(s.x,s.z,12)*1.8+10;
        target.copy(c); target.y=1.5;
        radius=dist; theta=Math.PI/4; phi=Math.PI/3;
        updateCamera();
      } else {
        target.set(0,1.5,0); radius=30; theta=Math.PI/4; phi=Math.PI/3; updateCamera();
      }
    }
    function exportPhoto(){
      // Render to 4K buffer
      const prevSize={w:W,h:H};
      const targetW=3840, targetH=2160;
      const savedPixelRatio=renderer.getPixelRatio();
      renderer.setPixelRatio(1);
      renderer.setSize(targetW,targetH);
      camera.aspect=targetW/targetH; camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      const url=dom.toDataURL("image/png");
      // Restore
      renderer.setPixelRatio(savedPixelRatio);
      renderer.setSize(prevSize.w,prevSize.h);
      camera.aspect=prevSize.w/prevSize.h; camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      const a=document.createElement("a");
      a.href=url; a.download=`PlayQuote-3D-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    }
    function renderOnce(){ renderer.render(scene,camera); }

    threeRef.current={scene,camera,renderer,worldGroup,resetCamera,exportPhoto,render:renderOnce};

    const onResize=()=>{
      if(!container) return;
      const w=container.clientWidth||800, h=container.clientHeight||500;
      camera.aspect=w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    };
    window.addEventListener("resize",onResize);
    // Fit on first mount
    setTimeout(()=>{ if(threeRef.current===null) return; onResize(); },0);

    return ()=>{
      if(animRef.current){ cancelAnimationFrame(animRef.current); animRef.current=null; }
      window.removeEventListener("resize",onResize);
      window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp);
      dom.removeEventListener("pointerdown",onDown);
      dom.removeEventListener("wheel",onWheel);
      dom.removeEventListener("contextmenu",onContext);
      // Full scene cleanup
      scene.traverse(o=>{
        if(o.geometry) o.geometry.dispose();
        if(o.material){
          if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      try{ renderer.forceContextLoss(); }catch(e){}
      if(dom.parentNode) dom.parentNode.removeChild(dom);
      threeRef.current=null;
    };
  // Run ONCE on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Update scene contents when data changes (no rebuild of renderer/scene!)
  useEffect(()=>{
    if(!threeRef.current) return;
    const { scene, worldGroup } = threeRef.current;
    // Clear previous contents
    while(worldGroup.children.length){
      const o=worldGroup.children[0];
      worldGroup.remove(o);
      o.traverse(x=>{
        if(x.geometry) x.geometry.dispose();
        if(x.material){
          if(Array.isArray(x.material)) x.material.forEach(m=>m.dispose());
          else x.material.dispose();
        }
      });
    }

    const mapCenter=projectCenter;
    const mPerLat=111320;
    const mPerLng=111320*Math.cos(mapCenter.lat*Math.PI/180);
    const toLocal=(lat,lng)=>[(lng-mapCenter.lng)*mPerLng,(lat-mapCenter.lat)*mPerLat];

    const metalPost=(col)=>new THREE.MeshStandardMaterial({color:col,metalness:.65,roughness:.3});
    const plastic=(col)=>new THREE.MeshStandardMaterial({color:col,metalness:.05,roughness:.55});
    const wood=(col)=>new THREE.MeshStandardMaterial({color:col,metalness:.02,roughness:.82});
    const rubber=(col)=>new THREE.MeshStandardMaterial({color:col,metalness:.1,roughness:.85});

    // KOMPAN-Markenfarben & Materialien basierend auf Artikel-Nr-Präfix (tatsächliche Produktlinien)
    function getKompanColors(eq){
      const art=(eq.artNr||"").toUpperCase();
      const defaults={post:"#6B7B8C",accent:eq.color||"#3B82F6",plat:"#C69A5A",seat:"#1F2937",brand:"KOMPAN"};
      if(art.startsWith("KSW")||art.startsWith("SW")) return {post:"#A8AEB4",accent:"#C8102E",plat:"#C69A5A",seat:"#1F2937",brand:"KOMPAN Schaukeln"}; // verzinkter Stahl + rot-schwarz
      if(art.startsWith("GXY")) return {post:"#A8AEB4",accent:"#1E2A3B",plat:"#A8AEB4",seat:"#1F2937",brand:"GALAXY"}; // Edelstahl + Anthrazit
      if(art.startsWith("COR")||art.startsWith("CRP")) return {post:"#1F1F1F",accent:"#D62828",plat:"#1F1F1F",seat:"#D62828",brand:"COROCORD"}; // schwarz + rot (Seilspiel)
      if(art.startsWith("NRO")) return {post:"#A97851",accent:"#6B4226",plat:"#A97851",seat:"#4A2E1A",brand:"NATURA Robinia"}; // Robinia-Holz
      if(art.startsWith("MSC")||art.startsWith("MSV")) return {post:"#F4A82C",accent:"#E8732C",plat:"#F4A82C",seat:"#5A2B82",brand:"MOMENTS"}; // bunt: orange/lila
      if(art.startsWith("PCM")) return {post:"#2C7873",accent:"#F39C12",plat:"#A97851",seat:"#2C7873",brand:"PCM"}; // grün-orange
      if(art.startsWith("KPL")||art.startsWith("KPB")) return {post:"#A8AEB4",accent:"#008DC7",plat:"#8B6A47",seat:"#008DC7",brand:"ELEPHANT"}; // blau-holz
      if(art.startsWith("ELE")) return {post:"#A8AEB4",accent:"#D4A853",plat:"#E8CFA0",seat:"#1F2937",brand:"ELEMENTS"}; // natur-gold
      if(art.startsWith("KSL")) return {post:"#A8AEB4",accent:"#C8102E",plat:"#C69A5A",seat:"#1F2937",brand:"KSL Rutsche"}; // rot-Stahl
      if(art.startsWith("JUM")) return {post:"#1F1F1F",accent:"#1F1F1F",plat:"#1F1F1F",seat:"#2A2A2A",brand:"JUMPER"}; // ganz schwarz (Membran)
      if(art.startsWith("TPP")) return {post:"#A97851",accent:"#D4A853",plat:"#A97851",seat:"#2C7873",brand:"TODDLER"}; // Holz + Akzent
      if(art.startsWith("KCW")) return {post:"#A8AEB4",accent:"#1E2A3B",plat:"#A8AEB4",seat:"#2A2A2A",brand:"SEILBAHN"}; // Stahl
      if(art.startsWith("M")) return {post:"#A8AEB4",accent:eq.color||"#3B82F6",plat:"#C69A5A",seat:"#1F2937",brand:"MOMENTS"}; // classic
      return defaults;
    }

    /* Fallschutz-Bodenflächen (EN 1177) — auch im 3D mit gleicher Farbe und Puffer wie 2D */
    const FP_BUFFER_3D = fpMerged ? 0.3 : 0;
    placed.forEach(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return;
      if(!eq.fallZone||eq.fallZone<=0.6) return;
      const zone=calcFallZone(eq); if(!zone) return;
      const [lx,lz]=toLocal(pl.lat||mapCenter.lat,pl.lng||mapCenter.lng);
      const surfaceMat=new THREE.MeshStandardMaterial({color:fpColor,roughness:.95,metalness:0});
      if(zone.shape==="circle"){
        const fp=new THREE.Mesh(new THREE.CircleGeometry(zone.r+FP_BUFFER_3D,48),surfaceMat);
        fp.rotation.x=-Math.PI/2; fp.position.set(lx,0.008,-lz); fp.receiveShadow=true;
        worldGroup.add(fp);
      } else {
        const fp=new THREE.Mesh(new THREE.PlaneGeometry(zone.w+FP_BUFFER_3D*2,zone.h+FP_BUFFER_3D*2),surfaceMat);
        fp.rotation.x=-Math.PI/2; fp.rotation.z=-(pl.rot||0)*Math.PI/180;
        fp.position.set(lx,0.008,-lz); fp.receiveShadow=true;
        worldGroup.add(fp);
      }
    });

    /* Equipment Meshes */
    function buildEqMesh(eq,pl){
      const g=new THREE.Group();
      const [w,d]=eq.size||[2,2];
      const height=parseHeight(eq);
      const col=eq.color||"#3B82F6";
      const K=getKompanColors(eq); // KOMPAN-Farbschema für diese Produktlinie

      if(eq.cat==="Schaukeln"){
        const frameH=Math.max(height,2.0);
        const frameMat=metalPost(K.post);
        const chainMat=metalPost("#4B5563");
        const seatMat=rubber(K.seat);
        const legLen=Math.sqrt(frameH*frameH+0.8*0.8);
        const legAngle=Math.atan2(0.8,frameH);
        [[-w/2, d/2-.2],[ w/2, d/2-.2],[-w/2,-d/2+.2],[ w/2,-d/2+.2]].forEach(([x,z])=>{
          const leg=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,legLen,10),frameMat);
          leg.position.set(x*0.95,frameH/2,z);
          leg.rotation.z=Math.sign(x)*legAngle*0.6;
          leg.rotation.x=-Math.sign(z)*legAngle*0.4;
          leg.castShadow=true; g.add(leg);
        });
        const bar=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,w*.9,10),metalPost(K.accent));
        bar.rotation.z=Math.PI/2; bar.position.y=frameH; bar.castShadow=true; g.add(bar);
        const isNest=/nest/i.test(eq.name||"");
        const nSeats=isNest?1:(w>3.5?2:1);
        if(isNest){
          const seatR=0.55;
          const nest=new THREE.Mesh(new THREE.TorusGeometry(seatR,.07,8,24),seatMat);
          nest.rotation.x=Math.PI/2; nest.position.set(0,0.5,0); nest.castShadow=true; g.add(nest);
          for(let i=0;i<4;i++){
            const a=(i/4)*Math.PI*2;
            const ch=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,frameH-0.5,6),chainMat);
            ch.position.set(Math.cos(a)*seatR*.9,0.5+(frameH-0.5)/2,Math.sin(a)*seatR*.9);
            g.add(ch);
          }
        } else {
          const seatSpacing=nSeats>1?1.5:0;
          for(let i=0;i<nSeats;i++){
            const sx=(i-(nSeats-1)/2)*seatSpacing;
            const seat=new THREE.Mesh(new THREE.BoxGeometry(.55,.07,.22),seatMat);
            seat.position.set(sx,0.55,0); seat.castShadow=true; g.add(seat);
            [-0.22,0.22].forEach(cx=>{
              const ch=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,frameH-0.55,6),chainMat);
              ch.position.set(sx+cx,0.55+(frameH-0.55)/2,0);
              g.add(ch);
            });
          }
        }
      }
      else if(eq.cat==="Rutschen"){
        const platH=Math.max(height,1.2);
        const slideLen=Math.max(d,platH*2.2);
        const postMat=metalPost(K.post);
        const woodPlat=wood(K.plat);
        const railsMat=plastic(K.accent);
        const slideMat=new THREE.MeshStandardMaterial({color:K.accent,metalness:.35,roughness:.35,side:THREE.DoubleSide});
        // Platform (top)
        const plat=new THREE.Mesh(new THREE.BoxGeometry(1.2,.1,1.1),woodPlat);
        plat.position.set(-slideLen/2+0.6,platH,0);
        plat.castShadow=true; plat.receiveShadow=true; g.add(plat);
        // 4 posts under platform
        [[-0.55,-0.5],[0.55,-0.5],[-0.55,0.5],[0.55,0.5]].forEach(([x,z])=>{
          const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,platH,8),postMat);
          p.position.set(-slideLen/2+0.6+x,platH/2,z); p.castShadow=true; g.add(p);
        });
        // Platform guard rails (behind slide entry)
        [-0.5,0.5].forEach(z=>{
          const rail=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,.05),railsMat);
          rail.position.set(-slideLen/2+0.6,platH+.3,z);
          rail.castShadow=true; g.add(rail);
        });
        // Back rail
        const back=new THREE.Mesh(new THREE.BoxGeometry(.05,0.8,1.1),railsMat);
        back.position.set(-slideLen/2,platH+.4,0); g.add(back);
        // Slide bed
        const bedW=0.65;
        const slideAngle=Math.atan2(platH-0.1,slideLen-0.6);
        const bedLen=Math.sqrt((slideLen-0.6)*(slideLen-0.6)+(platH-0.1)*(platH-0.1));
        const bed=new THREE.Mesh(new THREE.BoxGeometry(bedLen,.06,bedW),slideMat);
        bed.position.set(-slideLen/2+0.6+ (slideLen-0.6)/2, (platH+0.1)/2, 0);
        bed.rotation.z=slideAngle;
        bed.castShadow=true; bed.receiveShadow=true; g.add(bed);
        // Side edges / splash guards
        [-(bedW/2+0.04), bedW/2+0.04].forEach(sz=>{
          const side=new THREE.Mesh(new THREE.BoxGeometry(bedLen,.12,.06),slideMat);
          side.position.set(-slideLen/2+0.6+(slideLen-0.6)/2,(platH+0.1)/2+.08,sz);
          side.rotation.z=slideAngle;
          side.castShadow=true; g.add(side);
        });
        // Runout (flat section at bottom)
        const runout=new THREE.Mesh(new THREE.BoxGeometry(.7,.05,bedW+.1),slideMat);
        runout.position.set(slideLen/2-0.15,.05,0);
        runout.castShadow=true; g.add(runout);
        // Ladder on left side
        const ladLen=platH+.1;
        const ladSide=new THREE.Mesh(new THREE.BoxGeometry(.06,ladLen,.04),postMat);
        ladSide.position.set(-slideLen/2+0.2,ladLen/2,-.3); g.add(ladSide);
        const ladSide2=new THREE.Mesh(new THREE.BoxGeometry(.06,ladLen,.04),postMat);
        ladSide2.position.set(-slideLen/2+0.2,ladLen/2,.3); g.add(ladSide2);
        for(let i=1;i<=Math.floor(platH/0.27);i++){
          const rung=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.6,6),postMat);
          rung.rotation.x=Math.PI/2;
          rung.position.set(-slideLen/2+0.2,i*0.27,0);
          g.add(rung);
        }
      }
      else if(eq.cat==="Karussell"){
        const r=Math.max(w,d)/2;
        const discH=0.18;
        const disc=new THREE.Mesh(new THREE.CylinderGeometry(r,r,discH,32),plastic(K.accent));
        disc.position.y=discH/2; disc.castShadow=true; disc.receiveShadow=true; g.add(disc);
        const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.04,8,32),metalPost(K.post));
        rim.rotation.x=Math.PI/2; rim.position.y=discH; g.add(rim);
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.0,10),metalPost("#6B7B8C"));
        pole.position.y=discH+0.5; g.add(pole);
        for(let i=0;i<4;i++){
          const a=(i/4)*Math.PI*2;
          const h=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1,6),metalPost("#6B7B8C"));
          h.position.set(Math.cos(a)*r*0.8,discH+0.5,Math.sin(a)*r*0.8); g.add(h);
          const top=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,r*0.4,6),metalPost(K.post));
          top.rotation.z=Math.PI/2; top.rotation.y=-a;
          top.position.set(Math.cos(a)*r*0.6,discH+1.0,Math.sin(a)*r*0.6);
          g.add(top);
        }
      }
      else if(eq.cat==="Wipptiere"){
        const seatH=0.55;
        const pivot=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,.2,12),metalPost(K.post));
        pivot.position.y=0.1; g.add(pivot);
        const spring=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.35,8),metalPost("#4B5563"));
        spring.position.y=0.375; g.add(spring);
        const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.28,0.6,8,12),plastic(K.accent));
        body.rotation.z=Math.PI/2;
        body.position.y=seatH+.1; body.castShadow=true; g.add(body);
      }
      else if(eq.cat==="Spielhäuser"){
        const baseH=Math.max(height*0.7,1.8);
        const base=new THREE.Mesh(new THREE.BoxGeometry(w,baseH,d),wood(K.plat));
        base.position.y=baseH/2; base.castShadow=true; base.receiveShadow=true; g.add(base);
        const win=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.06),plastic(K.accent));
        win.position.set(0,baseH*0.65,d/2+0.02); g.add(win);
        const roofH=baseH*0.55;
        const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.72,roofH,4),wood("#8B4513"));
        roof.position.y=baseH+roofH/2; roof.rotation.y=Math.PI/4; roof.castShadow=true; g.add(roof);
      }
      else if(eq.cat==="Klettern"){
        const frameH=Math.max(height,2.2);
        const postMat=metalPost(K.post);
        const ropeMat=rubber(K.accent);
        [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z])=>{
          const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,frameH,8),postMat);
          p.position.set(x,frameH/2,z); p.castShadow=true; g.add(p);
        });
        [[0,-d/2],[0,d/2]].forEach(([x,z])=>{
          const bar=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,w,8),postMat);
          bar.rotation.z=Math.PI/2; bar.position.set(x,frameH,z); g.add(bar);
        });
        [[-w/2,0],[w/2,0]].forEach(([x,z])=>{
          const bar=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,d,8),postMat);
          bar.rotation.x=Math.PI/2; bar.position.set(x,frameH,z); g.add(bar);
        });
        for(let i=-1;i<=1;i+=0.5){
          const rope=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,Math.sqrt(w*w+frameH*frameH)*0.9,6),ropeMat);
          rope.position.set(i*w/3,frameH/2,0);
          rope.rotation.z=Math.atan2(frameH,w);
          g.add(rope);
        }
      }
      else if(eq.cat==="Sandspiel"){
        const edgeH=0.35;
        const edgeMat=wood(K.plat);
        [[0,-d/2,w,0.1],[0,d/2,w,0.1],[-w/2,0,0.1,d],[w/2,0,0.1,d]].forEach(([x,z,bw,bd])=>{
          const e=new THREE.Mesh(new THREE.BoxGeometry(bw,edgeH,bd),edgeMat);
          e.position.set(x,edgeH/2,z); e.castShadow=true; e.receiveShadow=true; g.add(e);
        });
        const sand=new THREE.Mesh(new THREE.BoxGeometry(w-0.2,0.08,d-0.2),
          new THREE.MeshStandardMaterial({color:"#E4C785",roughness:.98}));
        sand.position.y=0.3; sand.receiveShadow=true; g.add(sand);
      }
      else if(eq.cat==="Balancieren"){
        const beamLen=Math.max(w,d);
        const beamMat=wood(K.plat);
        const beam=new THREE.Mesh(new THREE.BoxGeometry(beamLen,.14,.16),beamMat);
        beam.position.y=0.45; beam.castShadow=true; g.add(beam);
        [[-beamLen/2+0.1,0],[beamLen/2-0.1,0]].forEach(([x,z])=>{
          const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,0.45,8),metalPost(K.post));
          p.position.set(x,0.225,z); p.castShadow=true; g.add(p);
        });
      }
      else {
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,height,d),plastic(K.accent));
        b.position.y=height/2; b.castShadow=true; g.add(b);
      }

      const [lx,lz]=toLocal(pl.lat||mapCenter.lat,pl.lng||mapCenter.lng);
      g.position.set(lx,0,-lz);
      g.rotation.y=(pl.rot||0)*Math.PI/180;
      return g;
    }

    placed.forEach(pl=>{
      const eq=equipment.find(x=>x.id===pl.eqId); if(!eq) return;
      worldGroup.add(buildEqMesh(eq,pl));
    });

    // Obstacles
    obstacles.forEach(ob=>{
      const [lx,lz]=toLocal(ob.lat,ob.lng);
      if(ob.type==="tree"){
        const r=ob.r||3;
        const trunkH=2.5;
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,trunkH,10),wood("#5C3317"));
        trunk.position.set(lx,trunkH/2,-lz); trunk.castShadow=true; worldGroup.add(trunk);
        const crown=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),
          new THREE.MeshStandardMaterial({color:"#3F8C3F",roughness:.85}));
        crown.position.set(lx,trunkH+r*0.6,-lz); crown.castShadow=true; crown.receiveShadow=true; worldGroup.add(crown);
      } else if(ob.type==="building"){
        const bw=ob.w||6, bd=ob.h||4;
        const bh=3.2;
        const bgroup=new THREE.Group();
        const b=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),
          new THREE.MeshStandardMaterial({color:"#E5E7EB",roughness:.85}));
        b.position.y=bh/2; b.castShadow=true; b.receiveShadow=true; bgroup.add(b);
        const roof=new THREE.Mesh(new THREE.BoxGeometry(bw+0.3,0.3,bd+0.3),wood("#8B4513"));
        roof.position.y=bh+0.15; roof.castShadow=true; bgroup.add(roof);
        bgroup.position.set(lx,0,-lz);
        bgroup.rotation.y=(ob.rot||0)*Math.PI/180;
        worldGroup.add(bgroup);
      } else if(ob.type==="greenArea" && ob.polygon){
        // Grünfläche als flache Bodenmatte (leicht erhöht, keine Höhe)
        try {
          const shape=new THREE.Shape();
          ob.polygon.forEach(([plat,plng],i)=>{
            const [px,pz]=toLocal(plat,plng);
            if(i===0) shape.moveTo(px,-pz);
            else shape.lineTo(px,-pz);
          });
          const geo=new THREE.ShapeGeometry(shape);
          geo.rotateX(-Math.PI/2);
          const mesh=new THREE.Mesh(geo,
            new THREE.MeshStandardMaterial({color:"#3F8C3F",roughness:.9,metalness:0,transparent:true,opacity:.55}));
          mesh.position.y=0.01;
          mesh.receiveShadow=true;
          worldGroup.add(mesh);
        } catch(e){ console.warn("greenArea 3D failed",e); }
      } else if(ob.type==="buildingPoly" && ob.polygon){
        // OSM-Gebäude: echten Umriss extrudieren (Höhe auf Boden stehend)
        const bh=3.5; // Standardhöhe 3.5m
        try {
          const shape=new THREE.Shape();
          ob.polygon.forEach(([plat,plng],i)=>{
            const [px,pz]=toLocal(plat,plng);
            if(i===0) shape.moveTo(px,-pz);
            else shape.lineTo(px,-pz);
          });
          const extrudeSettings={depth:bh,bevelEnabled:false,steps:1};
          const geo=new THREE.ExtrudeGeometry(shape,extrudeSettings);
          // rotateX(-π/2) verschiebt den Extrudierungs-Bereich von +Z auf +Y,
          // ergibt automatisch y=0 (Boden) bis y=bh (Dach). KEIN Y-Offset nötig!
          geo.rotateX(-Math.PI/2);
          geo.computeVertexNormals();
          const wallMat=new THREE.MeshStandardMaterial({color:"#E5E7EB",roughness:.88,metalness:0,side:THREE.DoubleSide});
          const mesh=new THREE.Mesh(geo,wallMat);
          mesh.castShadow=true; mesh.receiveShadow=true;
          worldGroup.add(mesh);
          // Flaches Dach oben drauf (gleicher Shape, etwas dunkler, leicht über Wand-Kante)
          const roofGeo=new THREE.ShapeGeometry(shape);
          roofGeo.rotateX(-Math.PI/2);
          const roofMat=new THREE.MeshStandardMaterial({color:"#7C4A2E",roughness:.78,metalness:0,side:THREE.DoubleSide});
          const roof=new THREE.Mesh(roofGeo,roofMat);
          roof.position.y=bh+0.02;
          roof.castShadow=true; roof.receiveShadow=true;
          worldGroup.add(roof);
        } catch(e){ console.warn("buildingPoly 3D failed",e); }
      }
    });

    // Auto-fit on first content if camera still at default
    if(placed.length>0 && threeRef.current){
      threeRef.current.resetCamera();
    }
  },[placed,obstacles,equipment,fpMerged,fpColor]);



  /* ────── UI ────── */
  const selEq=selected&&selected.type==="eq"?placed.find(x=>x.id===selected.id):null;
  const selEqData=selEq?equipment.find(e=>e.id===selEq.eqId):null;
  const selOb=selected&&selected.type==="ob"?obstacles.find(x=>x.id===selected.id):null;

  const libFiltered=equipment.filter(e=>{
    if(libCat!=="Alle"&&e.cat!==libCat) return false;
    if(libSearch&&!e.name.toLowerCase().includes(libSearch.toLowerCase())&&!(e.artNr||"").toLowerCase().includes(libSearch.toLowerCase())) return false;
    return true;
  });

  // ── Toolbar button ──
  const TB=({active,onClick,title,children,danger})=>(
    <button onClick={onClick} title={title}
      style={{width:38,height:38,borderRadius:8,
        border:`1.5px solid ${active?T.green:T.border}`,
        background:active?T.green:"white",
        color:active?"white":(danger?T.red:T.text),
        cursor:"pointer",fontSize:16,display:"flex",
        alignItems:"center",justifyContent:"center",
        transition:"all .12s",fontFamily:"inherit",
        boxShadow:active?"0 2px 6px rgba(27,67,50,.25)":"none",
      }}>{children}</button>
  );

  return (
    <div className="fade-in" style={{height:"calc(100vh - 80px)",display:"flex",flexDirection:"column",gap:10}}>
      {/* Top Header Bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>{setPage("projects");setActiveProjectId(null);}}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.muted}}>←</button>
          <div>
            <div className="syne" style={{fontSize:20,fontWeight:800,lineHeight:1.1}}>{project.name}</div>
            <div style={{color:T.muted,fontSize:12}}>{project.client} · {placed.length} Geräte platziert {conflicts.length>0&&<span style={{color:T.red,fontWeight:600}}>· ⚠ {conflicts.length} Konflikt(e)</span>}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",background:"white",border:`1.5px solid ${T.border}`,borderRadius:10,padding:3}}>
            <button onClick={()=>setView("2d")}
              style={{padding:"7px 16px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,
                background:view==="2d"?T.green:"transparent",color:view==="2d"?"white":T.text}}>🗺️ 2D Karte</button>
            <button onClick={()=>setView("3d")}
              style={{padding:"7px 16px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,
                background:view==="3d"?T.green:"transparent",color:view==="3d"?"white":T.text}}>🧊 3D Ansicht</button>
          </div>
          <Btn onClick={()=>setPage("quote")}>📄 Offerte</Btn>
        </div>
      </div>

      {/* Main content row */}
      <div style={{flex:1,display:"flex",gap:10,minHeight:0}}>
        {/* LEFT – Equipment library */}
        <div style={{width:libOpen?290:48,background:"white",border:`1px solid ${T.border}`,borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden",transition:"width .2s ease",boxShadow:T.shadow}}>
          <div style={{padding:libOpen?"10px 12px":"10px 4px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
            {libOpen&&<div style={{fontWeight:700,fontSize:13}}>📦 Gerätebibliothek</div>}
            <button onClick={()=>setLibOpen(v=>!v)} title={libOpen?"Einklappen":"Ausklappen"}
              style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16,padding:4}}>
              {libOpen?"◀":"▶"}
            </button>
          </div>
          {libOpen&&<>
            <div style={{padding:"8px 10px",borderBottom:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:6}}>
              <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="🔍 Suchen…"
                style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:12,fontFamily:"inherit",background:T.bg,outline:"none"}}/>
              <select value={libCat} onChange={e=>setLibCat(e.target.value)}
                style={{padding:"6px 9px",border:`1px solid ${T.border}`,borderRadius:6,fontSize:12,fontFamily:"inherit",background:T.bg,cursor:"pointer",outline:"none"}}>
                {["Alle",...CATS].map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={autoPlace} style={{padding:"6px 9px",border:`1.5px solid ${T.gold}`,background:T.gold+"15",borderRadius:6,fontSize:12,fontWeight:600,color:"#8B6914",cursor:"pointer",fontFamily:"inherit"}}>✨ KI auto-platzieren</button>
              {(placed.length>0||obstacles.length>0)&&(
                <button onClick={()=>{
                  if(window.confirm(`Wirklich alle ${placed.length} Geräte und ${obstacles.length} Objekte vom Plan entfernen?`)){
                    updateProject(p=>({...p,placed:[],obstacles:[]}));
                    setSelected(null);
                  }
                }} style={{padding:"6px 9px",border:`1.5px solid ${T.red}`,background:T.redLight,borderRadius:6,fontSize:12,fontWeight:600,color:T.red,cursor:"pointer",fontFamily:"inherit"}}>🗑 Alles zurücksetzen</button>
              )}
            </div>
            <div style={{flex:1,overflow:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:5}}>
              {libFiltered.length===0&&<div style={{color:T.muted,fontSize:12,padding:16,textAlign:"center"}}>Keine Geräte</div>}
              {libFiltered.map(eq=>{
                const isPending=pendingEq&&pendingEq.id===eq.id;
                return (
                <button key={eq.id} onClick={()=>addEquipment(eq)}
                  style={{padding:"7px 9px",border:`1.5px solid ${isPending?T.green:T.border}`,background:isPending?T.green+"10":"white",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit",textAlign:"left",transition:"all .12s"}}
                  onMouseEnter={e=>{if(!isPending) e.currentTarget.style.borderColor=eq.color;}}
                  onMouseLeave={e=>{if(!isPending) e.currentTarget.style.borderColor=T.border;}}>
                  <div style={{width:30,height:30,borderRadius:8,background:eq.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{eq.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eq.name}</div>
                    <div style={{fontSize:10,color:T.muted,display:"flex",gap:6}}>
                      <span>{fmt(eq.price)}</span>
                      {eq.fallZone>0&&<span>⬡{eq.fallZone}m</span>}
                    </div>
                  </div>
                  {isPending&&<span style={{fontSize:10,color:T.green,fontWeight:700}}>●</span>}
                </button>
                );
              })}
            </div>
          </>}
        </div>

        {/* CENTER – Map / 3D */}
        <div style={{flex:1,background:"white",border:`1px solid ${T.border}`,borderRadius:12,position:"relative",overflow:"hidden",boxShadow:T.shadow}}>
          {/* === 2D MAP VIEW (always in DOM, hidden when 3D active) === */}
          <div style={{position:"absolute",inset:0,
            visibility:view==="2d"?"visible":"hidden",
            pointerEvents:view==="2d"?"auto":"none",
            zIndex:view==="2d"?2:1,
            opacity:view==="2d"?1:0}}>
            {/* Address search + map style switcher */}
            <div style={{position:"absolute",top:10,left:10,zIndex:500,display:"flex",gap:6,flexWrap:"wrap"}}>
              <div style={{display:"flex",background:"white",borderRadius:8,border:`1.5px solid ${T.border}`,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <input value={addrQuery} onChange={e=>setAddrQuery(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")searchAddress();}}
                  placeholder="📍 Adresse eingeben…"
                  style={{padding:"7px 11px",border:"none",outline:"none",fontSize:12.5,fontFamily:"inherit",minWidth:200,background:"white"}}/>
                <button onClick={searchAddress} style={{padding:"7px 11px",border:"none",background:T.green,color:"white",cursor:"pointer",fontSize:12,fontWeight:600}}>Finden</button>
              </div>
              <div style={{display:"flex",background:"white",border:`1.5px solid ${T.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                {[{v:"satellite",l:"🛰 Satellit"},{v:"hybrid",l:"🌍 Hybrid"},{v:"streets",l:"🗺 Karte"}].map(o=>(
                  <button key={o.v} onClick={()=>setMapStyle(o.v)}
                    style={{padding:"7px 10px",border:"none",background:mapStyle===o.v?T.green:"white",color:mapStyle===o.v?"white":T.text,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>
                    {o.l}
                  </button>
                ))}
              </div>
              <button onClick={detectFromOrthophoto} disabled={osmLoading}
                title="Gebäudeumrisse und Bäume aus OpenStreetMap im aktuellen Kartenausschnitt laden"
                style={{padding:"7px 13px",border:"none",background:osmLoading?T.muted:`linear-gradient(135deg, ${T.gold} 0%, ${T.goldLight} 100%)`,color:osmLoading?"white":"#5A3D00",cursor:osmLoading?"wait":"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",borderRadius:8,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                {osmLoading?"⏳ Analysiere…":"🏢 Gebäude & Bäume erkennen"}
              </button>
            </div>

            {/* Tool palette */}
            <div style={{position:"absolute",left:10,top:60,zIndex:500,background:"white",padding:6,border:`1.5px solid ${T.border}`,borderRadius:10,display:"flex",flexDirection:"column",gap:4,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
              <TB active={tool==="select"} onClick={()=>{setTool("select");setPendingEq(null);}} title="Auswählen / verschieben">✥</TB>
              <TB active={tool==="tree"} onClick={()=>{setTool("tree");setPendingEq(null);}} title="Baum manuell platzieren (klicken)">🌳</TB>
              <TB active={tool==="measure"} onClick={()=>{setTool("measure");setPendingEq(null);}} title="Distanz messen (2 Punkte anklicken)">📏</TB>
              {/* Trennlinie */}
              <div style={{height:1,background:T.border,margin:"2px 0"}}/>
              {/* Fallschutz-Modus: verschmolzen vs. einzeln */}
              <TB active={fpMerged} onClick={()=>setFpMerged(v=>!v)}
                title={fpMerged?"Fallschutz zusammenhängend (Klick = wechsel zu einzeln pro Gerät)":"Fallschutz einzeln pro Gerät (Klick = wechsel zu zusammenhängend)"}>
                {fpMerged?"⬛":"⬚"}
              </TB>
              {/* EPDM-Farbwahl */}
              <div style={{position:"relative"}}>
                <button onClick={()=>setFpColorPickerOpen(v=>!v)}
                  title="EPDM-Fallschutz Farbe wählen"
                  style={{width:38,height:38,borderRadius:8,border:`1.5px solid ${fpColorPickerOpen?T.green:T.border}`,background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,fontFamily:"inherit"}}>
                  <div style={{width:22,height:22,borderRadius:5,background:fpColor,border:"2px solid white",boxShadow:"0 0 0 1px rgba(0,0,0,.15), inset 0 0 0 0.5px rgba(255,255,255,.1)"}}/>
                </button>
                {fpColorPickerOpen&&(
                  <div style={{position:"absolute",left:48,top:0,zIndex:700,background:"white",border:`1.5px solid ${T.border}`,borderRadius:10,padding:10,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",minWidth:200}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>EPDM-Farbe</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6}}>
                      {[
                        {name:"Schwarz",c:"#2A1F18"},
                        {name:"Anthrazit",c:"#3D3D3D"},
                        {name:"Braun",c:"#5C3317"},
                        {name:"Sand",c:"#B89A6B"},
                        {name:"Terrakotta",c:"#A0522D"},
                        {name:"Rot",c:"#B23A2A"},
                        {name:"Blau",c:"#2D5A7D"},
                        {name:"Grün",c:"#3E6B4A"},
                      ].map(col=>(
                        <button key={col.c}
                          onClick={()=>{setFpColor(col.c);setFpColorPickerOpen(false);}}
                          title={col.name}
                          style={{width:38,height:38,borderRadius:7,border:fpColor===col.c?`2.5px solid ${T.green}`:`1.5px solid ${T.border}`,background:col.c,cursor:"pointer",padding:0,position:"relative"}}>
                          {fpColor===col.c&&<span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:14,textShadow:"0 0 3px rgba(0,0,0,.7)"}}>✓</span>}
                        </button>
                      ))}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
                      <span style={{fontSize:11,color:T.muted}}>Eigene:</span>
                      <input type="color" value={fpColor} onChange={e=>setFpColor(e.target.value)}
                        style={{width:32,height:24,border:`1px solid ${T.border}`,borderRadius:4,cursor:"pointer",padding:0}}/>
                      <span style={{fontSize:10,color:T.muted,fontFamily:"monospace"}}>{fpColor}</span>
                    </div>
                  </div>
                )}
              </div>
              {selected&&<>
                <div style={{height:1,background:T.border,margin:"2px 0"}}/>
                {selected.type==="eq"&&<TB onClick={()=>rotateSelected(-15)} title="Drehen links 15°">↺</TB>}
                {selected.type==="eq"&&<TB onClick={()=>rotateSelected(15)} title="Drehen rechts 15°">↻</TB>}
                <TB onClick={deleteSelected} title="Löschen (Entf)" danger>🗑</TB>
              </>}
            </div>

            {/* Placement-mode banner */}
            {pendingEq&&(
              <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:600,background:T.green,color:"white",padding:"8px 16px",borderRadius:8,boxShadow:"0 3px 12px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",gap:10,fontSize:13,fontWeight:600}}>
                <span style={{fontSize:18}}>{pendingEq.icon}</span>
                <span>Klicke auf die Karte, um <b>{pendingEq.name}</b> zu platzieren</span>
                <button onClick={()=>{setPendingEq(null);setTool("select");}} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",cursor:"pointer",padding:"3px 9px",borderRadius:4,fontFamily:"inherit",fontSize:12}}>Abbrechen (Esc)</button>
              </div>
            )}

            {/* Measure tool banner */}
            {tool==="measure"&&!measureInfo&&(
              <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:600,background:T.gold,color:"white",padding:"8px 16px",borderRadius:8,boxShadow:"0 3px 12px rgba(0,0,0,0.25)",fontSize:13,fontWeight:600}}>
                📏 Klicke 2 Punkte auf die Karte, um die Distanz zu messen
              </div>
            )}

            {/* Conflict warning toast (shows actual message) */}
            {collisionWarning&&(
              <div style={{position:"absolute",top:55,left:"50%",transform:"translateX(-50%)",zIndex:600,background:T.red,color:"white",padding:"8px 16px",borderRadius:8,boxShadow:"0 3px 12px rgba(220,38,38,.35)",fontSize:13,fontWeight:600,animation:"fadeIn .15s"}}>
                ⚠️ {typeof collisionWarning==="string"?collisionWarning:"Fallräume dürfen sich nicht überschneiden"}
              </div>
            )}

            {/* OSM status toast */}
            {osmStatus&&(
              <div style={{position:"absolute",top:55,left:"50%",transform:"translateX(-50%)",zIndex:600,background:osmStatus.type==="error"?T.red:T.green,color:"white",padding:"8px 16px",borderRadius:8,boxShadow:"0 3px 12px rgba(0,0,0,.25)",fontSize:13,fontWeight:600}}>
                {osmStatus.msg}
              </div>
            )}

            {/* Legend */}
            <div style={{position:"absolute",bottom:30,left:10,zIndex:500,background:"white",padding:"8px 12px",border:`1.5px solid ${T.border}`,borderRadius:8,fontSize:11,boxShadow:"0 2px 6px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontWeight:700,color:T.muted,fontSize:10,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Legende</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:12,background:fpColor,border:"1px solid rgba(0,0,0,.3)",borderRadius:2}}/>Fallschutz-Belag · {fpMerged?"zusammenhängend":"einzeln"}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:12,background:"#F59E0B66",border:"1.5px dashed #F59E0B",borderRadius:2}}/>Fallraum (EN 1176)</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:12,background:"#DC262644",border:"1.5px dashed #DC2626",borderRadius:2}}/>Konflikt</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:12,background:"#EF444455",border:"1px dashed #B91C1C",borderRadius:2}}/>Gebäude (OSM)</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:12,height:12,background:"#22C55E44",border:"1px dashed #14532D",borderRadius:2}}/>Wald/Park (OSM)</div>
            </div>

            {/* Map canvas */}
            <div ref={mapContainerRef} style={{width:"100%",height:"100%"}}/>
          </div>

          {/* === 3D VIEW (always in DOM, hidden when 2D active) === */}
          <div style={{position:"absolute",inset:0,
            visibility:view==="3d"?"visible":"hidden",
            pointerEvents:view==="3d"?"auto":"none",
            zIndex:view==="3d"?2:1,
            opacity:view==="3d"?1:0}}>
            {/* 3D toolbar */}
            <div style={{position:"absolute",top:10,left:10,zIndex:500,display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>{ if(threeRef.current?.resetCamera) threeRef.current.resetCamera(); }}
                style={{padding:"7px 11px",background:"white",border:`1.5px solid ${T.border}`,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,boxShadow:"0 2px 6px rgba(0,0,0,.12)"}}>
                🎥 Ansicht zentrieren
              </button>
              <button onClick={()=>{ if(threeRef.current?.exportPhoto) threeRef.current.exportPhoto(); }}
                style={{padding:"7px 11px",background:"white",border:`1.5px solid ${T.border}`,borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,boxShadow:"0 2px 6px rgba(0,0,0,.12)"}}>
                📸 Schnell-Foto (4K)
              </button>
              <button onClick={()=>setRenderStudioOpen(true)}
                style={{padding:"7px 13px",background:`linear-gradient(135deg, ${T.gold} 0%, ${T.goldLight} 100%)`,color:"#5A3D00",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,boxShadow:"0 3px 10px rgba(212,168,83,0.45)"}}>
                🎬 Photorealistisches Rendering
              </button>
            </div>
            {/* Hint */}
            <div style={{position:"absolute",bottom:10,left:10,zIndex:500,background:"rgba(255,255,255,.92)",padding:"7px 12px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:11,color:T.muted,pointerEvents:"none"}}>
              🖱 Ziehen = drehen · Scrollrad = zoomen · Shift/Rechtsklick ziehen = verschieben
            </div>
            <div ref={threeContainerRef} style={{width:"100%",height:"100%",background:"#B8D5E8"}}/>
          </div>
        </div>

        {/* RIGHT – Properties panel */}
        <div style={{width:270,background:"white",border:`1px solid ${T.border}`,borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:T.shadow}}>
          <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.border}`,fontWeight:700,fontSize:13}}>
            {selected?(selected.type==="eq"?"⚙️ Gerät":"📌 Objekt"):"ℹ️ Projekt-Info"}
          </div>
          <div style={{flex:1,overflow:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
            {!selected&&(
              <>
                <Stat label="Geräte platziert" val={placed.length}/>
                <Stat label="Bäume & Gebäude" val={obstacles.length}/>
                <Stat label="Konflikte" val={conflicts.length} color={conflicts.length>0?T.red:T.green}/>
                {/* Fallschutzfläche — zeigt individuelle Summe vs. zusammenhängende Fläche */}
                {(()=>{
                  const fp=computeFallProtectionArea(placed,equipment,projectCenter);
                  if(fp.zones===0) return null;
                  const savings=Math.round((fp.mergedArea-fp.individualSum)*10)/10;
                  // Contrast text color for readable label on selected EPDM color
                  const rgb=parseInt(fpColor.slice(1),16);
                  const lum=((rgb>>16)&255)*.299+((rgb>>8)&255)*.587+(rgb&255)*.114;
                  const textCol=lum>140?"#1A1A1A":"white";
                  return (
                    <div style={{background:fpColor,color:textCol,borderRadius:8,padding:"10px 12px",marginTop:4,border:`1px solid ${textCol==="white"?"rgba(255,255,255,.1)":"rgba(0,0,0,.15)"}`}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,opacity:.75,marginBottom:6}}>Fallschutz EN 1177</div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                        <span style={{opacity:.85}}>Einzelflächen Σ</span>
                        <span style={{fontFamily:"monospace"}}>{fp.individualSum} m²</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,paddingTop:4,borderTop:`1px solid ${textCol==="white"?"rgba(255,255,255,.18)":"rgba(0,0,0,.2)"}`}}>
                        <span>Belag {fpMerged?"zusammenhängend":"einzeln"}</span>
                        <span className="syne">{fpMerged?fp.mergedArea:fp.individualSum} m²</span>
                      </div>
                      {fpMerged&&savings>0&&<div style={{fontSize:10,opacity:.8,marginTop:4,fontStyle:"italic"}}>+{savings} m² durch Verbindungen & sauberen Rand · {fp.clusters} Cluster</div>}
                      {!fpMerged&&<div style={{fontSize:10,opacity:.8,marginTop:4,fontStyle:"italic"}}>Jedes Gerät mit separatem Belag · {fp.zones} Flächen</div>}
                    </div>
                  );
                })()}
                <div style={{height:1,background:T.border,margin:"6px 0"}}/>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Gesamtpreis</div>
                <div className="syne" style={{fontSize:22,fontWeight:800,color:T.green}}>
                  {fmt(placed.reduce((s,pl)=>{const e=equipment.find(x=>x.id===pl.eqId);return s+(e?.price||0);},0))}
                </div>
                <div style={{height:1,background:T.border,margin:"6px 0"}}/>
                <div style={{fontSize:11,color:T.muted,lineHeight:1.5}}>
                  💡 <b>Tipp:</b><br/>
                  Klicken Sie auf ein Gerät in der Bibliothek, um es auf der Karte zu platzieren. Ziehen Sie Geräte und Hindernisse per Drag & Drop.
                </div>
              </>
            )}
            {selEqData&&(
              <>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:42,height:42,borderRadius:10,background:selEqData.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{selEqData.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,lineHeight:1.2}}>{selEqData.name}</div>
                    {selEqData.artNr&&<div style={{fontSize:10,color:T.muted,fontFamily:"monospace",marginTop:2}}>{selEqData.artNr}</div>}
                  </div>
                </div>
                <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{selEqData.desc}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11}}>
                  <Kv label="Kategorie" val={selEqData.cat}/>
                  <Kv label="Material" val={selEqData.mat}/>
                  <Kv label="Altersgruppe" val={selEqData.age}/>
                  <Kv label="Fallzone" val={`${selEqData.fallZone} m`}/>
                  <Kv label="Größe" val={`${selEqData.size[0]}×${selEqData.size[1]} m`}/>
                  <Kv label="Rotation" val={`${selEq.rot||0}°`}/>
                </div>
                <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginTop:4}}>Preis</div>
                <div className="syne" style={{fontSize:18,fontWeight:800,color:T.green}}>{fmt(selEqData.price)}</div>
                {/* Rotation control */}
                <div style={{background:T.bg,borderRadius:8,padding:10,display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Rotation</span>
                    <span className="syne" style={{fontWeight:800,fontSize:13,color:T.green}}>{selEq.rot||0}°</span>
                  </div>
                  <input type="range" min="0" max="359" step="1" value={selEq.rot||0}
                    onChange={e=>{
                      const v=Number(e.target.value);
                      updateProject(p=>({...p,placed:p.placed.map(x=>x.id===selEq.id?{...x,rot:v}:x)}));
                    }}
                    style={{width:"100%",accentColor:T.green,cursor:"pointer"}}/>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>rotateSelected(-15)} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>↺ 15°</button>
                    <button onClick={()=>rotateSelected(-45)} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>↺ 45°</button>
                    <button onClick={()=>updateProject(p=>({...p,placed:p.placed.map(x=>x.id===selEq.id?{...x,rot:0}:x)}))} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}} title="Auf 0° zurücksetzen">⊙</button>
                    <button onClick={()=>rotateSelected(45)} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>45° ↻</button>
                    <button onClick={()=>rotateSelected(15)} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>15° ↻</button>
                  </div>
                  <div style={{fontSize:10,color:T.muted,textAlign:"center"}}>⌨ Taste <b>R</b> = +15° · <b>Shift+R</b> = −15°</div>
                </div>
                <Btn variant="ghost" onClick={deleteSelected} style={{color:T.red,borderColor:T.red+"66"}}>🗑 Entfernen (Entf)</Btn>
              </>
            )}
            {selOb&&(
              <>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:42,height:42,borderRadius:10,background:selOb.type==="tree"?"#065F4622":"#37415122",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{selOb.type==="tree"?"🌳":"🏠"}</div>
                  <div><div style={{fontWeight:700,fontSize:13}}>{selOb.label}</div><div style={{fontSize:11,color:T.muted}}>{selOb.type==="tree"?"Baum / Hindernis":"Gebäude"}</div></div>
                </div>
                <Input label="Bezeichnung" value={selOb.label} onChange={v=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,label:v}:x)}))}/>
                {selOb.type==="tree"?
                  <Input label="Kronendurchmesser (m)" type="number" value={(selOb.r||3)*2} onChange={v=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,r:Math.max(.5,Number(v)/2)}:x)}))}/>:
                  <>
                    <Input label="Breite (m)" type="number" value={selOb.w||6} onChange={v=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,w:Math.max(1,Number(v))}:x)}))}/>
                    <Input label="Tiefe (m)" type="number" value={selOb.h||4} onChange={v=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,h:Math.max(1,Number(v))}:x)}))}/>
                    <div style={{background:T.bg,borderRadius:8,padding:10,display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Ausrichtung</span>
                        <span className="syne" style={{fontWeight:800,fontSize:13,color:T.green}}>{selOb.rot||0}°</span>
                      </div>
                      <input type="range" min="0" max="359" step="1" value={selOb.rot||0}
                        onChange={e=>{
                          const v=Number(e.target.value);
                          updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,rot:v}:x)}));
                        }}
                        style={{width:"100%",accentColor:T.green,cursor:"pointer"}}/>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,rot:((x.rot||0)-15+360)%360}:x)}))} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>↺ 15°</button>
                        <button onClick={()=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,rot:0}:x)}))} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}} title="0°">⊙</button>
                        <button onClick={()=>updateProject(p=>({...p,obstacles:p.obstacles.map(x=>x.id===selOb.id?{...x,rot:((x.rot||0)+15)%360}:x)}))} style={{flex:1,padding:"6px 0",border:`1px solid ${T.border}`,background:"white",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>15° ↻</button>
                      </div>
                      <div style={{fontSize:10,color:T.muted,textAlign:"center"}}>Ausrichtung zum Luftbild anpassen</div>
                    </div>
                  </>}
                <Btn variant="ghost" onClick={deleteSelected} style={{color:T.red,borderColor:T.red+"66"}}>🗑 Entfernen</Btn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RenderStudio Modal — Photorealistic Path Tracing */}
      {renderStudioOpen && threeRef.current && (
        <RenderStudio
          sourceScene={threeRef.current.scene}
          sourceCamera={threeRef.current.camera}
          onClose={()=>setRenderStudioOpen(false)}
        />
      )}
    </div>
  );
}

function Stat({label,val,color}){
  return (
    <div style={{padding:"8px 10px",background:T.bg,borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:12,color:T.muted}}>{label}</span>
      <span className="syne" style={{fontWeight:800,color:color||T.text}}>{val}</span>
    </div>
  );
}
function Kv({label,val}){
  return (
    <div style={{padding:"5px 8px",background:T.bg,borderRadius:6}}>
      <div style={{fontSize:9.5,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.3}}>{label}</div>
      <div style={{fontWeight:600,fontSize:11.5,marginTop:1}}>{val}</div>
    </div>
  );
}

/* ═══════════════════════════ QUOTE ═══════════════════════════ */
function Quote({project,equipment,manufacturers,workPrices}) {
  const placed=project.placed||[];
  const eqItems=placed.map(pl=>{const e=equipment.find(x=>x.id===pl.eqId);return e?{...e,placedId:pl.id}:null;}).filter(Boolean);
  const floorArea=project.area.w*project.area.h;

  // Fallschutz-Fläche: tatsächlich benötigter zusammenhängender Belag
  // (individuelle Fallzonen + 0.3m Verbindungs-Puffer, zusammenhängend berechnet)
  const projectCenter=project.geo||{lat:46.9480,lng:7.4474,zoom:19};
  const fpCalc=computeFallProtectionArea(placed,equipment,projectCenter);

  // === State für Rabatte, Skonto & Fallschutz-Modus ===
  const usedCats=[...new Set(eqItems.map(e=>e.cat))];
  const [catDiscounts,setCatDiscounts]=useState({}); // cat → % discount
  const [overallDiscount,setOverallDiscount]=useState(0); // zusätzlicher Gesamtrabatt %
  const [skonto,setSkonto]=useState(""); // String, leer = nicht anzeigen
  const [skontoDays,setSkontoDays]=useState(14);
  const [fpMode,setFpMode]=useState("merged"); // "merged" | "individual"

  // Fläche abhängig vom Modus
  const fallProtectionArea = fpCalc.zones>0
    ? (fpMode==="merged" ? fpCalc.mergedArea : fpCalc.individualSum)
    : floorArea;

  // === Berechnungen ===
  // Geräte nach Rabatt
  const eqWithDiscount=eqItems.map(e=>{
    const pct=Number(catDiscounts[e.cat]||0);
    const discountedPrice=e.price*(1-pct/100);
    return {...e,origPrice:e.price,discountedPrice,discountPct:pct};
  });
  const eqGross=eqItems.reduce((s,e)=>s+e.price,0);
  const eqAfterCatDiscount=eqWithDiscount.reduce((s,e)=>s+e.discountedPrice,0);
  const catDiscountAmount=eqGross-eqAfterCatDiscount;

  // Arbeitspositionen
  const fpFloorName=project.wizard?.floor||"EPDM";
  const workItems=[
    {name:"Lieferpauschale",unit:"pauschal",qty:1,price:workPrices.find(w=>w.name.includes("Liefer"))?.price||580},
    {name:"Geräteaufbau (geschätzt)",unit:"h",qty:Math.ceil(placed.length*3),price:workPrices.find(w=>w.name.includes("Aufbau"))?.price||95},
    {name:"Fundamente",unit:"Stk",qty:placed.length,price:workPrices.find(w=>w.name.includes("Fundam"))?.price||320},
    {name:`Fallschutzbelag ${fpFloorName}`+(fpCalc.zones>0?(fpMode==="merged"?` (${fpCalc.clusters} zusammenhängende Fläche${fpCalc.clusters>1?"n":""})`:` (${fpCalc.zones} einzelne Geräteflächen)`):""),unit:"m²",qty:fallProtectionArea,price:workPrices.find(w=>w.name.includes("Fallschutz"))?.price||45},
    {name:"Projektleitung",unit:"pauschal",qty:1,price:workPrices.find(w=>w.name.includes("Projekt"))?.price||850},
  ];
  const workTotal=workItems.reduce((s,w)=>s+w.qty*w.price,0);

  // Gesamtrabatt auf Zwischensumme (Geräte + Arbeit)
  const afterCatDiscount=eqAfterCatDiscount+workTotal;
  const overallDiscountAmount=afterCatDiscount*(Number(overallDiscount)/100);
  const subtotal=afterCatDiscount-overallDiscountAmount;
  const vat=subtotal*.081;
  const total=subtotal+vat;

  // Skonto (nur wenn eingegeben)
  const skontoPct=Number(skonto)||0;
  const hasSkonto=skontoPct>0;
  const skontoAmount=hasSkonto?total*(skontoPct/100):0;
  const skontoTotal=total-skontoAmount;

  const today=new Date().toLocaleDateString("de-CH",{year:"numeric",month:"long",day:"numeric"});
  const validTil=new Date(Date.now()+60*86400000).toLocaleDateString("de-CH",{year:"numeric",month:"long",day:"numeric"});

  const inlineInput={
    padding:"3px 6px",border:`1px solid ${T.border}`,borderRadius:4,fontSize:12,fontFamily:"inherit",
    width:50,textAlign:"right",background:"white",outline:"none",
  };

  return (
    <div className="fade-in">
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div className="syne" style={{fontSize:24,fontWeight:800}}>Offerte</div><div style={{color:T.muted,fontSize:13}}>Drucken oder als PDF speichern — Rabatte und Skonto sind live-editierbar</div></div>
        <Btn variant="gold" onClick={()=>window.print()}>🖨️ Drucken / PDF</Btn>
      </div>

      {/* ════ RABATT-STEUERUNG (nicht in Druck) ════ */}
      <div className="no-print" style={{maxWidth:860,margin:"0 auto 16px",background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"14px 20px"}}>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Rabatt pro Kategorie</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {usedCats.map(c=>(
                <div key={c} style={{display:"flex",alignItems:"center",gap:5,background:"white",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 8px"}}>
                  <span style={{fontSize:12,fontWeight:600}}>{ICONS[c]} {c}</span>
                  <input type="number" min="0" max="100" step="1" value={catDiscounts[c]||""}
                    onChange={e=>setCatDiscounts(d=>({...d,[c]:e.target.value}))}
                    placeholder="0" style={{...inlineInput,width:48}}/>
                  <span style={{fontSize:12,color:T.muted}}>%</span>
                </div>
              ))}
              {usedCats.length===0&&<span style={{fontSize:12,color:T.muted,fontStyle:"italic"}}>Keine Geräte platziert</span>}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Gesamtrabatt</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <input type="number" min="0" max="100" step="0.5" value={overallDiscount||""}
                onChange={e=>setOverallDiscount(e.target.value)}
                placeholder="0" style={{...inlineInput,width:65}}/>
              <span style={{fontSize:12,color:T.muted}}>%</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Skontoabzug (optional)</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <input type="number" min="0" max="10" step="0.5" value={skonto}
                onChange={e=>setSkonto(e.target.value)}
                placeholder="— %"
                style={{...inlineInput,width:70,color:hasSkonto?T.green:T.muted,fontWeight:hasSkonto?700:400}}/>
              <span style={{fontSize:12,color:T.muted}}>% bei Zahlung binnen</span>
              <input type="number" min="1" max="90" step="1" value={skontoDays}
                onChange={e=>setSkontoDays(Number(e.target.value))}
                style={{...inlineInput,width:50}}/>
              <span style={{fontSize:12,color:T.muted}}>Tagen</span>
            </div>
            {!hasSkonto&&<div style={{fontSize:10,color:T.muted,marginTop:4,fontStyle:"italic"}}>→ wird in der Offerte nur angezeigt, wenn % eingegeben</div>}
          </div>
          {fpCalc.zones>0&&(
            <div>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Fallschutz-Verrechnung</div>
              <div style={{display:"flex",background:"white",border:`1.5px solid ${T.border}`,borderRadius:6,overflow:"hidden"}}>
                <button onClick={()=>setFpMode("merged")}
                  style={{padding:"6px 12px",border:"none",background:fpMode==="merged"?T.green:"white",color:fpMode==="merged"?"white":T.text,cursor:"pointer",fontSize:11.5,fontWeight:600,fontFamily:"inherit"}}
                  title="Zusammenhängende Fläche inkl. Verbindungen und sauberem Rand (realistischer für grössere Anlagen)">
                  ⬛ Zusammenhängend · {fpCalc.mergedArea} m²
                </button>
                <button onClick={()=>setFpMode("individual")}
                  style={{padding:"6px 12px",border:"none",background:fpMode==="individual"?T.green:"white",color:fpMode==="individual"?"white":T.text,cursor:"pointer",fontSize:11.5,fontWeight:600,fontFamily:"inherit",borderLeft:`1px solid ${T.border}`}}
                  title="Pro Gerät eine Einzelfläche (für isolierte Geräte)">
                  ⬚ Einzeln · {fpCalc.individualSum} m²
                </button>
              </div>
              <div style={{fontSize:10,color:T.muted,marginTop:4,fontStyle:"italic"}}>
                Differenz: {Math.round((fpCalc.mergedArea-fpCalc.individualSum)*10)/10} m² ·
                wirkt sich auf Position „Fallschutzbelag" aus
              </div>
            </div>
          )}
        </div>
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
                <div style={{fontSize:13,fontWeight:600}}>{v||"—"}</div>
              </div>
            ))}
          </div>
          {fpCalc.zones>0&&(
            <div style={{marginTop:16,padding:"10px 14px",background:"#2A1F18",color:"white",borderRadius:8,fontSize:11.5,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{opacity:.9}}>
                <b>Fallschutz EN 1177:</b>{" "}
                {fpCalc.zones} Gerät(e) mit Fallhöhe &gt; 60cm
              </div>
              <div style={{display:"flex",gap:14,fontSize:11}}>
                <span>Einzelflächen Σ: <b style={{fontFamily:"monospace"}}>{fpCalc.individualSum} m²</b></span>
                <span>→ Belag zusammenhängend: <b className="syne" style={{fontSize:13}}>{fpCalc.mergedArea} m²</b></span>
                {fpCalc.clusters>1&&<span style={{opacity:.7}}>in {fpCalc.clusters} separaten Bereichen</span>}
              </div>
            </div>
          )}
        </div>
        {/* Equipment */}
        <div style={{padding:"24px 40px"}}>
          <div className="syne" style={{fontWeight:700,fontSize:16,marginBottom:14,color:T.green}}>🛝 Spielgeräte</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.bg}}>
                {["Pos","Gerät","Kategorie","Material","Hersteller","Preis","Rabatt","Netto CHF"].map(h=>(
                  <th key={h} style={{padding:"10px 8px",textAlign:["Preis","Rabatt","Netto CHF"].includes(h)?"right":"left",fontSize:10.5,fontWeight:700,textTransform:"uppercase",color:T.muted,letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eqWithDiscount.map((e,i)=>(
                <tr key={e.placedId} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"10px 8px",color:T.muted,fontSize:12}}>{i+1}</td>
                  <td style={{padding:"10px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:7,background:e.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{e.icon}</div>
                      <div><div style={{fontWeight:600,fontSize:12.5}}>{e.name}</div>{e.artNr&&<div style={{fontSize:10,color:T.muted,fontFamily:"monospace"}}>{e.artNr}</div>}</div>
                    </div>
                  </td>
                  <td style={{padding:"10px 8px"}}><Badge color={e.color}>{e.cat}</Badge></td>
                  <td style={{padding:"10px 8px",color:T.muted,fontSize:12}}>{e.mat}</td>
                  <td style={{padding:"10px 8px",color:T.muted,fontSize:12}}>{manufacturers.find(m=>m.id===e.mfr)?.name||"—"}</td>
                  <td style={{padding:"10px 8px",textAlign:"right",fontSize:12,color:e.discountPct>0?T.muted:"inherit",textDecoration:e.discountPct>0?"line-through":"none"}}>{fmt(e.origPrice)}</td>
                  <td style={{padding:"10px 8px",textAlign:"right",fontSize:12,color:e.discountPct>0?T.red:T.muted}}>{e.discountPct>0?`−${e.discountPct}%`:"—"}</td>
                  <td style={{padding:"10px 8px",textAlign:"right"}}><span className="syne" style={{fontWeight:700}}>{fmt(e.discountedPrice)}</span></td>
                </tr>
              ))}
              {eqItems.length===0&&<tr><td colSpan={8} style={{padding:20,textAlign:"center",color:T.muted,fontSize:12}}>Keine Geräte platziert</td></tr>}
              <tr style={{background:"#F8FDF9"}}>
                <td colSpan={7} style={{padding:"12px",fontWeight:700,color:T.green}}>Geräte-Zwischentotal</td>
                <td style={{padding:"12px",textAlign:"right"}}><span className="syne" style={{fontWeight:800,color:T.green,fontSize:16}}>{fmt(eqAfterCatDiscount)}</span></td>
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
              <div style={{width:340}}>
                {catDiscountAmount>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:12.5,color:T.red}}>
                    <span>Kategorie-Rabatte</span><span>−{fmt(catDiscountAmount)}</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13}}>
                  <span style={{color:T.muted}}>Zwischentotal (Geräte + Montage)</span><span>{fmt(afterCatDiscount)}</span>
                </div>
                {overallDiscountAmount>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:12.5,color:T.red}}>
                    <span>Gesamtrabatt ({overallDiscount}%)</span><span>−{fmt(overallDiscountAmount)}</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:600}}>
                  <span>Netto</span><span>{fmt(subtotal)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                  <span style={{color:T.muted}}>MWST 8.1%</span><span>{fmt(vat)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 0",alignItems:"center"}}>
                  <span className="syne" style={{fontWeight:800,fontSize:16}}>TOTAL CHF</span>
                  <span className="syne" style={{fontWeight:800,fontSize:24,color:T.green}}>{fmt(total)}</span>
                </div>

                {/* Skonto block - only shown when value entered */}
                {hasSkonto&&(
                  <div style={{marginTop:16,padding:"14px",background:"white",border:`1.5px solid ${T.gold}66`,borderRadius:10}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#8B6914",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Zahlungsbonus</div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5}}>
                      <span>Bei Zahlung binnen {skontoDays} Tagen:</span>
                      <span style={{color:T.red,fontWeight:600}}>−{skontoPct}% Skonto (−{fmt(skontoAmount)})</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px dashed ${T.border}`,alignItems:"baseline"}}>
                      <span className="syne" style={{fontWeight:700,fontSize:14,color:"#8B6914"}}>Skonto-Betrag CHF</span>
                      <span className="syne" style={{fontWeight:800,fontSize:20,color:"#8B6914"}}>{fmt(skontoTotal)}</span>
                    </div>
                  </div>
                )}
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
          <div>Preise exkl. MWST · Alle Geräte nach EN 1176/1177 · Lieferung ab Werk<br/>Diese Offerte ist 60 Tage gültig ab Ausstellungsdatum{hasSkonto?` · ${skontoPct}% Skonto bei Zahlung binnen ${skontoDays} Tagen`:""}.</div>
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
