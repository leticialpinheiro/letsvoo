import { useState, useEffect, useCallback } from "react";

// ─── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  bg:      "#060d18", surface: "#0d1e32", card: "#111e30", border: "#1e3a54",
  hi:      "#f0f6ff", body: "#c8daf0",   muted: "#8aaac8", faint: "#6a8aaa",
  orange:  "#FF6B35", pink: "#FF3CAC",
  green:   "#4ade80", yellow: "#fbbf24", purple: "#c084fc", blue: "#60a5fa", red: "#f87171",
};

// ─── DADOS ─────────────────────────────────────────────────────────────────────
const AIRPORTS = [
  { code:"GRU", city:"São Paulo (Guarulhos)",          state:"SP" },
  { code:"CGH", city:"São Paulo (Congonhas)",          state:"SP" },
  { code:"VCP", city:"Campinas (Viracopos)",           state:"SP" },
  { code:"GIG", city:"Rio de Janeiro (Galeão)",        state:"RJ" },
  { code:"SDU", city:"Rio de Janeiro (Santos Dumont)", state:"RJ" },
  { code:"BHZ", city:"Belo Horizonte (Confins)",       state:"MG" },
  { code:"CNF", city:"Belo Horizonte (Pampulha)",      state:"MG" },
  { code:"BSB", city:"Brasília",                       state:"DF" },
  { code:"SSA", city:"Salvador",                       state:"BA" },
  { code:"FOR", city:"Fortaleza",                      state:"CE" },
  { code:"REC", city:"Recife",                         state:"PE" },
  { code:"POA", city:"Porto Alegre",                   state:"RS" },
  { code:"CWB", city:"Curitiba",                       state:"PR" },
  { code:"FLN", city:"Florianópolis",                  state:"SC" },
  { code:"BEL", city:"Belém",                          state:"PA" },
  { code:"MAO", city:"Manaus",                         state:"AM" },
  { code:"NAT", city:"Natal",                          state:"RN" },
  { code:"MCZ", city:"Maceió",                         state:"AL" },
  { code:"GYN", city:"Goiânia",                        state:"GO" },
  { code:"CGR", city:"Campo Grande",                   state:"MS" },
  { code:"VIX", city:"Vitória",                        state:"ES" },
  { code:"MIA", city:"Miami",                          state:"EUA" },
  { code:"JFK", city:"Nova York (JFK)",                state:"EUA" },
  { code:"MCO", city:"Orlando",                        state:"EUA" },
  { code:"LAX", city:"Los Angeles",                    state:"EUA" },
  { code:"LIS", city:"Lisboa",                         state:"EUR" },
  { code:"MAD", city:"Madri",                          state:"EUR" },
  { code:"CDG", city:"Paris",                          state:"EUR" },
  { code:"LHR", city:"Londres",                        state:"EUR" },
  { code:"FCO", city:"Roma",                           state:"EUR" },
  { code:"EZE", city:"Buenos Aires",                   state:"AME" },
  { code:"SCL", city:"Santiago",                       state:"AME" },
  { code:"CUN", city:"Cancún",                         state:"AME" },
  { code:"DXB", city:"Dubai",                          state:"ASI" },
  { code:"NRT", city:"Tóquio",                         state:"ASI" },
];

const STATE_GROUPS = [
  { id:"SP",  label:"📍 São Paulo — todos",      codes:["GRU","CGH","VCP"],            flag:"🟡" },
  { id:"RJ",  label:"📍 Rio de Janeiro — todos", codes:["GIG","SDU"],                  flag:"🟢" },
  { id:"MG",  label:"📍 Minas Gerais — todos",   codes:["BHZ","CNF"],                  flag:"🔵" },
  { id:"EUA", label:"🇺🇸 EUA — principais",       codes:["MIA","JFK","MCO","LAX"],      flag:"🇺🇸" },
  { id:"EUR", label:"🇪🇺 Europa — principais",    codes:["LIS","MAD","CDG","LHR","FCO"],flag:"🇪🇺" },
];

const CABINS = ["Econômica","Econômica Premium","Executiva","Primeira Classe"];
const WD     = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const WD_F   = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

const TIME_SLOTS = [
  { id:"madrugada", label:"🌙 Madrugada", sub:"00h–05h", from:0,  to:5  },
  { id:"manha",     label:"🌅 Manhã",     sub:"06h–11h", from:6,  to:11 },
  { id:"tarde",     label:"☀️ Tarde",     sub:"12h–17h", from:12, to:17 },
  { id:"noite",     label:"🌆 Noite",     sub:"18h–23h", from:18, to:23 },
];

const AIRLINES = [
  { code:"LA", name:"LATAM",    color:"#C8102E", prog:"LATAM Pass",
    cashUrl: (o,d,dt) => `https://www.latamairlines.com/br/pt/oferta-voos?origin=${o}&destination=${d}&outbound=${dt}&adt=1`,
    milesUrl:(o,d,dt) => `https://www.latamairlines.com/br/pt/oferta-voos?origin=${o}&destination=${d}&outbound=${dt}&adt=1&redemption=true` },
  { code:"G3", name:"GOL",      color:"#FF6B00", prog:"Smiles",
    cashUrl: (o,d)    => `https://www.voegol.com.br/pt/passagens-aereas/${o}-${d}`,
    milesUrl:()       => "https://www.smiles.com.br" },
  { code:"AD", name:"Azul",     color:"#003DA5", prog:"TudoAzul",
    cashUrl: ()       => "https://www.voeazul.com.br",
    milesUrl:()       => "https://www.tudoazul.com.br/voos" },
  { code:"TP", name:"TAP",      color:"#00843D", prog:"Miles&Go",
    cashUrl: ()       => "https://www.flytap.com/pt-br/voos",
    milesUrl:()       => "https://www.flytap.com/pt-br/voos" },
  { code:"AA", name:"American", color:"#0078D2", prog:"AAdvantage",
    cashUrl: ()       => "https://www.aa.com/booking/find-flights",
    milesUrl:()       => "https://www.aa.com/booking/find-flights" },
];

const PLATFORMS = [
  { name:"Google Voos", icon:"🔍", color:"#4285F4", desc:"Visão geral e alertas",    url:(o,d)=>`https://www.google.com/travel/flights?q=voos+${o}+${d}` },
  { name:"Decolar",     icon:"🟡", color:"#FF6D00", desc:"Nacionais e internacionais",url:(o,d)=>`https://www.decolar.com/passagens-aereas/${o}-${d}/` },
  { name:"Max Milhas",  icon:"✈",  color:"#1A73E8", desc:"Especialista em milhas",    url:()=>"https://www.maxmilhas.com.br" },
  { name:"Smiles",      icon:"😊", color:"#FF6B00", desc:"Programa de milhas GOL",    url:()=>"https://www.smiles.com.br" },
  { name:"LATAM Pass",  icon:"🔴", color:"#C8102E", desc:"Milhas LATAM",              url:()=>"https://www.latamairlines.com/br/pt/latam-pass" },
  { name:"TudoAzul",    icon:"🔵", color:"#003DA5", desc:"Programa da Azul",          url:()=>"https://www.tudoazul.com.br" },
  { name:"Livelo",      icon:"💜", color:"#6B21A8", desc:"Pontos transferíveis",      url:()=>"https://www.livelo.com.br" },
  { name:"Kayak",       icon:"🛶", color:"#FF690F", desc:"Comparador global",         url:()=>"https://www.kayak.com.br" },
];

