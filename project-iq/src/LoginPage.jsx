import { useState } from "react";

const ROLES = ["Admin", "Manager", "Developer"];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Developer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);

    // Simulate API call: POST /api/auth/login
    try {
      const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, role }),
});
const data = await res.json();
localStorage.setItem("token", data.token);
// redirect based on role
window.location.href = role === "Admin" ? "/admin" : "/dashboard";

      // Placeholder simulation
      await new Promise((r) => setTimeout(r, 1400));
      alert(`Logged in as ${role}: ${email}`);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandArea}>
          <div style={styles.logoMark}>
            <span style={styles.logoIcon}>⬡</span>
          </div>
          <h1 style={styles.brandName}>ProjectIQ</h1>
          <p style={styles.brandTagline}>
            AI-Powered Project & Resource Intelligence
          </p>
        </div>

        <div style={styles.featureList}>
          {[
            { icon: "", text: "Real-time sprint analytics" },
            { icon: "", text: "ML-based delay risk prediction" },
            { icon: "", text: "Live task notifications" },
            { icon: "", text: "Smart resource allocation" },
          ].map((f) => (
            <div key={f.text} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={styles.leftFooter}>
          <span style={styles.versionBadge}>v1.0 · Capstone MVP</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSubtitle}>
              Access your workspace dashboard
            </p>
          </div>

          {/* Role selector */}
          <div style={styles.roleRow}>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  ...styles.roleBtn,
                  ...(role === r ? styles.roleBtnActive : {}),
                }}
              >
                {r === "Admin" && "🛡 "}
                {r === "Manager" && "📋 "}
                {r === "Developer" && "💻 "}
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={styles.input}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: "44px" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p style={styles.errorMsg}>⚠ {error}</p>}

            {/* Forgot */}
            <div style={styles.forgotRow}>
              <button type="button" style={styles.forgotLink}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Signing in…
                </span>
              ) : (
                `Sign in as ${role}`
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>Demo credentials</p>
            <p style={styles.demoText}>admin@projectiq.com · admin123</p>
          </div>

          <p style={styles.registerNote}>
            New to ProjectIQ?{" "}
            <button type="button" style={styles.registerLink}>
              Request access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f4f5f7",
  },

  // ---- Left panel ----
  leftPanel: {
    width: "420px",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0f1b35 0%, #1a3260 60%, #1e4da0 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 40px",
    color: "#fff",
    flexShrink: 0,
  },
  brandArea: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logoMark: {
    width: "52px",
    height: "52px",
    background: "rgba(255,255,255,0.12)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  logoIcon: {
    fontSize: "26px",
    filter: "drop-shadow(0 0 6px rgba(100,160,255,0.5))",
  },
  brandName: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    color: "#fff",
  },
  brandTagline: {
    margin: 0,
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.5,
    maxWidth: "260px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "8px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  featureIcon: {
    fontSize: "20px",
    width: "36px",
    height: "36px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
  },
  leftFooter: {
    display: "flex",
  },
  versionBadge: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.07)",
    padding: "4px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  // ---- Right panel ----
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "44px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e8eaf0",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formTitle: {
    margin: "0 0 6px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f1b35",
    letterSpacing: "-0.3px",
  },
  formSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#7a8099",
  },

  // Role selector
  roleRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "28px",
    background: "#f4f5f7",
    padding: "4px",
    borderRadius: "12px",
  },
  roleBtn: {
    flex: 1,
    padding: "8px 4px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    borderRadius: "9px",
    background: "transparent",
    color: "#7a8099",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  roleBtnActive: {
    background: "#fff",
    color: "#1a3260",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },

  // Form fields
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#3d4460",
    letterSpacing: "0.2px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: "14px",
    border: "1.5px solid #e0e3ed",
    borderRadius: "10px",
    outline: "none",
    color: "#0f1b35",
    background: "#fafbfc",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "2px",
    lineHeight: 1,
  },
  errorMsg: {
    margin: 0,
    fontSize: "13px",
    color: "#c0392b",
    background: "#fdf0f0",
    border: "1px solid #f5c6c6",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-8px",
  },
  forgotLink: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#1a3260",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #1a3260 0%, #1e4da0 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "11px",
    cursor: "pointer",
    transition: "opacity 0.15s",
    marginTop: "4px",
    letterSpacing: "0.2px",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  // Demo box
  demoBox: {
    background: "#f0f4ff",
    border: "1px dashed #bcc8e8",
    borderRadius: "10px",
    padding: "12px 16px",
    marginTop: "20px",
    textAlign: "center",
  },
  demoTitle: {
    margin: "0 0 2px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#1a3260",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  demoText: {
    margin: 0,
    fontSize: "13px",
    color: "#7a8099",
    fontFamily: "monospace",
  },

  registerNote: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#7a8099",
  },
  registerLink: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#1a3260",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
  },
};
