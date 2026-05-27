import { useState, useEffect } from "react";
import Layout, { BtnWire, Annotation, WBox, TableBase } from "../components/Layout";
import { getProjects, createProject, updateProject, deleteProject } from "../utils/api";

export default function ProjectsPage({ onNav }) {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const [form, setForm] = useState({ name:"", description:"", startDate:"", endDate:"" });

  const add = async () => {
    if (!form.name) return;
    try {
      if (editingId) {
        await updateProject(editingId, {
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
        });
        setEditingId(null);
      } else {
        await createProject({
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
        });
      }
      setShowForm(false);
      setForm({ name:"", description:"", startDate:"", endDate:"" });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
    setEditingId(project.id);
    setShowForm(true);
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
          <div style={monoLabel}>{editingId ? "Edit Project" : "Create New Project"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              ["Project Name", "name", "CRM Revamp v2"],
              ["Description", "description", "Project description"],
              ["Start Date", "startDate", "2025-02-01"],
              ["End Date", "endDate", "2025-05-01"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <div style={fieldLabel}>{label}</div>
                <input
                  placeholder={ph} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputSt}
                  type={key.includes("Date") ? "date" : "text"}
                />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <BtnWire onClick={() => {setShowForm(false); setEditingId(null); setForm({ name:"", description:"", startDate:"", endDate:"" });}}>Cancel</BtnWire>
            <BtnWire primary onClick={add}>{editingId ? "Update Project →" : "Save Project →"}</BtnWire>
          </div>
        </WBox>
      )}

      {error && (
        <div style={{ padding:10, background:"#ff6b6b18", border:"1px solid #ff6b6b33", borderRadius:4, marginBottom:14, fontSize:11, color:"var(--accent3)" }}>
          ⚠ {error}
        </div>
      )}

      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Project","Description","Start","End","Actions"]}>
          {projects.map((p, i) => (
            <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
              <td style={{ padding:"8px 10px", color:"var(--text)", fontWeight:600, fontSize:11 }}>{p.name}</td>
              <td style={tdSt}>{p.description || "-"}</td>
              <td style={tdSt}>{p.startDate || "-"}</td>
              <td style={tdSt}>{p.endDate || "-"}</td>
              <td style={tdSt}>
                <div style={{ display:"flex", gap:4 }}>
                  <BtnWire onClick={() => handleEdit(p)}>Edit</BtnWire>
                  <BtnWire onClick={() => handleDelete(p.id)}>Delete</BtnWire>
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
