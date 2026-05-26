import { useState, useEffect } from "react";
import Layout, { Chip, BtnWire, Avatar, Annotation, WBox } from "../components/Layout";
import { authFetch } from "../utils/auth";

const INIT = {
  todo: [
    { id:1, title:"Design Login UI Mockup",    pts:3,  pts_color:"yellow", assignee:"VK" },
    { id:2, title:"Setup PostgreSQL Schema",   pts:5,  pts_color:"blue",   assignee:"RP" },
    { id:3, title:"CSV Import Pipeline",       pts:8,  pts_color:"red",    assignee:"SN" },
  ],
  inprogress: [
    { id:4, title:"Build Notification Service", pts:5,  pts_color:"blue", assignee:"AM" },
    { id:5, title:"ML Risk Prediction API",     pts:13, pts_color:"red",  assignee:"PK" },
  ],
  done: [
    { id:6, title:"JWT Auth Integration", pts:8, pts_color:"green", assignee:"DJ" },
    { id:7, title:"Dashboard Layout",     pts:5, pts_color:"green", assignee:"VK" },
  ],
};

const COL_CONFIG = {
  todo:       { label:"📋 To Do",      accent:"var(--muted2)",  border:"var(--wire2)" },
  inprogress: { label:"⚡ In Progress", accent:"var(--accent)",  border:"#4f7cff44" },
  done:       { label:"✅ Done",        accent:"var(--accent2)", border:"#00e5a033" },
};

export default function SprintsPage({ onNav }) {
  const [cols, setCols] = useState(INIT);

  useEffect(() => {
  authFetch("/api/sprints")
    .then(data => {
      setCols({
        todo:       data.filter(t => t.status === "To Do"),
        inprogress: data.filter(t => t.status === "In Progress"),
        done:       data.filter(t => t.status === "Done"),
      });
    });
}, []);
  const [dragging, setDragging] = useState(null);

  const moveCard = (card, fromCol, toCol) => {
    if (fromCol === toCol) return;
    setCols(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(c => c.id !== card.id),
      [toCol]:   [...prev[toCol], card],
    }));
  };

  return (
    <Layout page="sprints" onNav={onNav}
      topbarTitle="Sprint 04 — CRM Revamp"
      topbarActions={<>
        <Chip color="yellow">8 days left</Chip>
        <BtnWire>Retrospective</BtnWire>
        <BtnWire primary>+ Add Task</BtnWire>
      </>}
    >
      {/* Sprint meta */}
      <div style={{ display:"flex", gap:16, marginBottom:14 }}>
        {[
          ["Velocity","42 pts","var(--accent)"],
          ["Completion","68%","var(--accent2)"],
          ["Utilization","91%","var(--accent3)"],
          ["Days Left","8","var(--accent4)"],
        ].map(([key, val, color]) => (
          <div key={key} style={{ display:"flex", flexDirection:"column", gap:2 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>{key}</div>
            <div style={{ fontSize:13, fontWeight:600, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {Object.entries(cols).map(([colKey, cards]) => {
          const cfg = COL_CONFIG[colKey];
          return (
            <div
              key={colKey}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragging) moveCard(dragging.card, dragging.from, colKey);
                setDragging(null);
              }}
              style={{
                background:"var(--wire)", border:`1px solid ${cfg.border}`,
                borderRadius:8, padding:10, minHeight:200,
              }}
            >
              {/* Column header */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:10, paddingBottom:8, borderBottom:"1px solid var(--border)",
              }}>
                <div style={{
                  fontFamily:"'DM Mono',monospace", fontSize:10,
                  letterSpacing:"1.5px", textTransform:"uppercase", color:cfg.accent,
                }}>{cfg.label}</div>
                <div style={{
                  fontFamily:"'DM Mono',monospace", fontSize:9,
                  padding:"2px 6px", borderRadius:10,
                  background:"var(--border-bright)", color:"var(--muted)",
                }}>{cards.length}</div>
              </div>

              {/* Cards */}
              {cards.map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragging({ card, from: colKey })}
                  style={{
                    background:"var(--surface2)",
                    border:`1px solid ${colKey === "inprogress" ? "#4f7cff33" : "var(--border)"}`,
                    borderRadius:6, padding:10, marginBottom:8,
                    cursor:"grab", opacity: colKey === "done" ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontSize:11, marginBottom:6, color:"var(--text)" }}>{card.title}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <Chip color={card.pts_color}>{card.pts} pts</Chip>
                    <Avatar initials={card.assignee} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Annotation>PUT /api/tasks/:id · Socket.IO → taskStatusUpdated fires on drag</Annotation>
    </Layout>
  );
}
