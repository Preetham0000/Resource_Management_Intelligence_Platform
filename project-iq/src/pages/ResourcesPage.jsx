import Layout, { Chip, BtnWire, Avatar, Annotation, WBox, TableBase } from "../components/Layout";
import { useState, useEffect } from "react";
import { getResources } from "../utils/api";

const availColor = { Available:"green", Overloaded:"red" };

export default function ResourcesPage({ onNav }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await getResources();
      // Map backend User fields to frontend display fields
      const mappedMembers = data.map((user, idx) => ({
        ...user,
        name: user.username,
        ai: (user.username || "U").substring(0, 2).toUpperCase(),
        availability: Math.random() > 0.5 ? "Available" : "Overloaded",
        util: 30 + Math.floor(Math.random() * 70),
        color: ["var(--accent)", "var(--accent2)", "var(--accent3)"][Math.floor(Math.random() * 3)],
        project: "Current Project",
      })) || [];
      setMembers(mappedMembers);
    } catch (err) {
      console.error(err);
    }
  };
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
              {members.map((m,i) => (
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
            {members.map((m, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"7px 0",
                borderBottom: i < members.length-1 ? "1px solid var(--border)" : "none",
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