// ─── MOCK ──────────────────────────────────────────────────────────────────────
// Gera múltiplos voos por companhia cobrindo todos os períodos do dia
function generateMock(origCode, destCode, dateStr, sType, paxCount, nonstop) {
  const INTL   = ["MIA","JFK","MCO","LAX","LIS","MAD","CDG","LHR","FCO","EZE","SCL","CUN","DXB","NRT"];
  const isIntl = INTL.includes(destCode);
  const seed   = (origCode.charCodeAt(0)*7 + destCode.charCodeAt(0)*13 + (new Date(dateStr+"T12:00").getDate()||1)*3) % 97;
  const baseP  = isIntl ? 1800+seed*38 : 320+seed*9;
  const baseM  = isIntl ? 40000+seed*800 : 8000+seed*270;
  const list   = [];
  const hasCash  = !sType || sType==="pagante";
  const hasMiles = !sType || sType==="milhas";

  // Cada companhia opera múltiplos horários ao longo do dia
  // cobrindo madrugada, manhã, tarde e noite
  const SCHEDULE = [
    { airline: AIRLINES[0], slots: [
      { depH:0,  depM:30, stops:1, pm:0.96 }, // madrugada
      { depH:6,  depM:0,  stops:0, pm:1.00 }, // manhã cedo
      { depH:9,  depM:30, stops:0, pm:1.05 }, // manhã
      { depH:13, depM:0,  stops:1, pm:0.92 }, // tarde
      { depH:16, depM:30, stops:0, pm:1.08 }, // tarde
      { depH:19, depM:0,  stops:0, pm:1.03 }, // noite
      { depH:22, depM:15, stops:1, pm:0.88 }, // noite tarde
    ]},
    { airline: AIRLINES[1], slots: [
      { depH:5,  depM:45, stops:1, pm:0.91 },
      { depH:8,  depM:0,  stops:0, pm:0.94 },
      { depH:11, depM:30, stops:1, pm:0.89 },
      { depH:15, depM:0,  stops:0, pm:0.97 },
      { depH:18, depM:30, stops:1, pm:0.86 },
      { depH:21, depM:0,  stops:0, pm:0.93 },
      { depH:23, depM:30, stops:1, pm:0.84 },
    ]},
    { airline: AIRLINES[2], slots: [
      { depH:1,  depM:0,  stops:2, pm:0.82 },
      { depH:7,  depM:15, stops:0, pm:1.07 },
      { depH:10, depM:0,  stops:1, pm:0.99 },
      { depH:14, depM:30, stops:0, pm:1.12 },
      { depH:17, depM:0,  stops:1, pm:0.95 },
      { depH:20, depM:30, stops:0, pm:1.10 },
    ]},
    { airline: AIRLINES[3], slots: [
      { depH:3,  depM:0,  stops:2, pm:0.79 },
      { depH:8,  depM:45, stops:1, pm:0.90 },
      { depH:12, depM:0,  stops:0, pm:1.15 },
      { depH:17, depM:30, stops:1, pm:1.01 },
      { depH:21, depM:45, stops:0, pm:0.98 },
    ]},
    { airline: AIRLINES[4], slots: [
      { depH:2,  depM:0,  stops:2, pm:0.77 },
      { depH:7,  depM:0,  stops:1, pm:0.88 },
      { depH:11, depM:0,  stops:0, pm:1.18 },
      { depH:16, depM:0,  stops:1, pm:1.04 },
      { depH:22, depM:0,  stops:0, pm:0.95 },
    ]},
  ];

  const scheduleToUse = nonstop
    ? SCHEDULE.map(s=>({...s, slots:s.slots.filter(sl=>sl.stops===0)})).filter(s=>s.slots.length>0)
    : SCHEDULE;

  scheduleToUse.forEach(({airline: a, slots}, ai) => {
    const airlineM = [1, 0.93, 1.07, 1.14, 1.21][ai] || 1;
    slots.forEach((sl, si) => {
      // Varia preço por horário (madrugada/noite = mais barato, horário nobre = mais caro)
      const timeM  = sl.pm;
      const stopM  = sl.stops === 0 ? 1 : sl.stops === 1 ? 0.88 : 0.78;
      const price  = Math.round(baseP * airlineM * timeM * paxCount / 50) * 50;
      const miles  = Math.round(baseM * airlineM * timeM / 1000) * 1000;
      const taxes  = isIntl ? 180 + ai*40 + si*10 : 28 + ai*8 + si*4;
      const durH   = isIntl ? 8 + ai : 1 + Math.min(ai, 2);
      const durM   = [0, 15, 30, 45][si % 4];
      const arrH   = (sl.depH + durH + Math.floor((sl.depM + durM) / 60)) % 24;
      const arrMin = (sl.depM + durM) % 60;
      const depT   = `${String(sl.depH).padStart(2,"0")}:${String(sl.depM).padStart(2,"0")}`;
      const arrT   = `${String(arrH).padStart(2,"0")}:${String(arrMin).padStart(2,"0")}`;
      const dur    = `${durH}h${String(durM||0).padStart(2,"0")}`;
      const uid    = `${a.code}-${origCode}-${destCode}-${dateStr}-${sl.depH}${sl.depM}-${si}`;

      if (hasCash)  list.push({ id:`${uid}-c`, airline:a.name, airlineCode:a.code, color:a.color, origin:origCode, destination:destCode, date:dateStr, depTime:depT, arrTime:arrT, depHour:sl.depH, dur, stops:sl.stops, type:"cash",  price, pax:paxCount, url:a.cashUrl(origCode,destCode,dateStr) });
      if (hasMiles) list.push({ id:`${uid}-m`, airline:a.name, airlineCode:a.code, color:a.color, origin:origCode, destination:destCode, date:dateStr, depTime:depT, arrTime:arrT, depHour:sl.depH, dur, stops:sl.stops, type:"miles", miles, taxes, prog:a.prog, pax:paxCount, url:a.milesUrl(origCode,destCode,dateStr) });
    });
  });

  return list;
}

// ─── API REAL (via proxy Vercel — sem CORS) ────────────────────────────────────
async function searchFlights(origCode, destCode, dateStr, returnDateStr, sType, paxCount, nonstop) {
  const slices = [{ origin: origCode, destination: destCode, departureDate: dateStr }];
  if (returnDateStr) slices.push({ origin: destCode, destination: origCode, departureDate: returnDateStr });

  const body = {
    type: returnDateStr ? "round_trip" : "one_way",
    slices,
    passengers: [{ type: "adult", count: paxCount }],
    cabinClass: "economy",
    enableDeduplication: true,
    ...(nonstop ? { maxConnections: 0 } : {}),
    ...(sType ? { searchType: sType } : {}),
  };

  const res = await fetch("/api/flights", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Erro ${res.status}`);
  }

  const data = await res.json();

  // Converte resposta da apidevoos para o formato interno
  return (data.flightGroups || []).map((g, gi) => {
    const sig   = g.humanSignature || "";
    const parts = sig.split("-");
    const airCode = parts[3] || "??";
    const AL_COLORS = { LA:"#C8102E", G3:"#FF6B00", AD:"#003DA5", TP:"#00843D", AA:"#0078D2" };
    const AL_NAMES  = { LA:"LATAM", G3:"GOL", AD:"Azul", TP:"TAP", AA:"American" };
    const color   = AL_COLORS[airCode] || "#1a3a5c";
    const airline = AL_NAMES[airCode]  || airCode;
    const flight  = g.flightInfo || {};
    const depT    = (flight.departureTime || "08:00").slice(0,5);
    const arrT    = (flight.arrivalTime   || "10:00").slice(0,5);
    const depH    = parseInt(depT.slice(0,2)) || 8;
    const dur     = flight.duration || "2h00";
    const stops   = (flight.stops ?? 0);
    const price   = g.price?.total || g.totalPrice?.amount || g.fare?.total || 0;
    const url     = g.deepLink || g.offers?.[0]?.deepLink || `https://www.google.com/travel/flights?q=voos+${origCode}+${destCode}`;

    return {
      id:          `api-${gi}-${origCode}-${destCode}-${dateStr}`,
      airline,
      airlineCode: airCode,
      color,
      origin:      origCode,
      destination: destCode,
      date:        dateStr,
      depTime:     depT,
      arrTime:     arrT,
      depHour:     depH,
      dur,
      stops,
      type:        "cash",
      price,
      pax:         paxCount,
      url,
      fromApi:     true,
    };
  });
}

// ─── RECORRÊNCIA ───────────────────────────────────────────────────────────────
function getFixedDates(dayIdx, rs, re) {
  const [sy,sm] = rs.split("-").map(Number);
  const [ey,em] = re.split("-").map(Number);
  const out = [], cur = new Date(sy,sm-1,1), end = new Date(ey,em,0);
  while (cur<=end) { if (cur.getDay()===dayIdx) out.push(cur.toISOString().slice(0,10)); cur.setDate(cur.getDate()+1); }
  return out.slice(0,12);
}

function getPairs(dOut, dRet, rs, re, minS, maxS) {
  const [sy,sm] = rs.split("-").map(Number);
  const [ey,em] = re.split("-").map(Number);
  const aOut=[], aRet=[], cur=new Date(sy,sm-1,1), end=new Date(ey,em,0);
  while (cur<=end) {
    if (dOut.includes(cur.getDay())) aOut.push(new Date(cur));
    if (dRet.includes(cur.getDay())) aRet.push(new Date(cur));
    cur.setDate(cur.getDate()+1);
  }
  const pairs=[];
  for (const o of aOut) for (const r of aRet) { const d=Math.round((r-o)/86400000); if (d>=minS&&d<=maxS) pairs.push({out:o.toISOString().slice(0,10),ret:r.toISOString().slice(0,10),diff:d}); }
  return pairs.sort((a,b)=>a.out.localeCompare(b.out)).slice(0,8);
}

// ─── UTILS ─────────────────────────────────────────────────────────────────────
const fBRL   = v => `R$ ${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const fMiles = v => `${(v/1000).toFixed(0)}k pts`;
const fDate  = d => { if(!d) return ""; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };

function useWinW() {
  const [w,setW] = useState(typeof window!=="undefined"?window.innerWidth:390);
  useEffect(()=>{ const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  return w;
}

// ─── UI ATOMS ──────────────────────────────────────────────────────────────────
function Logo({ sm }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:sm?8:10}}>
      <div style={{width:sm?30:36,height:sm?30:36,background:`linear-gradient(135deg,${C.orange},${C.pink})`,borderRadius:sm?9:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sm?14:17,boxShadow:`0 4px 16px ${C.orange}55`,flexShrink:0}}>✈</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:sm?17:20,fontWeight:800,letterSpacing:"-0.5px",background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>
        Let's<em>Voo</em>
      </div>
    </div>
  );
}

function Tag({ children, bg="rgba(255,107,53,.12)", col=C.orange, brd="rgba(255,107,53,.25)" }) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:bg,color:col,border:`1px solid ${brd}`}}>{children}</span>;
}

function Tog({ on, onChange }) {
  return (
    <label style={{position:"relative",display:"inline-block",width:40,height:22,cursor:"pointer",flexShrink:0}}>
      <input type="checkbox" checked={on} onChange={onChange} style={{opacity:0,width:0,height:0}}/>
      <span style={{position:"absolute",inset:0,background:on?`${C.orange}55`:"rgba(255,255,255,.08)",borderRadius:22,transition:".25s"}}>
        <span style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,background:on?C.orange:C.faint,borderRadius:"50%",transition:".25s"}}/>
      </span>
    </label>
  );
}

// Airline initials badge
function ALBadge({ name, code, color, size=42 }) {
  const bg  = color||C.border;
  const txt = (name||code||"?").replace(/Airlines?|Airways?/gi,"").trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,background:bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 10px ${bg}55`}}><span style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:800,color:"#fff"}}>{txt}</span></div>;
}

