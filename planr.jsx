import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadialBarChart, RadialBar
} from "recharts";

/* ─── Bootstrap ─────────────────────────────────────────── */
const bootstrap = (dark) => {
  if (document.getElementById("planr-fonts")) {
    document.body.style.background = dark ? "#0F0F0F" : "#F7F5F0";
    return;
  }
  const l = document.createElement("link");
  l.id = "planr-fonts";
  l.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{font-family:'Plus Jakarta Sans',sans-serif;transition:background 0.3s}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:#555;border-radius:99px}
    input,select,textarea{font-family:'Plus Jakarta Sans',sans-serif}
    input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
    input[type=date]::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fu{animation:fadeUp 0.38s ease both}
    .fu2{animation:fadeUp 0.38s 0.06s ease both}
    .fu3{animation:fadeUp 0.38s 0.12s ease both}
    .fu4{animation:fadeUp 0.38s 0.18s ease both}
    .fu5{animation:fadeUp 0.38s 0.24s ease both}
    .ch{transition:transform 0.18s,box-shadow 0.18s}
    .ch:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,0.12)!important}
    .press:active{transform:scale(0.96)}
  `;
  document.head.appendChild(s);
  document.body.style.background = dark ? "#0F0F0F" : "#F7F5F0";
};

/* ─── Theme system ───────────────────────────────────────── */
const light = {
  bg:"#F7F5F0", card:"#FFFFFF", card2:"#F4F1EC", bdr:"#E8E3DC", bdr2:"#F0EDE8",
  ink:"#1C1917", ink2:"#292524", muted:"#78716C", lt:"#A8A29E",
  em:"#059669", emL:"#D1FAE5", rose:"#E11D48", roseL:"#FFE4E6",
  amb:"#D97706", ambL:"#FEF3C7", sky:"#0EA5E9", vio:"#7C3AED",
  heroTop:"#1C1917", heroBall:"rgba(255,255,255,0.03)"
};
const dark = {
  bg:"#0F0F0F", card:"#1A1A1A", card2:"#222222", bdr:"#2A2A2A", bdr2:"#222",
  ink:"#F5F0EB", ink2:"#DDD8D2", muted:"#9A9490", lt:"#6A6560",
  em:"#10B981", emL:"#052E16", rose:"#F43F5E", roseL:"#2D0A14",
  amb:"#F59E0B", ambL:"#2D1F00", sky:"#38BDF8", vio:"#A78BFA",
  heroTop:"#1A1A1A", heroBall:"rgba(255,255,255,0.04)"
};

/* ─── Currency ───────────────────────────────────────────── */
const CURRENCIES = {
  NGN:{sym:"₦", name:"Nigerian Naira",      rate:1},
  USD:{sym:"$", name:"US Dollar",           rate:0.00063},
  GBP:{sym:"£", name:"British Pound",       rate:0.00050},
  EUR:{sym:"€", name:"Euro",                rate:0.00058},
  GHS:{sym:"GH₵",name:"Ghanaian Cedi",     rate:0.0096},
  KES:{sym:"KSh",name:"Kenyan Shilling",    rate:0.082},
  ZAR:{sym:"R",  name:"South African Rand", rate:0.012},
  XOF:{sym:"CFA",name:"West African CFA",   rate:0.38},
};

/* ─── Static data ────────────────────────────────────────── */
const CATS = [
  {id:"transport", label:"Transportation", icon:"🚌", color:"#0EA5E9"},
  {id:"foodstuff", label:"Foodstuff",      icon:"🛒", color:"#16A34A"},
  {id:"bread",     label:"Bread",          icon:"🍞", color:"#D97706"},
  {id:"data",      label:"Mobile Data",    icon:"📶", color:"#8B5CF6"},
  {id:"debt",      label:"Debt Repayment", icon:"💳", color:"#E11D48"},
  {id:"feeding",   label:"Eating Out",     icon:"🍽️",  color:"#F97316"},
  {id:"clothing",  label:"Clothing",       icon:"👔", color:"#EC4899"},
  {id:"housing",   label:"Housing/Rent",   icon:"🏠", color:"#6366F1"},
  {id:"health",    label:"Health",         icon:"💊", color:"#14B8A6"},
  {id:"utilities", label:"Utilities",      icon:"⚡", color:"#EAB308"},
  {id:"savings",   label:"Savings",        icon:"💰", color:"#059669"},
  {id:"other",     label:"Other",          icon:"📦", color:"#94A3B8"},
];
const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FM = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const Q1_SEED = [
  {id:"feb-t", category:"transport",amount:42000, type:"expense",date:"2025-02-01",description:"Monthly transport", recurring:true},
  {id:"feb-f", category:"foodstuff",amount:30000, type:"expense",date:"2025-02-01",description:"Foodstuff",         recurring:true},
  {id:"feb-b", category:"bread",    amount:4000,  type:"expense",date:"2025-02-01",description:"Bread ×4 weeks",   recurring:true},
  {id:"feb-d", category:"data",     amount:14000, type:"expense",date:"2025-02-01",description:"Mobile data",      recurring:true},
  {id:"feb-dt",category:"debt",     amount:120000,type:"expense",date:"2025-02-25",description:"Debt cleared"},
  {id:"feb-i", category:"other",    amount:500000,type:"income", date:"2025-02-25",description:"February salary"},
  {id:"mar-t", category:"transport",amount:42000, type:"expense",date:"2025-03-01",description:"Monthly transport", recurring:true},
  {id:"mar-f", category:"foodstuff",amount:30000, type:"expense",date:"2025-03-01",description:"Foodstuff",         recurring:true},
  {id:"mar-b", category:"bread",    amount:4000,  type:"expense",date:"2025-03-01",description:"Bread ×4 weeks",   recurring:true},
  {id:"mar-d", category:"data",     amount:14000, type:"expense",date:"2025-03-01",description:"Mobile data",      recurring:true},
  {id:"mar-i", category:"other",    amount:500000,type:"income", date:"2025-03-25",description:"March salary"},
  {id:"apr-t", category:"transport",amount:42000, type:"expense",date:"2025-04-01",description:"Monthly transport", recurring:true},
  {id:"apr-f", category:"foodstuff",amount:30000, type:"expense",date:"2025-04-01",description:"Foodstuff",         recurring:true},
  {id:"apr-b", category:"bread",    amount:4000,  type:"expense",date:"2025-04-01",description:"Bread ×4 weeks",   recurring:true},
  {id:"apr-d", category:"data",     amount:14000, type:"expense",date:"2025-04-01",description:"Mobile data",      recurring:true},
  {id:"apr-i", category:"other",    amount:500000,type:"income", date:"2025-04-25",description:"April salary"},
];

/* ─── Helpers ────────────────────────────────────────────── */
const uid  = () => Math.random().toString(36).slice(2,10);
const tod  = () => new Date().toISOString().split("T")[0];
const dim  = (m,y) => new Date(y,m+1,0).getDate();
const dom  = () => new Date().getDate();
const getCat = id => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

const useFmt = (currency) => {
  return (n) => {
    const { sym, rate } = CURRENCIES[currency];
    const v = n * rate;
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${sym}${(v/1_000_000).toFixed(2)}M`;
    if (abs >= 1_000)     return `${sym}${(v/1_000).toFixed(1)}K`;
    return `${sym}${v.toLocaleString("en-NG",{maximumFractionDigits:0})}`;
  };
};

/* ─── Primitive components (theme-aware) ─────────────────── */
const Serif = ({ch,size=28,color,italic=false,style={}}) => (
  <span style={{fontFamily:"'Instrument Serif',serif",fontSize:size,color,fontStyle:italic?"italic":"normal",lineHeight:1.15,...style}}>{ch}</span>
);

