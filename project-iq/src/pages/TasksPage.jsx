import { useState, useEffect } from "react";
import Layout, { Chip, BtnWire, Avatar, Annotation, WBox, TableBase } from "../components/Layout";
import { authFetch } from "../utils/auth";

const INIT_TASKS = [
  { id:1, title:"Build Notification Service", assignee:"A. Mehta",  ai:"AM", sprint:"Sprint 04", priority:"High",   status:"In Progress", pts:5 },
  { id:2, title:"ML Risk API Integration",    assignee:"P. Kumar",  ai:"PK", sprint:"Sprint 04", priority:"High",   status:"In Progress", pts:13 },
  { id:3, title:"CSV Import Pipeline",        assignee:"S. Nair",   ai:"SN", sprint:"Sprint 04", priority:"Medium", status:"To Do",       pts:8 },
  { id:4, title:"JWT Auth Integration",       assignee:"D. Jain",   ai:"DJ", sprint:"Sprint 03", priority:"Low",    status:"Done",        pts:8 },
];

const priorityColor = { High:"red", Medium:"yellow", Low:"blue" };
const statusColor   = { "In Progress":"blue", "To Do":"default", "Done":"green" };

export default function TasksPage({ onNav }) {
  const [tasks, setTasks]     = useState(INIT_TASKS);

  useEffect(() => {
  authFetch("/api/tasks")
    .then(data => setTasks(data));
}, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", assignee:"", sprint:"Sprint 04", priority:"High", pts:"", status:"To Do" });

  const save = async () => {
  if (!form.title) return;
  const newTask = await authFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(form),
  });
  setTasks(t => [...t, newTask]);
  setShowForm(false);
};

  const del = (id) => setTasks(t => t.filter(x => x.id !== id));

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
          <div style={monoHdr}>Create New Task</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              ["Task Title","title","Implement OAuth flow…"],
              ["Assignee","assignee","Select developer"],
            ].map(([label,key,ph]) => (
              <div key={key}>
                <div style={flabel}>{label}</div>
                <input placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inputSt}/>
              </div>
            ))}
            <div>
              <div style={flabel}>Sprint</div>
              <select value={form.sprint} onChange={e=>setForm(f=>({...f,sprint:e.target.value}))} style={inputSt}>
                {["Sprint 04","Sprint 03","Sprint 02"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={flabel}>Priority</div>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={inputSt}>
                {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={flabel}>Story Points</div>
              <input placeholder="8" value={form.pts} onChange={e=>setForm(f=>({...f,pts:e.target.value}))} style={inputSt}/>
            </div>
            <div>
              <div style={flabel}>Status</div>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inputSt}>
                {["To Do","In Progress","Done"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <BtnWire onClick={()=>setShowForm(false)}>Cancel</BtnWire>
            <BtnWire primary onClick={save}>Save Task →</BtnWire>
          </div>
        </WBox>
      )}

      <WBox style={{ overflow:"hidden" }}>
        <TableBase headers={["Task","Assignee","Sprint","Priority","Status","Story Pts","Actions"]}>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom:"1px solid var(--border)" }}>
              <td style={tdSt}><strong style={{ color:"var(--text)" }}>{t.title}</strong></td>
              <td style={tdSt}><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar initials={t.ai}/>{t.assignee}</div></td>
              <td style={tdSt}>{t.sprint}</td>
              <td style={tdSt}><Chip color={priorityColor[t.priority]}>{t.priority}</Chip></td>
              <td style={tdSt}><Chip color={statusColor[t.status]}>{t.status}</Chip></td>
              <td style={tdSt}>{t.pts}</td>
              <td style={tdSt}>
                <div style={{display:"flex",gap:4}}>
                  <BtnWire>Edit</BtnWire>
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
