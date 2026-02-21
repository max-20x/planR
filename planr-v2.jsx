import { useState, useEffect, useMemo, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/* ── Google Fonts ── */
const loadFonts = () => {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#F7F5F0}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-track{background:#F0EDE8}
    ::-webkit-scrollbar-thumb{background:#C8BFB0;border-radius:99px}
    input,select,textarea{font-family:'Plus Jakarta Sans',sans-serif}
    input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .fade-up{animation:fadeUp 0.45s ease forwards}
    .fade-up-2{animation:fadeUp 0.45s 0.08s ease both}
    .fade-up-3{animation:fadeUp 0.45s 0.16s ease both}
    .fade-up-4{animation:fadeUp 0.45s 0.24s ease both}
    .card-hover{transition:transform 0.2s ease,box-shadow 0.2s ease}
    .card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.1)!important}
  `;
  document.head.appendChild(s);
};

/* ── Constants ── */
const EM = "#059669"; const EM_L = "#D1FAE5"; const EM_D = "#047857";
const AMB = "#D97706"; const AMB_L = "#FEF3C7";
const ROS = "#E11D48"; const ROS_L = "#FFE4E6";
const INK = "#1C1917"; const MUT = "#78716C"; const LT = "#A8A29E";
const CREAM = "#F7F5F0"; const CARD = "#FFFFFF"; const BDR = "#E8E3DC";

const CATS = [
  {id:"transport",  label:"Transportation", icon:"🚌", color:"#0EA5E9"},
  {id:"foodstuff",  label:"Foodstuff",       icon:"🛒", color:"#16A34A"},
  {id:"bread",      label:"Bread",           icon:"🍞", color:"#D97706"},
  {id:"data",       label:"Mobile Data",     icon:"📶", color:"#8B5CF6"},
  {id:"debt",       label:"Debt Repayment",  icon:"💳", color:"#E11D48"},
  {id:"feeding",    label:"Eating Out",      icon:"🍽️", color:"#F97316"},
  {id:"clothing",   label:"Clothing",        icon:"👔", color:"#EC4899"},
  {id:"housing",    label:"Housing/Rent",    icon:"🏠", color:"#6366F1"},
  {id:"health",     label:"Health",          icon:"💊", color:"#14B8A6"},
  {id:"savings",    label:"Savings",         icon:"💰", color:"#059669"},
  {id:"other",      label:"Other",           icon:"📦", color:"#94A3B8"},
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_M = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Pre-loaded Q1 2025 data ── */
const Q1_DATA = [
  // February 2025 (month index 1, year 2025)
  {id:"feb-t",  category:"transport", amount:42000, type:"expense", date:"2025-02-01", description:"Monthly transport"},
  {id:"feb-f",  category:"foodstuff", amount:30000, type:"expense", date:"2025-02-01", description:"Foodstuff (home cooking)"},
  {id:"feb-b",  category:"bread",     amount:4000,  type:"expense", date:"2025-02-01", description:"Bread ₦1k/week × 4"},
  {id:"feb-d",  category:"data",      amount:14000, type:"expense", date:"2025-02-01", description:"Mobile data plan"},
  {id:"feb-dt", category:"debt",      amount:120000,type:"expense", date:"2025-02-01", description:"Debt repayment (cleared)"},
  {id:"feb-i",  category:"other",     amount:500000,type:"income",  date:"2025-02-25", description:"February salary"},
  // March 2025
  {id:"mar-t",  category:"transport", amount:42000, type:"expense", date:"2025-03-01", description:"Monthly transport"},
  {id:"mar-f",  category:"foodstuff", amount:30000, type:"expense", date:"2025-03-01", description:"Foodstuff (home cooking)"},
  {id:"mar-b",  category:"bread",     amount:4000,  type:"expense", date:"2025-03-01", description:"Bread ₦1k/week × 4"},
  {id:"mar-d",  category:"data",      amount:14000, type:"expense", date:"2025-03-01", description:"Mobile data plan"},
  {id:"mar-i",  category:"other",     amount:500000,type:"income",  date:"2025-03-25", description:"March salary"},
  // April 2025
  {id:"apr-t",  category:"transport", amount:42000, type:"expense", date:"2025-04-01", description:"Monthly transport"},
  {id:"apr-f",  category:"foodstuff", amount:30000, type:"expense", date:"2025-04-01", description:"Foodstuff (home cooking)"},
  {id:"apr-b",  category:"bread",     amount:4000,  type:"expense", date:"2025-04-01", description:"Bread ₦1k/week × 4"},
  {id:"apr-d",  category:"data",      amount:14000, type:"expense", date:"2025-04-01", description:"Mobile data plan"},
  {id:"apr-i",  category:"other",     amount:500000,type:"income",  date:"2025-04-25", description:"April salary"},
];

const fmt = (n) => {
  if (Math.abs(n) >= 1_000_000) return `₦${(n/1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `₦${(n/1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
};
const getCat = (id) => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

/* ── Reusable primitives ── */
const T = ({children, as="p", size=14, weight=400, color=INK, style={}, className=""}) => {
  const Tag = as;
  return <Tag className={className} style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:size,fontWeight:weight,color,lineHeight:1.5,...style}}>{children}</Tag>;
};
const Serif = ({children, size=28, color=INK, italic=false, style={}}) => (
  <span style={{fontFamily:"'Instrument Serif',serif",fontSize:size,color,fontStyle:italic?"italic":"normal",lineHeight:1.2,...style}}>{children}</span>
);

const Card = ({children, style={}, className="card-hover", onClick}) => (
  <div onClick={onClick} className={className} style={{background:CARD,borderRadius:20,border:`1px solid ${BDR}`,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",padding:24,...style}}>{children}</div>
);

const Badge = ({children, color=EM, bg}) => (
  <span style={{background:bg||color+"18",color,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:600,letterSpacing:0.3}}>{children}</span>
);

const Btn = ({children, onClick, variant="primary", size="md", style={}}) => {
  const base = {border:"none",cursor:"pointer",borderRadius:12,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,transition:"all 0.18s ease",...style};
  const variants = {
    primary:{background:INK,color:CARD,boxShadow:"0 4px 14px rgba(0,0,0,0.15)"},
    ghost:{background:"transparent",color:MUT,border:`1px solid ${BDR}`},
    danger:{background:ROS,color:CARD},
    success:{background:EM,color:CARD,boxShadow:"0 4px 14px rgba(5,150,105,0.25)"},
  };
  const sizes = {sm:{padding:"7px 14px",fontSize:12},md:{padding:"11px 20px",fontSize:14},lg:{padding:"14px 28px",fontSize:15}};
  return <button onClick={onClick} style={{...base,...variants[variant],...sizes[size]}}>{children}</button>;
};

const Field = ({label, children}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    <T size={11} weight={600} color={MUT} style={{textTransform:"uppercase",letterSpacing:0.8}}>{label}</T>
    {children}
  </div>
);

const Input = ({value, onChange, placeholder, type="text", style={}}) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{background:CREAM,border:`1.5px solid ${BDR}`,borderRadius:12,padding:"11px 14px",fontSize:14,color:INK,outline:"none",width:"100%",transition:"border 0.15s",...style}}
    onFocus={e=>e.target.style.borderColor=EM} onBlur={e=>e.target.style.borderColor=BDR}
  />
);

const Select = ({value, onChange, children, style={}}) => (
  <select value={value} onChange={onChange}
    style={{background:CREAM,border:`1.5px solid ${BDR}`,borderRadius:12,padding:"11px 14px",fontSize:14,color:INK,outline:"none",width:"100%",cursor:"pointer",...style}}>
    {children}
  </select>
);

const ProgressBar = ({pct, color=EM}) => (
  <div style={{background:"#F0EDE8",borderRadius:99,height:5,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:pct>90?ROS:pct>70?AMB:color,borderRadius:99,transition:"width 0.7s cubic-bezier(.22,1,.36,1)"}}/>
  </div>
);

const ChartTip = ({active, payload, label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:14,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.1)"}}>
      <T size={12} weight={600} color={MUT}>{label}</T>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
          <div style={{width:8,height:8,borderRadius:99,background:p.color||p.fill}}/>
          <T size={13} weight={600} color={INK}>{p.name}: {fmt(p.value)}</T>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════ */
export default function PlanR() {
  const now = new Date();
  const [view, setView] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({transport:42000,foodstuff:30000,bread:4000,data:14000});
  const [loaded, setLoaded] = useState(false);
  const [selMonth, setSelMonth] = useState(1); // Feb = 1
  const [selYear, setSelYear] = useState(2025);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({category:"transport",amount:"",description:"",type:"expense",date:now.toISOString().split("T")[0]});
  const [filterCat, setFilterCat] = useState("all");

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2500); };

  useEffect(()=>{
    loadFonts();
    (async()=>{
      try {
        const t = await window.storage.get("planr2-tx");
        if (t) setTransactions(JSON.parse(t.value));
        else {
          setTransactions(Q1_DATA);
          await window.storage.set("planr2-tx", JSON.stringify(Q1_DATA));
        }
        const b = await window.storage.get("planr2-budgets");
        if (b) setBudgets(JSON.parse(b.value));
      } catch(e){ setTransactions(Q1_DATA); }
      setLoaded(true);
    })();
  },[]);

  const saveTx = async(txs) => {
    setTransactions(txs);
    try { await window.storage.set("planr2-tx", JSON.stringify(txs)); } catch(e){}
  };

  const monthTx = useMemo(()=> transactions.filter(tx=>{
    const d = new Date(tx.date); return d.getMonth()===selMonth && d.getFullYear()===selYear;
  }),[transactions,selMonth,selYear]);

  const expenses = useMemo(()=>monthTx.filter(t=>t.type==="expense"),[monthTx]);
  const incomes  = useMemo(()=>monthTx.filter(t=>t.type==="income"),[monthTx]);
  const totalExp = useMemo(()=>expenses.reduce((s,t)=>s+t.amount,0),[expenses]);
  const totalInc = useMemo(()=>incomes.reduce((s,t)=>s+t.amount,0),[incomes]);
  const balance  = totalInc - totalExp;
  const savRate  = totalInc > 0 ? balance/totalInc : 0;

  const catSpend = useMemo(()=>{
    const m={};
    expenses.forEach(t=>{m[t.category]=(m[t.category]||0)+t.amount;});
    return m;
  },[expenses]);

  const pieData = useMemo(()=>
    CATS.filter(c=>catSpend[c.id]>0)
      .map(c=>({name:c.label,value:catSpend[c.id],color:c.color,icon:c.icon}))
      .sort((a,b)=>b.value-a.value),
  [catSpend]);

  const trendData = useMemo(()=>{
    const res=[];
    for(let i=2;i>=0;i--){
      const d=new Date(2025,selMonth-i,1);
      const m=d.getMonth(); const y=d.getFullYear();
      const txs=transactions.filter(t=>{const dd=new Date(t.date);return dd.getMonth()===m&&dd.getFullYear()===y;});
      res.push({
        month:MONTHS[m],
        income:txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),
        expenses:txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),
        savings:txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0)-txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),
      });
    }
    return res;
  },[transactions,selMonth,selYear]);

  const addTx = () => {
    if(!form.amount||isNaN(+form.amount)||+form.amount<=0){notify("Enter a valid amount","err");return;}
    const tx={id:Date.now().toString(),...form,amount:+form.amount};
    saveTx([tx,...transactions]);
    setForm({category:"transport",amount:"",description:"",type:"expense",date:now.toISOString().split("T")[0]});
    setShowAdd(false);
    notify(form.type==="income"?"Income added ✓":"Expense added ✓");
  };
  const delTx = (id)=>{saveTx(transactions.filter(t=>t.id!==id));notify("Removed");};

  const prevMonth = ()=>{ if(selMonth===0){setSelMonth(11);setSelYear(y=>y-1);}else setSelMonth(m=>m-1); };
  const nextMonth = ()=>{ if(selMonth===11){setSelMonth(0);setSelYear(y=>y+1);}else setSelMonth(m=>m+1); };

  if(!loaded) return (
    <div style={{background:CREAM,height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{width:48,height:48,borderRadius:16,background:INK,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:CREAM}}>₦</span>
      </div>
      <Serif size={14} color={MUT}>Loading your finances…</Serif>
    </div>
  );

  /* ── NAV TABS ── */
  const tabs = [
    {id:"overview",    icon:"◈", label:"Overview"},
    {id:"plan",        icon:"📅", label:"Q1 Plan"},
    {id:"transactions",icon:"↕", label:"Entries"},
    {id:"budget",      icon:"◎", label:"Budget"},
  ];

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:CREAM,minHeight:"100vh",color:INK,position:"relative"}}>

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="err"?ROS:INK,color:CARD,
          borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:600,
          zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",
          animation:"popIn 0.2s ease"}}>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:CARD,borderBottom:`1px solid ${BDR}`,padding:"0 20px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:INK,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:CREAM,fontStyle:"italic"}}>₦</span>
            </div>
            <div>
              <Serif size={18} color={INK} style={{display:"block",letterSpacing:-0.3}}>PlanR</Serif>
              <T size={10} color={LT} weight={500}>Budget Tracker</T>
            </div>
          </div>

          {/* Month selector */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:CREAM,borderRadius:12,padding:"6px 12px",border:`1px solid ${BDR}`}}>
            <button onClick={prevMonth} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:16,lineHeight:1,padding:"0 2px"}}>‹</button>
            <T size={13} weight={600} color={INK} style={{minWidth:88,textAlign:"center"}}>{FULL_M[selMonth].slice(0,3)} {selYear}</T>
            <button onClick={nextMonth} style={{background:"none",border:"none",cursor:"pointer",color:MUT,fontSize:16,lineHeight:1,padding:"0 2px"}}>›</button>
          </div>

          {/* Greeting */}
          <T size={12} weight={500} color={MUT}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"} 👋</T>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div style={{background:CARD,borderBottom:`1px solid ${BDR}`,position:"sticky",top:60,zIndex:99}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",gap:2,padding:"0 16px"}}>
          {tabs.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setView(id)} style={{
              background:"none",border:"none",borderBottom:view===id?`2.5px solid ${INK}`:"2.5px solid transparent",
              color:view===id?INK:MUT,padding:"13px 14px",fontSize:13,fontWeight:view===id?700:500,
              cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all 0.15s",
              display:"flex",alignItems:"center",gap:6,flexShrink:0
            }}>
              <span style={{fontSize:11}}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:760,margin:"0 auto",padding:"24px 20px 100px"}}>

        {/* ═══ OVERVIEW ═══ */}
        {view==="overview" && (
          <div>
            {/* Hero stat card */}
            <div className="fade-up" style={{background:INK,borderRadius:24,padding:28,marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>
              <div style={{position:"absolute",bottom:-50,right:40,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.02)"}}/>
              <T size={11} weight={600} color={LT} style={{textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Net Balance · {FULL_M[selMonth]}</T>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:20}}>
                <Serif size={44} color={CREAM} style={{letterSpacing:-1}}>{fmt(balance)}</Serif>
                <Badge color={savRate>0?"#6EE7B7":ROS} bg={savRate>0?"rgba(110,231,183,0.15)":"rgba(225,29,72,0.15)"}>
                  {(savRate*100).toFixed(1)}% saved
                </Badge>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[{label:"Income",val:totalInc,color:"#6EE7B7"},{label:"Spent",val:totalExp,color:"#FDA4AF"}].map(({label,val,color})=>(
                  <div key={label}>
                    <T size={11} weight={500} color={"rgba(255,255,255,0.45)"} style={{marginBottom:2}}>{label}</T>
                    <T size={18} weight={700} color={color}>{fmt(val)}</T>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat row */}
            <div className="fade-up-2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {[
                {label:"Transactions",val:monthTx.length,unit:"this month",color:EM},
                {label:"Avg Daily Spend",val:fmt(totalExp/30),unit:"per day",color:AMB},
                {label:"Budget Used",val:Object.keys(budgets).length>0?Math.round((totalExp/Object.values(budgets).reduce((s,b)=>s+b,0))*100)+"%":"—",unit:"of limit",color:ROS},
              ].map(({label,val,unit,color})=>(
                <Card key={label} style={{padding:18}} className="">
                  <T size={10} weight={600} color={LT} style={{textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{label}</T>
                  <Serif size={22} color={INK}>{val}</Serif>
                  <T size={11} color={MUT} style={{marginTop:2}}>{unit}</T>
                </Card>
              ))}
            </div>

            {/* Charts row */}
            <div className="fade-up-3" style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:12,marginBottom:16}}>
              {/* Area chart */}
              <Card className="">
                <T size={13} weight={700} color={INK} style={{marginBottom:16}}>3-Month Trend</T>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={trendData} margin={{top:5,right:0,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EM} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={EM} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ROS} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={ROS} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#F0EDE8" vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:LT}} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip content={<ChartTip/>}/>
                    <Area type="monotone" dataKey="savings" name="Savings" stroke={EM} strokeWidth={2.5} fill="url(#gS)"/>
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke={ROS} strokeWidth={2} fill="url(#gE)" strokeDasharray="4 2"/>
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:16,marginTop:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:3,background:EM,borderRadius:99}}/><T size={11} color={MUT}>Savings</T></div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:3,background:ROS,borderRadius:99,borderTop:"2px dashed "+ROS}}/><T size={11} color={MUT}>Expenses</T></div>
                </div>
              </Card>

              {/* Donut */}
              <Card className="" style={{display:"flex",flexDirection:"column"}}>
                <T size={13} weight={700} color={INK} style={{marginBottom:12}}>Breakdown</T>
                {pieData.length===0 ? (
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <T size={12} color={LT}>No data</T>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                          {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                        </Pie>
                        <Tooltip content={<ChartTip/>}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:4}}>
                      {pieData.slice(0,4).map(d=>(
                        <div key={d.name} style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:7,height:7,borderRadius:99,background:d.color,flexShrink:0}}/>
                          <T size={11} color={MUT} style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</T>
                          <T size={11} weight={600} color={INK}>{fmt(d.value)}</T>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            {/* Category spend vs budget */}
            <Card className="fade-up-4" style={{}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <T size={13} weight={700} color={INK}>Category Spending</T>
                <Btn variant="ghost" size="sm" onClick={()=>setView("budget")}>Set Budgets</Btn>
              </div>
              {CATS.filter(c=>catSpend[c.id]>0).sort((a,b)=>catSpend[b.id]-catSpend[a.id]).map((cat,i)=>{
                const spent = catSpend[cat.id]||0;
                const bdg   = budgets[cat.id];
                const pct_  = bdg ? (spent/bdg)*100 : null;
                return (
                  <div key={cat.id} style={{padding:"10px 0",borderBottom:i<CATS.filter(c=>catSpend[c.id]>0).length-1?`1px solid ${BDR}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:11,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cat.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <T size={13} weight={600} color={INK}>{cat.label}</T>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            {pct_!==null && pct_>90 && <Badge color={ROS}>Over budget</Badge>}
                            <T size={13} weight={700} color={cat.color}>{fmt(spent)}</T>
                            {bdg && <T size={11} color={LT}>/ {fmt(bdg)}</T>}
                          </div>
                        </div>
                        {pct_!==null && <ProgressBar pct={pct_} color={cat.color}/>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {CATS.filter(c=>catSpend[c.id]>0).length===0 && (
                <div style={{textAlign:"center",padding:"24px 0"}}>
                  <T size={13} color={LT}>No expenses this month yet</T>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══ Q1 PLAN ═══ */}
        {view==="plan" && (
          <div>
            <div className="fade-up" style={{marginBottom:20}}>
              <Serif size={28} color={INK} italic>Q1 Budget Plan</Serif>
              <T size={13} color={MUT} style={{marginTop:4}}>February · March · April 2025</T>
            </div>

            {/* 3 month side by side */}
            <div className="fade-up-2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[
                {m:1,label:"February",bg:INK,notes:"Debt cleared this month",debt:120000,savings:290000,savRate:58},
                {m:2,label:"March",   bg:EM_D,notes:"Clean slate — home plan active",debt:0,savings:410000,savRate:82},
                {m:3,label:"April",   bg:"#7C3AED",notes:"Consistent — same plan",debt:0,savings:410000,savRate:82},
              ].map(({m,label,bg,notes,debt,savings,savRate:sr})=>(
                <div key={m} style={{background:bg,borderRadius:20,padding:20,cursor:"pointer",position:"relative",overflow:"hidden"}}
                  onClick={()=>{setSelMonth(m);setSelYear(2025);setView("overview");}}>
                  <div style={{position:"absolute",bottom:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
                  <T size={11} weight={600} color={"rgba(255,255,255,0.6)"} style={{textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{label} 2025</T>
                  <Serif size={28} color={CREAM} style={{display:"block",marginBottom:12}}>₦{(savings/1000).toFixed(0)}K</Serif>
                  <Badge color="#fff" bg="rgba(255,255,255,0.15)">saved</Badge>
                  <T size={11} color={"rgba(255,255,255,0.5)"} style={{marginTop:8}}>{notes}</T>
                  <div style={{marginTop:12,display:"flex",alignItems:"center",gap:6}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.15)",borderRadius:99,height:4,overflow:"hidden"}}>
                      <div style={{width:`${sr}%`,height:"100%",background:"rgba(255,255,255,0.7)",borderRadius:99}}/>
                    </div>
                    <T size={11} weight={700} color={CREAM}>{sr}%</T>
                  </div>
                  {m===selMonth&&selYear===2025 && (
                    <div style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.2)",borderRadius:99,width:8,height:8}}/>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <Card className="fade-up-3" style={{overflow:"hidden",padding:0}}>
              <div style={{padding:"16px 20px",borderBottom:`1px solid ${BDR}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <T size={13} weight={700} color={INK}>Side-by-Side Comparison</T>
                <T size={11} color={LT}>Click a month above to view detail</T>
              </div>
              {/* Table */}
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  <thead>
                    <tr>
                      {["Expense","February","March","April"].map((h,i)=>(
                        <td key={h} style={{padding:"12px 20px",fontSize:11,fontWeight:700,color:i===0?MUT:CARD,
                          background:i===0?CREAM:[INK,EM_D,"#7C3AED"][i-1],
                          textAlign:i===0?"left":"right",letterSpacing:0.5,textTransform:"uppercase"}}>
                          {h}
                        </td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Monthly Income",500000,500000,500000],
                      ["Transportation",42000,42000,42000],
                      ["Foodstuff",30000,30000,30000],
                      ["Bread",4000,4000,4000],
                      ["Mobile Data",14000,14000,14000],
                      ["Debt Repayment",120000,0,0],
                    ].map(([label,...vals],i)=>{
                      const isIncome = label==="Monthly Income";
                      const isDebt   = label==="Debt Repayment";
                      const bg = i%2===0?CREAM:CARD;
                      return (
                        <tr key={label}>
                          <td style={{padding:"11px 20px",fontSize:13,fontWeight:isIncome?700:500,color:isIncome?EM:INK,background:bg,borderBottom:`1px solid ${BDR}`}}>
                            {label}
                          </td>
                          {vals.map((v,j)=>(
                            <td key={j} style={{padding:"11px 20px",fontSize:13,fontWeight:600,textAlign:"right",
                              color:isIncome?EM:isDebt&&v>0?ROS:v===0?LT:INK,background:bg,borderBottom:`1px solid ${BDR}`}}>
                              {v===0?<span style={{color:LT}}>—</span>:fmt(v)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    {/* Totals */}
                    {[
                      {label:"Total Expenses",vals:[210000,90000,90000],color:ROS,bg:ROS_L},
                      {label:"Net Savings",vals:[290000,410000,410000],color:EM,bg:EM_L},
                    ].map(({label,vals,color,bg})=>(
                      <tr key={label}>
                        <td style={{padding:"13px 20px",fontSize:13,fontWeight:800,color,background:bg,borderTop:`2px solid ${color}33`}}>{label}</td>
                        {vals.map((v,j)=>(
                          <td key={j} style={{padding:"13px 20px",fontSize:14,fontWeight:800,textAlign:"right",color,background:bg,borderTop:`2px solid ${color}33`}}>{fmt(v)}</td>
                        ))}
                      </tr>
                    ))}
                    {/* Savings rate */}
                    <tr>
                      <td style={{padding:"13px 20px",fontSize:12,fontWeight:700,color:MUT,background:CREAM}}>Savings Rate</td>
                      {[58,82,82].map((v,j)=>(
                        <td key={j} style={{padding:"13px 20px",fontSize:13,fontWeight:800,textAlign:"right",color:v>70?EM:AMB,background:CREAM}}>{v}%</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{padding:"13px 20px",fontSize:12,fontWeight:700,color:MUT,background:LGRAY||CREAM}}>Cumulative Savings</td>
                      {[290000,700000,1110000].map((v,j)=>(
                        <td key={j} style={{padding:"13px 20px",fontSize:13,fontWeight:800,textAlign:"right",color:EM,background:CREAM}}>{fmt(v)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cumulative savings bar */}
            <Card className="fade-up-4" style={{marginTop:12}}>
              <T size={13} weight={700} color={INK} style={{marginBottom:16}}>Cumulative Savings Growth (₦)</T>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[{m:"Feb",v:290000},{m:"Mar",v:700000},{m:"Apr",v:1110000}]} margin={{top:5,right:5,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#F0EDE8" vertical={false}/>
                  <XAxis dataKey="m" tick={{fontSize:12,fill:MUT}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip content={<ChartTip/>}/>
                  <Bar dataKey="v" name="Savings" radius={[8,8,0,0]} fill={EM}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ═══ TRANSACTIONS ═══ */}
        {view==="transactions" && (
          <div>
            <div className="fade-up" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <Serif size={28} color={INK} italic>Entries</Serif>
                <T size={13} color={MUT} style={{marginTop:4}}>{monthTx.length} records · {FULL_M[selMonth]} {selYear}</T>
              </div>
              <Btn onClick={()=>setShowAdd(true)} variant="primary">+ Add Entry</Btn>
            </div>

            {/* Filter chips */}
            <div className="fade-up-2" style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {["all",...CATS.filter(c=>transactions.some(t=>t.category===c.id&&new Date(t.date).getMonth()===selMonth)).map(c=>c.id)].map(id=>(
                <button key={id} onClick={()=>setFilterCat(id)} style={{
                  background:filterCat===id?INK:CARD,
                  color:filterCat===id?CARD:MUT,
                  border:`1.5px solid ${filterCat===id?INK:BDR}`,
                  borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:600,
                  cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all 0.15s"
                }}>
                  {id==="all"?"All":CATS.find(c=>c.id===id)?.icon+" "+CATS.find(c=>c.id===id)?.label}
                </button>
              ))}
            </div>

            <div className="fade-up-3" style={{display:"flex",flexDirection:"column",gap:8}}>
              {monthTx.filter(tx=>filterCat==="all"||tx.category===filterCat).length===0 ? (
                <Card style={{textAlign:"center",padding:40}}>
                  <T size={32} style={{marginBottom:8}}>📭</T>
                  <T size={14} color={LT}>No entries found</T>
                  <div style={{marginTop:12}}><Btn onClick={()=>setShowAdd(true)} variant="primary">Add Entry</Btn></div>
                </Card>
              ) : monthTx.filter(tx=>filterCat==="all"||tx.category===filterCat).map(tx=>{
                const cat = getCat(tx.category);
                const isInc = tx.type==="income";
                return (
                  <Card key={tx.id} style={{padding:"14px 18px"}} className="card-hover">
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:42,height:42,borderRadius:13,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{cat.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <T size={14} weight={600} color={INK} style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.description||cat.label}</T>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                          <Badge color={cat.color}>{cat.label}</Badge>
                          <T size={11} color={LT}>{new Date(tx.date).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}</T>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <T size={15} weight={700} color={isInc?EM:INK}>{isInc?"+":"-"}{fmt(tx.amount)}</T>
                        <button onClick={()=>delTx(tx.id)} style={{background:"none",border:"none",cursor:"pointer",color:LT,fontSize:11,marginTop:2,fontFamily:"inherit",padding:0}}>remove</button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ BUDGET ═══ */}
        {view==="budget" && (
          <div>
            <div className="fade-up" style={{marginBottom:20}}>
              <Serif size={28} color={INK} italic>Monthly Budget</Serif>
              <T size={13} color={MUT} style={{marginTop:4}}>Set spending limits for {FULL_M[selMonth]} {selYear}</T>
            </div>

            <div className="fade-up-2" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {CATS.map((cat,i)=>{
                const spent = catSpend[cat.id]||0;
                const bdg   = budgets[cat.id]||"";
                const pct_  = bdg ? (spent/bdg)*100 : 0;
                const over  = bdg && spent > bdg;
                return (
                  <Card key={cat.id} style={{padding:"16px 18px"}} className="">
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:12,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{cat.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:bdg?6:0}}>
                          <T size={13} weight={600} color={INK}>{cat.label}</T>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            {over && <Badge color={ROS}>Over</Badge>}
                            {spent>0 && <T size={13} weight={700} color={cat.color}>{fmt(spent)}</T>}
                            {bdg && <T size={11} color={LT}>/ {fmt(+bdg)}</T>}
                          </div>
                        </div>
                        {!!bdg && <ProgressBar pct={pct_} color={cat.color}/>}
                      </div>
                      <div style={{flexShrink:0}}>
                        <input
                          value={budgets[cat.id]||""}
                          onChange={e=>{
                            const v=e.target.value;
                            const nb={...budgets};
                            if(v===""||v==="0") delete nb[cat.id]; else nb[cat.id]=+v;
                            setBudgets(nb);
                            (async()=>{try{await window.storage.set("planr2-budgets",JSON.stringify(nb));}catch(e){}})();
                          }}
                          placeholder="Limit"
                          type="number"
                          style={{background:CREAM,border:`1.5px solid ${BDR}`,borderRadius:10,
                            padding:"7px 10px",fontSize:12,color:INK,outline:"none",width:100,
                            textAlign:"right",fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Btn onClick={()=>notify("Budgets auto-saved ✓")} variant="success" size="lg" style={{width:"100%"}}>
              ✓ Budgets Saved Automatically
            </Btn>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <button onClick={()=>setShowAdd(true)} style={{
        position:"fixed",bottom:28,right:24,width:54,height:54,borderRadius:17,
        background:INK,border:"none",cursor:"pointer",color:CREAM,fontSize:24,
        boxShadow:"0 8px 28px rgba(0,0,0,0.2)",zIndex:200,display:"flex",
        alignItems:"center",justifyContent:"center",transition:"transform 0.15s, box-shadow 0.15s"
      }} onMouseEnter={e=>{e.target.style.transform="scale(1.08)";e.target.style.boxShadow="0 12px 36px rgba(0,0,0,0.28)"}}
         onMouseLeave={e=>{e.target.style.transform="scale(1)";e.target.style.boxShadow="0 8px 28px rgba(0,0,0,0.2)"}}>
        +
      </button>

      {/* ── ADD MODAL ── */}
      {showAdd && (
        <div style={{position:"fixed",inset:0,background:"rgba(28,25,23,0.5)",zIndex:500,
          display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)"}}
          onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}>
          <div style={{background:CARD,borderRadius:"24px 24px 0 0",padding:"28px 24px 36px",
            width:"100%",maxWidth:500,margin:"0 auto",
            borderTop:`1px solid ${BDR}`,animation:"slideIn 0.3s cubic-bezier(.22,1,.36,1)"}}>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <Serif size={22} color={INK}>New Entry</Serif>
              <button onClick={()=>setShowAdd(false)} style={{background:CREAM,border:"none",color:MUT,width:32,height:32,borderRadius:99,cursor:"pointer",fontSize:18}}>×</button>
            </div>

            {/* Type toggle */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20,background:CREAM,borderRadius:14,padding:4}}>
              {["expense","income"].map(t=>(
                <button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{
                  padding:"10px",border:"none",borderRadius:11,cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,transition:"all 0.18s",
                  background:form.type===t?(t==="income"?EM:ROS):"transparent",
                  color:form.type===t?CARD:MUT,
                  boxShadow:form.type===t?"0 4px 14px rgba(0,0,0,0.15)":"none",
                }}>
                  {t==="expense"?"💸 Expense":"💵 Income"}
                </button>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Amount (₦)">
                <Input value={form.amount} type="number" placeholder="e.g. 42000"
                  onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
                  style={{fontSize:22,fontWeight:700,padding:"13px 16px"}}/>
              </Field>

              <Field label="Category">
                <Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </Select>
              </Field>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Field label="Description">
                  <Input value={form.description} placeholder="What for?" onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
                </Field>
                <Field label="Date">
                  <Input value={form.date} type="date" onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                </Field>
              </div>
            </div>

            <button onClick={addTx} style={{
              width:"100%",marginTop:22,padding:"15px",background:INK,color:CARD,
              border:"none",borderRadius:14,fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:15,fontWeight:700,cursor:"pointer",
              boxShadow:"0 6px 20px rgba(0,0,0,0.15)",letterSpacing:0.2
            }}>
              Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