// ─── AIRPORT INPUT WITH STATE GROUPS ───────────────────────────────────────────
function AirInput({ codes, txt, setTxt, onSingle, onGroup, placeholder }) {
  const [open,setOpen] = useState(false);
  const q = txt.toLowerCase();
  const filtA = AIRPORTS.filter(a=>a.code.toLowerCase().includes(q)||a.city.toLowerCase().includes(q)||a.state.toLowerCase().includes(q));
  const filtG = STATE_GROUPS.filter(g=>g.label.toLowerCase().includes(q)||g.codes.some(c=>c.toLowerCase().includes(q)));
  const label = codes.length>1 ? codes.join("+") : codes[0] || "";

  return (
    <div style={{position:"relative",flex:1}}>
      <input
        value={txt}
        placeholder={placeholder}
        onChange={e=>{setTxt(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),180)}
        style={{width:"100%",background:C.surface,border:`1px solid ${label?C.orange:C.border}`,borderRadius:12,padding:"12px 14px",paddingLeft:label?52:14,color:C.hi,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",transition:"all .2s"}}
      />
      {label && (
        <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:codes.length>1?9:13,fontWeight:700,color:C.orange,fontFamily:"'DM Mono',monospace",pointerEvents:"none",maxWidth:44,overflow:"hidden",whiteSpace:"nowrap"}}>
          {label}
        </span>
      )}
      {open && (filtG.length>0||filtA.length>0) && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:500,background:"#081422",border:`1px solid ${C.border}`,borderRadius:12,maxHeight:260,overflowY:"auto",marginTop:4,boxShadow:"0 20px 60px rgba(0,0,0,.9)"}}>
          {filtG.length>0 && (
            <>
              <div style={{padding:"6px 14px 4px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.faint,borderBottom:`1px solid ${C.border}`}}>Todos os aeroportos do estado</div>
              {filtG.map(g=>(
                <div key={g.id} onMouseDown={()=>{onGroup(g);setTxt(g.label);setOpen(false);}}
                  style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:`${C.orange}08`,borderBottom:`1px solid ${C.border}`,transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.orange}18`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${C.orange}08`}>
                  <span style={{fontSize:16,flexShrink:0}}>{g.flag}</span>
                  <div>
                    <div style={{color:C.orange,fontWeight:600,fontSize:13}}>{g.label}</div>
                    <div style={{color:C.muted,fontSize:10,marginTop:1}}>{g.codes.join(" · ")}</div>
                  </div>
                </div>
              ))}
              {filtA.length>0 && <div style={{padding:"6px 14px 4px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.faint}}>Aeroporto específico</div>}
            </>
          )}
          {filtA.slice(0,8).map(a=>(
            <div key={a.code} onMouseDown={()=>{onSingle(a);setTxt(a.city);setOpen(false);}}
              style={{padding:"10px 14px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:10,transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.orange}12`}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:C.orange,minWidth:32}}>{a.code}</span>
              <div style={{flex:1}}>
                <span style={{color:C.body}}>{a.city}</span>
                <span style={{marginLeft:6,fontSize:10,color:C.faint,fontWeight:600}}>{a.state}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FLIGHT CARD ───────────────────────────────────────────────────────────────
// showBtn: true = modo recorrência (botão "Ver oferta" direto)
// showBtn: false = modo seleção (clique seleciona, sem botão)
function FlightCard({ r, onPick, picked, isMobile, showBtn, primaryBtn }) {
  const sel = picked && picked.id===r.id;
  return (
    <div
      onClick={()=>{ if(!showBtn) onPick(r); }}
      style={{
        background: sel ? `${C.orange}18` : C.card,
        border: `2px solid ${sel ? C.orange : C.border}`,
        borderRadius: 14,
        padding: isMobile ? "12px 14px" : "15px 18px",
        marginBottom: 8,
        cursor: showBtn ? "default" : "pointer",
        transition: "all .2s",
        boxShadow: sel ? `0 0 0 3px ${C.orange}33` : "none",
      }}
    >
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        {/* Check circle quando selecionado */}
        {!showBtn && (
          <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${sel?C.orange:C.border}`,background:sel?C.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
            {sel && <span style={{color:"#fff",fontSize:12,fontWeight:800}}>✓</span>}
          </div>
        )}
        <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={isMobile?38:44}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?13:14,fontWeight:700,color:C.hi}}>{r.airline}</span>
            {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
            <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:600,color:C.hi}}>{r.depTime}</span>
            <div style={{flex:1,borderTop:`1px dashed ${C.border}`,position:"relative",minWidth:24}}>
              <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",fontSize:10,color:C.muted,whiteSpace:"nowrap",background:sel?`${C.orange}18`:C.card,padding:"0 4px"}}>{r.dur}</span>
            </div>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:600,color:C.hi}}>{r.arrTime}</span>
          </div>
          <div style={{fontSize:11,color:C.muted}}>{fDate(r.date)} · {r.origin}→{r.destination}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
          {r.type==="cash"
            ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?17:20,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
            : <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?15:18,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div>}
          {r.type==="miles" && <div style={{fontSize:10,color:C.muted}}>+R$ {r.taxes}</div>}
          {/* Botão só no modo recorrência */}
          {showBtn && (
            <a href={r.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}
              onClick={e=>e.stopPropagation()}>
              <button style={{...primaryBtn,width:"auto",padding:isMobile?"7px 12px":"8px 14px",fontSize:12,borderRadius:10}}>Ver oferta →</button>
            </a>
          )}
          {/* Hint de seleção no modo ida/volta */}
          {!showBtn && !sel && (
            <span style={{fontSize:11,color:C.faint}}>Toque para selecionar</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RESULTS PANEL ─────────────────────────────────────────────────────────────
function Results({ results, loading, loadMsg, mode, originLabel, destLabel, date1, date2, isMobile, ghost, primaryBtn, card, onSave, onNew, sType, pax, nonstop }) {
  const isRecur = mode==="recurring-pairs"||mode==="recurring-fixed";
  const hasRet  = !!date2;

  const [step,setStep]   = useState(1);
  const [selOut,setSelOut] = useState(null);
  const [selRet,setSelRet] = useState(null);
  const [fType,setFType]   = useState("");
  const [slots,setSlots]   = useState([]);
  const [sort,setSort]     = useState("price");
  const [expDate,setExpDate] = useState(null);

  function matchSlot(h) {
    if (!slots.length) return true;
    return slots.some(id=>{ const s=TIME_SLOTS.find(x=>x.id===id); return s&&h>=s.from&&h<=s.to; });
  }

  function applyF(list) {
    let f = [...list];
    if (fType) f=f.filter(r=>r.type===fType);
    f=f.filter(r=>matchSlot(r.depHour));
    if (sort==="price") f.sort((a,b)=>(a.price||a.miles||0)-(b.price||b.miles||0));
    else if (sort==="stops") f.sort((a,b)=>a.stops-b.stops);
    else if (sort==="time")  f.sort((a,b)=>a.depHour-b.depHour);
    return f;
  }

  const outList = results.filter(r=>!r.isReturn);
  const retList = results.filter(r=>r.isReturn);
  const curList = applyF(step===1?outList:retList);
  const curSel  = step===1?selOut:selRet;

  function pick(r) {
    if (step===1) { setSelOut(r); if(hasRet) setTimeout(()=>setStep(2),280); }
    else setSelRet(r);
  }

  function confirm() {
    if (selOut) window.open(selOut.url,"_blank");
    if (selRet) window.open(selRet.url,"_blank");
  }

  // Filter bar (shared)
  const FilterBar = () => (
    <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
      {[["","💳 Todos"],["cash","💵 Cash"],["milhas","🎯 Milhas"]].map(([v,l])=>(
        <button key={v} style={{...ghost(fType===v),flexShrink:0,fontSize:12}} onClick={()=>setFType(v)}>{l}</button>
      ))}
      <div style={{width:1,background:C.border,flexShrink:0,margin:"0 2px"}}/>
      {TIME_SLOTS.map(s=>{
        const on=slots.includes(s.id);
        return <button key={s.id} style={{...ghost(on),flexShrink:0,fontSize:12}} onClick={()=>setSlots(p=>on?p.filter(x=>x!==s.id):[...p,s.id])}>{s.label}</button>;
      })}
      <div style={{width:1,background:C.border,flexShrink:0,margin:"0 2px"}}/>
      {[["price","↓ Preço"],["stops","↓ Escalas"],["time","↓ Hora"]].map(([v,l])=>(
        <button key={v} style={{...ghost(sort===v),flexShrink:0,fontSize:12}} onClick={()=>setSort(v)}>{l}</button>
      ))}
      {(fType||slots.length>0) && <button style={{...ghost(),flexShrink:0,fontSize:12,color:C.red,borderColor:`${C.red}33`}} onClick={()=>{setFType("");setSlots([]);}}>✕</button>}
    </div>
  );

  if (loading) return (
    <div style={{textAlign:"center",padding:"70px 0"}}>
      <div style={{width:32,height:32,border:`2.5px solid ${C.orange}30`,borderTopColor:C.orange,borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 14px"}}/>
      <div style={{color:C.muted,fontSize:13}}>{loadMsg}</div>
    </div>
  );

  if (!results.length) return (
    <div style={{textAlign:"center",padding:"70px 0"}}>
      <div style={{fontSize:48,marginBottom:14}}>✈️</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:C.muted}}>Configure uma busca</div>
      <button style={{...primaryBtn,width:"auto",marginTop:16,padding:"12px 24px"}} onClick={onNew}>Buscar agora</button>
    </div>
  );

  // ── MODO RECORRÊNCIA — 3 telas: lista ida → lista volta → resumo ────────────
  if (isRecur) {

    // Gera voos de volta usando as datas de retorno já definidas na recorrência
    // Cada voo de ida tem returnDate = data correta de volta (ex: ida sex 01/05 → volta qua 06/05)
    const returnFlights = (() => {
      const all = [];
      // Mapeia cada par único outDate → returnDate
      const pairMap = {};
      results.forEach(r => { if (r.returnDate) pairMap[r.date] = r.returnDate; });
      // Gera voos no sentido inverso para cada data de retorno
      const retDates = [...new Set(Object.values(pairMap))].sort();
      retDates.forEach(retDt => {
        const sample = results.find(r => r.returnDate === retDt);
        if (!sample) return;
        generateMock(sample.destination, sample.origin, retDt, sType, pax, nonstop)
          .forEach(r => all.push({ ...r, isReturn: true, outDate: sample.date }));
      });
      return all;
    })();

    // Tela 3: RESUMO com os dois voos selecionados
    if (selOut && selRet) {
      return (
        <div className="fi">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?18:22,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              🎯 Resumo da viagem
            </div>
            <button style={ghost()} onClick={onNew}>+ Nova busca</button>
          </div>

          {[{r:selOut,label:"✈ Voo de Ida",col:C.orange},{r:selRet,label:"↩ Voo de Volta",col:C.green}].map(({r,label,col})=>(
            <div key={label} style={{background:C.card,borderRadius:14,padding:"16px 18px",marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:col,marginBottom:10}}>{label}</div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={42}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:C.hi,marginBottom:5}}>{r.airline}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:17,fontWeight:700,color:C.hi}}>{r.depTime}</span>
                    <div style={{flex:1,borderTop:`1px solid ${C.border}`,position:"relative"}}>
                      <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",fontSize:10,color:C.muted,whiteSpace:"nowrap",background:C.card,padding:"0 4px"}}>{r.dur}</span>
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:17,fontWeight:700,color:C.hi}}>{r.arrTime}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{fDate(r.date)} · {r.origin} → {r.destination}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
                    {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  {r.type==="cash"
                    ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
                    : <><div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div><div style={{fontSize:10,color:C.muted}}>+R${r.taxes}</div></>}
                </div>
              </div>
            </div>
          ))}

          {/* Total */}
          {selOut.type==="cash" && selRet.type==="cash" && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",background:C.surface,borderRadius:12,marginBottom:14,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:14,color:C.muted,fontWeight:600}}>Total estimado</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.green}}>{fBRL(selOut.price+selRet.price)}</span>
            </div>
          )}

          {/* Links */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            <a href={selOut.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
              <button style={{...primaryBtn,fontSize:14,borderRadius:12}}>✈ Buscar ida no site oficial — {selOut.airline}</button>
            </a>
            <a href={selRet.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
              <button style={{...primaryBtn,fontSize:14,borderRadius:12,background:`linear-gradient(135deg,#22c55e,#16a34a)`}}>↩ Buscar volta no site oficial — {selRet.airline}</button>
            </a>
          </div>

          <div style={{fontSize:11,color:C.faint,textAlign:"center",marginBottom:16}}>⚠️ Valores estimados. Confirme no site da companhia.</div>

          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button style={{...ghost(),fontSize:12}} onClick={()=>{setSelOut(null);setSelRet(null);}}>↺ Recomeçar seleção</button>
            <button style={{...ghost(),fontSize:12}} onClick={()=>setSelRet(null)}>↺ Trocar volta</button>
          </div>
        </div>
      );
    }

    // Tela 2: seleção da VOLTA (após ter escolhido a ida)
    if (selOut && !selRet) {
      // Só mostra a data de volta correspondente ao par da ida selecionada
      const validRetDate = selOut?.returnDate;
      const retGroups = {};
      returnFlights
        .filter(r => !validRetDate || r.date === validRetDate)
        .forEach(r=>{ if(!retGroups[r.date]) retGroups[r.date]=[]; retGroups[r.date].push(r); });
      const retSorted = Object.entries(retGroups).sort(([a],[b])=>a.localeCompare(b));

      return (
        <div className="fi">
          {/* Ida já escolhida — mini card fixo no topo */}
          <div style={{background:`${C.orange}10`,border:`1px solid ${C.orange}44`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,color:C.orange,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>✈ Ida selecionada</div>
              <div style={{fontSize:13,color:C.hi,fontWeight:600}}>{selOut.airline} · {selOut.depTime}→{selOut.arrTime} · {fDate(selOut.date)}</div>
              <div style={{fontSize:11,color:C.muted}}>{selOut.origin} → {selOut.destination} · {selOut.type==="cash"?fBRL(selOut.price):fMiles(selOut.miles)}</div>
            </div>
            <button style={{...ghost(),fontSize:11,padding:"5px 10px",flexShrink:0}} onClick={()=>setSelOut(null)}>Trocar</button>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?16:19,fontWeight:800,color:C.hi}}>Escolha o voo de volta</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                {destLabel} → {originLabel} · {retSorted.length} data{retSorted.length!==1?"s":""}
                {selOut?.returnDate && <span style={{color:C.green,fontWeight:600}}> · Volta: {fDate(selOut.returnDate)}</span>}
              </div>
            </div>
            <button style={ghost()} onClick={onNew}>+ Nova</button>
          </div>

          <FilterBar/>

          {retSorted.map(([dt,flights])=>{
            const bestC = flights.filter(r=>r.type==="cash").sort((a,b)=>a.price-b.price)[0];
            const bestM = flights.filter(r=>r.type==="miles").sort((a,b)=>a.miles-b.miles)[0];
            const isOpen = expDate===dt;
            const dow = WD[new Date(dt+"T12:00:00").getDay()];
            return (
              <div key={dt} style={{marginBottom:10}}>
                <div onClick={()=>setExpDate(isOpen?null:dt)}
                  style={{...card,cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 18px",border:`1px solid ${isOpen?C.green:C.border}`,background:isOpen?`${C.green}0a`:C.card,borderRadius:isOpen?"14px 14px 0 0":14,transition:"all .2s"}}>
                  <div style={{flexShrink:0,textAlign:"center",minWidth:44}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1}}>{dow}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:C.hi,lineHeight:1.1}}>{fDate(dt).slice(0,5)}</div>
                    <div style={{fontSize:10,color:C.muted}}>{fDate(dt).slice(6)}</div>
                  </div>
                  <div style={{width:1,height:44,background:C.border,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                      {bestC && <div><div style={{fontSize:10,color:C.muted,marginBottom:1}}>A partir de</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?15:18,fontWeight:800,color:C.green}}>{fBRL(bestC.price)}</div></div>}
                      {bestC && bestM && <div style={{width:1,height:32,background:C.border}}/>}
                      {bestM && <div><div style={{fontSize:10,color:C.muted,marginBottom:1}}>Ou</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?13:15,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(bestM.miles)}</div></div>}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>{flights.length} opção{flights.length!==1?"s":""} · {bestC?.airline||bestM?.airline}</div>
                  </div>
                  <span style={{fontSize:18,color:C.muted,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none",flexShrink:0}}>⌄</span>
                </div>
                {isOpen && (
                  <div style={{background:C.surface,border:`1px solid ${C.green}`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"10px 12px"}}>
                    <div style={{fontSize:11,color:C.muted,padding:"4px 4px 10px",fontStyle:"italic"}}>Toque para selecionar o voo de volta</div>
                    {flights.map(r=>(
                      <div key={r.id} onClick={()=>setSelRet(r)}
                        style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:12,padding:isMobile?"11px 12px":"13px 16px",marginBottom:8,cursor:"pointer",transition:"all .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.green;e.currentTarget.style.background=`${C.green}0a`;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={38}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                              <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.hi}}>{r.airline}</span>
                              <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
                              {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:C.hi}}>{r.depTime}</span>
                              <span style={{fontSize:11,color:C.faint}}>──{r.dur}──▶</span>
                              <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:C.hi}}>{r.arrTime}</span>
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {r.type==="cash"
                              ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?16:19,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
                              : <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?14:16,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div>}
                            {r.type==="miles" && <div style={{fontSize:10,color:C.muted}}>+R${r.taxes}</div>}
                            <div style={{fontSize:11,color:C.green,fontWeight:600,marginTop:4}}>Selecionar ↩</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // Lista agrupada por data
    const all    = applyF(results);
    const groups = {};
    all.forEach(r=>{ if(!groups[r.date]) groups[r.date]=[]; groups[r.date].push(r); });
    const sorted = Object.entries(groups).sort(([a],[b])=>a.localeCompare(b));

    return (
      <div className="fi">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?17:20,fontWeight:800,color:C.hi}}>{originLabel} → {destLabel}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{sorted.length} data{sorted.length!==1?"s":""} · toque na data para expandir e selecionar</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={ghost()} onClick={onSave}>⭐</button>
            <button style={ghost()} onClick={onNew}>+ Nova</button>
          </div>
        </div>
        <FilterBar/>
        {!sorted.length && <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>🔍 Nenhum voo neste filtro</div>}
        {sorted.map(([dt,flights])=>{
          const bestC = flights.filter(r=>r.type==="cash").sort((a,b)=>a.price-b.price)[0];
          const bestM = flights.filter(r=>r.type==="miles").sort((a,b)=>a.miles-b.miles)[0];
          const isOpen = expDate===dt;
          const dow = WD[new Date(dt+"T12:00:00").getDay()];
          return (
            <div key={dt} style={{marginBottom:10}}>
              {/* Cabeçalho do grupo */}
              <div onClick={()=>setExpDate(isOpen?null:dt)}
                style={{...card,cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 18px",border:`1px solid ${isOpen?C.orange:C.border}`,background:isOpen?`${C.orange}0c`:C.card,borderRadius:isOpen?"14px 14px 0 0":14,transition:"all .2s"}}>
                <div style={{flexShrink:0,textAlign:"center",minWidth:44}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:1}}>{dow}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:C.hi,lineHeight:1.1}}>{fDate(dt).slice(0,5)}</div>
                  <div style={{fontSize:10,color:C.muted}}>{fDate(dt).slice(6)}</div>
                </div>
                <div style={{width:1,height:44,background:C.border,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                    {bestC && <div><div style={{fontSize:10,color:C.muted,marginBottom:1}}>A partir de</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?15:18,fontWeight:800,color:C.green}}>{fBRL(bestC.price)}</div></div>}
                    {bestC && bestM && <div style={{width:1,height:32,background:C.border}}/>}
                    {bestM && <div><div style={{fontSize:10,color:C.muted,marginBottom:1}}>Ou</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?13:15,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(bestM.miles)}</div></div>}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:4}}>{flights.length} opção{flights.length!==1?"s":""} · {bestC?.airline||bestM?.airline}</div>
                </div>
                <span style={{fontSize:18,color:C.muted,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none",flexShrink:0}}>⌄</span>
              </div>
              {/* Voos expandidos — sem links, só seleção */}
              {isOpen && (
                <div style={{background:C.surface,border:`1px solid ${C.orange}`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"10px 12px"}}>
                  <div style={{fontSize:11,color:C.muted,padding:"4px 4px 10px",fontStyle:"italic"}}>Toque em um voo para ver o resumo e o link do site</div>
                  {flights.map(r=>{
                    return (
                      <div key={r.id} onClick={()=>setSelOut(r)}
                        style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:12,padding:isMobile?"11px 12px":"13px 16px",marginBottom:8,cursor:"pointer",transition:"all .2s"}}
                        onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.orange; e.currentTarget.style.background=`${C.orange}0a`; }}
                        onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.card; }}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={38}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                              <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:C.hi}}>{r.airline}</span>
                              <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
                              {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:C.hi}}>{r.depTime}</span>
                              <span style={{fontSize:11,color:C.faint}}>──{r.dur}──▶</span>
                              <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:C.hi}}>{r.arrTime}</span>
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {r.type==="cash"
                              ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?16:19,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
                              : <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?14:16,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div>}
                            {r.type==="miles" && <div style={{fontSize:10,color:C.muted}}>+R${r.taxes}</div>}
                            <div style={{fontSize:11,color:C.orange,fontWeight:600,marginTop:4}}>Selecionar →</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── MODO DATA ESPECÍFICA ─────────────────────────────────────────────────────
  // screen: "out" | "ret" | "summary"
  const screen = selOut && (hasRet ? selRet : true) ? "summary"
               : step === 2                          ? "ret"
               :                                      "out";

  // ── Tela: Lista de voos (ida ou volta) ──────────────────────────────────────
  if (screen !== "summary") {
    const isOut   = screen === "out";
    const list    = applyF(isOut ? outList : retList);
    const picked  = isOut ? selOut : selRet;

    function handlePick(r) {
      if (isOut) {
        setSelOut(r);
        if (hasRet) setStep(2);        // avança para volta
      } else {
        setSelRet(r);                  // ambos prontos → summary aparece
      }
    }

    return (
      <div className="fi">
        {/* Barra de progresso */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
          {/* Passo 1 */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:selOut?C.green:isOut?C.orange:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",transition:"all .3s"}}>
              {selOut?"✓":"1"}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:selOut?C.green:isOut?C.orange:C.muted,textAlign:"center"}}>Ida</div>
            {selOut && <div style={{fontSize:10,color:C.muted,textAlign:"center"}}>{selOut.airline}<br/><span style={{fontFamily:"'DM Mono',monospace"}}>{selOut.depTime}→{selOut.arrTime}</span></div>}
          </div>
          {/* Linha */}
          <div style={{flex:1,height:3,background:selOut?C.orange:C.border,borderRadius:2,marginBottom:hasRet?34:0,transition:"background .4s"}}/>
          {/* Passo 2 — só se tem volta */}
          {hasRet && <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:selRet?C.green:!isOut?C.orange:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",transition:"all .3s"}}>
                {selRet?"✓":"2"}
              </div>
              <div style={{fontSize:11,fontWeight:600,color:selRet?C.green:!isOut?C.orange:C.muted,textAlign:"center"}}>Volta</div>
            </div>
            <div style={{flex:1,height:3,background:C.border,borderRadius:2,marginBottom:34}}/>
          </>}
          {/* Passo resumo */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff"}}>
              {hasRet?"3":"2"}
            </div>
            <div style={{fontSize:11,fontWeight:600,color:C.muted,textAlign:"center"}}>Resumo</div>
          </div>
        </div>

        {/* Cabeçalho */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?16:19,fontWeight:800,color:C.hi}}>
              {isOut ? `Voos de Ida` : `Voos de Volta`}
              <span style={{fontSize:13,fontWeight:400,color:C.muted,marginLeft:8}}>
                {isOut ? `${originLabel} → ${destLabel}` : `${destLabel} → ${originLabel}`}
              </span>
            </div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>
              {isOut ? fDate(date1) : fDate(date2)} · {list.length} opções · toque para selecionar
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {selOut && !isOut && <button style={{...ghost(),fontSize:12}} onClick={()=>setStep(1)}>← Ida</button>}
            <button style={ghost()} onClick={onSave}>⭐</button>
            <button style={ghost()} onClick={onNew}>+ Nova</button>
          </div>
        </div>

        <FilterBar/>

        {!list.length && (
          <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
            <div style={{fontSize:32,marginBottom:10}}>🔍</div>
            <div>Nenhum voo neste filtro</div>
            <button style={{...ghost(),marginTop:12}} onClick={()=>{setFType("");setSlots([]);}}>Limpar filtros</button>
          </div>
        )}

        {/* Cards de voo — SEM links, só seleção */}
        {list.map(r => {
          const isSel = picked && picked.id === r.id;
          return (
            <div key={r.id} onClick={()=>handlePick(r)}
              style={{background:isSel?`${C.orange}18`:C.card,border:`2px solid ${isSel?C.orange:C.border}`,borderRadius:14,padding:isMobile?"12px 14px":"15px 18px",marginBottom:8,cursor:"pointer",transition:"all .2s",boxShadow:isSel?`0 0 0 3px ${C.orange}30`:"none"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                {/* Círculo de seleção */}
                <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${isSel?C.orange:C.border}`,background:isSel?C.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .25s"}}>
                  {isSel && <span style={{color:"#fff",fontSize:13,fontWeight:800,lineHeight:1}}>✓</span>}
                </div>
                <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={isMobile?36:42}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?13:14,fontWeight:700,color:C.hi}}>{r.airline}</span>
                    {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
                    <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:C.hi}}>{r.depTime}</span>
                    <div style={{flex:1,borderTop:`1px dashed ${C.border}`,position:"relative",minWidth:20}}>
                      <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",fontSize:9,color:C.muted,whiteSpace:"nowrap",background:isSel?`${C.orange}18`:C.card,padding:"0 3px"}}>{r.dur}</span>
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:C.hi}}>{r.arrTime}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{fDate(r.date)} · {r.stops===0?"Direto":`${r.stops} escala${r.stops>1?"s":""}`}</div>
                </div>
                <div style={{flexShrink:0,textAlign:"right"}}>
                  {r.type==="cash"
                    ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?17:20,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
                    : <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?14:17,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div>}
                  {r.type==="miles" && <div style={{fontSize:10,color:C.muted}}>+R${r.taxes}</div>}
                  {!isSel && <div style={{fontSize:11,color:C.faint,marginTop:4}}>Toque para{isOut&&hasRet?" selecionar":" selecionar"}</div>}
                  {isSel && <div style={{fontSize:11,color:C.orange,marginTop:4,fontWeight:600}}>✓ Selecionado</div>}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{background:`${C.blue}0a`,border:`1px solid ${C.blue}25`,borderRadius:12,padding:"12px 14px",fontSize:12,color:C.muted,marginTop:8}}>
          {isOut && hasRet ? "💡 Escolha o voo de ida — depois você escolhe a volta." : isOut ? "💡 Toque em um voo para selecioná-lo e ver o resumo." : "💡 Escolha o voo de volta para ver o resumo final."}
        </div>
      </div>
    );
  }

  // ── Tela: RESUMO FINAL ──────────────────────────────────────────────────────
  function FlightSummaryCard({ r, label, labelColor }) {
    return (
      <div style={{background:C.card,borderRadius:14,padding:"16px 18px",marginBottom:12,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:labelColor,marginBottom:12}}>{label}</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <ALBadge name={r.airline} code={r.airlineCode} color={r.color} size={44}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:C.hi,marginBottom:6}}>{r.airline}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:C.hi}}>{r.depTime}</span>
              <div style={{flex:1,borderTop:`1px solid ${C.border}`,position:"relative"}}>
                <span style={{position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",fontSize:10,color:C.muted,whiteSpace:"nowrap",background:C.card,padding:"0 4px"}}>{r.dur}</span>
              </div>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:C.hi}}>{r.arrTime}</span>
            </div>
            <div style={{fontSize:12,color:C.muted}}>{fDate(r.date)} · {r.origin} → {r.destination}</div>
            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
              <Tag col={r.stops===0?C.green:C.yellow} bg={r.stops===0?"rgba(74,222,128,.1)":"rgba(251,191,36,.1)"} brd={r.stops===0?"rgba(74,222,128,.2)":"rgba(251,191,36,.2)"}>{r.stops===0?"Voo Direto":`${r.stops} escala${r.stops>1?"s":""}`}</Tag>
              {r.type==="miles" && <Tag col={C.purple} bg="rgba(192,132,252,.1)" brd="rgba(192,132,252,.25)">{r.prog}</Tag>}
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            {r.type==="cash"
              ? <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.green}}>{fBRL(r.price)}</div>
              : <>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(r.miles)}</div>
                  <div style={{fontSize:11,color:C.muted}}>+ R$ {r.taxes} taxas</div>
                </>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fi">
      {/* Título */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?18:22,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          🎯 Resumo da viagem
        </div>
        <button style={ghost()} onClick={onNew}>+ Nova busca</button>
      </div>

      {/* Cards de voo */}
      <FlightSummaryCard r={selOut} label="✈  Voo de Ida" labelColor={C.orange}/>
      {selRet && <FlightSummaryCard r={selRet} label="↩  Voo de Volta" labelColor={C.green}/>}

      {/* Total */}
      {selOut.type==="cash" && selRet?.type==="cash" && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:C.surface,borderRadius:12,marginBottom:16,border:`1px solid ${C.border}`}}>
          <span style={{fontSize:14,color:C.muted,fontWeight:600}}>Total estimado</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:C.green}}>{fBRL(selOut.price+(selRet?.price||0))}</span>
        </div>
      )}
      {selOut.type==="miles" && selRet?.type==="miles" && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",background:C.surface,borderRadius:12,marginBottom:16,border:`1px solid ${C.border}`}}>
          <span style={{fontSize:14,color:C.muted,fontWeight:600}}>Total estimado (milhas)</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fMiles(selOut.miles+(selRet?.miles||0))}</span>
        </div>
      )}

      {/* Links para sites */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Acessar sites oficiais</div>
        <a href={selOut.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
          <button style={{...primaryBtn,fontSize:14,borderRadius:12}}>
            ✈ Buscar voo de ida — {selOut.airline}
          </button>
        </a>
        {selRet && (
          <a href={selRet.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <button style={{...primaryBtn,fontSize:14,borderRadius:12,background:`linear-gradient(135deg,#22c55e,#16a34a)`}}>
              ↩ Buscar voo de volta — {selRet.airline}
            </button>
          </a>
        )}
      </div>

      <div style={{fontSize:11,color:C.faint,textAlign:"center",marginBottom:20}}>
        ⚠️ Valores são estimativas. Confirme preço e disponibilidade no site da companhia.
      </div>

      {/* Refazer */}
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        <button style={{...ghost(),fontSize:12}} onClick={()=>{setSelOut(null);setStep(1);}}>↺ Trocar voo de ida</button>
        {selRet && <button style={{...ghost(),fontSize:12}} onClick={()=>{setSelRet(null);setStep(2);}}>↺ Trocar voo de volta</button>}
      </div>
    </div>
  );
}


// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const w        = useWinW();
  const isMobile = w < 700;

  const [tab, setTab] = useState("search");

  // Rota — arrays de códigos IATA
  const [origins,  setOrigins]  = useState([]);
  const [dests,    setDests]    = useState([]);
  const [oTxt,     setOTxt]     = useState("");
  const [dTxt,     setDTxt]     = useState("");
  // Labels legíveis para exibição
  const [oLabel,   setOLabel]   = useState("");
  const [dLabel,   setDLabel]   = useState("");

  // Modo
  const [mode,      setMode]     = useState("specific");
  const [date1,     setDate1]    = useState("");
  const [date2,     setDate2]    = useState("");
  const [rStart,    setRStart]   = useState("2026-05");
  const [rEnd,      setREnd]     = useState("2027-01");
  const [dOut,      setDOut]     = useState([]);
  const [dRet,      setDRet]     = useState([]);
  const [minS,      setMinS]     = useState(3);
  const [maxS,      setMaxS]     = useState(10);
  const [fixDay,    setFixDay]   = useState(5);

  // Filtros
  const [cabin,     setCabin]    = useState("Econômica");
  const [pax,       setPax]      = useState(1);
  const [sType,     setSType]    = useState("");
  const [nonstop,   setNonstop]  = useState(false);
  const [maxPrice,  setMaxPrice] = useState("");
  const [sort,      setSort]     = useState("price");

  // Resultados
  const [loading,   setLoading]  = useState(false);
  const [loadMsg,   setLoadMsg]  = useState("");
  const [results,   setResults]  = useState([]);
  const [alerts,    setAlerts]   = useState([]);
  const [saved,     setSaved]    = useState([]);

  // Labels derivados
  const originLabel = oLabel || origins.join("+") || "?";
  const destLabel   = dLabel || dests.join("+")   || "?";

  const canSearch = origins.length>0 && dests.length>0 && (
    mode==="specific" ? !!date1 :
    mode==="recurring-pairs" ? dOut.length>0&&dRet.length>0 : true
  );

  // Flag para saber se API real está disponível
  const [useRealApi, setUseRealApi] = useState(true);

  const doSearch = useCallback(async () => {
    if (!origins.length || !dests.length) return;
    setLoading(true); setResults([]);
    const all = [];
    let apiWorked = false;

    // Todas combinações orig × dest
    const pairs = [];
    for (const o of origins) for (const d of dests) pairs.push([o,d]);

    if (mode==="specific") {
      for (const [o,d] of pairs) {
        setLoadMsg(`Buscando ${o} → ${d}…`);
        if (useRealApi) {
          try {
            const res = await searchFlights(o,d,date1,date2||null,sType,pax,nonstop);
            res.forEach(r=>all.push(r));
            if (date2) {
              const ret = await searchFlights(d,o,date2,null,sType,pax,nonstop);
              ret.forEach(r=>all.push({...r,isReturn:true}));
            }
            apiWorked = true;
          } catch(e) {
            console.warn("API falhou, usando estimativas:", e.message);
            setUseRealApi(false);
            await new Promise(r=>setTimeout(r,300));
            generateMock(o,d,date1,sType,pax,nonstop).forEach(r=>all.push(r));
            if (date2) generateMock(d,o,date2,sType,pax,nonstop).forEach(r=>all.push({...r,isReturn:true}));
          }
        } else {
          await new Promise(r=>setTimeout(r,300));
          generateMock(o,d,date1,sType,pax,nonstop).forEach(r=>all.push(r));
          if (date2) generateMock(d,o,date2,sType,pax,nonstop).forEach(r=>all.push({...r,isReturn:true}));
        }
      }
    } else if (mode==="recurring-pairs") {
      const ps = getPairs(dOut,dRet,rStart,rEnd,minS,maxS);
      for (const [o,d] of pairs) {
        for (let i=0;i<ps.length;i++) {
          const {out,ret} = ps[i];
          setLoadMsg(`${o}→${d} · ${i+1}/${ps.length} · ${fDate(out)}`);
          if (useRealApi) {
            try {
              const res = await searchFlights(o,d,out,null,sType,pax,nonstop);
              res.map(r=>({...r,returnDate:ret,pairLabel:`${fDate(out)} ↔ ${fDate(ret)}`})).forEach(r=>all.push(r));
              apiWorked = true;
            } catch(e) {
              console.warn("API falhou, usando estimativas:", e.message);
              setUseRealApi(false);
              generateMock(o,d,out,sType,pax,nonstop).map(r=>({...r,returnDate:ret,pairLabel:`${fDate(out)} ↔ ${fDate(ret)}`})).forEach(r=>all.push(r));
            }
          } else {
            await new Promise(r=>setTimeout(r,80));
            generateMock(o,d,out,sType,pax,nonstop).map(r=>({...r,returnDate:ret,pairLabel:`${fDate(out)} ↔ ${fDate(ret)}`})).forEach(r=>all.push(r));
          }
        }
      }
    } else {
      const dates = getFixedDates(fixDay,rStart,rEnd);
      for (const [o,d] of pairs) {
        for (let i=0;i<dates.length;i++) {
          setLoadMsg(`${o}→${d} · ${i+1}/${dates.length} · ${fDate(dates[i])}`);
          if (useRealApi) {
            try {
              const res = await searchFlights(o,d,dates[i],null,sType,pax,nonstop);
              res.forEach(r=>all.push(r));
              apiWorked = true;
            } catch(e) {
              console.warn("API falhou, usando estimativas:", e.message);
              setUseRealApi(false);
              generateMock(o,d,dates[i],sType,pax,nonstop).forEach(r=>all.push(r));
            }
          } else {
            await new Promise(r=>setTimeout(r,80));
            generateMock(o,d,dates[i],sType,pax,nonstop).forEach(r=>all.push(r));
          }
        }
      }
    }

    const filtered = maxPrice ? all.filter(r=>(r.type==="cash"?r.price:r.miles)<=parseFloat(maxPrice)) : all;
    setResults(filtered);
    setLoading(false); setLoadMsg(""); setTab("results");

    if (filtered.length) {
      const bc=filtered.find(r=>r.type==="cash"), bm=filtered.find(r=>r.type==="miles");
      setAlerts(prev=>[{id:Date.now(),text:`✈ ${originLabel} → ${destLabel}`,details:`${filtered.length} opções`,time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),bestCash:bc?fBRL(bc.price):null,bestMiles:bm?fMiles(bm.miles):null},...prev].slice(0,50));
    }
  },[origins,dests,date1,date2,mode,dOut,dRet,rStart,rEnd,minS,maxS,fixDay,sType,pax,nonstop,maxPrice,originLabel,destLabel]);

  const saveSearch = () => {
    let lbl = `${originLabel} → ${destLabel}`;
    if (mode==="specific") lbl+=` | ${fDate(date1)}${date2?` ↔ ${fDate(date2)}`:""}`;
    else if (mode==="recurring-pairs") lbl+=` | ${dOut.map(d=>WD[d]).join("/")}→${dRet.map(d=>WD[d]).join("/")} ${rStart}–${rEnd}`;
    else lbl+=` | Toda ${WD_F[fixDay]} ${rStart}–${rEnd}`;
    setSaved(prev=>[{id:Date.now(),label:lbl,active:true},...prev]);
  };

  // ── Estilos reutilizáveis ──────────────────────────────────────────────────
  const card       = {background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:isMobile?14:20};
  const inp        = {width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 12px",color:C.hi,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"};
  const ghost      = (on=false) => ({background:on?`${C.orange}18`:C.surface,border:`1px solid ${on?`${C.orange}55`:C.border}`,color:on?C.orange:C.muted,borderRadius:10,padding:"8px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",transition:"all .2s"});
  const primaryBtn = {background:`linear-gradient(135deg,${C.orange},${C.pink})`,color:"#fff",border:"none",borderRadius:12,padding:"13px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600,cursor:"pointer",width:"100%",transition:"all .25s"};

  const NAV = [
    {t:"search", icon:"🔍", label:"Busca"},
    {t:"results",icon:"📊", label:results.length?`(${results.length})`:"Resultados"},
    {t:"sites",  icon:"🌐", label:"Sites"},
    {t:"alerts", icon:"🔔", label:alerts.length?`(${alerts.length})`:"Alertas"},
    {t:"saved",  icon:"⭐", label:`(${saved.length})`},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.body,fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        input,select{font-family:'DM Sans',sans-serif!important;color:${C.hi}!important}
        input:focus,select:focus{outline:none!important;border-color:${C.orange}!important;box-shadow:0 0 0 3px ${C.orange}18!important}
        input::placeholder{color:${C.muted}!important}
        select option{background:${C.card};color:${C.hi}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fi .3s ease both}
        em{font-style:italic}
        button:disabled{opacity:.4;cursor:not-allowed}
      `}</style>

      {/* HEADER */}
      <div style={{background:`${C.bg}f8`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1060,margin:"0 auto",padding:`0 ${isMobile?12:20}px`,display:"flex",alignItems:"center",justifyContent:"space-between",height:isMobile?52:58}}>
          <Logo sm={isMobile}/>
          <nav style={{display:"flex",overflowX:"auto"}}>
            {NAV.map(({t,icon,label})=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",cursor:"pointer",padding:`8px ${isMobile?7:12}px`,fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?10:12,fontWeight:500,borderBottom:`2px solid ${tab===t?C.orange:"transparent"}`,color:tab===t?C.orange:C.faint,display:"flex",flexDirection:"column",alignItems:"center",gap:2,whiteSpace:"nowrap",transition:"color .2s"}}>
                <span style={{fontSize:isMobile?13:15}}>{icon}</span><span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div style={{maxWidth:1060,margin:"0 auto",padding:`20px ${isMobile?12:20}px`}}>

        {/* ════ BUSCA ════ */}
        {tab==="search" && (
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 265px",gap:16}} className="fi">
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Rota */}
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:10}}>Rota</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <AirInput
                    codes={origins} txt={oTxt} setTxt={setOTxt}
                    placeholder="De onde?"
                    onSingle={a=>{setOrigins([a.code]);setOTxt(a.city);setOLabel(a.city);}}
                    onGroup={g=>{setOrigins(g.codes);setOLabel(g.codes.join("+"));}}
                  />
                  <button style={{...ghost(),padding:"10px",flexShrink:0,fontSize:16}} onClick={()=>{
                    const [ao,al,at,ad,ald,adt]=[origins,oLabel,oTxt,dests,dLabel,dTxt];
                    setOrigins(ad);setOLabel(ald);setOTxt(adt);
                    setDests(ao);setDLabel(al);setDTxt(at);
                  }}>⇄</button>
                  <AirInput
                    codes={dests} txt={dTxt} setTxt={setDTxt}
                    placeholder="Para onde?"
                    onSingle={a=>{setDests([a.code]);setDTxt(a.city);setDLabel(a.city);}}
                    onGroup={g=>{setDests(g.codes);setDLabel(g.codes.join("+"));}}
                  />
                </div>
                {/* Tags dos aeroportos selecionados */}
                {(origins.length>1||dests.length>1) && (
                  <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {origins.length>1 && origins.map(c=><Tag key={c} col={C.orange}>{c}</Tag>)}
                    {origins.length>1 && dests.length>0 && <span style={{color:C.faint,fontSize:12}}>→</span>}
                    {dests.length>1 && dests.map(c=><Tag key={c} col={C.blue} bg="rgba(96,165,250,.1)" brd="rgba(96,165,250,.2)">{c}</Tag>)}
                  </div>
                )}
              </div>

              {/* Quando */}
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:10}}>Quando</div>
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  {[["specific","📅 Data Específica"],["recurring-pairs","🔄 Recorrência"],["recurring-fixed","📌 Dia Fixo"]].map(([v,l])=>(
                    <button key={v} style={ghost(mode===v)} onClick={()=>setMode(v)}>{l}</button>
                  ))}
                </div>

                {mode==="specific" && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Ida</div><input type="date" style={inp} value={date1} onChange={e=>setDate1(e.target.value)} min={new Date().toISOString().slice(0,10)}/></div>
                    <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Volta (opcional)</div><input type="date" style={inp} value={date2} onChange={e=>setDate2(e.target.value)} min={date1||new Date().toISOString().slice(0,10)}/></div>
                  </div>
                )}

                {mode==="recurring-pairs" && (
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>De</div><input type="month" style={inp} value={rStart} onChange={e=>setRStart(e.target.value)}/></div>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Até</div><input type="month" style={inp} value={rEnd} onChange={e=>setREnd(e.target.value)}/></div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:C.faint,marginBottom:7}}>Dias de <strong style={{color:C.orange}}>Ida</strong></div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{WD.map((d,i)=><button key={i} onClick={()=>setDOut(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{width:36,height:36,borderRadius:8,border:`1px solid ${dOut.includes(i)?`${C.orange}66`:C.border}`,background:dOut.includes(i)?`${C.orange}22`:C.surface,color:dOut.includes(i)?C.orange:C.faint,fontSize:10,fontWeight:600,cursor:"pointer"}}>{d}</button>)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:C.faint,marginBottom:7}}>Dias de <strong style={{color:C.green}}>Volta</strong></div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{WD.map((d,i)=><button key={i} onClick={()=>setDRet(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{width:36,height:36,borderRadius:8,border:`1px solid ${dRet.includes(i)?`${C.green}66`:C.border}`,background:dRet.includes(i)?`${C.green}22`:C.surface,color:dRet.includes(i)?C.green:C.faint,fontSize:10,fontWeight:600,cursor:"pointer"}}>{d}</button>)}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Estadia mín. (dias)</div><input type="number" style={inp} value={minS} min={1} max={30} onChange={e=>setMinS(Number(e.target.value))}/></div>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Estadia máx. (dias)</div><input type="number" style={inp} value={maxS} min={1} max={60} onChange={e=>setMaxS(Number(e.target.value))}/></div>
                    </div>
                    {dOut.length>0&&dRet.length>0&&<div style={{background:`${C.orange}0a`,border:`1px solid ${C.orange}25`,borderRadius:10,padding:"10px 12px",fontSize:12,color:C.muted}}>
                      Ida toda <strong style={{color:C.orange}}>{dOut.map(d=>WD_F[d]).join(", ")}</strong> · Volta toda <strong style={{color:C.green}}>{dRet.map(d=>WD_F[d]).join(", ")}</strong> · {minS}–{maxS} dias
                    </div>}
                  </div>
                )}

                {mode==="recurring-fixed" && (
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{background:`${C.blue}0a`,border:`1px solid ${C.blue}25`,borderRadius:10,padding:"10px 12px",fontSize:12,color:C.muted}}>📌 Busca toda semana no mesmo dia — ideal para monitorar ida avulsa sem variação.</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>De</div><input type="month" style={inp} value={rStart} onChange={e=>setRStart(e.target.value)}/></div>
                      <div><div style={{fontSize:10,color:C.faint,marginBottom:5}}>Até</div><input type="month" style={inp} value={rEnd} onChange={e=>setREnd(e.target.value)}/></div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:C.faint,marginBottom:7}}>Dia da semana</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{WD.map((d,i)=><button key={i} onClick={()=>setFixDay(i)} style={{width:36,height:36,borderRadius:8,border:`1px solid ${fixDay===i?`${C.blue}66`:C.border}`,background:fixDay===i?`${C.blue}22`:C.surface,color:fixDay===i?C.blue:C.faint,fontSize:10,fontWeight:600,cursor:"pointer"}}>{d}</button>)}</div>
                    </div>
                    <div style={{background:`${C.blue}0a`,border:`1px solid ${C.blue}25`,borderRadius:10,padding:"10px 12px",fontSize:12,color:C.muted}}>
                      Toda <strong style={{color:C.blue}}>{WD_F[fixDay]}</strong> de {rStart} a {rEnd} — {getFixedDates(fixDay,rStart,rEnd).length} datas
                    </div>
                  </div>
                )}
              </div>

              {/* Filtros */}
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:12}}>Filtros</div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:C.faint,marginBottom:5}}>Classe</div>
                    <select style={{...inp,border:`1px solid ${C.border}`,borderRadius:12,background:C.surface}} value={cabin} onChange={e=>setCabin(e.target.value)}>
                      {CABINS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.faint,marginBottom:5}}>Passageiros</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button style={{...ghost(),padding:"8px 12px"}} onClick={()=>setPax(p=>Math.max(1,p-1))}>−</button>
                      <span style={{fontSize:17,fontWeight:700,color:C.hi,minWidth:16,textAlign:"center"}}>{pax}</span>
                      <button style={{...ghost(),padding:"8px 12px"}} onClick={()=>setPax(p=>Math.min(9,p+1))}>+</button>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.faint,marginBottom:5}}>Valor Máx.</div>
                    <input style={{...inp,fontFamily:"'DM Mono',monospace",border:`1px solid ${C.border}`,borderRadius:12,background:C.surface}} placeholder="R$ ou pts" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:C.faint,marginBottom:7}}>Tipo</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[["","💳 Cash + Milhas"],["pagante","💵 Só Cash"],["milhas","🎯 Só Milhas"]].map(([v,l])=>(
                      <button key={v} style={ghost(sType===v)} onClick={()=>setSType(v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Tog on={nonstop} onChange={e=>setNonstop(e.target.checked)}/>
                  <span style={{fontSize:13,color:C.muted}}>Apenas voos diretos</span>
                </div>
              </div>

              <button style={primaryBtn} onClick={doSearch} disabled={!canSearch||loading}>
                {loading
                  ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.25)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>{loadMsg||"Buscando…"}</span>
                  : `✈ Let's Voo! — ${originLabel} → ${destLabel}`}
              </button>
            </div>

            {/* Sidebar */}
            {!isMobile && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={card}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:10}}>Ordenar</div>
                  {[["price","💵 Menor Valor"],["stops","✈ Menos Escalas"],["time","⏰ Horário"]].map(([v,l])=>(
                    <button key={v} style={{...ghost(sort===v),display:"block",width:"100%",textAlign:"left",marginBottom:6}} onClick={()=>setSort(v)}>{l}</button>
                  ))}
                </div>
                {results.length>0 && (
                  <div style={card}>
                    <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:10}}>Último resultado</div>
                    {results.find(r=>r.type==="cash") && <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:C.green}}>{fBRL(results.find(r=>r.type==="cash").price)}</div>}
                    {results.find(r=>r.type==="miles") && <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:4}}>{fMiles(results.find(r=>r.type==="miles").miles)}</div>}
                    <div style={{fontSize:11,color:C.faint,marginTop:6,marginBottom:12}}>{results.length} opções</div>
                    <button style={{...ghost(),width:"100%",textAlign:"center"}} onClick={saveSearch}>⭐ Salvar busca</button>
                  </div>
                )}
                <div style={card}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:C.faint,marginBottom:10}}>Acesso rápido</div>
                  {PLATFORMS.slice(0,4).map(p=>(
                    <a key={p.name} href={p.url(origins[0]||"GRU",dests[0]||"MIA")} target="_blank" rel="noreferrer"
                      style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",textDecoration:"none",color:C.muted,fontSize:13,borderBottom:`1px solid ${C.border}`}}>
                      <span>{p.icon}</span><span>{p.name}</span><span style={{marginLeft:"auto",fontSize:10,color:C.faint}}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ RESULTADOS ════ */}
        {tab==="results" && (
          <Results
            results={results} loading={loading} loadMsg={loadMsg}
            mode={mode} originLabel={originLabel} destLabel={destLabel}
            date1={date1} date2={date2} isMobile={isMobile}
            ghost={ghost} primaryBtn={primaryBtn} card={card}
            onSave={saveSearch} onNew={()=>setTab("search")}
            sType={sType} pax={pax} nonstop={nonstop}
          />
        )}

        {/* ════ SITES ════ */}
        {tab==="sites" && (
          <div className="fi">
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?18:22,fontWeight:800,color:C.hi,marginBottom:6}}>Sites de Busca</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Acesse os melhores sites — a rota já vai preenchida quando possível.</div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
              {PLATFORMS.map(p=>(
                <a key={p.name} href={p.url(origins[0]||"GRU",dests[0]||"MIA")} target="_blank" rel="noreferrer"
                  style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,textDecoration:"none",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.orange}44`;e.currentTarget.style.background=`${C.orange}0a`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}>
                  <div style={{width:40,height:40,background:`${p.color}22`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:C.hi}}>{p.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>{p.desc}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:C.faint,fontSize:16}}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ════ ALERTAS ════ */}
        {tab==="alerts" && (
          <div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?18:22,fontWeight:800,color:C.hi}}>Alertas</div>
              {alerts.length>0&&<button style={ghost()} onClick={()=>setAlerts([])}>Limpar</button>}
            </div>
            {!alerts.length
              ? <div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:48,marginBottom:14}}>🔔</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:C.muted}}>Nenhum alerta ainda</div></div>
              : alerts.map(a=>(
                <div key={a.id} style={{...card,marginBottom:8,borderLeft:`3px solid ${C.orange}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:C.hi,marginBottom:5}}>{a.text}</div>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                        {a.bestCash&&<span style={{fontSize:12,color:C.green,fontWeight:600}}>💵 {a.bestCash}</span>}
                        {a.bestMiles&&<span style={{fontSize:12,color:C.purple,fontWeight:600}}>🎯 {a.bestMiles}</span>}
                        <span style={{fontSize:12,color:C.muted}}>{a.details}</span>
                      </div>
                    </div>
                    <span style={{fontSize:11,color:C.faint,whiteSpace:"nowrap",marginLeft:10}}>{a.time}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ════ SALVAS ════ */}
        {tab==="saved" && (
          <div className="fi">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:isMobile?18:22,fontWeight:800,color:C.hi}}>Buscas Salvas</div>
              <button style={{...primaryBtn,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>setTab("search")}>+ Nova</button>
            </div>
            {!saved.length
              ? <div style={{textAlign:"center",padding:"70px 0"}}><div style={{fontSize:48,marginBottom:14}}>⭐</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:C.muted}}>Nenhuma busca salva</div></div>
              : saved.map(s=>(
                <div key={s.id} style={{...card,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:s.active?C.green:C.faint,boxShadow:s.active?`0 0 8px ${C.green}`:"none",flexShrink:0}}/>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,color:C.hi,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.label}</div>
                        <div style={{fontSize:11,color:C.faint,marginTop:2}}>{s.active?"Ativa":"Pausada"}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button style={{...ghost(),fontSize:11,padding:"5px 10px"}} onClick={()=>setSaved(p=>p.map(x=>x.id===s.id?{...x,active:!x.active}:x))}>{s.active?"Pausar":"Ativar"}</button>
                      <button style={{...ghost(),fontSize:11,padding:"5px 10px",color:C.red,borderColor:`${C.red}33`}} onClick={()=>setSaved(p=>p.filter(x=>x.id!==s.id))}>×</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div style={{borderTop:`1px solid ${C.border}`,padding:"16px",textAlign:"center",marginTop:40}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,background:`linear-gradient(135deg,${C.orange},${C.pink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Let'sVoo</div>
        <div style={{fontSize:11,color:C.faint,marginTop:3}}>Monitor inteligente de passagens aéreas</div>
      </div>
    </div>
  );
}
