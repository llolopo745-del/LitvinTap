import { useState, useRef, useEffect } from "react";

const HITBOXES = ["Head","Neck","Chest","Stomach","Pelvis","Arms","Left leg","Right leg"];

function Toggle({ on, onChange }) {
  return (
    <div onClick={e=>{e.stopPropagation();onChange(!on);}} style={{
      width:34,height:19,borderRadius:10,
      background:on?"#30D158":"#D1D1D6",
      position:"relative",cursor:"pointer",flexShrink:0,transition:"background .2s"
    }}>
      <div style={{
        position:"absolute",top:2,left:2,width:15,height:15,borderRadius:"50%",
        background:"white",boxShadow:"0 1px 3px rgba(0,0,0,.25)",
        transform:on?"translateX(15px)":"none",
        transition:"transform .2s cubic-bezier(.34,1.56,.64,1)"
      }}/>
    </div>
  );
}

function Slider({ label, value, min, max, fmt, onChange }) {
  const trackRef = useRef(null);
  const pct = ((value-min)/(max-min))*100;
  const handle = e => {
    e.preventDefault();
    const track = trackRef.current;
    const move = ev => {
      const r = track.getBoundingClientRect();
      const p = Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));
      onChange(min+(max-min)*p);
    };
    const up = ()=>{document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",move);document.addEventListener("mouseup",up);move(e);
  };
  return (
    <div style={{padding:"5px 14px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:12.5,fontWeight:500,color:"#1C1C1E"}}>{label}</span>
        <span style={{fontSize:11.5,fontWeight:600,color:"#0A84FF",background:"rgba(10,132,255,.11)",padding:"1px 7px",borderRadius:5}}>{fmt(value)}</span>
      </div>
      <div ref={trackRef} onMouseDown={handle} style={{width:"100%",height:4,background:"rgba(0,0,0,.08)",borderRadius:2,position:"relative",cursor:"pointer"}}>
        <div style={{height:"100%",width:pct+"%",background:"#0A84FF",borderRadius:2,position:"relative"}}>
          <div style={{position:"absolute",right:-6,top:-5,width:13,height:13,borderRadius:"50%",background:"white",border:"2px solid #0A84FF",boxShadow:"0 1px 4px rgba(10,132,255,.4)"}}/>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, bg, name, desc, on, onChange }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={()=>onChange(!on)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",padding:"5px 14px",gap:9,cursor:"pointer",
        borderRadius:8,margin:"0 4px",background:hov?"rgba(0,0,0,.04)":"transparent",transition:"background .1s"}}>
      <div style={{width:27,height:27,borderRadius:7,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:12.5,fontWeight:500,color:"#1C1C1E"}}>{name}</div>
        {desc&&<div style={{fontSize:10.5,color:"#AEAEB2",marginTop:1}}>{desc}</div>}
      </div>
      <Toggle on={on} onChange={onChange}/>
    </div>
  );
}

function EnableRow({ label, on, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",
      background:"rgba(10,132,255,.06)",borderBottom:"1px solid rgba(0,0,0,.065)"}}>
      <span style={{fontSize:13,fontWeight:600,color:on?"#0A84FF":"#6C6C70",transition:"color .2s"}}>{label}</span>
      <Toggle on={on} onChange={onChange}/>
    </div>
  );
}

function hsvToHex(h,s,v){
  const s2=s/100,v2=v/100;
  const f=n=>{const k=(n+h/60)%6;return v2-v2*s2*Math.max(0,Math.min(k,4-k,1));};
  const toH=x=>Math.round(x*255).toString(16).padStart(2,"0");
  return "#"+toH(f(5))+toH(f(3))+toH(f(1));
}
function hexToHsv(hex){
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0;
  if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=Math.round(h*60);if(h<0)h+=360;}
  return [h,mx?Math.round((d/mx)*100):0,Math.round(mx*100)];
}
const PRESETS=["#0A84FF","#30D158","#FF3B30","#FF9F0A","#BF5AF2","#5AC8FA","#FFD60A","#FF2D55"];

