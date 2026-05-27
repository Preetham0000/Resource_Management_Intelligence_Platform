import { useState, useEffect } from "react";
import Layout, { StatCard, WBox, Chip, BtnWire, Avatar, Annotation } from "../components/Layout";
import { getProjects, getAtRiskProjects, getSprintVelocity } from "../utils/api";

const HM_LEVELS = [
  [2,4,5,3,1,4,2],
  [5,3,2,5,4,2,3],
  [1,2,3,4,5,3,4],
  [3,5,4,2,3,5,1],
];

const HM_COLORS = {
  0:"var(--border)",
  1:"#4f7cff22", 2:"#4f7cff55", 3:"#4f7cff99",
  4:"#4f7cffcc", 5:"var(--accent)",
};

export default function DashboardPage({ onNav }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    atRiskProjects: 0,
    activeDevelopers: 0,
    sprintVelocity: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projects, atRisk] = await Promise.all([
        getProjects(),
        getAtRiskProjects(),
        getSprintVelocity(),
      ]);

      setStats({
        totalProjects: projects?.length || 0,
        atRiskProjects: atRisk?.length || 0,
        activeDevelopers: 38,
        sprintVelocity: 47,
      });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Layout
      page="dashboard" onNav={onNav}
      topbarTitle="Dashboard Overview"
      topbarActions={<>
        <Chip color="green">● Live</Chip>
        <BtnWire>↑ Export CSV</BtnWire>
        <Avatar initials="AD" />
      </>}
    >
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <StatCard label="Total Projects"     value={String(stats.totalProjects)} trend="↑ 3 this sprint"     color="var(--accent)" />
        <StatCard label="At-Risk Projects"   value={String(stats.atRiskProjects)}  trend="⚠ Needs review"      color="var(--accent3)" />
        <StatCard label="Active Developers"  value={String(stats.activeDevelopers)} trend="85% utilization avg"  color="var(--accent2)" />
        <StatCard label="Sprint Velocity"    value={String(stats.sprintVelocity)} trend="↓ -5 vs last sprint"  color="var(--accent4)" />
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>Sprint Velocity Trend</div>
          <svg viewBox="0 0 200 80" style={{ width:"100%", height:90 }} preserveAspectRatio="none">
            <polyline points="10,65 35,50 60,55 85,30 110,40 135,20 160,28 185,15"
              fill="none" stroke="#4f7cff" strokeWidth="2" opacity=".6"/>
            <polyline points="10,65 35,50 60,55 85,30 110,40 135,20 160,28 185,15 185,80 10,80"
              fill="#4f7cff" opacity=".08"/>
            <circle cx="185" cy="15" r="4" fill="#4f7cff"/>
          </svg>
          <Annotation>GET /analytics/sprint-velocity</Annotation>
        </WBox>

        <WBox style={{ padding:14 }}>
          <div style={chartTitle}>Project Status Distribution</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:90, padding:"0 4px" }}>
            {[60,80,45,90,70,55,85].map((h,i) => (
              <div key={i} style={{
                flex:1, background:"var(--border-bright)",
                borderRadius:"3px 3px 0 0", position:"relative", height:"100%",
              }}>
                <div style={{
                  position:"absolute", left:0, right:0, bottom:0,
                  background:"var(--accent)", opacity:.35,
                  borderRadius:"3px 3px 0 0", height:`${h}%`,
                }}/>
              </div>
            ))}
          </div>
          <Annotation>Recharts BarChart component</Annotation>
        </WBox>
      </div>

      {/* Heatmap */}
      <WBox style={{ padding:14 }}>
        <div style={chartTitle}>Developer Utilization Heatmap</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, maxWidth:280 }}>
          {HM_LEVELS.flat().map((l, i) => (
            <div key={i} style={{
              aspectRatio:"1", borderRadius:2,
              background: HM_COLORS[l],
            }}/>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:8 }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"var(--muted)" }}>Low</span>
          {[1,2,3,4,5].map(l => (
            <div key={l} style={{ width:14, height:14, borderRadius:2, background:HM_COLORS[l], flexShrink:0 }}/>
          ))}
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"var(--muted)" }}>High</span>
        </div>
        <Annotation>GET /analytics/top-performers · Recharts HeatMap</Annotation>
      </WBox>
    </Layout>
  );
}

const chartTitle = {
  fontFamily:"'DM Mono',monospace", fontSize:10,
  color:"var(--muted2)", letterSpacing:1,
  textTransform:"uppercase", marginBottom:10,
};
