import Layout, { BtnWire, Annotation, WBox } from "../components/Layout";
import { useState, useEffect } from "react";
import { getAtRiskProjects, getSprintVelocity } from "../utils/api";

const tagColors = { red:"var(--accent3)", yellow:"var(--accent4)", blue:"var(--accent)" };
const tagBorders = { red:"#ff6b6b33", yellow:"#ffc85733", blue:"#4f7cff33" };

export default function AnalyticsPage({ onNav }) {
  const [projectsAtRisk, setProjectsAtRisk] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [riskData] = await Promise.all([
        getAtRiskProjects(),
        getSprintVelocity(),
      ]);
      setProjectsAtRisk(riskData || []);
      setBottlenecks([
        { level: "red", name: "UI Development", status: "Blocked", impact: 8 },
        { level: "yellow", name: "API Testing", status: "In Progress", impact: 5 },
      ]);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Layout page="analytics" onNav={onNav}
      topbarTitle="Analytics & Insights"
      topbarActions={<>
        <BtnWire>Sprint 04 ▾</BtnWire>
        <BtnWire>Last 30 days ▾</BtnWire>
      </>}
    >
      {/* Top charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        {/* Burndown */}
        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>Sprint Burndown</div>
          <svg viewBox="0 0 200 80" style={{ width:"100%", height:90 }} preserveAspectRatio="none">
            <line x1="10" y1="5" x2="185" y2="75" stroke="#ffffff15" strokeWidth="1.5" strokeDasharray="4,3"/>
            <polyline points="10,5 35,18 60,28 85,32 110,50 135,52 160,65 185,72"
              fill="none" stroke="#4f7cff" strokeWidth="2"/>
            <polyline points="10,5 35,18 60,28 85,32 110,50 135,52 160,65 185,72 185,80 10,80"
              fill="#4f7cff" opacity=".07"/>
          </svg>
          <Annotation>Ideal vs Actual · GET /analytics/delay-trends</Annotation>
        </WBox>

        {/* Completion by dev */}
        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>Task Completion Rate (by Developer)</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:90, padding:"0 4px" }}>
            {[
              { h:80, c:"var(--accent2)" },
              { h:65, c:"var(--accent2)" },
              { h:45, c:"var(--accent3)" },
              { h:90, c:"var(--accent2)" },
              { h:60, c:"var(--accent4)" },
            ].map((b, i) => (
              <div key={i} style={{
                flex:1, background:"var(--border-bright)",
                borderRadius:"3px 3px 0 0", position:"relative", height:"100%",
              }}>
                <div style={{
                  position:"absolute", left:0, right:0, bottom:0,
                  background:b.c, opacity:.4,
                  borderRadius:"3px 3px 0 0", height:`${b.h}%`,
                }}/>
              </div>
            ))}
          </div>
          <Annotation>GET /analytics/top-performers · task_completion.csv</Annotation>
        </WBox>
      </div>

      {/* Bottom charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* At-risk */}
        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>At-Risk Projects</div>
          {projectsAtRisk.map((p, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"6px 0",
              borderBottom: i < projectsAtRisk.length-1 ? "1px solid var(--border)" : "none",
              fontSize:11,
            }}>
              <div style={{ width:120, color:"var(--muted2)" }}>{p.name}</div>
              <div style={{ flex:1, height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, background:p.color, width:`${p.pct}%` }}/>
              </div>
              <div style={{ width:32, textAlign:"right", color:p.color, fontFamily:"'DM Mono',monospace", fontSize:10 }}>
                {p.pct}%
              </div>
            </div>
          ))}
          <Annotation>GET /analytics/at-risk-projects · Python FastAPI</Annotation>
        </WBox>

        {/* Bottleneck detection */}
        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>Bottleneck Detection</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
            {bottlenecks.map((b, i) => (
              <div key={i} style={{
                background:"var(--surface2)",
                border:`1px solid ${tagBorders[b.level]}`,
                borderRadius:5, padding:"8px 10px", fontSize:10,
              }}>
                <div style={{
                  color:tagColors[b.level],
                  fontFamily:"'DM Mono',monospace", fontSize:9, marginBottom:3,
                }}>{b.tag}</div>
                <div style={{ color:"var(--muted2)" }}>{b.msg}</div>
              </div>
            ))}
          </div>
          <Annotation>POST /etl/process → Pandas bottleneck detection</Annotation>
        </WBox>
      </div>
    </Layout>
  );
}

const chartTitle = {
  fontFamily:"'DM Mono',monospace", fontSize:10,
  color:"var(--muted2)", letterSpacing:1,
  textTransform:"uppercase", marginBottom:10,
};
