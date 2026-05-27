import { useState, useEffect, useCallback } from "react";
import Layout, { BtnWire, Annotation } from "../components/Layout";
import { getSprints, getTasks, updateTask } from "../utils/api";

const COL_CONFIG = {
  TODO:       { label:"📋 To Do",      accent:"var(--muted2)",  border:"var(--wire2)" },
  IN_PROGRESS: { label:"⚡ In Progress", accent:"var(--accent)",  border:"#4f7cff44" },
  DONE:       { label:"✅ Done",        accent:"var(--accent2)", border:"#00e5a033" },
};

export default function SprintsPage({ onNav }) {
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [cols, setCols] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sprintsData = await getSprints();
      setSprints(sprintsData || []);
      if (sprintsData && sprintsData.length > 0) {
        setActiveSprint(sprintsData[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const loadTasks = useCallback(async () => {
    try {
      const tasksData = await getTasks();
      if (tasksData && activeSprint) {
        // Filter tasks for active sprint
        const sprintTasks = tasksData.filter(t => t.sprint?.id === activeSprint.id);
        setCols({
          TODO: sprintTasks.filter(t => t.status === "TODO"),
          IN_PROGRESS: sprintTasks.filter(t => t.status === "IN_PROGRESS"),
          DONE: sprintTasks.filter(t => t.status === "DONE"),
        });
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [activeSprint]);

  useEffect(() => {
    if (activeSprint) {
      loadTasks();
    }
  }, [activeSprint, loadTasks]);

  const [dragging, setDragging] = useState(null);

  const moveCard = async (card, fromCol, toCol) => {
    if (fromCol === toCol) return;
    try {
      await updateTask(card.id, { ...card, status: toCol });
      setCols(prev => ({
        ...prev,
        [fromCol]: prev[fromCol].filter(c => c.id !== card.id),
        [toCol]:   [...prev[toCol], { ...card, status: toCol }],
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout page="sprints" onNav={onNav}
      topbarTitle={activeSprint ? `${activeSprint.name} — ${activeSprint.project?.name || "Project"}` : "Sprints"}
      topbarActions={<>
        {sprints.length > 0 && (
          <select value={activeSprint?.id || ""} onChange={e => setActiveSprint(sprints.find(s => s.id === parseInt(e.target.value)))} style={{ padding:"6px 10px", borderRadius:4, border:"1px solid var(--border)", background:"var(--surface2)", color:"var(--text)", fontSize:12 }}>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <BtnWire>Retrospective</BtnWire>
        <BtnWire primary>+ Add Task</BtnWire>
      </>}
    >
      {error && (
        <div style={{ padding:10, background:"#ff6b6b18", border:"1px solid #ff6b6b33", borderRadius:4, marginBottom:14, fontSize:11, color:"var(--accent3)" }}>
          ⚠ {error}
        </div>
      )}

      {/* Sprint meta */}
      {activeSprint && (
        <div style={{ display:"flex", gap:16, marginBottom:14 }}>
          {[
            ["Start Date", activeSprint.startDate || "-", "var(--accent)"],
            ["End Date", activeSprint.endDate || "-", "var(--accent2)"],
            ["Tasks", Object.values(cols).flat().length, "var(--accent3)"],
          ].map(([key, val, color]) => (
            <div key={key} style={{ display:"flex", flexDirection:"column", gap:2 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"var(--muted)", letterSpacing:1, textTransform:"uppercase" }}>{key}</div>
              <div style={{ fontSize:13, fontWeight:600, color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

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
                    border:`1px solid ${colKey === "IN_PROGRESS" ? "#4f7cff33" : "var(--border)"}`,
                    borderRadius:6, padding:10, marginBottom:8,
                    cursor:"grab", opacity: colKey === "DONE" ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontSize:11, marginBottom:6, color:"var(--text)" }}>{card.title}</div>
                  {card.description && <div style={{ fontSize:9, marginBottom:6, color:"var(--muted)" }}>{card.description}</div>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:9, color:"var(--muted)" }}>{card.assignee?.username || "Unassigned"}</span>
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
