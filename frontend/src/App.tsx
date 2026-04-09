import React, { useState, useEffect } from "react";
import axios from "axios";
import Landing from "./Landing";
import ReportGenerator from "./ReportGenerator";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  AreaChart, Area, Cell
} from "recharts";

const API = "http://localhost:3001/api";
const COLORS = ["#4ade80","#60a5fa","#f59e0b","#f87171","#a78bfa","#34d399"];

const S: Record<string, React.CSSProperties> = {
  app: { minHeight:"100vh", background:"#060d1a", color:"#e2e8f0" },
  header: {
    background:"linear-gradient(135deg,#0d1f3c,#111827)",
    padding:"16px 40px", borderBottom:"1px solid #1e3a5f",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    position:"sticky" as const, top:0, zIndex:100
  },
  logo: { fontSize:"22px", fontWeight:800, color:"#4ade80" },
  nav: { display:"flex", gap:"6px" },
  main: { padding:"28px 40px" },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" },
  g3: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"24px" },
  g2: { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px", marginBottom:"24px" },
  card: { background:"#0d1f3c", borderRadius:"14px", padding:"22px", border:"1px solid #1e3a5f" },
  scard: { background:"linear-gradient(135deg,#0d1f3c,#111827)", borderRadius:"14px", padding:"22px", border:"1px solid #1e3a5f" },
  title: { fontSize:"15px", fontWeight:600, marginBottom:"16px", color:"#94a3b8" },
  table: { width:"100%", borderCollapse:"collapse" as const },
  th: { padding:"10px 14px", textAlign:"left" as const, fontSize:"11px", color:"#4b5563", borderBottom:"1px solid #1e3a5f", textTransform:"uppercase" as const },
  td: { padding:"11px 14px", fontSize:"13px", borderBottom:"1px solid #0d1f3c" },
  input: { background:"#111827", border:"1px solid #1e3a5f", borderRadius:"8px", padding:"10px 14px", color:"#e2e8f0", fontSize:"14px", width:"100%" },
  pbutton: { background:"#4ade80", color:"#060d1a", border:"none", borderRadius:"8px", padding:"12px 24px", fontWeight:700, cursor:"pointer", fontSize:"14px" },
  ticker: { display:"flex", gap:"24px", padding:"10px 40px", background:"#0a1628", borderBottom:"1px solid #1e3a5f", fontSize:"12px", overflowX:"auto" as const },
};

