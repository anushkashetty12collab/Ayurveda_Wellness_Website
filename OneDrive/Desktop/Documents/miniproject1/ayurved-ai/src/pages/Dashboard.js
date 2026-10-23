import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const modules = [
    {
      name: "Ayurveda Recommendation",
      desc: "Discover classical formulations tailored to your symptoms using AI-powered analysis of ancient texts.",
      route: "/recommend",
      icon: "🌿",
      accent: "#8B4513",
      tag: "Most Popular",
      stat: "768 Formulations",
    },
    {
      name: "Dosha Detector",
      desc: "Reveal your unique Prakriti — Vata, Pitta, or Kapha — through a guided assessment.",
      route: "/dosha",
      icon: "☯️",
      accent: "#A0522D",
      tag: "Quick Test",
      stat: "3 Body Types",
    },
    {
      name: "Diet Planner",
      desc: "Receive a personalized seasonal diet curated to your dosha, lifestyle, and wellness goals.",
      route: "/diet",
      icon: "🍽️",
      accent: "#6B3A2A",
      tag: "Personalized",
      stat: "Dosha-Based",
    },
  ];

  const stats = [
    { label: "Formulations", value: "768+", icon: "📜" },
    { label: "Herbs Indexed", value: "340+", icon: "🌱" },
    { label: "Conditions", value: "120+", icon: "🩺" },
    { label: "Categories", value: "17", icon: "🏷️" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --brown-900: #2C1810;
          --brown-800: #3D1C08;
          --brown-700: #5C2E0A;
          --brown-600: #7A3A0A;
          --brown-500: #8B5C2A;
          --brown-400: #A0722A;
          --brown-300: #C4A882;
          --brown-200: #E8D9C5;
          --brown-100: #F5EFE6;
          --brown-50:  #FDFAF5;
          --gold:      #D4A843;
          --gold-light:#F0D080;
          --cream:     #FDF8F0;
          --white:     #FFFFFF;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dashboard-root {
          min-height: 100vh;
          background: var(--brown-50);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Ambient Background ─────────────────────────── */
        .bg-pattern {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(139,92,42,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(92,46,10,0.06) 0%, transparent 55%);
        }
        .bg-mandala {
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          opacity: 0.035;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Navbar ─────────────────────────────────────── */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          height: 68px;
          background: rgba(253,250,245,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--brown-200);
          box-shadow: 0 1px 24px rgba(44,24,16,0.06);
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .navbar-brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--brown-700), var(--brown-500));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(92,46,10,0.3);
        }
        .navbar-brand-text {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--brown-800);
          letter-spacing: 0.3px;
        }
        .navbar-brand-sub {
          font-size: 10px;
          color: var(--brown-400);
          font-weight: 400;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: block;
          margin-top: -2px;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          border-radius: 99px;
          background: var(--brown-100);
          border: 1px solid var(--brown-200);
        }
        .navbar-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--brown-600), var(--brown-400));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--cream);
          font-weight: 600;
          font-family: 'Playfair Display', serif;
        }
        .navbar-username {
          font-size: 13px;
          font-weight: 500;
          color: var(--brown-700);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: transparent;
          border: 1.5px solid var(--brown-300);
          border-radius: 10px;
          color: var(--brown-600);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.2px;
        }
        .logout-btn:hover {
          background: var(--brown-800);
          border-color: var(--brown-800);
          color: var(--cream);
          box-shadow: 0 4px 16px rgba(44,24,16,0.2);
        }

        /* ── Hero ───────────────────────────────────────── */
        .hero {
          position: relative;
          z-index: 1;
          padding: 4rem 3rem 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          animation: fadeUp 0.7s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-left {}
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          background: linear-gradient(90deg, rgba(212,168,67,0.15), rgba(212,168,67,0.05));
          border: 1px solid rgba(212,168,67,0.35);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #A07820;
          margin-bottom: 16px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 3.5vw, 46px);
          font-weight: 500;
          color: var(--brown-900);
          line-height: 1.18;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }
        .hero-title em {
          font-style: italic;
          color: var(--brown-600);
        }
        .hero-subtitle {
          font-family: 'Crimson Pro', serif;
          font-size: 18px;
          color: var(--brown-400);
          font-weight: 300;
          max-width: 520px;
          line-height: 1.7;
          font-style: italic;
        }
        .hero-right {
          flex-shrink: 0;
        }
        .hero-date-card {
          background: var(--white);
          border: 1px solid var(--brown-200);
          border-radius: 16px;
          padding: 1.2rem 1.6rem;
          text-align: right;
          box-shadow: 0 4px 24px rgba(44,24,16,0.07);
        }
        .hero-date-day {
          font-family: 'Playfair Display', serif;
          font-size: 44px;
          font-weight: 600;
          color: var(--brown-800);
          line-height: 1;
        }
        .hero-date-rest {
          font-size: 13px;
          color: var(--brown-400);
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        /* ── Divider ─────────────────────────────────────── */
        .divider {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 3rem;
          margin-bottom: 1.5rem;
        }
        .divider-line { flex: 1; height: 1px; background: var(--brown-200); }
        .divider-text {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          color: var(--brown-300);
          font-style: italic;
          white-space: nowrap;
        }

        /* ── Stats Bar ──────────────────────────────────── */
        .stats-bar {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 0 3rem 2.5rem;
          animation: fadeUp 0.7s ease 0.1s both;
        }
        .stat-card {
          background: var(--white);
          border: 1px solid var(--brown-200);
          border-radius: 14px;
          padding: 1rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 12px rgba(44,24,16,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(44,24,16,0.1);
        }
        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          background: var(--brown-100);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--brown-800);
          line-height: 1;
        }
        .stat-label {
          font-size: 11px;
          color: var(--brown-400);
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-top: 2px;
          text-transform: uppercase;
        }

        /* ── Section Header ──────────────────────────────── */
        .section-header {
          position: relative;
          z-index: 1;
          padding: 0 3rem 1.5rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 500;
          color: var(--brown-900);
          letter-spacing: -0.3px;
        }
        .section-sub {
          font-family: 'Crimson Pro', serif;
          font-size: 15px;
          color: var(--brown-400);
          font-style: italic;
          margin-top: 2px;
        }

        /* ── Module Cards ────────────────────────────────── */
        .modules-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 0 3rem 3rem;
          animation: fadeUp 0.7s ease 0.2s both;
        }
        .module-card {
          background: var(--white);
          border: 1px solid var(--brown-200);
          border-radius: 20px;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 4px 20px rgba(44,24,16,0.05);
          position: relative;
        }
        .module-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(44,24,16,0.14);
          border-color: var(--brown-300);
        }
        .module-card-accent {
          height: 5px;
          background: linear-gradient(90deg, var(--brown-700), var(--brown-400));
          transition: height 0.25s ease;
        }
        .module-card:hover .module-card-accent { height: 6px; }

        .module-card-body {
          padding: 1.6rem 1.8rem 1.4rem;
        }
        .module-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .module-icon-wrap {
          width: 52px;
          height: 52px;
          background: var(--brown-100);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 1px solid var(--brown-200);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .module-card:hover .module-icon-wrap {
          background: var(--brown-200);
          transform: scale(1.06) rotate(-3deg);
        }
        .module-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--brown-100);
          color: var(--brown-500);
          border: 1px solid var(--brown-200);
        }
        .module-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          color: var(--brown-900);
          margin-bottom: 8px;
          letter-spacing: -0.2px;
          line-height: 1.25;
        }
        .module-desc {
          font-family: 'Crimson Pro', serif;
          font-size: 15.5px;
          color: var(--brown-400);
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 1.4rem;
        }
        .module-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--brown-100);
        }
        .module-stat {
          font-size: 12px;
          font-weight: 500;
          color: var(--brown-400);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .module-stat::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brown-300);
        }
        .module-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--brown-800);
          color: var(--cream);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          transition: background 0.2s ease, gap 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .module-card:hover .module-cta {
          background: var(--brown-700);
          gap: 10px;
        }
        .module-cta-arrow {
          font-size: 14px;
          transition: transform 0.2s ease;
        }
        .module-card:hover .module-cta-arrow { transform: translateX(3px); }

        /* ── Wisdom Strip ────────────────────────────────── */
        .wisdom-strip {
          position: relative;
          z-index: 1;
          margin: 0 3rem 3rem;
          background: linear-gradient(135deg, var(--brown-800) 0%, var(--brown-600) 100%);
          border-radius: 20px;
          padding: 2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(44,24,16,0.2);
          animation: fadeUp 0.7s ease 0.35s both;
        }
        .wisdom-strip::before {
          content: '𑁍';
          position: absolute;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 120px;
          opacity: 0.07;
          line-height: 1;
          color: var(--gold);
          pointer-events: none;
        }
        .wisdom-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 8px;
          opacity: 0.8;
        }
        .wisdom-quote {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-style: italic;
          color: var(--cream);
          line-height: 1.55;
          max-width: 520px;
          font-weight: 400;
        }
        .wisdom-source {
          font-size: 12px;
          color: rgba(253,248,240,0.55);
          margin-top: 6px;
          font-family: 'DM Sans', sans-serif;
        }
        .wisdom-cta-btn {
          flex-shrink: 0;
          padding: 11px 22px;
          background: rgba(253,248,240,0.12);
          border: 1.5px solid rgba(253,248,240,0.25);
          border-radius: 12px;
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
          white-space: nowrap;
        }
        .wisdom-cta-btn:hover { background: rgba(253,248,240,0.22); }

        /* ── Logout Confirm Modal ────────────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(44,24,16,0.5);
          backdrop-filter: blur(6px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeMask 0.2s ease;
        }
        @keyframes fadeMask { from { opacity: 0 } to { opacity: 1 } }
        .modal-box {
          background: var(--white);
          border-radius: 20px;
          padding: 2.5rem 2.8rem;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 24px 64px rgba(44,24,16,0.25);
          animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-icon { font-size: 40px; margin-bottom: 16px; }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: var(--brown-900);
          margin-bottom: 8px;
        }
        .modal-text {
          font-family: 'Crimson Pro', serif;
          font-size: 16px;
          color: var(--brown-400);
          font-style: italic;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .modal-actions { display: flex; gap: 12px; }
        .modal-cancel {
          flex: 1;
          padding: 11px;
          border: 1.5px solid var(--brown-200);
          border-radius: 12px;
          background: transparent;
          color: var(--brown-500);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .modal-cancel:hover { background: var(--brown-100); }
        .modal-confirm {
          flex: 1;
          padding: 11px;
          border: none;
          border-radius: 12px;
          background: var(--brown-800);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .modal-confirm:hover { background: var(--brown-900); }

        /* ── Footer ─────────────────────────────────────── */
        .footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 1.5rem 3rem 2.5rem;
          font-family: 'Crimson Pro', serif;
          font-size: 14px;
          color: var(--brown-300);
          font-style: italic;
          border-top: 1px solid var(--brown-200);
        }
        .footer span { color: var(--brown-500); }

        @media (max-width: 960px) {
          .modules-grid { grid-template-columns: 1fr; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .hero, .divider, .stats-bar, .section-header, .modules-grid, .wisdom-strip, .footer {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .wisdom-strip { margin-left: 1.5rem; margin-right: 1.5rem; flex-direction: column; }
          .navbar { padding: 0 1.5rem; }
        }
      `}</style>

      <div className="dashboard-root">
        <div className="bg-pattern" />

        {/* SVG Mandala */}
        <svg className="bg-mandala" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="195" stroke="#7A3A0A" strokeWidth="1"/>
          <circle cx="200" cy="200" r="160" stroke="#7A3A0A" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="120" stroke="#7A3A0A" strokeWidth="1"/>
          <circle cx="200" cy="200" r="80" stroke="#7A3A0A" strokeWidth="0.5"/>
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <line key={i} x1="200" y1="5" x2="200" y2="395" stroke="#7A3A0A" strokeWidth="0.5" transform={`rotate(${a} 200 200)`}/>
          ))}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
            <ellipse key={i} cx="200" cy="120" rx="12" ry="30" fill="#7A3A0A" transform={`rotate(${a} 200 200)`}/>
          ))}
        </svg>

        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">🌿</div>
            <div>
              <div className="navbar-brand-text">Ayurveda Wellness</div>
              <span className="navbar-brand-sub">Classical Medicine Platform</span>
            </div>
          </div>
          <div className="navbar-right">
            <div className="navbar-user">
              <div className="navbar-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">
                {user?.name || "User"}
              </span>
            </div>
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log Out
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span>✦</span> Ayurvedic Intelligence Platform
            </div>
            <h1 className="hero-title">
              Welcome to your<br />
              <em>Wellness Sanctuary</em>
            </h1>
            <p className="hero-subtitle">
              Ancient wisdom meets modern intelligence. Explore 5,000 years of Ayurvedic knowledge, personalized for your constitution.
            </p>
          </div>
          <div className="hero-right">
            <div className="hero-date-card">
              <div className="hero-date-day">
                {new Date().getDate()}
              </div>
              <div className="hero-date-rest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}<br />
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="divider">
          <div className="divider-line" />
          <div className="divider-text">— Explore the Modules —</div>
          <div className="divider-line" />
        </div>

        {/* Section header */}
        <div className="section-header">
          <div>
            <div className="section-title">Your Wellness Modules</div>
            <div className="section-sub">Select a module to begin your journey</div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="modules-grid">
          {modules.map((m, i) => (
            <div
              key={i}
              className="module-card"
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => nav(m.route)}
            >
              <div className="module-card-accent" />
              <div className="module-card-body">
                <div className="module-card-top">
                  <div className="module-icon-wrap">{m.icon}</div>
                  <span className="module-tag">{m.tag}</span>
                </div>
                <h2 className="module-name">{m.name}</h2>
                <p className="module-desc">{m.desc}</p>
                <div className="module-card-footer">
                  <span className="module-stat">{m.stat}</span>
                  <button className="module-cta">
                    Open Module
                    <span className="module-cta-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wisdom Strip */}
        <div className="wisdom-strip">
          <div>
            <div className="wisdom-label">✦ Daily Wisdom · Charaka Samhita</div>
            <div className="wisdom-quote">
              "The three pillars of health — Ahara, Nidra, and Brahmacharya — when kept in balance, sustain the body throughout a long and wholesome life."
            </div>
            <div className="wisdom-source">Charaka Samhita · Sutrasthana</div>
          </div>
          <button className="wisdom-cta-btn" onClick={() => nav('/recommend')}>
            Begin Consultation →
          </button>
        </div>

        {/* Footer */}
        <div className="footer">
          Crafted with reverence for <span>Ayurvedic tradition</span> · All formulations are for informational purposes only · Consult a qualified physician before use
        </div>

        {/* Logout Modal */}
        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🌿</div>
              <div className="modal-title">Leaving so soon?</div>
              <p className="modal-text">
                Your wellness journey awaits. Are you sure you want to log out of the Ayurveda Platform?
              </p>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setShowLogoutConfirm(false)}>
                  Stay
                </button>
                            <button
              className="modal-confirm"
              onClick={() => {
                setShowLogoutConfirm(false);

                // 🧹 Clear data
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // 🔁 Redirect to login page
                nav("/");

              }}
            >
              Yes, Log Out
            </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}