function ColorPicker({ onChange }) {
  const [h,setH]=useState(211);const [s,setS]=useState(100);const [v,setV]=useState(100);
  const svRef=useRef(null);const hueRef=useRef(null);
  const hex=hsvToHex(h,s,v);
  useEffect(()=>{onChange(hex);},[hex]);

  const dragSV=e=>{
    e.preventDefault();const el=svRef.current;
    const move=ev=>{const r=el.getBoundingClientRect();setS(Math.round(Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width))*100));setV(Math.round((1-Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height)))*100));};
    const up=()=>{document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",move);document.addEventListener("mouseup",up);move(e);
  };
  const dragHue=e=>{
    e.preventDefault();const el=hueRef.current;
    const move=ev=>{const r=el.getBoundingClientRect();setH(Math.round(Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width))*360));};
    const up=()=>{document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",move);document.addEventListener("mouseup",up);move(e);
  };

  return (
    <div style={{padding:"4px 12px 8px"}}>
      <div ref={svRef} onMouseDown={dragSV} style={{width:"100%",height:110,borderRadius:9,position:"relative",cursor:"crosshair",marginBottom:7,overflow:"hidden",background:`hsl(${h},100%,50%)`}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,#fff,transparent)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#000,transparent)"}}/>
        <div style={{position:"absolute",left:`calc(${s}% - 6px)`,top:`calc(${100-v}% - 6px)`,width:12,height:12,borderRadius:"50%",border:"2px solid white",boxShadow:"0 1px 4px rgba(0,0,0,.5)",background:hex,pointerEvents:"none"}}/>
      </div>
      <div ref={hueRef} onMouseDown={dragHue} style={{width:"100%",height:11,borderRadius:6,cursor:"pointer",position:"relative",marginBottom:8,background:"linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"}}>
        <div style={{position:"absolute",left:`calc(${(h/360)*100}% - 7px)`,top:-2,width:15,height:15,borderRadius:"50%",background:`hsl(${h},100%,50%)`,border:"2px solid white",boxShadow:"0 1px 4px rgba(0,0,0,.3)",pointerEvents:"none"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
        <div style={{width:30,height:30,borderRadius:8,background:hex,border:"1px solid rgba(0,0,0,.1)",flexShrink:0}}/>
        <div style={{flex:1,background:"rgba(0,0,0,.04)",borderRadius:7,padding:"6px 9px",fontSize:12,fontWeight:500,color:"#1C1C1E",fontFamily:"monospace",letterSpacing:.8}}>{hex.toUpperCase()}</div>
      </div>
      <div style={{display:"flex",gap:4}}>
        {PRESETS.map((c,i)=>(
          <div key={i} onClick={()=>{const[hh,ss,vv]=hexToHsv(c);setH(hh);setS(ss);setV(vv);}}
            style={{flex:1,height:18,borderRadius:5,background:c,cursor:"pointer",border:hex.toLowerCase()===c.toLowerCase()?"2px solid rgba(0,0,0,.35)":"2px solid transparent",transition:"transform .12s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scaleY(1.2)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scaleY(1)"}/>
        ))}
      </div>
    </div>
  );
}

function HitboxCombo({ selected, onChange }) {
  const [open,setOpen]=useState(false);const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const tog=h=>{const s=new Set(selected);s.has(h)?s.delete(h):s.add(h);onChange(s);};
  const label=selected.size?[...selected].join(", "):"Select hitboxes...";
  return (
    <div ref={ref} style={{margin:"3px 12px 6px",position:"relative",zIndex:10}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",padding:"8px 11px",borderRadius:9,
        background:"rgba(248,248,248,.9)",border:`1px solid ${open?"#0A84FF":"rgba(0,0,0,.09)"}`,cursor:"pointer",gap:7,transition:"border-color .15s"}}>
        <span style={{fontSize:12,fontWeight:500,color:selected.size?"#1C1C1E":"#AEAEB2",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
        {selected.size>0&&<span style={{fontSize:10.5,fontWeight:600,color:"#0A84FF",background:"rgba(10,132,255,.11)",padding:"1px 6px",borderRadius:5,flexShrink:0}}>{selected.size}</span>}
        <span style={{fontSize:8,color:"#AEAEB2",transform:open?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block",flexShrink:0}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"rgba(252,252,252,.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:11,border:"1px solid rgba(0,0,0,.09)",boxShadow:"0 8px 28px rgba(0,0,0,.13)",overflow:"hidden",animation:"fadeIn .12s ease"}}>
          {HITBOXES.map((h,i)=>(
            <div key={h} onClick={()=>tog(h)}
              style={{display:"flex",alignItems:"center",padding:"8px 11px",gap:9,cursor:"pointer",background:selected.has(h)?"rgba(10,132,255,.07)":"transparent",borderBottom:i<HITBOXES.length-1?"1px solid rgba(0,0,0,.05)":"none",transition:"background .1s"}}
              onMouseEnter={e=>{if(!selected.has(h))e.currentTarget.style.background="rgba(0,0,0,.04)";}}
              onMouseLeave={e=>{if(!selected.has(h))e.currentTarget.style.background="transparent";}}>
              <div style={{width:16,height:16,borderRadius:5,flexShrink:0,background:selected.has(h)?"#0A84FF":"transparent",border:`1.5px solid ${selected.has(h)?"#0A84FF":"#C7C7CC"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                {selected.has(h)&&<span style={{color:"white",fontSize:10,fontWeight:700,lineHeight:1}}>✓</span>}
              </div>
              <span style={{fontSize:12.5,fontWeight:500,color:selected.has(h)?"#0A84FF":"#1C1C1E"}}>{h}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CfgRow({ cfg, onLoad, onDel, onClick }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",padding:"7px 9px",borderRadius:9,gap:8,cursor:"pointer",
        background:cfg.active?"rgba(10,132,255,.11)":hov?"rgba(0,0,0,.04)":"transparent",transition:"background .12s"}}>
      <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:cfg.active?"#0A84FF":"#D1D1D6",boxShadow:cfg.active?"0 0 5px rgba(10,132,255,.4)":"none",transition:"all .2s"}}/>
      <div style={{flex:1,fontSize:12.5,fontWeight:500,color:"#1C1C1E"}}>{cfg.name}.cfg</div>
      <div style={{fontSize:10.5,color:"#AEAEB2"}}>{cfg.date}</div>
      <div style={{display:"flex",gap:3}}>
        <div onClick={e=>{e.stopPropagation();onLoad();}} style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,cursor:"pointer",background:"rgba(10,132,255,.1)",color:"#0A84FF"}}>▶</div>
        <div onClick={e=>{e.stopPropagation();onDel();}} style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,cursor:"pointer",background:"rgba(255,59,48,.1)",color:"#FF3B30"}}>✕</div>
      </div>
    </div>
  );
}

function CfgTab() {
  const [cfgs,setCfgs]=useState([{name:"default",date:"today",active:true},{name:"competitive",date:"Apr 19",active:false},{name:"hvh",date:"Apr 17",active:false}]);
  const [showInput,setShowInput]=useState(false);
  const [newName,setNewName]=useState("");
  const loadCfg=i=>setCfgs(prev=>prev.map((c,j)=>({...c,active:j===i})));
  const delCfg=i=>setCfgs(prev=>{if(prev.length<=1)return prev;const next=prev.filter((_,j)=>j!==i);if(!next.some(c=>c.active))next[Math.min(i,next.length-1)]={...next[Math.min(i,next.length-1)],active:true};return next;});
  const addCfg=()=>{
    const n=newName.trim()||"config"+cfgs.length;
    setCfgs(prev=>[...prev,{name:n,date:"now",active:false}]);
    setNewName("");setShowInput(false);
  };
  const saveCurrent=()=>setCfgs(prev=>prev.map(c=>c.active?{...c,date:"just now"}:c));
  return (
    <div>
      <SLabel>Profiles</SLabel>
      <div style={{padding:"0 6px"}}>
        {cfgs.map((c,i)=><CfgRow key={i} cfg={c} onLoad={()=>loadCfg(i)} onDel={()=>delCfg(i)} onClick={()=>loadCfg(i)}/>)}
      </div>
      <div onClick={()=>setShowInput(!showInput)}
        style={{display:"flex",alignItems:"center",gap:7,margin:"7px 11px 0",padding:"7px 11px",background:"rgba(248,248,248,.85)",border:"1px dashed rgba(0,0,0,.12)",borderRadius:9,cursor:"pointer"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(10,132,255,.35)";e.currentTarget.style.background="rgba(10,132,255,.07)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,0,0,.12)";e.currentTarget.style.background="rgba(248,248,248,.85)";}}>
        <div style={{fontSize:17,color:"#0A84FF",lineHeight:1}}>＋</div>
        <div style={{fontSize:12,fontWeight:500,color:"#6C6C70"}}>New config...</div>
      </div>
      {showInput&&(
        <div style={{margin:"7px 11px 0",display:"flex",gap:5}}>
          <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addCfg()} placeholder="config name"
            style={{flex:1,border:"1px solid rgba(0,0,0,.1)",background:"rgba(255,255,255,.7)",borderRadius:7,padding:"6px 9px",fontSize:12,fontFamily:"inherit",outline:"none",color:"#1C1C1E"}}/>
          <button onClick={addCfg} style={{padding:"6px 13px",borderRadius:7,background:"#0A84FF",color:"white",fontSize:11.5,fontWeight:600,cursor:"pointer",border:"none",fontFamily:"inherit"}}>Save</button>
        </div>
      )}
      <div style={{padding:"10px 11px 2px",display:"flex",justifyContent:"flex-end"}}>
        <div onClick={saveCurrent}
          style={{fontSize:12,fontWeight:600,color:"#0A84FF",background:"rgba(10,132,255,.11)",padding:"6px 16px",borderRadius:8,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(10,132,255,.2)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(10,132,255,.11)"}>
          Save config
        </div>
      </div>
    </div>
  );
}

const SLabel=({children})=>(
  <div style={{fontSize:10,fontWeight:600,color:"#AEAEB2",textTransform:"uppercase",letterSpacing:.6,padding:"8px 14px 3px"}}>{children}</div>
);
const Divider=()=><div style={{height:1,background:"rgba(0,0,0,.065)",margin:"3px 14px"}}/>;

export default function App() {
  const [tab,setTab]=useState("esp");
  const [espEnabled,setEspEnabled]=useState(true);
  const [box,setBox]=useState(true);const [skel,setSkel]=useState(true);const [hpBar,setHpBar]=useState(true);const [snapLines,setSnapLines]=useState(true);
  const [espColor,setEspColor]=useState("#0A84FF");
  const [aimEnabled,setAimEnabled]=useState(true);
  const [visCheck,setVisCheck]=useState(true);const [fovCheck,setFovCheck]=useState(true);const [drawFov,setDrawFov]=useState(true);
  const [fov,setFov]=useState(85);const [smooth,setSmooth]=useState(4.2);
  const [hbs,setHbs]=useState(new Set(["Head","Chest"]));

  const tabSt=t=>({flex:1,padding:"6px 0",textAlign:"center",fontSize:11.5,fontWeight:500,cursor:"pointer",borderRadius:"7px 7px 0 0",userSelect:"none",borderBottom:tab===t?"2px solid #0A84FF":"2px solid transparent",color:tab===t?"#0A84FF":"#6C6C70",background:tab===t?"rgba(10,132,255,.07)":"transparent",transition:"all .15s"});

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",background:"linear-gradient(135deg,#dce8ff 0%,#ead8ff 40%,#ffd8ea 70%,#d8ffe8 100%)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes fadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}input::placeholder{color:#AEAEB2}`}</style>

      <div style={{width:350,maxHeight:450,display:"flex",flexDirection:"column",background:"rgba(255,255,255,.75)",backdropFilter:"blur(28px) saturate(180%)",WebkitBackdropFilter:"blur(28px) saturate(180%)",borderRadius:16,border:"1px solid rgba(255,255,255,.9)",boxShadow:"0 12px 48px rgba(0,0,0,.13),0 2px 8px rgba(0,0,0,.07)",overflow:"hidden"}}>

        {/* Titlebar */}
        <div style={{display:"flex",alignItems:"center",padding:"11px 14px",background:"rgba(255,255,255,.55)",borderBottom:"1px solid rgba(0,0,0,.065)",gap:8,flexShrink:0}}>
          <div style={{display:"flex",gap:5}}>
            {["#FF3B30","#FFD60A","#30D158"].map((c,i)=>(
              <div key={i} style={{width:11,height:11,borderRadius:"50%",background:c,cursor:"pointer"}}/>
            ))}
          </div>
          <div style={{flex:1,textAlign:"center",fontSize:12.5,fontWeight:600,color:"#1C1C1E",marginLeft:-37,letterSpacing:.2}}>хуесос · v2.4</div>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#30D158",boxShadow:"0 0 6px rgba(48,209,88,.7)",animation:"pulse 2s ease-in-out infinite"}}/>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",padding:"7px 10px 0",gap:2,background:"rgba(255,255,255,.32)",borderBottom:"1px solid rgba(0,0,0,.065)",flexShrink:0}}>
          {["esp","aim","cfg"].map(t=>(
            <div key={t} style={tabSt(t)} onClick={()=>setTab(t)}>
              {t==="esp"?"ESP":t==="aim"?"Aimbot":"Config"}
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{overflowY:"auto",flex:1,padding:"2px 0 8px",animation:"fadeIn .15s ease"}} key={tab}>

          {tab==="esp"&&<>
            <EnableRow label="Enable ESP" on={espEnabled} onChange={setEspEnabled}/>
            <SLabel>Bounding Box</SLabel>
            <Row icon="📦" bg="rgba(10,132,255,.11)" name="Box ESP" desc="2D outline · adaptive" on={box} onChange={setBox}/>
            <SLabel>Skeleton</SLabel>
            <Row icon="🦴" bg="rgba(90,200,250,.11)" name="Skeleton" desc="Full rig · 17 joints" on={skel} onChange={setSkel}/>
            <SLabel>Health Bar</SLabel>
            <Row icon="🏥" bg="rgba(48,209,88,.11)" name="HP Bar" desc="Side · color by health" on={hpBar} onChange={setHpBar}/>
            <SLabel>Lines</SLabel>
            <Row icon="📍" bg="rgba(10,132,255,.11)" name="Snap lines" desc="Screen bottom → feet" on={snapLines} onChange={setSnapLines}/>
            <SLabel>ESP Color</SLabel>
            <ColorPicker onChange={setEspColor}/>
          </>}

          {tab==="aim"&&<>
            <EnableRow label="Enable Aimbot" on={aimEnabled} onChange={setAimEnabled}/>
            <SLabel>Checks</SLabel>
            <Row icon="👁" bg="rgba(48,209,88,.11)" name="Visible only" desc="Skip behind-wall targets" on={visCheck} onChange={setVisCheck}/>
            <Row icon="⭕" bg="rgba(10,132,255,.11)" name="FOV Check" desc="Aim within circle only" on={fovCheck} onChange={setFovCheck}/>
            <Row icon="🔵" bg="rgba(90,200,250,.11)" name="Draw FOV" desc="Show circle on screen" on={drawFov} onChange={setDrawFov}/>
            <Slider label="FOV Radius" value={fov} min={10} max={180} fmt={v=>Math.round(v)} onChange={setFov}/>
            <Slider label="Smooth" value={smooth} min={0} max={10} fmt={v=>v.toFixed(1)} onChange={setSmooth}/>
            <Divider/>
            <SLabel>Combo</SLabel>
            <HitboxCombo selected={hbs} onChange={setHbs}/>
          </>}

          {tab==="cfg"&&<CfgTab/>}
        </div>
      </div>
    </div>
  );
}
