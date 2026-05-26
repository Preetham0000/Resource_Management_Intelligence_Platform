import Layout, { Chip, BtnWire, Avatar, Annotation, WBox, TableBase } from "../components/Layout";
import { useState, useEffect } from "react";
import { authFetch } from "../utils/auth";

const MEMBERS = [
  { name:"A. Mehta",  ai:"AM", role:"Frontend Dev", project:"CRM Revamp",       util:78,  color:"var(--accent2)", availability:"Available" },
  { name:"P. Kumar",  ai:"PK", role:"Backend Dev",  project:"Supply Chain AI",   util:96,  color:"var(--accent3)", availability:"Overloaded" },
  { name:"S. Nair",   ai:"SN", role:"Data Engineer", project:"CRM Revamp",       util:60,  color:"var(--accent4)", availability:"Available" },
  { name:"D. Jain",   ai:"DJ", role:"DevOps",        project:"HR Portal 3.0",    util:45,  color:"var(--accent2)", availability:"Available" },
  { name:"V. Khanna", ai:"VK", role:"ML Engineer",  project:"Retail Analytics",  util:88,  color:"var(--accent4)", availability:"Available" },
];

const availColor = { Available:"green", Overloaded:"red" };

export default function ResourcesPage({ onNav }) {
  const [members, setMembers] = useState(MEMBERS);

  useEffect(() => {
    authFetch("/api/resources")
      .then(data => setMembers(data));
  }, []);
  return (
    <Layout page="resources" onNav={onNav}
      topbarTitle="Resource & Team Management"
      topbarActions={<>
        <BtnWire>↑ Bulk Import CSV</BtnWire>
        <BtnWire primary>+ Add Member</BtnWire>
      </>}
    >
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {/* Team table */}
        <div>
          <div style={sectionHdr}>Team Members</div>
          <WBox style={{ overflow:"hidden" }}>
            <TableBase headers={["Member","Role","Project","Availability"]}>
              {MEMBERS.map((m,i) => (
                <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={tdSt}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <Avatar initials={m.ai}/>{m.name}
                    </div>
                  </td>
                  <td style={tdSt}>{m.role}</td>
                  <td style={tdSt}>{m.project}</td>
                  <td style={tdSt}><Chip color={availColor[m.availability]}>{m.availability}</Chip></td>
                </tr>
              ))}
            </TableBase>
          </WBox>
        </div>

        {/* Utilization bars */}
        <div>
          <div style={sectionHdr}>Utilization % (This Sprint)</div>
          <WBox style={{ padding:12 }}>
            {MEMBERS.map((m, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"7px 0",
                borderBottom: i < MEMBERS.length-1 ? "1px solid var(--border)" : "none",
                fontSize:11,
              }}>
                <div style={{ width:80, color:"var(--muted2)", flexShrink:0 }}>{m.name}</div>
                <div style={{ flex:1, height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:m.color, width:`${m.util}%` }}/>
                </div>
                <div style={{ width:32, textAlign:"right", color:"var(--muted)", fontFamily:"'DM Mono',monospace", fontSize:10 }}>
                  {m.util}%
                </div>
              </div>
            ))}
            <Annotation>GET /api/resources · resource_utilization.csv ETL</Annotation>
          </WBox>
        </div>
      </div>
    </Layout>
  );
}

const sectionHdr = { fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--muted2)", letterSpacing:1, textTransform:"uppercase", marginBottom:8 };
const tdSt = { padding:"8px 10px", color:"var(--muted2)", fontSize:11 };
