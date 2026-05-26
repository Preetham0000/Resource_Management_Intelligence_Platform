import { useState, useEffect } from "react";
import Layout, { Chip, BtnWire, Avatar, Annotation, WBox, TableBase } from "../components/Layout";
import { authFetch } from "../utils/auth";

const PROJECTS = [
  { name:"CRM Revamp",        manager:"R. Sharma",  mi:"RS", start:"Dec 01, 2024", end:"Mar 15, 2025", status:"At Risk",  risk:72, progress:55 },
  { name:"Supply Chain AI",   manager:"M. Kumar",   mi:"MK", start:"Nov 15, 2024", end:"Feb 28, 2025", status:"Moderate", risk:55, progress:62 },
  { name:"HR Portal 3.0",     manager:"N. Joshi",   mi:"NJ", start:"Jan 20, 2025", end:"Apr 01, 2025", status:"On Track", risk:18, progress:88 },
  { name:"Retail Analytics",  manager:"P. Mehta",   mi:"PM", start:"Jan 05, 2025", end:"Mar 30, 2025", status:"On Track", risk:12, progress:74 },
];

const statusColor = { "At Risk":"red", "Moderate":"yellow", "On Track":"green" };

export default function ProjectsPage({ onNav }) {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);

  useEffect(() => {
    authFetch("/api/projects")
      .then(data => setProjects(data));
  }, []);
  const [form, setForm] = useState({ name:"", manager:"", start:"", end:"" });

  const add = () => {
    if (!form.name) return;
    setProjects(p => [...p, {
      name: form.name, manager: form.manager, mi: form.manager.slice(0,2).toUpperCase(),
      start: form.start, end: form.end, status:"On Track", risk:0, progress:0,
    }]);
    setShowForm(false);
    setForm({ name:"", manager:"", start:"", end:"" });
  };

  return (
    <Layout page="projects" onNav={onNav}
      topbarTitle="Project List"
      topbarActions={<>
        <BtnWire>↑ Upload CSV</BtnWire>
        <BtnWire primary onClick={() => setShowForm(v => !v)}>+ New Project</BtnWire>
      </>}
    >
      {/* Create form */}
      {showForm && (
        <WBox style={{ padding:14, marginBottom:14, borderColor:"#4f7cff33" }}>
          <div style={monoLabel}>Create New Project</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              ["Project Name", "name", "CRM Revamp v2"],
              ["Manager", "manager", "R. Sharma"],
              ["Start Date", "start", "2025-02-01"],
              ["End Date", "end", "2025-05-01"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <div style={fieldLabel}>{label}</div>
                <input
                  placeholder={ph} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputSt}
                />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <BtnWire onClick={() => setShowForm(false)}>Cancel</BtnWire>
            <BtnWire primary onClick={add}>Save Project →</BtnWire>
          </div>
        </WBox>
      )}

      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Project","Manager","Start","End","Status","Risk","Progress","Actions"]}>
          {projects.map((p, i) => (
            <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
              <td style={{ padding:"8px 10px", color:"var(--text)", fontWeight:600, fontSize:11 }}>{p.name}</td>
              <td style={tdSt}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Avatar initials={p.mi} /> {p.manager}
                </div>
              </td>
              <td style={tdSt}>{p.start}</td>
              <td style={tdSt}>{p.end}</td>
              <td style={tdSt}><Chip color={statusColor[p.status]}>{p.status}</Chip></td>
              <td style={tdSt}>
                <Chip color={statusColor[p.status]}>{p.risk}%</Chip>
              </td>
              <td style={tdSt}>
                <div style={{
                  background:"var(--border)", borderRadius:3,
                  height:5, width:80, overflow:"hidden",
                }}>
                  <div style={{
                    height:"100%", borderRadius:3,
                    background:"var(--accent)", width:`${p.progress}%`,
                  }}/>
                </div>
              </td>
              <td style={tdSt}>
                <div style={{ display:"flex", gap:4 }}>
                  <BtnWire>Edit</BtnWire>
                  <BtnWire>Archive</BtnWire>
                </div>
              </td>
            </tr>
          ))}
        </TableBase>
      </WBox>
      <Annotation>GET /api/projects · POST /api/projects · DELETE /api/projects/:id</Annotation>
    </Layout>
  );
}

const monoLabel = { fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:1, textTransform:"uppercase", marginBottom:10 };
const fieldLabel = { fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 };
const inputSt = { width:"100%", padding:"7px 10px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:4, color:"var(--text)", fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:"none" };
const tdSt = { padding:"8px 10px", color:"var(--muted2)", fontSize:11, borderBottom:"none" };