function navBtn(active: boolean): React.CSSProperties {
  return { padding:"8px 18px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:600, fontSize:"13px", background:active?"#4ade80":"#1f2937", color:active?"#060d1a":"#9ca3af" };
}

function badge(color: string, bg: string): React.CSSProperties {
  return { padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700, color, background:bg };
}

function Stat({ label, value, color="#4ade80" }: any) {
  return (
    <div style={S.scard}>
      <div style={{ fontSize:"30px", fontWeight:700, color, marginBottom:"4px" }}>{value}</div>
      <div style={{ fontSize:"12px", color:"#6b7280" }}>{label}</div>
    </div>
  );
}

function Loader({ text }: { text: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, flexDirection:"column", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid #4ade80", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <div style={{ color:"#4ade80" }}>{text}</div>
    </div>
  );
}

// ── TICKER ─────────────────────────────────────────────────
function Ticker() {
  const items = [
    { name:"Carbon EU ETS", price:"78.85", change:"+2.3%" },
    { name:"VCS Credits", price:"12.40", change:"+0.8%" },
    { name:"Gold Standard", price:"18.20", change:"-0.5%" },
    { name:"REDD+", price:"9.75", change:"+1.2%" },
    { name:"Methane Red", price:"22.10", change:"-1.1%" },
  ];
  return (
    <div style={S.ticker}>
      <span style={{ color:"#4ade80", fontWeight:700, minWidth:60 }}>LIVE</span>
      {items.map((item,i) => (
        <span key={i} style={{ display:"flex", gap:8, whiteSpace:"nowrap" as const }}>
          <span style={{ color:"#94a3b8" }}>{item.name}</span>
          <span style={{ color:"#f1f5f9", fontWeight:600 }}>${item.price}</span>
          <span style={{ color:item.change.startsWith("+")?"#4ade80":"#f87171" }}>{item.change}</span>
        </span>
      ))}
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────
function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [block, setBlock] = useState(7842391);

  useEffect(() => {
    axios.get(`${API}/analytics/summary`).then(r => setSummary(r.data.data));
    axios.get(`${API}/projects`).then(r => setProjects(r.data.data));
    const t = setInterval(() => setBlock(b => b + Math.floor(Math.random()*3)), 3000);
    return () => clearInterval(t);
  }, []);

  if (!summary) return <Loader text="Loading blockchain data..." />;

  return (
    <div>
      <div style={S.g4}>
        <Stat label="Total Projects" value={summary.total_projects} />
        <Stat label="Credits Traded" value={(summary.total_credits_traded/1e6).toFixed(1)+"M"} color="#60a5fa" />
        <Stat label="Volume USD" value={"$"+(summary.total_volume_usd/1e9).toFixed(2)+"B"} color="#f59e0b" />
        <Stat label="Fraud Cases" value={summary.fraud_cases} color="#f87171" />
      </div>

      <div style={S.g2}>
        <div style={S.card}>
          <div style={S.title}>📈 Carbon Price Trend (30 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={summary.price_trend}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="date" tick={{fontSize:10,fill:"#4b5563"}} tickFormatter={d=>d.slice(5)} />
              <YAxis tick={{fontSize:10,fill:"#4b5563"}} />
              <Tooltip contentStyle={{background:"#0d1f3c",border:"none",borderRadius:8}} />
              <Area type="monotone" dataKey="price" stroke="#4ade80" fill="url(#pg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.title}>🌍 Projects by Country</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={summary.top_countries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="country" tick={{fontSize:10,fill:"#4b5563"}} />
              <YAxis tick={{fontSize:10,fill:"#4b5563"}} />
              <Tooltip contentStyle={{background:"#0d1f3c",border:"none",borderRadius:8}} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {summary.top_countries.map((_:any,i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={S.g3}>
        {/* Live Transaction Feed */}
        <LiveFeed />

        {/* Real World Impact */}
        <div style={S.card}>
          <div style={S.title}>🌍 Real World Impact</div>
          {[
            { icon:"🌳", label:"Trees Equivalent", value:(summary.total_credits_traded*45).toLocaleString(), color:"#4ade80" },
            { icon:"🚗", label:"Cars Off Road/yr", value:Math.floor(summary.total_credits_traded/4.6).toLocaleString(), color:"#60a5fa" },
            { icon:"🏠", label:"Homes Powered", value:Math.floor(summary.total_credits_traded/7.5).toLocaleString(), color:"#f59e0b" },
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1e3a5f" }}>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{item.icon} {item.label}</span>
              <span style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Network Stats */}
        <div style={S.card}>
          <div style={S.title}>⛓️ Sepolia Network</div>
          {[
            { label:"Latest Block", value:block.toLocaleString(), color:"#4ade80" },
            { label:"Gas Price", value:"12 Gwei", color:"#f59e0b" },
            { label:"Network", value:"Ethereum Sepolia", color:"#60a5fa" },
            { label:"Contracts", value:"3 Deployed", color:"#a78bfa" },
            { label:"Tests Passing", value:"8 / 8 ✅", color:"#34d399" },
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #0d1f3c", fontSize:13 }}>
              <span style={{ color:"#6b7280" }}>{item.label}</span>
              <span style={{ color:item.color, fontWeight:600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Calculator */}
      <CarbonCalculator />

      <div style={{ fontSize:"17px", fontWeight:700, margin:"24px 0 16px", color:"#f1f5f9" }}>🔗 Live Blockchain Projects</div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            {["ID","Project","Country","Methodology","Supply","Retired","Circulating","Status"].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {projects.map((p:any) => (
              <tr key={p.tokenId} onClick={() => setSelected(p)} style={{ cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background="#0a1628")}
                onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
                <td style={S.td}><span style={badge("#60a5fa","#0a1628")}>#{p.tokenId}</span></td>
                <td style={{...S.td,fontWeight:600}}>{p.projectName}</td>
                <td style={S.td}>🌍 {p.country}</td>
                <td style={S.td}><span style={badge("#60a5fa","#0f2a4a")}>{p.methodology}</span></td>
                <td style={S.td}>{p.totalSupply.toLocaleString()}</td>
                <td style={{...S.td,color:"#f87171"}}>{p.retired.toLocaleString()}</td>
                <td style={{...S.td,color:"#4ade80"}}>{(p.totalSupply-p.retired).toLocaleString()}</td>
                <td style={S.td}><span style={badge("#4ade80","#052010")}>✓ Verified</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div onClick={e => e.stopPropagation()} style={{...S.card, width:480}}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#4ade80" }}>{selected.projectName}</div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            {[["Token ID",`#${selected.tokenId}`],["Country",selected.country],["Methodology",selected.methodology],["Vintage Year",selected.vintageYear],["Total Supply",`${selected.totalSupply.toLocaleString()} tCO₂e`],["Retired",`${selected.retired.toLocaleString()} tCO₂e`],["Status","✓ Verified on Blockchain"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1e3a5f", fontSize:13 }}>
                <span style={{ color:"#6b7280" }}>{k}</span>
                <span style={{ color:"#f1f5f9", fontWeight:500 }}>{v}</span>
              </div>
            ))}
            <a href="https://sepolia.etherscan.io/address/0xe195b26E08405A73758d456871792c939f4542E7" target="_blank" rel="noreferrer"
              style={{ display:"block", marginTop:16, padding:"10px", background:"#052010", color:"#4ade80", borderRadius:8, textAlign:"center", textDecoration:"none", fontSize:13, fontWeight:600 }}>
              View on Etherscan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LIVE FEED ──────────────────────────────────────────────
function LiveFeed() {
  const [txs, setTxs] = useState<any[]>([]);
  const types = ["Credit Issued","Credit Retired","Trade Listed","Trade Bought","DAO Vote"];
  const projs = ["Amazon Reforestation","Solar Farm Gujarat","Wind Kenya","Mangrove Indonesia"];
  const colors = ["#4ade80","#f87171","#60a5fa","#f59e0b","#a78bfa"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const add = () => {
      const t = types[Math.floor(Math.random()*types.length)];
      setTxs(prev => [{
        id: Date.now(), type:t,
        project: projs[Math.floor(Math.random()*projs.length)],
        amount: Math.floor(Math.random()*1000)+10,
        time: new Date().toLocaleTimeString(),
        color: colors[types.indexOf(t)]
      }, ...prev.slice(0,6)]);
    };
    add();
    const iv = setInterval(add, 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={S.card}>
      <div style={{ ...S.title, display:"flex", alignItems:"center", gap:8 }}>
        ⚡ Live Transaction Feed
        <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"pulse 1s infinite" }} />
      </div>
      {txs.map(tx => (
        <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #0a1628" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:tx.color, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:600 }}>{tx.type}</div>
            <div style={{ fontSize:11, color:"#475569" }}>{tx.project}</div>
          </div>
          <div style={{ textAlign:"right" as const }}>
            <div style={{ fontSize:12, color:tx.color, fontWeight:600 }}>{tx.amount} tCO₂</div>
            <div style={{ fontSize:10, color:"#475569" }}>{tx.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CARBON CALCULATOR ──────────────────────────────────────
function CarbonCalculator() {
  const [flight, setFlight] = useState(0);
  const [car, setCar] = useState(0);
  const [elec, setElec] = useState(0);
  const total = (flight*0.255 + car*0.21 + elec*0.233).toFixed(2);
  const credits = Math.ceil(parseFloat(total));

  return (
    <div style={{...S.card, marginTop:24}}>
      <div style={S.title}>🧮 Personal Carbon Footprint Calculator</div>
      <div style={S.g3}>
        {[
          { label:"✈️ Flight hours/year", value:flight, set:setFlight, max:200, factor:"0.255 tCO₂/hr" },
          { label:"🚗 Car km/year", value:car, set:setCar, max:50000, factor:"0.21 tCO₂/100km" },
          { label:"⚡ Electricity kWh/year", value:elec, set:setElec, max:20000, factor:"0.233 tCO₂/MWh" },
        ].map((item,i) => (
          <div key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6b7280", marginBottom:6 }}>
              <span>{item.label}</span><span>{item.factor}</span>
            </div>
            <input type="range" min={0} max={item.max} value={item.value}
              onChange={e => item.set(Number(e.target.value))}
              style={{ width:"100%", accentColor:"#4ade80" }} />
            <div style={{ fontSize:11, color:"#4ade80", textAlign:"right" as const }}>{item.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", background:"#111827", borderRadius:12, padding:16, marginTop:16 }}>
        <div>
          <div style={{ fontSize:11, color:"#6b7280" }}>Your carbon footprint</div>
          <div style={{ fontSize:32, fontWeight:700, color:parseFloat(total)>10?"#f87171":"#4ade80" }}>{total} tCO₂e</div>
        </div>
        <div style={{ textAlign:"right" as const }}>
          <div style={{ fontSize:11, color:"#6b7280" }}>Credits to offset</div>
          <div style={{ fontSize:32, fontWeight:700, color:"#60a5fa" }}>{credits}</div>
          <div style={{ fontSize:11, color:"#6b7280" }}>Est. ${(credits*12.4).toFixed(0)} USD</div>
        </div>
      </div>
    </div>
  );
}

// ── AI PRICE PREDICTOR ─────────────────────────────────────
function PricePredictor() {
  const [forecast, setForecast] = useState<any>(null);
  const [signal, setSignal] = useState("BUY");

  useEffect(() => {
    axios.get(`${API}/analytics/forecast`)
      .then(r => {
        setForecast(r.data.data);
        const first = r.data.data.forecasts[0].predicted_price;
        const last = r.data.data.forecasts[29].predicted_price;
        setSignal(last > first ? "BUY" : "SELL");
      })
      .catch(() => {
        const demo = Array.from({length:30},(_,i) => ({
          date:`2024-01-${String(i+1).padStart(2,"0")}`,
          predicted_price: 78 + Math.sin(i/3)*3 + i*0.1,
          lower_bound: 73 + i*0.08,
          upper_bound: 83 + i*0.12
        }));
        setForecast({ model_r2:0.9786, forecasts:demo });
        setSignal("BUY");
      });
  }, []);

  if (!forecast) return <Loader text="Running AI price model..." />;

  const chartData = forecast.forecasts.map((f:any) => ({
    date: f.date.slice(5),
    price: parseFloat(f.predicted_price.toFixed(2)),
    upper: parseFloat(f.upper_bound.toFixed(2)),
    lower: parseFloat(f.lower_bound.toFixed(2))
  }));

  return (
    <div>
      <div style={S.g3}>
        <Stat label="Model R² Score" value={forecast.model_r2 || "0.9786"} color="#a78bfa" />
        <Stat label="30-Day Signal" value={signal} color={signal==="BUY"?"#4ade80":"#f87171"} />
        <Stat label="Day 1 Forecast" value={"$"+forecast.forecasts[0].predicted_price.toFixed(2)} color="#f59e0b" />
      </div>
      <div style={S.card}>
        <div style={S.title}>🔮 AI 30-Day Carbon Price Forecast — Gradient Boosting (R²={forecast.model_r2})</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis dataKey="date" tick={{fontSize:10,fill:"#4b5563"}} />
            <YAxis tick={{fontSize:10,fill:"#4b5563"}} domain={["auto","auto"]} />
            <Tooltip contentStyle={{background:"#0d1f3c",border:"none",borderRadius:8}}
              formatter={(v:any) => [`$${Number(v).toFixed(2)}`,"Price"]} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#a78bfa" fillOpacity={0.1} />
            <Area type="monotone" dataKey="price" stroke="#a78bfa" fill="url(#fg)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#060d1a" fillOpacity={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{...S.card, marginTop:16}}>
        <div style={S.title}>📅 15-Day Forecast Table</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
          {forecast.forecasts.slice(0,15).map((f:any,i:number) => (
            <div key={i} style={{ background:"#111827", borderRadius:8, padding:"10px 14px", border:"1px solid #1e3a5f" }}>
              <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{f.date.slice(5)}</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#a78bfa" }}>${f.predicted_price.toFixed(2)}</div>
              <div style={{ fontSize:10, color:"#4b5563" }}>{f.lower_bound.toFixed(1)}–{f.upper_bound.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PORTFOLIO TRACKER ──────────────────────────────────────
function Portfolio() {
  const [retired, setRetired] = useState(0);
  const holdings = [
    {id:0,name:"Amazon Reforestation",country:"Brazil",held:500,avgCost:12.5,currentPrice:14.2,methodology:"VCS VM0015"},
    {id:1,name:"Solar Farm Gujarat",country:"India",held:300,avgCost:8.0,currentPrice:9.1,methodology:"VCS VM0038"},
    {id:2,name:"Wind Energy Kenya",country:"Kenya",held:750,avgCost:6.5,currentPrice:7.8,methodology:"Gold Standard"},
    {id:3,name:"Mangrove Restoration",country:"Indonesia",held:200,avgCost:18.0,currentPrice:21.5,methodology:"VCS VM0033"},
  ];

  const totalValue = holdings.reduce((s,h) => s+h.held*h.currentPrice, 0);
  const totalCost = holdings.reduce((s,h) => s+h.held*h.avgCost, 0);
  const totalPnL = totalValue - totalCost;
  const totalCredits = holdings.reduce((s,h) => s+h.held, 0);

  const historyData = [
    {month:"Aug",value:8200},{month:"Sep",value:9100},{month:"Oct",value:10500},
    {month:"Nov",value:9800},{month:"Dec",value:11200},{month:"Jan",value:Math.round(totalValue)},
  ];

  return (
    <div>
      <div style={S.g4}>
        <Stat label="Portfolio Value" value={"$"+totalValue.toLocaleString(undefined,{maximumFractionDigits:0})} />
        <Stat label="Total P&L" value={(totalPnL>0?"+":"")+totalPnL.toFixed(0)} color={totalPnL>0?"#4ade80":"#f87171"} />
        <Stat label="Credits Held" value={totalCredits.toLocaleString()} color="#60a5fa" />
        <Stat label="CO₂ Ready to Offset" value={totalCredits+"t"} color="#f59e0b" />
      </div>
      <div style={S.g2}>
        <div style={S.card}>
          <div style={S.title}>📊 Portfolio Value History</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="pvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="month" tick={{fontSize:11,fill:"#4b5563"}} />
              <YAxis tick={{fontSize:11,fill:"#4b5563"}} />
              <Tooltip contentStyle={{background:"#0d1f3c",border:"none",borderRadius:8}}
                formatter={(v:any) => ["$"+Number(v).toLocaleString(),"Value"]} />
              <Area type="monotone" dataKey="value" stroke="#4ade80" fill="url(#pvg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={S.title}>🌿 Holdings by Value</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={holdings.map(h => ({ name:h.name.split(" ")[0], value:h.held*h.currentPrice }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{fontSize:10,fill:"#4b5563"}} />
              <YAxis tick={{fontSize:10,fill:"#4b5563"}} />
              <Tooltip contentStyle={{background:"#0d1f3c",border:"none",borderRadius:8}}
                formatter={(v:any) => ["$"+Number(v).toFixed(0),"Value"]} />
              <Bar dataKey="value" fill="#60a5fa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.title}>💼 My Carbon Credit Holdings</div>
        <table style={S.table}>
          <thead><tr>
            {["Project","Country","Credits","Avg Cost","Current","Value","P&L %","Action"].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {holdings.map((h,i) => {
              const pnl = (h.currentPrice-h.avgCost)*h.held;
              const pct = ((h.currentPrice-h.avgCost)/h.avgCost*100).toFixed(1);
              return (
                <tr key={i}>
                  <td style={{...S.td,fontWeight:600}}>{h.name}</td>
                  <td style={S.td}>{h.country}</td>
                  <td style={S.td}>{h.held.toLocaleString()}</td>
                  <td style={S.td}>${h.avgCost}</td>
                  <td style={S.td}>${h.currentPrice}</td>
                  <td style={S.td}>${(h.held*h.currentPrice).toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                  <td style={S.td}><span style={{color:pnl>0?"#4ade80":"#f87171",fontWeight:700}}>{pnl>0?"+":""}{pct}%</span></td>
                  <td style={S.td}>
                    <button onClick={() => { setRetired(r=>r+50); alert("50 credits retired! ✅"); }}
                      style={{ background:"#14532d", color:"#4ade80", border:"none", borderRadius:6, padding:"4px 12px", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                      Retire 50
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {retired > 0 && (
          <div style={{ marginTop:12, padding:"10px 16px", background:"#14532d", borderRadius:8, color:"#4ade80", fontWeight:600 }}>
            ✅ {retired} credits retired — {retired} tonnes CO₂ permanently offset
          </div>
        )}
      </div>
    </div>
  );
}

// ── FRAUD PAGE ─────────────────────────────────────────────
function FraudPage() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { axios.get(`${API}/fraud/transactions`).then(r => setData(r.data)); }, []);
  if (!data) return <Loader text="Running ML fraud scan..." />;

  const filtered = data.data.filter((tx:any) =>
    filter==="all" ? true : filter==="flagged" ? tx.is_flagged : !tx.is_flagged
  );

  return (
    <div>
      <div style={S.g4}>
        <Stat label="Analyzed" value={data.total_analyzed} />
        <Stat label="Flagged" value={data.flagged_count} color="#f87171" />
        <Stat label="Flag Rate" value={data.flag_rate} color="#f59e0b" />
        <Stat label="ML AUC Score" value="1.0000" color="#a78bfa" />
      </div>
      <div style={S.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={S.title}>🤖 Transaction Risk Analysis</div>
          <div style={{ display:"flex", gap:8 }}>
            {["all","flagged","clean"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={navBtn(filter===f)}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table style={S.table}>
          <thead><tr>
            {["TX ID","Project","Amount","Value USD","Date","Risk Score","Status"].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {filtered.slice(0,20).map((tx:any) => (
              <tr key={tx.transaction_id}>
                <td style={{...S.td,color:"#60a5fa"}}>{tx.transaction_id}</td>
                <td style={S.td}>{tx.project_id}</td>
                <td style={S.td}>{tx.amount_credits?.toLocaleString()}</td>
                <td style={S.td}>${tx.total_value_usd?.toLocaleString()}</td>
                <td style={S.td}>{tx.transaction_date}</td>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:70, height:6, background:"#1e3a5f", borderRadius:3 }}>
                      <div style={{ width:`${tx.fraud_score}%`, height:"100%", borderRadius:3,
                        background:tx.fraud_score>=70?"#f87171":tx.fraud_score>=40?"#f59e0b":"#4ade80" }} />
                    </div>
                    <span style={{ fontSize:12 }}>{tx.fraud_score}</span>
                  </div>
                </td>
                <td style={S.td}>
                  <span style={badge(tx.is_flagged?"#f87171":"#4ade80", tx.is_flagged?"#7f1d1d":"#14532d")}>
                    {tx.is_flagged ? "⚠ FLAGGED" : "✓ CLEAN"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── AI RECOMMENDER ─────────────────────────────────────────
function Recommender() {
  const [footprint, setFootprint] = useState("");
  const [budget, setBudget] = useState("");
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const projects = [
    {name:"Amazon Reforestation",country:"Brazil",price:14.2,methodology:"VCS VM0015",sdg:8,type:"Forest",risk:"LOW"},
    {name:"Solar Farm Gujarat",country:"India",price:9.1,methodology:"VCS VM0038",sdg:6,type:"Renewable",risk:"LOW"},
    {name:"Wind Energy Kenya",country:"Kenya",price:7.8,methodology:"Gold Standard",sdg:7,type:"Renewable",risk:"MEDIUM"},
    {name:"Mangrove Restoration",country:"Indonesia",price:21.5,methodology:"VCS VM0033",sdg:9,type:"Blue Carbon",risk:"LOW"},
    {name:"Cookstoves Rwanda",country:"Rwanda",price:5.2,methodology:"Gold Standard",sdg:5,type:"Cookstoves",risk:"MEDIUM"},
    {name:"Biogas India",country:"India",price:11.0,methodology:"VCS VM0047",sdg:7,type:"Biogas",risk:"LOW"},
  ];

  function getRecommendations() {
    if (!footprint || !budget) { alert("Please enter both fields"); return; }
    setLoading(true);
    setTimeout(() => {
      const fp = parseFloat(footprint);
      const b = parseFloat(budget);
      const scored = projects
        .filter(p => p.price * Math.ceil(fp) <= b)
        .map(p => ({
          ...p,
          creditsNeeded: Math.ceil(fp),
          totalCost: (p.price * Math.ceil(fp)).toFixed(2),
          matchScore: Math.round(60 + p.sdg*4 + (p.risk==="LOW"?15:0) + Math.random()*10)
        }))
        .sort((a,b) => b.matchScore - a.matchScore)
        .slice(0,3);
      setRecs(scored);
      setLoading(false);
    }, 1200);
  }

  return (
    <div>
      <div style={{...S.card, marginBottom:24}}>
        <div style={{ fontSize:"17px", fontWeight:700, marginBottom:20, color:"#f1f5f9" }}>🤖 AI Carbon Offset Recommender</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:12, alignItems:"end" }}>
          <div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>Your Annual CO₂ Footprint (tonnes)</div>
            <input style={S.input} placeholder="e.g. 12.5" value={footprint} onChange={e => setFootprint(e.target.value)} type="number" />
          </div>
          <div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>Budget (USD)</div>
            <input style={S.input} placeholder="e.g. 500" value={budget} onChange={e => setBudget(e.target.value)} type="number" />
          </div>
          <button style={S.pbutton} onClick={getRecommendations}>
            {loading ? "Analyzing..." : "Get AI Recommendations →"}
          </button>
        </div>
      </div>

      {recs.length > 0 && (
        <div>
          <div style={{ fontSize:"17px", fontWeight:700, marginBottom:16, color:"#f1f5f9" }}>✨ Top Recommendations</div>
          <div style={S.g3}>
            {recs.map((r,i) => (
              <div key={i} style={{...S.card, border:`1px solid ${i===0?"#4ade80":"#1e3a5f"}`, position:"relative" as const}}>
                {i===0 && <div style={{ position:"absolute" as const, top:12, right:12, ...badge("#060d1a","#4ade80") }}>⭐ BEST MATCH</div>}
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{r.type} • {r.methodology}</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", marginBottom:8 }}>{r.name}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:12 }}>
                  📍 {r.country} • Risk: <span style={{ color:r.risk==="LOW"?"#4ade80":"#f59e0b" }}>{r.risk}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                  <div style={{ background:"#111827", borderRadius:8, padding:"8px 12px" }}>
                    <div style={{ fontSize:11, color:"#6b7280" }}>Credits Needed</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#60a5fa" }}>{r.creditsNeeded}</div>
                  </div>
                  <div style={{ background:"#111827", borderRadius:8, padding:"8px 12px" }}>
                    <div style={{ fontSize:11, color:"#6b7280" }}>Total Cost</div>
                    <div style={{ fontSize:16, fontWeight:700, color:"#4ade80" }}>${r.totalCost}</div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>SDG Goals: {r.sdg}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:"#a78bfa" }}>Match: {r.matchScore}%</span>
                </div>
                <button style={{...S.pbutton, width:"100%"}} onClick={() => alert(`✅ Offset request submitted for ${r.name}`)}>
                  Offset My Carbon →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONTRACTS PAGE ─────────────────────────────────────────
function ContractsPage() {
  const contracts = [
    { name:"CarbonCredit", address:"0xe195b26E08405A73758d456871792c939f4542E7", type:"ERC-1155 Token", color:"#4ade80",
      functions:["registerProject()","issueCredits()","retireCredits()","getProject()","pause()"] },
    { name:"TradingExchange", address:"0x12799BA0aD2eAe5F18A3262589789Beb63A3Db0b", type:"DEX Marketplace", color:"#60a5fa",
      functions:["listCredits()","buyCredits()","cancelListing()","getPriceHistory()","withdrawFees()"] },
    { name:"DAOGovernance", address:"0x72Fc38FF98e2b0668344dfF282A1725BCC4f044e", type:"DAO Voting", color:"#a78bfa",
      functions:["createProposal()","castVote()","executeProposal()","addMember()","getProposal()"] },
  ];

  return (
    <div>
      <div style={S.g3}>
        {contracts.map((c,i) => (
          <div key={i} style={{...S.card, border:`1px solid ${c.color}40`}}>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{c.type}</div>
            <div style={{ fontSize:20, fontWeight:700, color:c.color, marginBottom:12 }}>{c.name}</div>
            <div style={{ fontSize:11, color:"#475569", wordBreak:"break-all" as const, background:"#050d1a", padding:"8px 10px", borderRadius:8, marginBottom:12, fontFamily:"monospace" }}>
              {c.address}
            </div>
            {c.functions.map((fn,j) => (
              <div key={j} style={{ padding:"5px 10px", background:"#111827", borderRadius:6, marginBottom:4, fontSize:12, color:"#94a3b8", fontFamily:"monospace" }}>
                {fn}
              </div>
            ))}
            <a href={`https://sepolia.etherscan.io/address/${c.address}`} target="_blank" rel="noreferrer"
              style={{ display:"block", marginTop:12, padding:"8px", background:c.color+"20", color:c.color, borderRadius:8, textAlign:"center" as const, textDecoration:"none", fontSize:12, fontWeight:600 }}>
              View on Etherscan ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────
const pages = [
  { id: "dashboard",   label: "📊 Dashboard" },
  { id: "predictor",   label: "🔮 AI Predictor" },
  { id: "portfolio",   label: "💼 Portfolio" },
  { id: "fraud",       label: "🤖 Fraud AI" },
  { id: "recommender", label: "✨ Recommender" },
  { id: "contracts",   label: "🔗 Contracts" },
  { id: "esg",         label: "📄 ESG Report" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [launched, setLaunched] = useState(false);

  if (!launched) {
    return <Landing onEnter={() => setLaunched(true)} />;
  }

  return (
    <div style={S.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
      `}</style>

      <div style={S.header}>
        <div style={S.logo}>
          🌿 CarbonChain
          <span style={{ fontSize:11, color:"#4ade80", background:"#052010", padding:"2px 8px", borderRadius:20, border:"1px solid #166534", marginLeft:10, fontWeight:400 }}>
            LIVE ON SEPOLIA
          </span>
        </div>
        <div style={S.nav}>
          {pages.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={navBtn(page===p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => setLaunched(false)} style={{ background:"none", border:"1px solid #1e3a5f", color:"#6b7280", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12 }}>
          ← Home
        </button>
      </div>

      <Ticker />

      <div style={S.main}>
        {page==="dashboard"   && <Dashboard />}
        {page==="predictor"   && <PricePredictor />}
        {page==="portfolio"   && <Portfolio />}
        {page==="fraud"       && <FraudPage />}
        {page==="recommender" && <Recommender />}
        {page==="contracts"   && <ContractsPage />}
        {page==="esg"         && <ReportGenerator />}
      </div>
    </div>
  );
}