const PBar = ({pct,color,h=5,bg}) => (
  <div style={{background:bg||"rgba(128,128,128,0.15)",borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",borderRadius:99,
      transition:"width 0.65s cubic-bezier(.22,1,.36,1)",
      background:pct>90?"#E11D48":pct>70?"#D97706":color}}/>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════ */
export default function PlanR() {
  const now = new Date();

  /* ── Persistent state ── */
  const [isDark,    setIsDark]    = useState(false);
  const [currency,  setCurrency]  = useState("NGN");
  const [txns,      setTxns]      = useState([]);
  const [budgets,   setBudgets]   = useState({transport:42000,foodstuff:30000,bread:4000,data:14000});
  const [goals,     setGoals]     = useState([]);
  const [debts,     setDebts]     = useState([]);
  const [bills,     setBills]     = useState([]);
  const [profile,   setProfile]   = useState({name:"",emoji:"😊",income:500000});
  const [loaded,    setLoaded]    = useState(false);
  const [onboarded, setOnboarded] = useState(true);

  /* ── UI state ── */
  const [view,        setView]        = useState("overview");
  const [selM,        setSelM]        = useState(1);
  const [selY,        setSelY]        = useState(2025);
  const [toast,       setToast]       = useState(null);
  const [filterCat,   setFilterCat]   = useState("all");
  const [search,      setSearch]      = useState("");
  const [addTxOpen,   setAddTxOpen]   = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addDebtOpen, setAddDebtOpen] = useState(false);
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [settingsOpen,setSettingsOpen]= useState(false);
  const [payDebtOpen, setPayDebtOpen] = useState(null);
  const [curMenuOpen, setCurMenuOpen] = useState(false);
  const [payAmt,      setPayAmt]      = useState("");

  /* ── Forms ── */
  const [txForm,  setTxForm]  = useState({category:"transport",amount:"",description:"",type:"expense",date:tod(),recurring:false});
  const [goalForm,setGoalForm]= useState({name:"",target:"",saved:"",emoji:"🎯",deadline:""});
  const [debtForm,setDebtForm]= useState({creditor:"",amount:"",paid:"0",dueDate:"",note:""});
  const [billForm,setBillForm]= useState({name:"",amount:"",dueDay:"",category:"utilities",icon:"📋"});
  const [profForm,setProfForm]= useState({name:"",emoji:"😊",income:"500000"});
  const [obName,  setObName]  = useState("");
  const [obIncome,setObIncome]= useState("500000");

  /* ── Theme tokens ── */
  const T = isDark ? dark : light;
  const fmt = useFmt(currency);

  const notify = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2600); };

  /* ── Load ── */
  useEffect(()=>{
    (async()=>{
      try {
        const dk = await window.storage.get("planr4-dark");
        const d  = dk ? JSON.parse(dk.value) : false;
        setIsDark(d); bootstrap(d);

        const cu = await window.storage.get("planr4-currency");
        if (cu) setCurrency(JSON.parse(cu.value));

        const tx = await window.storage.get("planr4-tx");
        setTxns(tx ? JSON.parse(tx.value) : Q1_SEED);
        if (!tx) await window.storage.set("planr4-tx", JSON.stringify(Q1_SEED));

        const g = await window.storage.get("planr4-goals");
        if (g) setGoals(JSON.parse(g.value));

        const dt = await window.storage.get("planr4-debts");
        if (dt) setDebts(JSON.parse(dt.value));

        const bl = await window.storage.get("planr4-bills");
        if (bl) setBills(JSON.parse(bl.value));

        const bu = await window.storage.get("planr4-budgets");
        if (bu) setBudgets(JSON.parse(bu.value));

        const pr = await window.storage.get("planr4-profile");
        if (pr) {
          const p = JSON.parse(pr.value);
          setProfile(p); setProfForm({name:p.name,emoji:p.emoji,income:String(p.income)});
          setOnboarded(!!p.name);
        } else { setOnboarded(false); }
      } catch(e){ setTxns(Q1_SEED); bootstrap(false); }
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{ document.body.style.background = T.bg; },[isDark]);

  /* ── Persist helpers ── */
  const sv  = async(k,v) => { try{ await window.storage.set(k,JSON.stringify(v)); }catch(e){} };
  const sTx = v => { setTxns(v);    sv("planr4-tx",v); };
  const sG  = v => { setGoals(v);   sv("planr4-goals",v); };
  const sDt = v => { setDebts(v);   sv("planr4-debts",v); };
  const sBl = v => { setBills(v);   sv("planr4-bills",v); };
  const sBu = v => { setBudgets(v); sv("planr4-budgets",v); };

  const toggleDark = () => {
    const nd = !isDark; setIsDark(nd); sv("planr4-dark",nd);
    document.body.style.background = nd ? "#0F0F0F" : "#F7F5F0";
  };
  const changeCur = c => { setCurrency(c); sv("planr4-currency",c); setCurMenuOpen(false); };

  /* ── Derived ── */
  const monthTxns = useMemo(()=> txns.filter(t=>{ const d=new Date(t.date); return d.getMonth()===selM&&d.getFullYear()===selY; }),[txns,selM,selY]);
  const expenses  = useMemo(()=> monthTxns.filter(t=>t.type==="expense"),[monthTxns]);
  const incomes   = useMemo(()=> monthTxns.filter(t=>t.type==="income"),[monthTxns]);
  const totalExp  = useMemo(()=> expenses.reduce((s,t)=>s+t.amount,0),[expenses]);
  const totalInc  = useMemo(()=> incomes.reduce((s,t)=>s+t.amount,0),[incomes]);
  const balance   = totalInc - totalExp;
  const savRate   = totalInc>0 ? balance/totalInc : 0;

  const catSpend = useMemo(()=>{
    const m={}; expenses.forEach(t=>{ m[t.category]=(m[t.category]||0)+t.amount; }); return m;
  },[expenses]);

  const trend6 = useMemo(()=>{
    return Array.from({length:6},(_,i)=>{
      const d = new Date(selY,selM-5+i,1);
      const m=d.getMonth(); const y=d.getFullYear();
      const tx=txns.filter(t=>{ const dd=new Date(t.date); return dd.getMonth()===m&&dd.getFullYear()===y; });
      const inc=tx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
      const exp=tx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
      return {month:MN[m],income:inc,expenses:exp,savings:Math.max(inc-exp,0)};
    });
  },[txns,selM,selY]);

  const pieData = useMemo(()=>
    CATS.filter(c=>catSpend[c.id]>0)
      .map(c=>({name:c.label,value:catSpend[c.id],color:c.color}))
      .sort((a,b)=>b.value-a.value),
  [catSpend]);

  const insights = useMemo(()=>{
    const tips=[];
    const prev=txns.filter(t=>{ const d=new Date(t.date); return d.getMonth()===(selM===0?11:selM-1)&&d.getFullYear()===(selM===0?selY-1:selY)&&t.type==="expense"; });
    const prevExp=prev.reduce((s,t)=>s+t.amount,0);
    if(prevExp>0&&totalExp>0){ const diff=totalExp-prevExp; const p=Math.abs(diff/prevExp*100).toFixed(0); if(diff>0) tips.push({icon:"📈",text:`Spending up ${p}% vs last month`,color:T.rose}); else tips.push({icon:"📉",text:`Spending down ${p}% vs last month — great!`,color:T.em}); }
    if(savRate>0.75) tips.push({icon:"🌟",text:`Outstanding! You saved ${(savRate*100).toFixed(0)}% of income.`,color:T.em});
    else if(savRate<0.3&&savRate>0) tips.push({icon:"⚠️",text:`Only ${(savRate*100).toFixed(0)}% saved. Consider cutting top category.`,color:T.amb});
    const top=CATS.filter(c=>catSpend[c.id]>0).sort((a,b)=>catSpend[b.id]-catSpend[a.id])[0];
    if(top) tips.push({icon:top.icon,text:`Biggest spend: ${top.label} — ${fmt(catSpend[top.id])}`,color:top.color});
    const overdueBills=bills.filter(b=>!b.paidMonths?.includes(`${selY}-${selM}`)&&b.dueDay<dom());
    if(overdueBills.length>0) tips.push({icon:"🔔",text:`${overdueBills.length} bill(s) unpaid this month`,color:T.rose});
    return tips.slice(0,4);
  },[monthTxns,totalExp,totalInc,savRate,catSpend,bills,selM,selY,T]);

  /* ── Actions ── */
  const addTxn = () => {
    if(!txForm.amount||isNaN(+txForm.amount)||+txForm.amount<=0){notify("Enter a valid amount","err");return;}
    sTx([{id:uid(),...txForm,amount:+txForm.amount},...txns]);
    setTxForm({category:"transport",amount:"",description:"",type:"expense",date:tod(),recurring:false});
    setAddTxOpen(false); notify(txForm.type==="income"?"Income saved ✓":"Expense saved ✓");
  };
  const addGoal = () => {
    if(!goalForm.name||!goalForm.target){notify("Name & target required","err");return;}
    sG([...goals,{id:uid(),...goalForm,target:+goalForm.target,saved:+goalForm.saved||0}]);
    setGoalForm({name:"",target:"",saved:"",emoji:"🎯",deadline:""}); setAddGoalOpen(false); notify("Goal created ✓");
  };
  const topUpGoal = (gid,amt) => { sG(goals.map(g=>g.id===gid?{...g,saved:Math.min(g.saved+amt,g.target)}:g)); notify(`${fmt(amt)} added to goal ✓`); };
  const addDebt = () => {
    if(!debtForm.creditor||!debtForm.amount){notify("Creditor & amount required","err");return;}
    sDt([...debts,{id:uid(),...debtForm,amount:+debtForm.amount,paid:+debtForm.paid||0}]);
    setDebtForm({creditor:"",amount:"",paid:"0",dueDate:"",note:""}); setAddDebtOpen(false); notify("Debt added ✓");
  };
  const payDebt = () => {
    if(!payAmt||isNaN(+payAmt)){notify("Enter amount","err");return;}
    sDt(debts.map(d=>d.id===payDebtOpen.id?{...d,paid:Math.min(+d.paid+(+payAmt),+d.amount)}:d));
    sTx([{id:uid(),category:"debt",amount:+payAmt,type:"expense",date:tod(),description:`Payment → ${payDebtOpen.creditor}`},...txns]);
    setPayDebtOpen(null); setPayAmt(""); notify("Payment recorded ✓");
  };
  const addBill = () => {
    if(!billForm.name||!billForm.amount||!billForm.dueDay){notify("Fill all fields","err");return;}
    sBl([...bills,{id:uid(),...billForm,amount:+billForm.amount,dueDay:+billForm.dueDay,paidMonths:[]}]);
    setBillForm({name:"",amount:"",dueDay:"",category:"utilities",icon:"📋"}); setAddBillOpen(false); notify("Bill added ✓");
  };
  const toggleBillPaid = (bid) => {
    const key=`${selY}-${selM}`;
    sBl(bills.map(b=>{ if(b.id!==bid) return b; const pm=b.paidMonths||[]; const done=pm.includes(key); return {...b,paidMonths:done?pm.filter(k=>k!==key):[...pm,key]}; }));
  };
  const applyRecurring = () => {
    const seen=new Set(monthTxns.map(t=>t.description+"_"+t.amount));
    const toAdd=[];
    const done=new Set();
    txns.filter(t=>t.recurring).forEach(t=>{ const k=t.description+"_"+t.amount; if(!seen.has(k)&&!done.has(k)){done.add(k);toAdd.push({...t,id:uid(),date:`${selY}-${String(selM+1).padStart(2,"0")}-01`}); } });
    if(!toAdd.length){notify("All recurring items already applied");return;}
    sTx([...toAdd,...txns]); notify(`${toAdd.length} recurring item(s) applied ✓`);
  };
  const delTxn  = id => { sTx(txns.filter(t=>t.id!==id)); notify("Removed"); };
  const delGoal = id => { sG(goals.filter(g=>g.id!==id)); notify("Goal removed"); };
  const delDebt = id => { sDt(debts.filter(d=>d.id!==id)); notify("Debt removed"); };
  const delBill = id => { sBl(bills.filter(b=>b.id!==id)); notify("Bill removed"); };

  const saveProfile = () => {
    const p={name:profForm.name,emoji:profForm.emoji,income:+profForm.income||500000};
    setProfile(p); sv("planr4-profile",p); setSettingsOpen(false); notify("Profile saved ✓");
  };
  const completeOnboarding = () => {
    if(!obName.trim()){notify("Enter your name","err");return;}
    const p={name:obName,emoji:"😊",income:+obIncome||500000};
    setProfile(p); sv("planr4-profile",p); setOnboarded(true); notify(`Welcome, ${obName}! 🎉`);
  };

  const prevM = ()=>{ if(selM===0){setSelM(11);setSelY(y=>y-1);}else setSelM(m=>m-1); };
  const nextM = ()=>{ if(selM===11){setSelM(0);setSelY(y=>y+1);}else setSelM(m=>m+1); };

  /* ─── Shared styled helpers (use T for theme) ── */
  const cardStyle = (extra={}) => ({background:T.card,borderRadius:20,border:`1px solid ${T.bdr}`,boxShadow:isDark?"0 2px 12px rgba(0,0,0,0.4)":"0 2px 10px rgba(0,0,0,0.04)",padding:22,...extra});
  const inputStyle = (extra={}) => ({background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:11,padding:"10px 13px",fontSize:14,color:T.ink,outline:"none",width:"100%",fontFamily:"inherit",...extra});
  const badge = (txt,color,size=10) => (
    <span style={{background:color+"1A",color,borderRadius:99,padding:"3px 9px",fontSize:size,fontWeight:600}}>{txt}</span>
  );
  const pbar = (pct,color,h=5) => <PBar pct={pct} color={color} h={h} bg={isDark?"rgba(255,255,255,0.08)":undefined}/>;
  const tip = ({active,payload,label}) => {
    if(!active||!payload?.length) return null;
    return <div style={{background:T.card,border:`1px solid ${T.bdr}`,borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.15)"}}>
      <p style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>{label}</p>
      {payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:99,background:p.color||p.fill}}/><p style={{fontSize:12,fontWeight:600,color:T.ink}}>{p.name}: {fmt(p.value)}</p></div>)}
    </div>;
  };
  const Tip = tip;

  const btn = (label, onClick, variant="primary", size="md", full=false, extra={}) => {
    const vs = { primary:{background:T.ink,color:T.card,boxShadow:"0 3px 12px rgba(0,0,0,0.14)"}, success:{background:T.em,color:"#fff",boxShadow:"0 3px 12px rgba(16,185,129,0.25)"}, danger:{background:T.rose,color:"#fff"}, ghost:{background:"transparent",color:T.muted,border:`1.5px solid ${T.bdr}`}, amber:{background:T.amb,color:"#fff"}, vio:{background:T.vio,color:"#fff"} };
    const ss = {sm:{padding:"6px 13px",fontSize:12},md:{padding:"10px 18px",fontSize:13},lg:{padding:"13px 24px",fontSize:14}};
    return <button className="press" onClick={onClick} style={{border:"none",cursor:"pointer",borderRadius:11,fontFamily:"inherit",fontWeight:700,transition:"all 0.15s",width:full?"100%":"auto",...vs[variant],...ss[size],...extra}}>{label}</button>;
  };

  const modal = (open, onClose, title, children, maxW=440) => {
    if(!open) return null;
    return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:800,display:"flex",alignItems:"flex-end",backdropFilter:"blur(5px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:T.card,borderRadius:"22px 22px 0 0",padding:"26px 22px 32px",width:"100%",maxWidth:maxW,margin:"0 auto",borderTop:`1px solid ${T.bdr}`,animation:"slideUp 0.26s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <Serif ch={title} size={20} color={T.ink} italic/>
          <button onClick={onClose} style={{background:T.card2,border:"none",color:T.muted,width:30,height:30,borderRadius:99,cursor:"pointer",fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {children}
      </div>
    </div>;
  };

  const field = (label,children) => (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <p style={{fontSize:10,fontWeight:700,color:T.lt,textTransform:"uppercase",letterSpacing:0.9}}>{label}</p>
      {children}
    </div>
  );

  const inp = (value,onChange,placeholder,type="text",extra={}) => (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
      style={inputStyle(extra)}
      onFocus={e=>e.target.style.borderColor=T.em} onBlur={e=>e.target.style.borderColor=T.bdr}/>
  );
  const sel = (value,onChange,opts) => (
    <select value={value} onChange={e=>onChange(e.target.value)} style={inputStyle()}>
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );

  if(!loaded) return (
    <div style={{background:T.bg,height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{width:50,height:50,borderRadius:16,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Serif ch="₦" size={22} color={T.card} italic/>
      </div>
      <p style={{color:T.lt,fontSize:13}}>Loading PlanR…</p>
    </div>
  );

  /* ─── ONBOARDING ─────────────────────────────────────────── */
  if(!onboarded) return (
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{...cardStyle({padding:36,maxWidth:420,width:"100%",textAlign:"center"}),animation:"pop 0.3s ease"}}>
        <div style={{width:60,height:60,borderRadius:18,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
          <Serif ch="₦" size={26} color={T.card} italic/>
        </div>
        <Serif ch="Welcome to PlanR" size={28} color={T.ink} italic style={{display:"block",marginBottom:8}}/>
        <p style={{fontSize:14,color:T.muted,marginBottom:28,lineHeight:1.6}}>Your personal finance companion. Let's set up your profile to get started.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24,textAlign:"left"}}>
          {field("Your Name",inp(obName,setObName,"e.g. Chidi, Amaka…"))}
          {field("Monthly Income (₦)",inp(obIncome,setObIncome,"e.g. 500000","number"))}
          <div style={{display:"flex",gap:8}}>
            {["😊","💪","🌟","🤑","🎯"].map(e=>(
              <button key={e} onClick={()=>{}} style={{flex:1,padding:"10px",fontSize:22,background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:12,cursor:"pointer"}}>{e}</button>
            ))}
          </div>
        </div>
        {btn("Get Started →", completeOnboarding, "primary", "lg", true)}
        <p style={{fontSize:11,color:T.lt,marginTop:12}}>Your data stays on your device only.</p>
      </div>
    </div>
  );

  const TABS = [
    {id:"overview",  icon:"◈",  label:"Home"},
    {id:"plan",      icon:"📅", label:"Q1 Plan"},
    {id:"analytics", icon:"◉",  label:"Analytics"},
    {id:"goals",     icon:"🎯", label:"Goals"},
    {id:"debts",     icon:"💳", label:"Debts"},
    {id:"bills",     icon:"🔔", label:"Bills"},
    {id:"entries",   icon:"↕",  label:"Entries"},
    {id:"budget",    icon:"◎",  label:"Budget"},
  ];

  /* ════════════════════ OVERVIEW ════════════════════ */
  const OverviewView = () => (
    <div>
      {/* Hero */}
      <div className="fu" style={{background:T.heroTop,borderRadius:24,padding:26,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-40,width:200,height:200,borderRadius:"50%",background:T.heroBall}}/>
        <div style={{position:"absolute",bottom:-60,right:40,width:240,height:240,borderRadius:"50%",background:T.heroBall}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>
            {profile.name?`${profile.name}'s Balance`:"Net Balance"} · {FM[selM]} {selY}
          </p>
          <span style={{background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",borderRadius:99,padding:"3px 10px",fontSize:10,fontWeight:700}}>
            {(savRate*100).toFixed(0)}% saved
          </span>
        </div>
        <Serif ch={fmt(balance)} size={44} color="#F5F0EB" style={{display:"block",letterSpacing:-1,marginBottom:20}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[{l:"Income",v:totalInc,c:"#6EE7B7"},{l:"Expenses",v:totalExp,c:"#FDA4AF"}].map(({l,v,c})=>(
            <div key={l}><p style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:600,marginBottom:3}}>{l}</p><p style={{fontSize:19,fontWeight:800,color:c}}>{fmt(v)}</p></div>
          ))}
        </div>
        <div style={{marginTop:18,background:"rgba(255,255,255,0.1)",borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{width:`${Math.min(savRate*100,100)}%`,height:"100%",background:"#6EE7B7",borderRadius:99,transition:"width 0.7s ease"}}/>
        </div>
      </div>

      {/* Stats row */}
      <div className="fu2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
        {[
          {l:"Txns",   v:monthTxns.length+"",     unit:"this month", col:T.sky},
          {l:"Daily",  v:fmt(totalExp/Math.max(dom(),1)), unit:"avg spend",  col:T.amb},
          {l:"Budget", v:Object.values(budgets).length?Math.round(totalExp/Object.values(budgets).reduce((s,b)=>s+b,0)*100)+"%":"—", unit:"used", col:T.rose},
        ].map(({l,v,unit,col})=>(
          <div key={l} className="ch" style={cardStyle({padding:"14px 16px",textAlign:"center"})}>
            <p style={{fontSize:9,fontWeight:700,color:T.lt,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{l}</p>
            <Serif ch={v} size={20} color={col} style={{display:"block"}}/>
            <p style={{fontSize:10,color:T.lt,marginTop:2}}>{unit}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="fu3" style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:12,marginBottom:14}}>
        <div className="ch" style={cardStyle()}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>6-Month Trend</p>
          <ResponsiveContainer width="100%" height={145}>
            <AreaChart data={trend6} margin={{top:4,right:0,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.em} stopOpacity={0.2}/><stop offset="95%" stopColor={T.em} stopOpacity={0}/></linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.rose} stopOpacity={0.12}/><stop offset="95%" stopColor={T.rose} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.bdr2} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:T.lt}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="savings"  name="Savings"  stroke={T.em}   strokeWidth={2.5} fill="url(#gS)"/>
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={T.rose} strokeWidth={2}   fill="url(#gE)" strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="ch" style={cardStyle({display:"flex",flexDirection:"column"})}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:10}}>Split</p>
          {pieData.length===0?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:T.lt,fontSize:12}}>No data</p></div>:(
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value">{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip content={<Tip/>}/></PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexDirection:"column",gap:3,marginTop:4}}>
                {pieData.slice(0,4).map(d=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:6,height:6,borderRadius:99,background:d.color,flexShrink:0}}/>
                    <p style={{fontSize:10,color:T.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p>
                    <p style={{fontSize:10,fontWeight:700,color:T.ink}}>{fmt(d.value)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length>0&&(
        <div className="fu4 ch" style={cardStyle({marginBottom:14,padding:18})}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:12}}>💡 Smart Insights</p>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {insights.map((ins,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:ins.color+"12",borderRadius:12,border:`1px solid ${ins.color}22`}}>
                <span style={{fontSize:17,flexShrink:0}}>{ins.icon}</span>
                <p style={{fontSize:12,color:T.ink,lineHeight:1.4}}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category bars */}
      <div className="fu5 ch" style={cardStyle()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink}}>Category Spending</p>
          {btn("Set Budgets",()=>setView("budget"),"ghost","sm")}
        </div>
        {CATS.filter(c=>catSpend[c.id]>0).sort((a,b)=>catSpend[b.id]-catSpend[a.id]).map((cat,i,arr)=>{
          const spent=catSpend[cat.id]||0; const bdg=budgets[cat.id]; const p=bdg?(spent/bdg)*100:null;
          return (
            <div key={cat.id} style={{padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.bdr2}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:34,height:34,borderRadius:10,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{cat.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:p?5:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:T.ink}}>{cat.label}</p>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>{p>90&&badge("Over",T.rose)}<p style={{fontSize:13,fontWeight:700,color:cat.color}}>{fmt(spent)}</p>{bdg&&<p style={{fontSize:10,color:T.lt}}>/ {fmt(bdg)}</p>}</div>
                  </div>
                  {p!==null&&pbar(p,cat.color)}
                </div>
              </div>
            </div>
          );
        })}
        {!CATS.some(c=>catSpend[c.id]>0)&&<div style={{textAlign:"center",padding:24}}><p style={{color:T.lt,fontSize:13}}>No expenses yet</p><div style={{marginTop:10}}>{btn("Add Entry",()=>setAddTxOpen(true))}</div></div>}
      </div>
    </div>
  );

  /* ════════════════════ Q1 PLAN ════════════════════ */
  const PlanView = () => {
    const months=[{m:1,label:"February",bg:T.ink,debt:120000,savings:290000,sr:58},{m:2,label:"March",bg:"#047857",debt:0,savings:410000,sr:82},{m:3,label:"April",bg:"#4C1D95",debt:0,savings:410000,sr:82}];
    const rows=[["Monthly Income",500000,500000,500000],["Transportation",42000,42000,42000],["Foodstuff",30000,30000,30000],["Bread",4000,4000,4000],["Mobile Data",14000,14000,14000],["Debt Repayment",120000,0,0]];
    const cumul=[290000,700000,1110000];
    return (
      <div>
        <div className="fu" style={{marginBottom:18}}>
          <Serif ch="Q1 Budget Plan" size={26} color={T.ink} italic/>
          <p style={{fontSize:13,color:T.muted,marginTop:3}}>February · March · April 2025</p>
        </div>
        <div className="fu2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {months.map(({m,label,bg,debt,savings,sr})=>(
            <div key={m} onClick={()=>{setSelM(m);setSelY(2025);setView("overview");}} style={{background:bg,borderRadius:18,padding:18,cursor:"pointer",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",bottom:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{label}</p>
              <Serif ch={fmt(savings)} size={24} color="#fff" style={{display:"block",marginBottom:10}}/>
              <span style={{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",borderRadius:99,padding:"3px 9px",fontSize:10,fontWeight:700}}>saved</span>
              {debt>0&&<p style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:8}}>Debt cleared: {fmt(debt)}</p>}
              <div style={{marginTop:10,background:"rgba(255,255,255,0.15)",borderRadius:99,height:3,overflow:"hidden"}}>
                <div style={{width:`${sr}%`,height:"100%",background:"rgba(255,255,255,0.7)",borderRadius:99}}/>
              </div>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.7)",marginTop:4}}>{sr}% savings rate</p>
            </div>
          ))}
        </div>
        <div className="fu3 ch" style={cardStyle({padding:0,overflow:"hidden",marginBottom:14})}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,color:T.ink}}>Side-by-Side Comparison</p></div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <thead>
                <tr>{["Expense","February","March","April"].map((h,i)=>(
                  <td key={h} style={{padding:"11px 16px",fontSize:10,fontWeight:800,color:i===0?T.muted:"#fff",background:i===0?T.card2:[T.ink,"#047857","#4C1D95"][i-1],textAlign:i===0?"left":"right",textTransform:"uppercase",letterSpacing:0.5}}>{h}</td>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map(([lbl,...vals],ri)=>{
                  const isInc=lbl==="Monthly Income"; const isDebt=lbl==="Debt Repayment";
                  const bg=ri%2===0?T.card2:T.card;
                  return <tr key={lbl}><td style={{padding:"10px 16px",fontSize:13,fontWeight:isInc?700:500,color:isInc?T.em:T.ink,background:bg,borderBottom:`1px solid ${T.bdr2}`}}>{lbl}</td>
                    {vals.map((v,j)=><td key={j} style={{padding:"10px 16px",fontSize:13,fontWeight:600,textAlign:"right",color:isInc?T.em:isDebt&&v>0?T.rose:v===0?T.lt:T.ink,background:bg,borderBottom:`1px solid ${T.bdr2}`}}>{v===0?<span style={{color:T.lt}}>—</span>:fmt(v)}</td>)}</tr>;
                })}
                {[{l:"Total Expenses",vs:[210000,90000,90000],col:T.rose},{l:"Net Savings",vs:[290000,410000,410000],col:T.em}].map(({l,vs,col})=>(
                  <tr key={l}><td style={{padding:"12px 16px",fontSize:13,fontWeight:800,color:col,background:col+"10",borderTop:`2px solid ${col}30`}}>{l}</td>{vs.map((v,j)=><td key={j} style={{padding:"12px 16px",fontSize:13,fontWeight:800,textAlign:"right",color:col,background:col+"10",borderTop:`2px solid ${col}30`}}>{fmt(v)}</td>)}</tr>
                ))}
                <tr><td style={{padding:"12px 16px",fontSize:12,fontWeight:700,color:T.muted,background:T.card2}}>Savings Rate</td>{[58,82,82].map((v,j)=><td key={j} style={{padding:"12px 16px",fontSize:13,fontWeight:800,textAlign:"right",color:v>70?T.em:T.amb,background:T.card2}}>{v}%</td>)}</tr>
                <tr><td style={{padding:"12px 16px",fontSize:12,fontWeight:700,color:T.muted,background:T.card}}>Cumulative Savings</td>{cumul.map((v,j)=><td key={j} style={{padding:"12px 16px",fontSize:13,fontWeight:800,textAlign:"right",color:T.em,background:T.card}}>{fmt(v)}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="fu4 ch" style={cardStyle()}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Cumulative Savings Growth</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={[{m:"Feb",v:290000},{m:"Mar",v:700000},{m:"Apr",v:1110000}]} margin={{top:4,right:0,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.bdr2} vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:11,fill:T.lt}} axisLine={false} tickLine={false}/>
              <YAxis hide/><Tooltip content={<Tip/>}/>
              <Bar dataKey="v" name="Savings" radius={[8,8,0,0]} fill={T.em} maxBarSize={50}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  /* ════════════════════ ANALYTICS ════════════════════ */
  const AnalyticsView = () => {
    const score=Math.min(Math.round(savRate*100),100);
    const scoreCol=score>70?T.em:score>40?T.amb:T.rose;
    const barData=CATS.filter(c=>catSpend[c.id]>0).map(c=>({name:c.icon+" "+c.label.split("/")[0].trim(),value:catSpend[c.id],fill:c.color})).sort((a,b)=>b.value-a.value);
    return (
      <div>
        <div className="fu" style={{marginBottom:18}}><Serif ch="Analytics" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>{FM[selM]} {selY}</p></div>
        <div className="fu2 ch" style={cardStyle({marginBottom:12})}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:16}}>Financial Health Score</p>
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            <div style={{position:"relative",width:96,height:96,flexShrink:0}}>
              <ResponsiveContainer width={96} height={96}><RadialBarChart cx={48} cy={48} innerRadius={30} outerRadius={46} data={[{value:score,fill:scoreCol}]} startAngle={90} endAngle={-270}><RadialBar dataKey="value" cornerRadius={6} background={{fill:T.bdr2}}/></RadialBarChart></ResponsiveContainer>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <p style={{fontSize:20,fontWeight:800,color:scoreCol}}>{score}</p>
                <p style={{fontSize:9,color:T.lt,fontWeight:600}}>/ 100</p>
              </div>
            </div>
            <div style={{flex:1}}>
              <p style={{fontSize:16,fontWeight:800,color:scoreCol,marginBottom:6}}>{score>70?"Excellent":score>50?"Good":score>30?"Fair":"Needs Work"}</p>
              {[{l:"Savings Rate",v:`${(savRate*100).toFixed(0)}%`,ok:savRate>0.3},{l:"Active Debts",v:debts.filter(d=>d.paid<d.amount).length===0?"Clear ✓":`${debts.filter(d=>d.paid<d.amount).length} active`,ok:debts.filter(d=>d.paid<d.amount).length===0},{l:"Goals Set",v:goals.length>0?`${goals.length} active`:"None",ok:goals.length>0}].map(({l,v,ok})=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><p style={{fontSize:11,color:T.muted}}>{l}</p><p style={{fontSize:11,fontWeight:700,color:ok?T.em:T.rose}}>{v}</p></div>
              ))}
            </div>
          </div>
        </div>
        <div className="fu3 ch" style={cardStyle({marginBottom:12})}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Income · Expenses · Savings</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={trend6} margin={{top:4,right:0,left:0,bottom:0}} barGap={3}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.bdr2} vertical={false}/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:T.lt}} axisLine={false} tickLine={false}/>
              <YAxis hide/><Tooltip content={<Tip/>}/>
              <Bar dataKey="income"   name="Income"   radius={[5,5,0,0]} fill={T.sky}  maxBarSize={24}/>
              <Bar dataKey="expenses" name="Expenses" radius={[5,5,0,0]} fill={T.rose} maxBarSize={24}/>
              <Bar dataKey="savings"  name="Savings"  radius={[5,5,0,0]} fill={T.em}   maxBarSize={24}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {barData.length>0&&<div className="fu4 ch" style={cardStyle({marginBottom:12})}>
          <p style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:14}}>Spending by Category</p>
          <ResponsiveContainer width="100%" height={Math.max(barData.length*32,120)}>
            <BarChart data={barData} layout="vertical" margin={{top:0,right:10,left:0,bottom:0}}>
              <XAxis type="number" hide/><YAxis type="category" dataKey="name" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} width={115}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="value" name="Spent" radius={[0,6,6,0]} maxBarSize={14}>{barData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>}
        <div className="fu5" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{l:"Avg Daily",v:fmt(totalExp/Math.max(dom(),1)),col:T.amb},{l:"Projected",v:fmt(totalExp/Math.max(dom(),1)*dim(selM,selY)),col:T.sky},{l:"Total Inc",v:fmt(totalInc),col:T.em},{l:"Net Saved",v:fmt(balance),col:balance>=0?T.em:T.rose}].map(({l,v,col})=>(
            <div key={l} className="ch" style={cardStyle({padding:"16px",textAlign:"center"})}><p style={{fontSize:9,fontWeight:700,color:T.lt,textTransform:"uppercase",letterSpacing:0.7,marginBottom:5}}>{l}</p><Serif ch={v} size={18} color={col} style={{display:"block"}}/></div>
          ))}
        </div>
      </div>
    );
  };

  /* ════════════════════ GOALS ════════════════════ */
  const GoalsView = () => (
    <div>
      <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div><Serif ch="Savings Goals" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>{goals.length} goal{goals.length!==1?"s":""} · {goals.filter(g=>g.saved>=g.target).length} completed</p></div>
        {btn("+ New Goal",()=>setAddGoalOpen(true),"success")}
      </div>
      {goals.length===0?(
        <div className="fu2 ch" style={cardStyle({textAlign:"center",padding:"44px 24px"})}>
          <p style={{fontSize:36,marginBottom:12}}>🎯</p>
          <Serif ch="No goals yet" size={18} color={T.muted} italic/>
          <p style={{fontSize:13,color:T.lt,margin:"8px 0 16px"}}>Set a savings goal and track progress month by month.</p>
          {btn("Create First Goal",()=>setAddGoalOpen(true),"success")}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {goals.map((g,i)=>{
            const pct=Math.min((g.saved/g.target)*100,100); const left=g.target-g.saved; const done=g.saved>=g.target;
            return (
              <div key={g.id} className={`fu${Math.min(i+2,5)} ch`} style={cardStyle()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:44,height:44,borderRadius:14,background:done?T.emL:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{done?"✅":g.emoji}</div>
                    <div>
                      <p style={{fontSize:14,fontWeight:700,color:T.ink}}>{g.name}</p>
                      <p style={{fontSize:11,color:T.muted}}>Target: {fmt(g.target)}{g.deadline&&` · Due ${g.deadline}`}</p>
                    </div>
                  </div>
                  <button onClick={()=>delGoal(g.id)} style={{background:"none",border:"none",color:T.lt,cursor:"pointer",fontSize:18}}>×</button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <Serif ch={fmt(g.saved)} size={22} color={done?T.em:T.ink}/>
                  <div style={{textAlign:"right"}}><p style={{fontSize:10,color:T.lt}}>remaining</p><p style={{fontSize:14,fontWeight:700,color:done?T.em:T.rose}}>{done?"Reached!":fmt(left)}</p></div>
                </div>
                {pbar(pct,T.em,7)}
                <p style={{fontSize:10,color:T.lt,marginTop:4,marginBottom:done?0:12}}>{pct.toFixed(0)}% · Target {fmt(g.target)}</p>
                {!done&&<div style={{display:"flex",gap:8}}>{[10000,25000,50000].map(a=><div key={a}>{btn(`+${fmt(a)}`,()=>topUpGoal(g.id,a),"ghost","sm",false,{flex:1})}</div>)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ════════════════════ DEBTS ════════════════════ */
  const DebtsView = () => {
    const totOwed=debts.reduce((s,d)=>s+(d.amount-d.paid),0), totDebt=debts.reduce((s,d)=>s+d.amount,0), totPaid=debts.reduce((s,d)=>s+d.paid,0);
    return (
      <div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div><Serif ch="Debt Tracker" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>{debts.filter(d=>d.paid<d.amount).length} active obligation{debts.filter(d=>d.paid<d.amount).length!==1?"s":""}</p></div>
          {btn("+ Add Debt",()=>setAddDebtOpen(true),"danger")}
        </div>
        {debts.length>0&&(
          <div className="fu2" style={{background:T.rose,borderRadius:20,padding:22,marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Total Outstanding</p>
            <Serif ch={fmt(totOwed)} size={38} color="#fff" style={{display:"block",marginBottom:14}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>Total Debt</p><p style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.85)"}}>{fmt(totDebt)}</p></div>
              <div><p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:2}}>Total Paid</p><p style={{fontSize:16,fontWeight:700,color:"#6EE7B7"}}>{fmt(totPaid)}</p></div>
            </div>
            <div style={{marginTop:14,background:"rgba(255,255,255,0.15)",borderRadius:99,height:4,overflow:"hidden"}}>
              <div style={{width:`${totDebt>0?(totPaid/totDebt)*100:0}%`,height:"100%",background:"#6EE7B7",borderRadius:99,transition:"width 0.7s"}}/>
            </div>
          </div>
        )}
        {debts.length===0?(
          <div className="fu2 ch" style={cardStyle({textAlign:"center",padding:"44px 24px"})}>
            <p style={{fontSize:36,marginBottom:12}}>🎉</p>
            <Serif ch="Debt free!" size={18} color={T.em} italic/>
            <p style={{fontSize:13,color:T.lt,margin:"8px 0 16px"}}>No debts tracked.</p>
            {btn("Add a Debt",()=>setAddDebtOpen(true),"danger")}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {debts.map((d,i)=>{
              const left=d.amount-d.paid; const pct=(d.paid/d.amount)*100; const done=d.paid>=d.amount;
              return (
                <div key={d.id} className={`fu${Math.min(i+3,5)} ch`} style={cardStyle()}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:40,height:40,borderRadius:12,background:done?T.emL:T.roseL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{done?"✅":"💳"}</div>
                      <div><p style={{fontSize:14,fontWeight:700,color:T.ink}}>{d.creditor}</p><p style={{fontSize:11,color:T.muted}}>{d.dueDate?`Due ${d.dueDate}`:"No due date"}{d.note&&` · ${d.note}`}</p></div>
                    </div>
                    <button onClick={()=>delDebt(d.id)} style={{background:"none",border:"none",color:T.lt,cursor:"pointer",fontSize:18}}>×</button>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><p style={{fontSize:10,color:T.lt,marginBottom:2}}>Remaining</p><p style={{fontSize:18,fontWeight:800,color:done?T.em:T.rose}}>{done?"Cleared":fmt(left)}</p></div>
                    <div style={{textAlign:"right"}}><p style={{fontSize:10,color:T.lt,marginBottom:2}}>Paid</p><p style={{fontSize:18,fontWeight:800,color:T.em}}>{fmt(d.paid)}</p></div>
                  </div>
                  {pbar(pct,T.em,6)}
                  <p style={{fontSize:10,color:T.lt,marginTop:4,marginBottom:done?0:12}}>{pct.toFixed(0)}% paid · Total {fmt(d.amount)}</p>
                  {!done&&btn("Make Payment",()=>{setPayDebtOpen(d);setPayAmt("");},"danger","sm")}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════ BILLS ════════════════════ */
  const BillsView = () => {
    const billsUnpaid=bills.filter(b=>!(b.paidMonths||[]).includes(`${selY}-${selM}`));
    const billsPaid  =bills.filter(b=> (b.paidMonths||[]).includes(`${selY}-${selM}`));
    const totalBills =bills.reduce((s,b)=>s+b.amount,0);
    const totalPaidB =billsPaid.reduce((s,b)=>s+b.amount,0);
    const BillRow = ({b}) => {
      const paid=(b.paidMonths||[]).includes(`${selY}-${selM}`);
      const overdue=!paid&&b.dueDay<dom();
      const cat=getCat(b.category);
      return (
        <div className="ch" style={cardStyle({padding:"14px 16px"})}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:paid?T.emL:overdue?T.roseL:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{b.icon||cat.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <p style={{fontSize:13,fontWeight:600,color:paid?T.muted:T.ink,textDecoration:paid?"line-through":"none"}}>{b.name}</p>
                <p style={{fontSize:14,fontWeight:700,color:paid?T.em:overdue?T.rose:T.ink}}>{fmt(b.amount)}</p>
              </div>
              <div style={{display:"flex",gap:8,marginTop:3,alignItems:"center"}}>
                {badge(paid?"Paid":overdue?"Overdue":`Due day ${b.dueDay}`, paid?T.em:overdue?T.rose:T.amb)}
                {badge(cat.label,cat.color)}
              </div>
            </div>
            <button onClick={()=>toggleBillPaid(b.id)} style={{background:paid?T.em:T.card2,border:"none",color:paid?"#fff":T.muted,borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              {paid?"✓ Paid":"Mark Paid"}
            </button>
            <button onClick={()=>delBill(b.id)} style={{background:"none",border:"none",color:T.lt,cursor:"pointer",fontSize:16,marginLeft:4}}>×</button>
          </div>
        </div>
      );
    };
    return (
      <div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
          <div><Serif ch="Bills & Reminders" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>{FM[selM]} {selY}</p></div>
          {btn("+ Add Bill",()=>setAddBillOpen(true),"amber")}
        </div>
        {bills.length>0&&(
          <div className="fu2" style={{background:T.amb,borderRadius:20,padding:20,marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Monthly Bills Summary</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
              {[{l:"Total Bills",v:fmt(totalBills),c:"#fff"},{l:"Paid",v:fmt(totalPaidB),c:"#6EE7B7"},{l:"Remaining",v:fmt(totalBills-totalPaidB),c:"#FDA4AF"}].map(({l,v,c})=>(
                <div key={l}><p style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginBottom:2,fontWeight:600,textTransform:"uppercase"}}>{l}</p><p style={{fontSize:16,fontWeight:700,color:c}}>{v}</p></div>
              ))}
            </div>
            {pbar(bills.length>0?(billsPaid.length/bills.length)*100:0,"#6EE7B7",5)}
            <p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:5}}>{billsPaid.length}/{bills.length} paid this month</p>
          </div>
        )}
        {bills.length===0?(
          <div className="fu2 ch" style={cardStyle({textAlign:"center",padding:"44px 24px"})}>
            <p style={{fontSize:36,marginBottom:12}}>🔔</p>
            <Serif ch="No bills tracked" size={18} color={T.muted} italic/>
            <p style={{fontSize:13,color:T.lt,margin:"8px 0 16px"}}>Add recurring bills to track what's due each month.</p>
            {btn("Add First Bill",()=>setAddBillOpen(true),"amber")}
          </div>
        ):(
          <div>
            {billsUnpaid.length>0&&<>
              <p style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10,marginTop:4}}>Unpaid · {billsUnpaid.length}</p>
              <div className="fu3" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                {billsUnpaid.map(b=><BillRow key={b.id} b={b}/>)}
              </div>
            </>}
            {billsPaid.length>0&&<>
              <p style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Paid · {billsPaid.length}</p>
              <div className="fu4" style={{display:"flex",flexDirection:"column",gap:8}}>
                {billsPaid.map(b=><BillRow key={b.id} b={b}/>)}
              </div>
            </>}
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════ ENTRIES ════════════════════ */
  const EntriesView = () => {
    const filtered=monthTxns.filter(t=>{
      const catOk=filterCat==="all"||t.category===filterCat;
      const sOk=!search||t.description?.toLowerCase().includes(search.toLowerCase())||getCat(t.category).label.toLowerCase().includes(search.toLowerCase());
      return catOk&&sOk;
    });
    const recur=txns.filter(t=>t.recurring);
    return (
      <div>
        <div className="fu" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div><Serif ch="Entries" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>{filtered.length} records · {FM[selM]}</p></div>
          <div style={{display:"flex",gap:8}}>{recur.length>0&&btn("↻ Recurring",applyRecurring,"amber","sm")}{btn("+ Add",()=>setAddTxOpen(true),"primary","sm")}</div>
        </div>
        <div className="fu2" style={{marginBottom:12,position:"relative"}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:T.lt,fontSize:14}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…" style={{...inputStyle(),paddingLeft:36}}/>
        </div>
        <div className="fu3" style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {["all",...[...new Set(monthTxns.map(t=>t.category))]].map(id=>{
            const cat=getCat(id); const active=filterCat===id;
            return <button key={id} onClick={()=>setFilterCat(id)} style={{background:active?T.ink:T.card,color:active?T.card:T.muted,border:`1.5px solid ${active?T.ink:T.bdr}`,borderRadius:99,padding:"5px 13px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.13s"}}>{id==="all"?"All":cat.icon+" "+cat.label}</button>;
          })}
        </div>
        <div className="fu4" style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtered.length===0?<div className="ch" style={cardStyle({textAlign:"center",padding:"36px 20px"})}><p style={{fontSize:28,marginBottom:8}}>📭</p><p style={{fontSize:13,color:T.lt}}>No entries found</p></div>:
            filtered.map(tx=>{
              const cat=getCat(tx.category); const isInc=tx.type==="income";
              return (
                <div key={tx.id} className="ch" style={cardStyle({padding:"13px 16px"})}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:12,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cat.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.description||cat.label}{tx.recurring&&<span style={{fontSize:10,color:T.amb,marginLeft:6}}>↻</span>}</p>
                      <div style={{display:"flex",gap:7,marginTop:3,alignItems:"center"}}>{badge(cat.label,cat.color)}<p style={{fontSize:10,color:T.lt}}>{new Date(tx.date).toLocaleDateString("en-NG",{day:"numeric",month:"short"})}</p></div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontSize:14,fontWeight:700,color:isInc?T.em:T.ink}}>{isInc?"+":"-"}{fmt(tx.amount)}</p>
                      <button onClick={()=>delTxn(tx.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.lt,fontSize:10,padding:0,fontFamily:"inherit"}}>remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  };

  /* ════════════════════ BUDGET ════════════════════ */
  const BudgetView = () => (
    <div>
      <div className="fu" style={{marginBottom:18}}><Serif ch="Budget Limits" size={26} color={T.ink} italic/><p style={{fontSize:13,color:T.muted,marginTop:3}}>Auto-saves as you type</p></div>
      <div className="fu2" style={{display:"flex",flexDirection:"column",gap:10}}>
        {CATS.map(cat=>{
          const spent=catSpend[cat.id]||0; const bdg=budgets[cat.id]||""; const pct=bdg?(spent/bdg)*100:0;
          return (
            <div key={cat.id} className="ch" style={cardStyle({padding:"14px 16px"})}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:11,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cat.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:bdg?5:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:T.ink}}>{cat.label}</p>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>{pct>90&&badge("Over",T.rose)}{spent>0&&<p style={{fontSize:12,fontWeight:700,color:cat.color}}>{fmt(spent)}</p>}{bdg&&<p style={{fontSize:10,color:T.lt}}>/ {fmt(+bdg)}</p>}</div>
                  </div>
                  {!!bdg&&pbar(pct,cat.color)}
                </div>
                <input value={budgets[cat.id]||""} type="number" placeholder="Limit" onChange={e=>{const nb={...budgets};if(!e.target.value)delete nb[cat.id];else nb[cat.id]=+e.target.value;sBu(nb);}}
                  style={{background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:9,padding:"7px 9px",fontSize:12,color:T.ink,outline:"none",width:90,textAlign:"right",fontFamily:"inherit"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div style={{background:T.bg,minHeight:"100vh",color:T.ink}}>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?T.rose:T.ink,color:"#fff",borderRadius:12,padding:"10px 18px",fontSize:13,fontWeight:600,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",animation:"pop 0.18s ease"}}>{toast.msg}</div>}

      {/* ── Header ── */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.bdr}`,position:"sticky",top:0,zIndex:200}}>
        <div style={{maxWidth:780,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,padding:"0 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:T.ink,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Serif ch="₦" size={15} color={T.card} italic/>
            </div>
            <div>
              <Serif ch="PlanR" size={17} color={T.ink} style={{display:"block"}}/>
              <p style={{fontSize:9,fontWeight:600,color:T.lt}}>Budget Tracker</p>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8,background:T.card2,borderRadius:11,padding:"5px 10px",border:`1px solid ${T.bdr}`}}>
            <button onClick={prevM} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:15,lineHeight:1}}>‹</button>
            <p style={{fontSize:12,fontWeight:700,color:T.ink,minWidth:82,textAlign:"center"}}>{FM[selM].slice(0,3)} {selY}</p>
            <button onClick={nextM} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:15,lineHeight:1}}>›</button>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Currency picker */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setCurMenuOpen(o=>!o)} style={{background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:10,padding:"6px 10px",color:T.ink,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {CURRENCIES[currency].sym} {currency}
              </button>
              {curMenuOpen&&<div style={{position:"absolute",right:0,top:"110%",background:T.card,border:`1px solid ${T.bdr}`,borderRadius:14,padding:6,zIndex:600,minWidth:200,boxShadow:"0 16px 48px rgba(0,0,0,0.2)",animation:"pop 0.15s ease"}}>
                {Object.entries(CURRENCIES).map(([code,{sym,name}])=>(
                  <div key={code} onClick={()=>changeCur(code)} style={{padding:"9px 12px",borderRadius:9,cursor:"pointer",display:"flex",justifyContent:"space-between",fontSize:13,background:currency===code?T.em+"18":"transparent",color:currency===code?T.em:T.ink}}>
                    <span>{sym} {name}</span><span style={{color:T.lt,fontSize:11}}>{code}</span>
                  </div>
                ))}
              </div>}
            </div>
            {/* Dark mode */}
            <button onClick={toggleDark} style={{background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>
              {isDark?"☀️":"🌙"}
            </button>
            {/* Profile */}
            <button onClick={()=>{setProfForm({name:profile.name,emoji:profile.emoji,income:String(profile.income)});setSettingsOpen(true);}} style={{background:T.card2,border:`1.5px solid ${T.bdr}`,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>
              {profile.emoji||"👤"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.bdr}`,position:"sticky",top:58,zIndex:199,overflowX:"auto"}}>
        <div style={{maxWidth:780,margin:"0 auto",display:"flex",padding:"0 12px",whiteSpace:"nowrap"}}>
          {TABS.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setView(id)} style={{background:"none",border:"none",borderBottom:view===id?`2.5px solid ${T.ink}`:"2.5px solid transparent",color:view===id?T.ink:T.muted,padding:"12px 11px",fontSize:12,fontWeight:view===id?800:500,cursor:"pointer",fontFamily:"inherit",transition:"all 0.13s",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
              <span style={{fontSize:10}}>{icon}</span>{label}
              {id==="bills"&&bills.filter(b=>!(b.paidMonths||[]).includes(`${selY}-${selM}`)&&b.dueDay<dom()).length>0&&<span style={{background:T.rose,color:"#fff",borderRadius:99,width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{bills.filter(b=>!(b.paidMonths||[]).includes(`${selY}-${selM}`)&&b.dueDay<dom()).length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{maxWidth:780,margin:"0 auto",padding:"20px 16px 110px"}} onClick={()=>curMenuOpen&&setCurMenuOpen(false)}>
        {view==="overview"  && <OverviewView/>}
        {view==="plan"      && <PlanView/>}
        {view==="analytics" && <AnalyticsView/>}
        {view==="goals"     && <GoalsView/>}
        {view==="debts"     && <DebtsView/>}
        {view==="bills"     && <BillsView/>}
        {view==="entries"   && <EntriesView/>}
        {view==="budget"    && <BudgetView/>}
      </div>

      {/* FAB */}
      <button onClick={()=>setAddTxOpen(true)} style={{position:"fixed",bottom:28,right:22,width:52,height:52,borderRadius:16,background:T.ink,border:"none",cursor:"pointer",color:T.card,fontSize:22,boxShadow:`0 6px 24px rgba(0,0,0,${isDark?0.5:0.2})`,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.09)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>+</button>

      {/* ══ MODALS ══ */}

      {/* Add Transaction */}
      {modal(addTxOpen,()=>setAddTxOpen(false),"New Entry",(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16,background:T.card2,borderRadius:12,padding:4}}>
            {["expense","income"].map(t=>(
              <button key={t} onClick={()=>setTxForm(f=>({...f,type:t}))} style={{padding:"9px",border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,transition:"all 0.15s",background:txForm.type===t?(t==="income"?T.em:T.rose):"transparent",color:txForm.type===t?"#fff":T.muted,boxShadow:txForm.type===t?"0 3px 12px rgba(0,0,0,0.13)":"none"}}>{t==="expense"?"💸 Expense":"💵 Income"}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {field("Amount",inp(txForm.amount,v=>setTxForm(f=>({...f,amount:v})),"e.g. 42000","number",{fontSize:22,fontWeight:800,padding:"12px 14px"}))}
            {field("Category",sel(txForm.category,v=>setTxForm(f=>({...f,category:v})),CATS.map(c=>({v:c.id,l:c.icon+" "+c.label}))))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {field("Description",inp(txForm.description,v=>setTxForm(f=>({...f,description:v})),"What for?"))}
              {field("Date",inp(txForm.date,v=>setTxForm(f=>({...f,date:v})),"","date"))}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"9px 12px",background:T.amb+"12",borderRadius:10,border:`1px solid ${T.amb}22`}}>
              <input type="checkbox" checked={txForm.recurring} onChange={e=>setTxForm(f=>({...f,recurring:e.target.checked}))} style={{width:15,height:15,cursor:"pointer",accentColor:T.amb}}/>
              <p style={{fontSize:12,fontWeight:600,color:T.amb}}>↻ Mark as recurring</p>
            </label>
          </div>
          <div style={{marginTop:18}}>{btn("Save Entry",addTxn,"primary","lg",true)}</div>
        </>
      ))}

      {/* Add Goal */}
      {modal(addGoalOpen,()=>setAddGoalOpen(false),"New Savings Goal",(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"54px 1fr",gap:10}}>
            {field("Icon",inp(goalForm.emoji,v=>setGoalForm(f=>({...f,emoji:v})),"🎯","text",{textAlign:"center",fontSize:22,padding:"8px"}))}
            {field("Goal Name",inp(goalForm.name,v=>setGoalForm(f=>({...f,name:v})),"e.g. Emergency Fund"))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {field("Target (₦)",inp(goalForm.target,v=>setGoalForm(f=>({...f,target:v})),"500000","number"))}
            {field("Already Saved (₦)",inp(goalForm.saved,v=>setGoalForm(f=>({...f,saved:v})),"0","number"))}
          </div>
          {field("Target Date (optional)",inp(goalForm.deadline,v=>setGoalForm(f=>({...f,deadline:v})),"","date"))}
          <div style={{marginTop:6}}>{btn("Create Goal",addGoal,"success","lg",true)}</div>
        </div>
      ))}

      {/* Add Debt */}
      {modal(addDebtOpen,()=>setAddDebtOpen(false),"Add Debt",(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {field("Creditor / Who You Owe",inp(debtForm.creditor,v=>setDebtForm(f=>({...f,creditor:v})),"e.g. Uncle Emeka, GTBank Loan"))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {field("Total Amount (₦)",inp(debtForm.amount,v=>setDebtForm(f=>({...f,amount:v})),"120000","number"))}
            {field("Already Paid (₦)",inp(debtForm.paid,v=>setDebtForm(f=>({...f,paid:v})),"0","number"))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {field("Due Date",inp(debtForm.dueDate,v=>setDebtForm(f=>({...f,dueDate:v})),"","date"))}
            {field("Note",inp(debtForm.note,v=>setDebtForm(f=>({...f,note:v})),"Interest, terms…"))}
          </div>
          <div style={{marginTop:6}}>{btn("Add Debt",addDebt,"danger","lg",true)}</div>
        </div>
      ))}

      {/* Add Bill */}
      {modal(addBillOpen,()=>setAddBillOpen(false),"New Bill / Reminder",(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"54px 1fr",gap:10}}>
            {field("Icon",inp(billForm.icon,v=>setBillForm(f=>({...f,icon:v})),"📋","text",{textAlign:"center",fontSize:22,padding:"8px"}))}
            {field("Bill Name",inp(billForm.name,v=>setBillForm(f=>({...f,name:v})),"e.g. DSTV Subscription"))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {field("Amount (₦)",inp(billForm.amount,v=>setBillForm(f=>({...f,amount:v})),"e.g. 8000","number"))}
            {field("Due Day of Month",inp(billForm.dueDay,v=>setBillForm(f=>({...f,dueDay:v})),"e.g. 15","number"))}
          </div>
          {field("Category",sel(billForm.category,v=>setBillForm(f=>({...f,category:v})),CATS.map(c=>({v:c.id,l:c.icon+" "+c.label}))))}
          <div style={{marginTop:6}}>{btn("Add Bill",addBill,"amber","lg",true)}</div>
        </div>
      ))}

      {/* Pay Debt */}
      {modal(!!payDebtOpen,()=>setPayDebtOpen(null),`Pay · ${payDebtOpen?.creditor||""}`,(
        payDebtOpen&&<>
          <div style={{background:T.roseL,borderRadius:12,padding:"12px 16px",marginBottom:16}}><p style={{fontSize:12,fontWeight:700,color:T.rose}}>Outstanding: {fmt(payDebtOpen.amount-payDebtOpen.paid)}</p></div>
          {field("Payment Amount (₦)",inp(payAmt,setPayAmt,"Enter amount","number",{fontSize:20,fontWeight:800,padding:"13px 14px"}))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
            {[10000,25000,payDebtOpen.amount-payDebtOpen.paid].map((a,i)=><div key={i}>{btn(i===2?"Pay All":fmt(a),()=>setPayAmt(String(a)),"ghost","sm",false,{fontSize:11,width:"100%"})}</div>)}
          </div>
          <div style={{marginTop:16}}>{btn("Confirm Payment",payDebt,"success","lg",true)}</div>
        </>
      ))}

      {/* Settings */}
      {modal(settingsOpen,()=>setSettingsOpen(false),"Profile & Settings",(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"54px 1fr",gap:10}}>
            {field("Avatar",inp(profForm.emoji,v=>setProfForm(f=>({...f,emoji:v})),"😊","text",{textAlign:"center",fontSize:22,padding:"8px"}))}
            {field("Your Name",inp(profForm.name,v=>setProfForm(f=>({...f,name:v})),"Your name"))}
          </div>
          {field("Monthly Income (₦)",inp(profForm.income,v=>setProfForm(f=>({...f,income:v})),"500000","number"))}
          <div style={{height:1,background:T.bdr}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:T.card2,borderRadius:12}}>
            <div><p style={{fontSize:13,fontWeight:600,color:T.ink}}>Dark Mode</p><p style={{fontSize:11,color:T.muted}}>Easy on the eyes</p></div>
            <button onClick={toggleDark} style={{background:isDark?T.em:T.bdr2,border:"none",borderRadius:99,width:46,height:26,cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:20,height:20,borderRadius:99,background:"#fff",position:"absolute",top:3,left:isDark?23:3,transition:"left 0.2s",boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>
          <div style={{background:T.roseL,borderRadius:12,padding:"12px 14px"}}>
            <p style={{fontSize:12,fontWeight:700,color:T.rose,marginBottom:4}}>⚠️ Reset All Data</p>
            <p style={{fontSize:11,color:T.rose,marginBottom:8}}>Deletes all transactions, goals and debts. Cannot be undone.</p>
            {btn("Reset to Q1 Defaults",async()=>{
              await window.storage.set("planr4-tx",JSON.stringify(Q1_SEED));
              await window.storage.set("planr4-goals",JSON.stringify([]));
              await window.storage.set("planr4-debts",JSON.stringify([]));
              await window.storage.set("planr4-bills",JSON.stringify([]));
              setTxns(Q1_SEED); setGoals([]); setDebts([]); setBills([]);
              setSettingsOpen(false); notify("Reset to defaults");
            },"danger","sm")}
          </div>
          <div style={{marginTop:4}}>{btn("Save Profile",saveProfile,"primary","lg",true)}</div>
        </div>
      ))}

    </div>
  );
}
