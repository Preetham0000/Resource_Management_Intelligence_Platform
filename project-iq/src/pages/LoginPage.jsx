import { useState } from "react";
import { saveAuth } from "../utils/auth";
const ROLES = ["Admin", "Manager", "Developer"];

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("admin@projectiq.app");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("Admin");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");


const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  if (!email || !password) {
    setError("Please fill in all fields.");
    return;
  }
  setLoading(true);
  await new Promise((r) => setTimeout(r, 1000));
  setLoading(false);
  onLogin(role);
};

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--bg)", fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left brand panel */}
      <div style={{
        width: 340, background: "var(--surface2)",
        borderRight: "1px solid var(--border)",
        padding: "48px 40px",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-start",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, #4f7cff18 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 22,
          fontWeight: 800, color: "var(--accent)", marginBottom: 12,
        }}>⬡ ProjectIQ</div>
        <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6, maxWidth: 220, marginBottom: 32 }}>
          AI-powered intelligence for modern project teams.
        </div>
        {[
          "Real-time sprint tracking",
          "ML delay risk prediction",
          "Live notifications via Socket.IO",
          "Multi-role access control",
        ].map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--muted2)", marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent2)", flexShrink: 0 }} />
            {f}
          </div>
        ))}
      </div>

      {/* Right form panel */}
      <div style={{
        width: 340, padding: "48px 32px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Welcome back
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 24 }}>
          Sign in to your account to continue
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 10 }}>
            <div style={labelSt}>Email address</div>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@projectiq.app"
              style={inputSt}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18, position: "relative" }}>
            <div style={labelSt}>Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{ ...inputSt, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} style={{
                position: "absolute", right: 10, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--muted)", fontSize: 12,
              }}>{showPw ? "hide" : "show"}</button>
            </div>
          </div>

          {/* Role selector */}
          <div style={{
            background: "var(--wire)", border: "1px solid var(--wire2)",
            borderRadius: 4, padding: "8px 10px", marginBottom: 14,
          }}>
            <div style={{ ...labelSt, marginBottom: 6 }}>Role</div>
            <div style={{ display: "flex", gap: 6 }}>
              {ROLES.map((r) => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    padding: "3px 8px", borderRadius: 3, cursor: "pointer",
                    border: role === r ? "1px solid var(--accent)" : "1px solid var(--border)",
                    color: role === r ? "var(--accent)" : "var(--muted)",
                    background: role === r ? "#4f7cff18" : "transparent",
                  }}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 11, color: "var(--accent3)", marginBottom: 10,
              padding: "6px 10px", background: "#ff6b6b10",
              border: "1px solid #ff6b6b33", borderRadius: 4,
            }}>⚠ {error}</div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 9,
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            background: "var(--accent)", color: "#fff",
            border: "1px solid var(--accent)", borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, marginBottom: 10,
          }}>
            {loading ? "Signing in…" : `Sign In as ${role} →`}
          </button>

          <div style={{ textAlign: "center", fontSize: 10, color: "var(--muted)" }}>
            POST /api/auth/login · JWT token returned
          </div>
        </form>
      </div>
    </div>
  );
}

const labelSt = {
  fontFamily: "'DM Mono', monospace", fontSize: 9,
  letterSpacing: 1, color: "var(--muted)",
  textTransform: "uppercase", marginBottom: 4,
};
const inputSt = {
  width: "100%", padding: "8px 10px",
  background: "var(--wire)", border: "1px solid var(--wire2)",
  borderRadius: 4, color: "var(--text)", fontSize: 12,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
  boxSizing: "border-box",
};
