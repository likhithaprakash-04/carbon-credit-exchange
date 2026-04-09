import React, { useState, useEffect } from "react";

const phrases = [
  "Blockchain Carbon Credits",
  "AI Fraud Detection",
  "DAO Governance",
  "ML Price Prediction",
  "Real-Time Analytics"
];

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [stats, setStats] = useState({ contracts: 0, tests: 0, auc: 0.0 });

  useEffect(() => {
    const t = setInterval(() => setPhraseIndex(p => (p+1) % phrases.length), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let step = 0;
    const t = setInterval(() => {
      step++;
      setStats({
        contracts: Math.min(Math.floor((step/60)*3), 3),
        tests: Math.min(Math.floor((step/60)*8), 8),
        auc: parseFloat(Math.min((step/60)*1.0, 1.0).toFixed(4))
      });
      if (step >= 60) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight:"100vh", background:"#060d1a", color:"#e2e8f0",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", fontFamily:"system-ui,sans-serif",
      position:"relative", overflow:"hidden"
    }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #4ade8040} 50%{box-shadow:0 0 50px #4ade8080} }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .launch-btn:hover { transform:scale(1.05)!important; }
        .github-btn:hover { border-color:#4ade80!important; color:#4ade80!important; }
        .stat-box:hover { border-color:#4ade80!important; transform:translateY(-3px); }
      `}</style>

      <div style={{ position:"fixed", inset:0, zIndex:0, backgroundImage:"linear-gradient(#1e3a5f18 1px,transparent 1px),linear-gradient(90deg,#1e3a5f18 1px,transparent 1px)", backgroundSize:"50px 50px" }} />
      <div style={{ position:"fixed", top:"15%", left:"10%", width:350, height:350, background:"#4ade8012", borderRadius:"50%", filter:"blur(90px)", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:"15%", right:"10%", width:450, height:450, background:"#60a5fa0e", borderRadius:"50%", filter:"blur(110px)", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:720, padding:"0 24px", animation:"fadeUp 0.8s ease" }}>

        <div style={{ fontSize:72, marginBottom:20, animation:"float 3s ease-in-out infinite" }}>🌿</div>

        <div style={{ display:"inline-block", padding:"5px 18px", background:"#052010", border:"1px solid #166534", borderRadius:20, fontSize:12, color:"#4ade80", marginBottom:28, fontWeight:600, animation:"pulse2 2s infinite" }}>
          ⚡ LIVE ON ETHEREUM SEPOLIA TESTNET
        </div>

        <h1 style={{ fontSize:54, fontWeight:900, marginBottom:14, lineHeight:1.1, background:"linear-gradient(135deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          CarbonChain Exchange
        </h1>

        <div style={{ fontSize:22, color:"#4ade80", fontWeight:700, marginBottom:20, height:36 }}>
          {phrases[phraseIndex]}
        </div>

        <p style={{ fontSize:16, color:"#64748b", lineHeight:1.8, maxWidth:580, margin:"0 auto 44px" }}>
          A production-grade decentralized exchange for verified carbon credits
          built on Ethereum with real-world datasets and AI-powered fraud detection.
        </p>

        <div style={{ display:"flex", gap:16, justifyContent:"center", marginBottom:60 }}>
          <button className="launch-btn" onClick={onEnter} style={{ padding:"16px 40px", background:"#4ade80", color:"#060d1a", border:"none", borderRadius:12, fontSize:16, fontWeight:800, cursor:"pointer", transition:"all 0.2s", animation:"glow 2s infinite" }}>
            Launch App →
          </button>
          <a className="github-btn" href="https://github.com/likhithaprakash-04/carbon-credit-exchange" target="_blank" rel="noreferrer"
            style={{ padding:"16px 40px", background:"transparent", color:"#94a3b8", border:"2px solid #1e3a5f", borderRadius:12, fontSize:16, fontWeight:700, textDecoration:"none", transition:"all 0.2s", display:"inline-block" }}>
            GitHub ↗
          </a>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
          {[
            { value:stats.contracts, label:"Smart Contracts", color:"#4ade80" },
            { value:`${stats.tests}/8`, label:"Tests Passing", color:"#60a5fa" },
            { value:stats.auc.toFixed(4), label:"ML AUC Score", color:"#a78bfa" },
            { value:"Live", label:"On Sepolia", color:"#f59e0b" },
          ].map((s,i) => (
            <div key={i} className="stat-box" style={{ background:"#0d1f3c", borderRadius:14, padding:"20px 16px", border:"1px solid #1e3a5f", transition:"all 0.2s" }}>
              <div style={{ fontSize:28, fontWeight:800, color:s.color, marginBottom:6 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {["Solidity","ERC-1155","Hardhat","TypeScript","React","Node.js","Python","scikit-learn","Random Forest","Gradient Boosting","DAO","Web3"].map(tag => (
            <span key={tag} style={{ padding:"4px 12px", background:"#111827", border:"1px solid #1e3a5f", borderRadius:20, fontSize:11, color:"#64748b" }}>{tag}</span>
          ))}
        </div>

      </div>
    </div>
  );
}