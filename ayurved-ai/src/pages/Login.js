import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ── Inline SVG Icons ─────────────────────────────────────── */
const EmailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
    </path>
  </svg>
);

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));;
        nav("/dashboard");
      } else {
        setErrors({ server: data.error || "Invalid credentials" });
      }
    } catch {
      setErrors({ server: "Server unavailable. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FDFAF5;
          font-family: 'Nunito', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background */
        .auth-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 15% 10%, rgba(139,92,42,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 85% 90%, rgba(92,46,10,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 80% 15%, rgba(212,168,67,0.06) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Decorative botanical ring */
        .auth-deco {
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          border: 1px solid rgba(196,168,130,0.15);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-deco::after {
          content: '';
          position: absolute;
          inset: 30px;
          border-radius: 50%;
          border: 1px solid rgba(196,168,130,0.10);
        }

        /* Card */
        .auth-card {
          position: relative;
          z-index: 1;
          background: #FFFFFF;
          border: 1px solid #E8D9C5;
          border-radius: 24px;
          padding: 3rem 2.8rem;
          width: 100%;
          max-width: 440px;
          box-shadow:
            0 4px 24px rgba(44,24,16,0.06),
            0 24px 64px rgba(44,24,16,0.08);
          animation: cardIn 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Brand */
        .auth-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 2rem;
        }
        .auth-brand-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #5C2E0A, #8B5C2A);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 14px rgba(92,46,10,0.28);
        }
        .auth-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #2C1810;
          letter-spacing: -0.2px;
        }
        .auth-brand-sub {
          font-size: 10px;
          color: #A0722A;
          font-weight: 500;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          display: block;
          margin-top: -1px;
        }

        /* Heading */
        .auth-heading {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 500;
          color: #2C1810;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .auth-title em {
          font-style: italic;
          color: #7A3A0A;
        }
        .auth-subtitle {
          font-size: 13.5px;
          color: #A0722A;
          font-weight: 400;
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.6rem;
        }
        .auth-divider-line { flex: 1; height: 1px; background: #E8D9C5; }
        .auth-divider-text { font-size: 11px; color: #C4A882; letter-spacing: 0.5px; }

        /* Field */
        .auth-field { margin-bottom: 1.1rem; }
        .auth-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #6B4A2A;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 13px;
          color: #C4A882;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }
        .auth-input-wrap.focused .auth-input-icon { color: #8B5C2A; }
        .auth-input-wrap.has-error .auth-input-icon { color: #C0392B; }

        .auth-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          background: #FDFAF5;
          border: 1.5px solid #E8D9C5;
          border-radius: 12px;
          color: #2C1810;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: #C4A882; }
        .auth-input:focus {
          border-color: #8B5C2A;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(139,92,42,0.12);
        }
        .auth-input.error {
          border-color: #C0392B;
          background: #FFF5F5;
        }
        .auth-input.error:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.10); }

        .auth-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #C4A882;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.15s;
        }
        .auth-eye-btn:hover { color: #8B5C2A; }

        .auth-error-msg {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          font-size: 12px;
          color: #C0392B;
          font-weight: 500;
          animation: errIn 0.2s ease both;
        }
        @keyframes errIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .auth-error-server {
          background: #FFF0F0;
          border: 1px solid #F4BBBB;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #922B21;
          margin-bottom: 1rem;
          text-align: center;
          animation: errIn 0.2s ease both;
        }

        /* Forgot */
        .auth-forgot {
          text-align: right;
          margin-top: -4px;
          margin-bottom: 1.4rem;
        }
        .auth-forgot a {
          font-size: 12px;
          color: #8B5C2A;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-forgot a:hover { text-decoration: underline; }

        /* Button */
        .auth-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #5C2E0A, #8B5C2A);
          color: #FDF8F0;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 20px rgba(92,46,10,0.25);
          margin-bottom: 1.4rem;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(92,46,10,0.32);
        }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Toggle */
        .auth-toggle {
          text-align: center;
          font-size: 13.5px;
          color: #A0722A;
        }
        .auth-toggle a {
          color: #5C2E0A;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
          border-bottom: 1.5px solid rgba(92,46,10,0.3);
          transition: border-color 0.2s;
        }
        .auth-toggle a:hover { border-color: #5C2E0A; }

        /* Separator */
        .auth-sep {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.2rem 0;
        }
        .auth-sep-line { flex: 1; height: 1px; background: #E8D9C5; }
        .auth-sep-text { font-size: 11px; color: #C4A882; }

        @media (max-width: 480px) {
          .auth-card { padding: 2.2rem 1.6rem; border-radius: 20px; }
          .auth-title { font-size: 22px; }
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-deco" />

        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">🌿</div>
            <div>
              <div className="auth-brand-text">Ayurveda Wellness</div>
              <span className="auth-brand-sub">Classical Medicine</span>
            </div>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1 className="auth-title">Welcome <em>back</em></h1>
            <p className="auth-subtitle">Sign in to continue your wellness journey</p>
          </div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">✦</span>
            <div className="auth-divider-line" />
          </div>

          {/* Server error */}
          {errors.server && <div className="auth-error-server">⚠ {errors.server}</div>}

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className={`auth-input-wrap${focusedField === "email" ? " focused" : ""}${errors.email ? " has-error" : ""}`}>
              <span className="auth-input-icon"><EmailIcon /></span>
              <input
                className={`auth-input${errors.email ? " error" : ""}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>
            {errors.email && <div className="auth-error-msg">⚠ {errors.email}</div>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className={`auth-input-wrap${focusedField === "password" ? " focused" : ""}${errors.password ? " has-error" : ""}`}>
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                className={`auth-input${errors.password ? " error" : ""}`}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                style={{ paddingRight: "40px" }}
              />
              <button className="auth-eye-btn" type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                <EyeIcon open={showPass} />
              </button>
            </div>
            {errors.password && <div className="auth-error-msg">⚠ {errors.password}</div>}
          </div>

          {/* Forgot */}
          <div className="auth-forgot"><a href="#forgot">Forgot password?</a></div>

          {/* Submit */}
          <button className="auth-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
          </button>

          {/* Toggle */}
          <div className="auth-toggle">
            New to Ayurveda Wellness?
            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </div>
    </>
  );
}