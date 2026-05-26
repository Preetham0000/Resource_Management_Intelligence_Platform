import { useState } from "react";
import Layout, { Chip, BtnWire, Annotation, WBox, TableBase } from "../components/Layout";

const NOTIFS = [
  { type:"alert", icon:"⚠", title:"Delay risk generated for CRM Revamp",   time:"predictionGenerated · 2 min ago" },
  { type:"task",  icon:"✓", title:'Task "ML Risk API" moved to In Progress', time:"taskStatusUpdated · 8 min ago" },
  { type:"task",  icon:"+", title:"New task assigned to A. Mehta",           time:"taskAssigned · 15 min ago" },
  { type:"alert", icon:"🔔", title:"Sprint 04 deadline in 8 days",           time:"sprintDeadlineAlert · 1 hr ago" },
  { type:"info",  icon:"💬", title:"Manager feedback added by M. Kumar",     time:"managerFeedbackAdded · 2 hr ago" },
];

const notifBg = { alert:"#ff6b6b18", task:"#4f7cff18", info:"#00e5a018" };

const RISK_TABLE = [
  { name:"CRM Revamp",       vel:42, comp:"68%", util:"91%", days:5,  risk:72, status:"At Risk",  sc:"red" },
  { name:"Supply Chain AI",  vel:38, comp:"62%", util:"87%", days:12, risk:55, status:"Moderate", sc:"yellow" },
  { name:"Retail Analytics", vel:58, comp:"84%", util:"74%", days:20, risk:18, status:"On Track", sc:"green" },
];

export default function RiskPage({ onNav }) {
  const [inputs, setInputs] = useState({ velocity:42, completion:68, utilization:91, days:5 });
  const [mode, setMode]     = useState("rule");
  const [result, setResult] = useState({ prob:72, status:"At Risk — Review Sprint Plan" });
  const [running, setRunning] = useState(false);

  const runPrediction = async () => {
  setRunning(true);
  const res = await fetch("/predict/1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      sprint_velocity:    inputs.velocity,
      task_completion_rate: inputs.completion,
      team_utilization:   inputs.utilization,
      days_remaining:     inputs.days,
    }),
  });
  const data = await res.json();
  setResult({ prob: data.delay_probability, status: data.status });
  setRunning(false);
};

  const riskColor = result.prob >= 65 ? "var(--accent3)" : result.prob >= 35 ? "var(--accent4)" : "var(--accent2)";

  return (
    <Layout page="risk" onNav={onNav}
      topbarTitle="Delay Risk Report"
      topbarActions={<>
        <BtnWire>Project ▾</BtnWire>
        <BtnWire primary onClick={runPrediction}>{running ? "Running…" : "Run Prediction"}</BtnWire>
      </>}
    >
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Inputs */}
        <WBox style={{ padding:14 }}>
          <div style={monoHdr}>Prediction Inputs</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              ["Sprint Velocity","velocity"],
              ["Task Completion Rate (%)","completion"],
              ["Team Utilization (%)","utilization"],
              ["Days Remaining","days"],
            ].map(([label, key]) => (
              <div key={key}>
                <div style={flabel}>{label}</div>
                <input
                  type="number" value={inputs[key]}
                  onChange={e => setInputs(p => ({ ...p, [key]: +e.target.value }))}
                  style={inputSt}
                />
              </div>
            ))}

            {/* Mode toggle */}
            <div>
              <div style={flabel}>Prediction Mode</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                <Chip color={mode==="rule" ? "blue" : "default"} style={{ cursor:"pointer" }}
                  onClick={() => setMode("rule")}>● Rule-Based</Chip>
                <Chip color={mode==="ml" ? "blue" : "default"} style={{ cursor:"pointer" }}
                  onClick={() => setMode("ml")}>ML Model</Chip>
              </div>
            </div>
          </div>

          {/* Output */}
          <div style={{
            background:"#ff6b6b10", border:"1px solid #ff6b6b44",
            borderRadius:8, padding:14, marginTop:12,
          }}>
            <div style={{
              fontFamily:"'DM Mono',monospace", fontSize:9,
              letterSpacing:"1.5px", textTransform:"uppercase",
              color:"var(--accent3)", marginBottom:6,
            }}>Prediction Result — POST /predict/&#123;projectId&#125;</div>
            <div style={{
              fontFamily:"'Syne',sans-serif", fontSize:28,
              fontWeight:800, color:riskColor, marginBottom:4,
            }}>{result.prob}%</div>
            <div style={{ fontSize:11, color:"var(--muted2)", marginBottom:8 }}>
              ⚠ {result.status}
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"var(--muted)" }}>
              delay_probability: {result.prob} · risk_status: {result.prob >= 65 ? "AT_RISK" : result.prob >= 35 ? "MODERATE" : "ON_TRACK"}<br/>
              recommendation: Reduce utilization, reprioritize backlog
            </div>
          </div>
          <Annotation>Python FastAPI · scikit-learn Logistic Regression / Random Forest</Annotation>
        </WBox>

        {/* Live notifications */}
        <div>
          <div style={{ ...monoHdr, display:"flex", alignItems:"center", gap:8 }}>
            Live Notifications <Chip color="green">● Socket.IO</Chip>
          </div>
          <WBox>
            {NOTIFS.map((n, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"10px 14px",
                borderBottom: i < NOTIFS.length-1 ? "1px solid var(--border)" : "none",
                fontSize:11,
              }}>
                <div style={{
                  width:28, height:28, borderRadius:6,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, flexShrink:0,
                  background: notifBg[n.type],
                }}>{n.icon}</div>
                <div>
                  <div style={{ color:"var(--text)", marginBottom:2 }}>{n.title}</div>
                  <div style={{ color:"var(--muted)", fontSize:10, fontFamily:"'DM Mono',monospace" }}>{n.time}</div>
                </div>
              </div>
            ))}
          </WBox>
          <Annotation>NodeJS + Socket.IO · 5 event types wired</Annotation>
        </div>
      </div>

      {/* Risk table */}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1, textTransform:"uppercase" }}>
        All Projects — Risk Summary
      </div>
      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Project","Velocity","Completion %","Utilization %","Days Left","Risk Score","Status"]}>
          {RISK_TABLE.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < RISK_TABLE.length-1 ? "1px solid var(--border)" : "none" }}>
              <td style={tdSt}><strong style={{ color:"var(--text)" }}>{r.name}</strong></td>
              <td style={tdSt}>{r.vel}</td>
              <td style={tdSt}>{r.comp}</td>
              <td style={tdSt}>{r.util}</td>
              <td style={tdSt}>{r.days}</td>
              <td style={{ ...tdSt, fontFamily:"'DM Mono',monospace", fontWeight:700,
                color: r.sc==="red" ? "var(--accent3)" : r.sc==="yellow" ? "var(--accent4)" : "var(--accent2)" }}>
                {r.risk}%
              </td>
              <td style={tdSt}><Chip color={r.sc}>{r.status}</Chip></td>
            </tr>
          ))}
        </TableBase>
      </WBox>
      <Annotation>GET /analytics/at-risk-projects · Python ML prediction per project</Annotation>
    </Layout>
  );
}

const monoHdr = { fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--muted2)", letterSpacing:1, textTransform:"uppercase", marginBottom:8 };
const flabel  = { fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 };
const inputSt = { width:"100%", padding:"7px 10px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:4, color:"var(--text)", fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:"none" };
const tdSt    = { padding:"8px 10px", color:"var(--muted2)", fontSize:11 };
