import { useState, useEffect } from "react";
import Layout, { Chip, BtnWire, Annotation, WBox, TableBase } from "../components/Layout";
import { getRiskData, predictRisk } from "../utils/api";

const notifBg = { alert:"#ff6b6b18", task:"#4f7cff18", info:"#00e5a018" };

export default function RiskPage({ onNav }) {
  const [notifs, setNotifs] = useState([]);
  const [riskTable, setRiskTable] = useState([]);
  const [error, setError] = useState("");
  const [inputs, setInputs] = useState({ velocity:42, completion:68, utilization:91, days:5 });
  const [mode, setMode] = useState("rule");
  const [result, setResult] = useState({ prob:72, status:"At Risk — Review Sprint Plan" });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      const data = await getRiskData();
      if (data) {
        setNotifs(data.notifications || []);
        setRiskTable(data.riskTable || []);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const runPrediction = async () => {
    setRunning(true);
    try {
      const data = await predictRisk({
        sprint_velocity:      inputs.velocity,
        task_completion_rate: inputs.completion,
        team_utilization:     inputs.utilization,
        days_remaining:       inputs.days,
      });
      setResult({ prob: data.delay_probability, status: data.status });
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setRunning(false);
    }
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
            {notifs.length > 0 ? notifs.map((n, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"10px 14px",
                borderBottom: i < notifs.length-1 ? "1px solid var(--border)" : "none",
                fontSize:11,
              }}>
                <div style={{
                  width:28, height:28, borderRadius:6,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, flexShrink:0,
                  background: notifBg[n.type] || "#ffffff10",
                }}>{n.icon || "ℹ"}</div>
                <div>
                  <div style={{ color:"var(--text)", marginBottom:2 }}>{n.title}</div>
                  <div style={{ color:"var(--muted)", fontSize:10, fontFamily:"'DM Mono',monospace" }}>{n.time}</div>
                </div>
              </div>
            )) : <div style={{ padding:"10px 14px", color:"var(--muted)" }}>No notifications</div>}
          </WBox>
          <Annotation>NodeJS + Socket.IO · 5 event types wired</Annotation>
        </div>
      </div>

      {error && (
        <div style={{ padding:10, background:"#ff6b6b18", border:"1px solid #ff6b6b33", borderRadius:4, marginBottom:14, fontSize:11, color:"var(--accent3)" }}>
          ⚠ {error}
        </div>
      )}

      {/* Risk table */}
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--muted2)", marginBottom:8, letterSpacing:1, textTransform:"uppercase" }}>
        All Projects — Risk Summary
      </div>
      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Project","Velocity","Completion %","Utilization %","Days Left","Risk Score","Status"]}>
          {riskTable.map((r, i) => (
            <tr key={i} style={{ borderBottom: i < riskTable.length-1 ? "1px solid var(--border)" : "none" }}>
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
