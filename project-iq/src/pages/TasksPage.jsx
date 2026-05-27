import { useState, useEffect } from "react";
import Layout, { Chip, BtnWire, Annotation, WBox, TableBase } from "../components/Layout";
import { getTasks, createTask, deleteTask, updateTask, getSprints } from "../utils/api";

const statusColorMap = { "TODO":"default", "IN_PROGRESS":"blue", "DONE":"green" };

export default function TasksPage({ onNav }) {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTasks();
    loadSprints();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const loadSprints = async () => {
    try {
      const data = await getSprints();
      setSprints(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", status:"TODO", sprintId:"", assigneeId:"" });

  const save = async () => {
    if (!form.title || !form.sprintId) return;
    try {
      const taskData = {
        title: form.title,
        description: form.description,
        status: form.status,
        sprint: { id: parseInt(form.sprintId) },
        assignee: form.assigneeId ? { id: parseInt(form.assigneeId) } : null,
      };

      if (editingId) {
        await updateTask(editingId, taskData);
        setEditingId(null);
      } else {
        await createTask(taskData);
      }

      setShowForm(false);
      setForm({ title:"", description:"", status:"TODO", sprintId:"", assigneeId:"" });
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      sprintId: task.sprint?.id ? task.sprint.id.toString() : "",
      assigneeId: task.assignee?.id ? task.assignee.id.toString() : "",
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  return (
    <Layout page="tasks" onNav={onNav}
      topbarTitle="Task Management"
      topbarActions={<>
        <BtnWire>Filter ▾</BtnWire>
        <BtnWire primary onClick={() => setShowForm(v => !v)}>+ New Task</BtnWire>
      </>}
    >
      {/* Form */}
      {showForm && (
        <WBox style={{ padding:14, marginBottom:14, borderColor:"#4f7cff33" }}>
          <div style={monoHdr}>{editingId ? "Edit Task" : "Create New Task"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              ["Task Title","title","Implement OAuth flow…"],
              ["Description","description","Add task description"],
            ].map(([label,key,ph]) => (
              <div key={key}>
                <div style={flabel}>{label}</div>
                <input placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inputSt}/>
              </div>
            ))}
            <div>
              <div style={flabel}>Sprint</div>
              <select value={form.sprintId} onChange={e=>setForm(f=>({...f,sprintId:e.target.value}))} style={inputSt}>
                <option value="">Select a Sprint</option>
                {sprints.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={flabel}>Assignee (Optional)</div>
              <input placeholder="Assignee ID" value={form.assigneeId} onChange={e=>setForm(f=>({...f,assigneeId:e.target.value}))} style={inputSt}/>
            </div>
            <div>
              <div style={flabel}>Status</div>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inputSt}>
                {["TODO","IN_PROGRESS","DONE"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <BtnWire onClick={()=>{setShowForm(false); setEditingId(null); setForm({ title:"", description:"", status:"TODO", sprintId:"", assigneeId:"" });}}>Cancel</BtnWire>
            <BtnWire primary onClick={save}>{editingId ? "Update Task →" : "Save Task →"}</BtnWire>
          </div>
        </WBox>
      )}

      {error && (
        <div style={{ padding:10, background:"#ff6b6b18", border:"1px solid #ff6b6b33", borderRadius:4, marginBottom:14, fontSize:11, color:"var(--accent3)" }}>
          ⚠ {error}
        </div>
      )}

      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Task","Description","Sprint","Status","Assignee","Actions"]}>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom:"1px solid var(--border)" }}>
              <td style={tdSt}><strong style={{ color:"var(--text)" }}>{t.title}</strong></td>
              <td style={tdSt}>{t.description || "-"}</td>
              <td style={tdSt}>{t.sprint?.name || "-"}</td>
              <td style={tdSt}><Chip color={statusColorMap[t.status]}>{t.status}</Chip></td>
              <td style={tdSt}>{t.assignee?.username || "-"}</td>
              <td style={tdSt}>
                <div style={{display:"flex",gap:4}}>
                  <BtnWire onClick={()=>handleEdit(t)}>Edit</BtnWire>
                  <BtnWire onClick={()=>del(t.id)}>Delete</BtnWire>
                </div>
              </td>
            </tr>
          ))}
        </TableBase>
      </WBox>
      <Annotation>Socket.IO → taskAssigned event fires on save · GET /api/tasks · POST /api/tasks</Annotation>
    </Layout>
  );
}

const monoHdr = { fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:1, textTransform:"uppercase", marginBottom:10 };
const flabel  = { fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1, color:"var(--muted)", textTransform:"uppercase", marginBottom:4 };
const inputSt = { width:"100%", padding:"7px 10px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:4, color:"var(--text)", fontSize:12, fontFamily:"'DM Sans',sans-serif", outline:"none" };
const tdSt    = { padding:"8px 10px", color:"var(--muted2)", fontSize:11 };
