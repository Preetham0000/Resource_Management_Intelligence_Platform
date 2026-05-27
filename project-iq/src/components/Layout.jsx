import { logout, getRole } from "../utils/auth";
const NAV = [
  { key: "dashboard", icon: "⊞", label: "Dashboard", group: "Main" },
  { key: "projects",  icon: "◫", label: "Projects",  group: "Main" },
  { key: "sprints",   icon: "◻", label: "Sprints",   group: "Main" },
  { key: "tasks",     icon: "✓", label: "Tasks",     group: "Main" },
  { key: "analytics", icon: "∿", label: "Analytics", group: "Insights" },
  { key: "risk",      icon: "⚠", label: "Risk Report",group: "Insights" },
  { key: "resources", icon: "⊕", label: "Resources", group: "System" },
];

export default function Layout({ page, onNav, children, topbarTitle, topbarActions }) {
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 200, flexShrink: 0,
        background: "var(--surface2)",
        borderRight: "1px solid var(--border)",
        padding: "16px 0",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "0 16px 16px",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13, fontWeight: 700,
          color: "var(--accent)",
          borderBottom: "1px solid var(--border)",
          marginBottom: 12,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 26, height: 26, background: "var(--accent)",
            borderRadius: 6, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, color: "#fff",
          }}>⬡</div>
          ProjectIQ
        </div>

        {groups.map(g => (
          <div key={g}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, letterSpacing: 2,
              color: "var(--muted)",
              textTransform: "uppercase",
              padding: "8px 16px 4px",
            }}>{g}</div>
            {NAV.filter(n => n.group === g).map(n => (
              <div
                key={n.key}
                onClick={() => onNav(n.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px",
                  fontSize: 12,
                  color: page === n.key ? "var(--accent)" : "var(--muted2)",
                  background: page === n.key ? "#4f7cff12" : "transparent",
                  borderLeft: `2px solid ${page === n.key ? "var(--accent)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>{n.icon}</span>
                {n.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{
          padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>
            {topbarTitle}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {topbarActions}
            <span style={{ fontSize:11, color:"var(--muted)", fontFamily:"'DM Mono',monospace" }}>
              {getRole()}
            </span>
            <BtnWire onClick={logout}>Logout</BtnWire>
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Shared small components
export function Chip({ color = "default", children, style = {} }) {
  const colors = {
    blue:   { color: "var(--accent)",  border: "var(--accent)",  bg: "#4f7cff18" },
    green:  { color: "var(--accent2)", border: "var(--accent2)", bg: "#00e5a018" },
    red:    { color: "var(--accent3)", border: "var(--accent3)", bg: "#ff6b6b18" },
    yellow: { color: "var(--accent4)", border: "var(--accent4)", bg: "#ffc85718" },
    default:{ color: "var(--muted2)", border: "var(--border)",   bg: "transparent" },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 10, padding: "3px 8px",
      borderRadius: 3, border: `1px solid ${c.border}`,
      color: c.color, background: c.bg,
      whiteSpace: "nowrap",
      ...style,
    }}>{children}</span>
  );
}

export function BtnWire({ primary, onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 10, padding: "5px 12px",
      borderRadius: 4,
      border: `1px solid ${primary ? "var(--accent)" : "var(--border-bright)"}`,
      background: primary ? "var(--accent)" : "var(--wire)",
      color: primary ? "#fff" : "var(--muted2)",
      cursor: "pointer", whiteSpace: "nowrap",
      ...style,
    }}>{children}</button>
  );
}

export function StatCard({ label, value, trend, color = "var(--accent)" }) {
  return (
    <div style={{
      background: "var(--wire)", border: "1px solid var(--wire2)",
      borderRadius: 8, padding: 14,
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        letterSpacing: "1.5px", color: "var(--muted)",
        textTransform: "uppercase", marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 22,
        fontWeight: 700, color, marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--muted)" }}>{trend}</div>
    </div>
  );
}

export function WBox({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--wire)", border: "1px solid var(--wire2)",
      borderRadius: 6, ...style,
    }}>{children}</div>
  );
}

export function Avatar({ initials }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: "50%",
      background: "var(--wire2)", border: "2px solid var(--surface)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 8, fontWeight: 700, color: "var(--muted)", flexShrink: 0,
    }}>{initials}</div>
  );
}

export function Annotation({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      color: "var(--accent2)", marginTop: 8, letterSpacing: ".5px",
    }}>
      <span>↳</span> {children}
    </div>
  );
}

export function TableBase({ headers, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                letterSpacing: "1.5px", textTransform: "uppercase",
                color: "var(--muted)", padding: "6px 10px", textAlign: "left",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface2)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
