import { useState, useEffect } from "react";
import { apiUrl } from "../apiBase";
import { QUESTIONS } from "./DoshaQuestions";
import { KNOWLEDGE_UI } from "./DoshaKnowledgeSnapshot";

const DOSHA_THEME = {
  Vata:  { color: "#4A5FA8", accent: "#7B91D4", light: "#EEF0FB", text: "#1E2A6B", symbol: "🌬️", element: "Air + Ether",
            bg: "linear-gradient(135deg,#1A2362 0%,#3A4FA8 50%,#6B7FD4 100%)",
            particle: "#8899E0", glow: "rgba(74,95,168,0.35)" },
  Pitta: { color: "#B53A06", accent: "#E06030", light: "#FBF0EB", text: "#6B1800", symbol: "🔥", element: "Fire + Water",
            bg: "linear-gradient(135deg,#5C1200 0%,#B03010 50%,#D4541A 100%)",
            particle: "#E07050", glow: "rgba(181,58,6,0.35)" },
  Kapha: { color: "#1A6B40", accent: "#3A9E6A", light: "#EAF7F0", text: "#0A3D22", symbol: "🌍", element: "Earth + Water",
            bg: "linear-gradient(135deg,#0A2E1A 0%,#1A6B40 50%,#3A9E6A 100%)",
            particle: "#5ABF8E", glow: "rgba(26,107,64,0.35)" },
};

export default function DoshaDetector() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [animKey, setAnimKey] = useState(0);
  const [hoveredOption, setHoveredOption] = useState(null);

  const totalQuestions = QUESTIONS.length;
  const isQuestion = step >= 1 && step <= totalQuestions;
  const currentQ = isQuestion ? QUESTIONS[step - 1] : null;

  useEffect(() => {
    if (isQuestion) {
      const saved = answers[currentQ.key];
      setSelected(saved || null);
      setAnimKey(k => k + 1);
    }
  }, [step]);

  const handleSelect = (val) => setSelected(val);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [currentQ.key]: selected };
    setAnswers(newAnswers);
    if (step < totalQuestions) {
      setStep(s => s + 1);
    } else {
      submitDosha(newAnswers);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else setStep(0);
  };

  const submitDosha = async (finalAnswers) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/dosha"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      let data = {};
      try { data = await res.json(); } catch { /* non-JSON body */ }
      if (!res.ok) {
        const msg = typeof data?.error === "string"
          ? data.error
          : `Dosha API error (${res.status}). Check that the server matches the 25-field questionnaire.`;
        setError(msg);
        setResult(localFallback(finalAnswers, { offline_fallback: true }));
        setStep(totalQuestions + 1);
        return;
      }
      setResult(data);
      setStep(totalQuestions + 1);
    } catch (e) {
      setError(e.message || "Network error — start Flask on port 5050, then restart npm start (proxy). Or set REACT_APP_API_URL.");
      setResult(localFallback(finalAnswers, { offline_fallback: true }));
      setStep(totalQuestions + 1);
    } finally {
      setLoading(false);
    }
  };

  const localFallback = (ans, flags = {}) => {
    const PITTA_OUTPUT_SCALE = 0.55;
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    QUESTIONS.forEach(q => {
      const opt = q.options.find(o => o.value === ans[q.key]);
      if (!opt?.trait) return;
      scores.Vata += opt.trait[0];
      scores.Pitta += opt.trait[1];
      scores.Kapha += opt.trait[2];
    });
    scores.Pitta *= PITTA_OUTPUT_SCALE;
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const pct = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round((v / total) * 100)]));
    const ranked = Object.entries(pct).sort((a, b) => b[1] - a[1]);
    const dominant = ranked[0][0];
    const secondary = ranked[1][0];
    const theme = DOSHA_THEME[dominant];
    const k = KNOWLEDGE_UI[dominant];
    return {
      dominant_dosha: dominant, secondary_dosha: secondary,
      is_dual_dosha: pct[secondary] >= pct[dominant] - 18,
      dual_combination: null, percentages: pct,
      element: theme.element, symbol: theme.symbol, color: theme.color,
      tagline: k.tagline, description: k.description, qualities: k.qualities,
      strengths: k.strengths, imbalance_signs: k.imbalance_signs,
      herbs: k.herbs, lifestyle: k.lifestyle, yoga: k.yoga, diet: k.diet,
      seasonal_tip: k.seasonal_tip, mantra: k.mantra, dual_info: null,
      offline_fallback: Boolean(flags.offline_fallback),
    };
  };

  const reset = () => {
    setStep(0); setAnswers({}); setSelected(null);
    setResult(null); setError(""); setActiveTab("overview");
  };

  const theme = result ? DOSHA_THEME[result.dominant_dosha] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,500;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #FAF6EE;
          --ink: #1A0E08;
          --gold: #C9952A;
          --gold-light: #E8C97A;
          --gold-muted: #A07A30;
          --warm-white: #FFFDF8;
          --border: #E0CDAC;
          --border-soft: #EDE0C8;
          --text-secondary: #7A5C38;
          --text-muted: #A08060;
          --shadow-warm: rgba(60,30,10,0.10);
          --radius-card: 20px;
          --radius-sm: 10px;
        }

        .dp-root {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
          color: var(--ink);
        }

        /* Layered ambient background with grain texture */
        .dp-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 5%, rgba(201,149,42,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 90% 95%, rgba(100,50,10,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,149,42,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* SVG grain overlay for tactile paper feel */
        .dp-grain {
          position: fixed;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
          z-index: 0;
        }

        /* Decorative top border accent */
        .dp-top-accent {
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--gold-muted) 20%, var(--gold) 50%, var(--gold-muted) 80%, transparent 100%);
          position: relative;
          z-index: 51;
        }

        /* ── NAVBAR ─────────────────────────────────────── */
        .dp-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 64px;
          background: rgba(250,246,238,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-soft);
        }

        .dp-nav-brand {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 11px;
          letter-spacing: 0.3px;
        }

        .dp-nav-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #3D1C08, #8B5C2A);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(60,30,10,0.3);
        }

        .dp-nav-divider {
          width: 1px;
          height: 16px;
          background: var(--border);
          margin: 0 2px;
        }

        .dp-nav-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .dp-nav-back {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s;
          letter-spacing: 0.2px;
        }
        .dp-nav-back:hover {
          background: rgba(201,149,42,0.06);
          border-color: var(--gold-muted);
          color: var(--ink);
        }

        /* ── PROGRESS BAR ───────────────────────────────── */
        .dp-progress-wrap {
          position: sticky;
          top: 64px;
          z-index: 40;
          background: rgba(250,246,238,0.92);
          backdrop-filter: blur(12px);
          padding: 12px 2.5rem;
          border-bottom: 1px solid var(--border-soft);
        }

        .dp-progress-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .dp-progress-bar {
          height: 3px;
          background: var(--border-soft);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .dp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold-muted), var(--gold));
          border-radius: 99px;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }

        .dp-progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 7px;
          height: 7px;
          background: var(--gold);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--gold);
        }

        /* ── MAIN LAYOUT ────────────────────────────────── */
        .dp-main {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3.5rem 1.5rem 5rem;
          position: relative;
          z-index: 1;
        }

        .dp-content {
          width: 100%;
          max-width: 660px;
        }

        /* ══════════════════════════════════════════════════
           INTRO CARD
        ══════════════════════════════════════════════════ */
        .intro-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius-card);
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(60,30,10,0.04),
            0 8px 40px rgba(60,30,10,0.09),
            0 24px 80px rgba(60,30,10,0.05);
          animation: riseIn .65s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-8px) rotate(2deg); }
          66%       { transform: translateY(-4px) rotate(-1deg); }
        }

        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,149,42,0.3), 0 0 40px rgba(201,149,42,0.2); transform: scale(1); }
          50%       { box-shadow: 0 0 0 18px rgba(201,149,42,0), 0 0 60px rgba(201,149,42,0.3); transform: scale(1.04); }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .intro-hero {
          background: linear-gradient(160deg, #1A0808 0%, #3D1408 35%, #6B3010 65%, #9B6030 100%);
          padding: 3.5rem 3rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Ornamental watermark chakra */
        .intro-hero::before {
          content: '☸';
          position: absolute;
          right: -50px;
          top: -50px;
          font-size: 260px;
          opacity: 0.035;
          color: #F5DEB3;
          line-height: 1;
          pointer-events: none;
          animation: spinSlow 60s linear infinite;
        }

        /* Subtle radial glow center */
        .intro-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 50% at 50% 30%, rgba(201,149,42,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .intro-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 16px;
          background: rgba(201,149,42,0.12);
          border: 1px solid rgba(201,149,42,0.25);
          border-radius: 99px;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(232,201,122,0.85);
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .intro-eyebrow-dot {
          width: 5px;
          height: 5px;
          background: var(--gold);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--gold);
          animation: orbPulse 2s ease infinite;
        }

        .intro-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 900;
          color: #F8EDD8;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .intro-title em {
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(135deg, #E8C97A, #F5DEB3, #C9952A);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .intro-sub {
          font-size: 14px;
          color: rgba(245,222,179,0.55);
          font-weight: 300;
          max-width: 440px;
          margin: 0 auto 2.2rem;
          line-height: 1.75;
          position: relative;
          z-index: 1;
          font-style: italic;
        }

        .intro-pills {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }

        .intro-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 99px;
          font-size: 12.5px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.75);
          backdrop-filter: blur(8px);
          transition: all .25s;
        }

        .intro-pill:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.95);
          transform: translateY(-1px);
        }

        /* ── Intro Body ── */
        .intro-body {
          padding: 2.5rem 3rem 3rem;
        }

        .intro-section-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--gold-muted);
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .intro-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-soft);
        }

        .intro-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 2.2rem;
        }

        .intro-feat {
          text-align: center;
          padding: 1.4rem 1rem;
          background: var(--cream);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          transition: all .25s;
          position: relative;
          overflow: hidden;
        }

        .intro-feat::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,149,42,0.05), transparent);
          opacity: 0;
          transition: opacity .25s;
        }

        .intro-feat:hover {
          border-color: var(--border);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow-warm);
        }

        .intro-feat:hover::before { opacity: 1; }

        .intro-feat-icon {
          font-size: 24px;
          margin-bottom: 10px;
          display: block;
          animation: float 4s ease-in-out infinite;
        }

        .intro-feat:nth-child(2) .intro-feat-icon { animation-delay: 0.5s; }
        .intro-feat:nth-child(3) .intro-feat-icon { animation-delay: 1s; }

        .intro-feat-label {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .intro-feat-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.55;
        }

        .start-btn {
          width: 100%;
          padding: 17px;
          background: linear-gradient(135deg, #2C1008, #6B3010, #9B5520);
          color: #F8EDD8;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 13px;
          cursor: pointer;
          letter-spacing: 0.8px;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 6px 24px rgba(60,20,5,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }

        .start-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.06));
          pointer-events: none;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(60,20,5,0.42), inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .start-btn:active { transform: scale(0.99); }

        /* ══════════════════════════════════════════════════
           QUESTION CARD
        ══════════════════════════════════════════════════ */
        .q-card {
          animation: fadeSlideIn .38s cubic-bezier(.22,1,.36,1) both;
        }

        .q-header { margin-bottom: 1.8rem; }

        .q-step-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 14px;
          background: rgba(201,149,42,0.08);
          border: 1px solid rgba(201,149,42,0.2);
          border-radius: 99px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--gold-muted);
          margin-bottom: 16px;
        }

        .q-icon-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 8px;
        }

        .q-icon-wrap {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #FAF0E0, #F0E0C0);
          border: 1px solid var(--border);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px var(--shadow-warm);
        }

        .q-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .q-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 5px;
          line-height: 1.6;
          font-style: italic;
        }

        /* ── Options ── */
        .q-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .q-option {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 18px;
          background: var(--warm-white);
          border: 1.5px solid var(--border-soft);
          border-radius: 13px;
          cursor: pointer;
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .q-option::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #6B3010, #C4A060);
          border-radius: 3px 0 0 3px;
          opacity: 0;
          transition: opacity .2s;
        }

        .q-option:hover {
          border-color: var(--border);
          background: #FFFBF4;
          transform: translateX(3px);
          box-shadow: 0 4px 16px var(--shadow-warm);
        }

        .q-option:hover::before { opacity: 0.5; }

        .q-option.selected {
          border-color: #8B5C2A;
          background: linear-gradient(135deg, #FFFBF0, #FFF4E0);
          transform: translateX(3px);
          box-shadow: 0 4px 20px rgba(92,46,10,0.12);
        }

        .q-option.selected::before { opacity: 1; }

        .q-opt-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border);
          flex-shrink: 0;
          margin-top: 2px;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--warm-white);
        }

        .q-option.selected .q-opt-radio {
          border-color: #5C2E0A;
          background: linear-gradient(135deg, #5C2E0A, #8B5C2A);
          box-shadow: 0 0 0 3px rgba(92,46,10,0.12);
        }

        .q-opt-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FFF;
          opacity: 0;
          transition: opacity .15s;
        }

        .q-option.selected .q-opt-dot { opacity: 1; }

        .q-opt-label {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 3px;
          line-height: 1.3;
        }

        .q-opt-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* ── Question Footer ── */
        .q-footer { display: flex; gap: 12px; }

        .q-back-btn {
          padding: 14px 22px;
          background: transparent;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all .2s;
        }

        .q-back-btn:hover {
          background: var(--cream);
          border-color: var(--border);
          color: var(--ink);
        }

        .q-next-btn {
          flex: 1;
          padding: 14px;
          background: linear-gradient(135deg, #2C1008, #6B3010);
          color: #F8EDD8;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 4px 18px rgba(60,20,5,0.28);
          letter-spacing: 0.4px;
        }

        .q-next-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .q-next-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(60,20,5,0.36);
        }

        /* ══════════════════════════════════════════════════
           LOADING STATE
        ══════════════════════════════════════════════════ */
        .loading-wrap {
          text-align: center;
          padding: 5rem 2rem;
          animation: riseIn .4s ease both;
        }

        .loading-orb-outer {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-orb-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: var(--gold);
          border-right-color: rgba(201,149,42,0.3);
          animation: spinSlow 1.8s linear infinite;
        }

        .loading-orb-ring-2 {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1.5px solid transparent;
          border-bottom-color: rgba(201,149,42,0.5);
          animation: spinSlow 2.8s linear infinite reverse;
        }

        .loading-orb {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3D1C08, #8B5C2A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          animation: orbPulse 2s ease infinite;
          box-shadow: 0 8px 30px rgba(92,46,10,0.35);
        }

        .loading-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }

        .loading-sub {
          font-size: 14px;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* ══════════════════════════════════════════════════
           RESULT CARD
        ══════════════════════════════════════════════════ */
        .result-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          border-radius: var(--radius-card);
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(60,30,10,0.04),
            0 8px 40px rgba(60,30,10,0.10),
            0 24px 80px rgba(60,30,10,0.06);
          animation: riseIn .6s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Hero Banner ── */
        .result-hero {
          padding: 3rem 3rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Large watermark symbol */
        .result-hero::before {
          content: attr(data-symbol);
          position: absolute;
          right: -40px;
          bottom: -30px;
          font-size: 220px;
          opacity: 0.07;
          line-height: 1;
          pointer-events: none;
          filter: blur(2px);
        }

        /* Glow effect */
        .result-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,255,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .result-label {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 14px;
        }

        .result-dosha-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 8vw, 72px);
          font-weight: 900;
          color: #FFF;
          line-height: 1;
          letter-spacing: -2px;
          margin-bottom: 8px;
          text-shadow: 0 4px 30px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        }

        .result-tagline {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-style: italic;
          color: rgba(255,255,255,0.7);
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        /* Dosha Meters */
        .dosha-meters {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.6rem;
          position: relative;
          z-index: 1;
        }

        .meter {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .meter-ring {
          width: 68px;
          height: 68px;
          position: relative;
        }

        .meter-ring svg { transform: rotate(-90deg); }

        .meter-ring-bg { fill: none; stroke: rgba(255,255,255,0.12); }

        .meter-ring-fill {
          fill: none;
          stroke: rgba(255,255,255,0.88);
          stroke-linecap: round;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.4));
        }

        .meter-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .meter-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 700;
          color: #FFF;
        }

        .dual-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 18px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 99px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.3px;
          position: relative;
          z-index: 1;
        }

        /* ── Tabs ── */
        .result-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-soft);
          padding: 0 2rem;
          gap: 2px;
          overflow-x: auto;
          scrollbar-width: none;
          background: var(--warm-white);
        }

        .result-tabs::-webkit-scrollbar { display: none; }

        .result-tab {
          padding: 1rem 16px;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all .2s;
          letter-spacing: 0.3px;
        }

        .result-tab:hover { color: #5C2E0A; }

        .result-tab.active {
          color: #3D1C08;
          border-bottom-color: #8B5C2A;
        }

        /* ── Tab Body ── */
        .result-body { padding: 2.5rem 3rem; }

        .result-section { margin-bottom: 2.2rem; }
        .result-section:last-child { margin-bottom: 0; }

        .result-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-muted);
          margin-bottom: 1.1rem;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-soft);
        }

        .result-section-title::before {
          content: '';
          width: 3px;
          height: 12px;
          background: linear-gradient(180deg, var(--gold), var(--gold-muted));
          border-radius: 99px;
        }

        .result-desc {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          color: #3D2010;
          line-height: 1.85;
          font-style: italic;
          white-space: pre-line;
        }

        .offline-dosha-notice {
          margin: 14px 0 8px;
          padding: 12px 16px;
          font-size: 12px;
          line-height: 1.5;
          color: #5c4a38;
          background: #fff8e8;
          border: 1px solid #edd9a8;
          border-radius: 10px;
        }

        .offline-dosha-notice.err {
          background: #fff0f0;
          border-color: #f4bbbb;
          color: #7a2e2e;
        }

        /* Quality tags */
        .quality-tags { display: flex; flex-wrap: wrap; gap: 8px; }

        .quality-tag {
          padding: 6px 15px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          border: 1.5px solid;
          transition: transform .2s;
        }

        .quality-tag:hover { transform: translateY(-1px); }

        /* Lists */
        .result-list { display: flex; flex-direction: column; gap: 8px; }

        .result-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
          color: #4A2C14;
          line-height: 1.6;
          padding: 11px 14px;
          background: var(--cream);
          border-radius: 11px;
          border: 1px solid var(--border-soft);
          transition: border-color .2s, transform .2s;
        }

        .result-list-item:hover {
          border-color: var(--border);
          transform: translateX(2px);
        }

        .result-list-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        /* Herb cards */
        .herb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 11px;
        }

        .herb-card {
          padding: 1.1rem;
          border-radius: 13px;
          border: 1px solid var(--border-soft);
          background: var(--cream);
          transition: border-color .2s, transform .2s, box-shadow .2s;
          position: relative;
          overflow: hidden;
        }

        .herb-card::before {
          content: '🌱';
          position: absolute;
          right: -5px;
          bottom: -5px;
          font-size: 48px;
          opacity: 0.06;
          pointer-events: none;
        }

        .herb-card:hover {
          border-color: var(--border);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow-warm);
        }

        .herb-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .herb-benefit {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.55;
        }

        /* Diet panels */
        .diet-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .diet-panel { border-radius: 14px; padding: 1.3rem; }

        .diet-panel-title {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .diet-item {
          font-size: 13px;
          line-height: 1.65;
          padding: 6px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          color: #3D2010;
        }

        .diet-item:last-child { border-bottom: none; }

        /* Mantra */
        .mantra-box {
          text-align: center;
          padding: 2rem;
          border-radius: 16px;
          margin-top: 1.2rem;
          position: relative;
          overflow: hidden;
        }

        .mantra-box::before {
          content: '"';
          position: absolute;
          left: 20px;
          top: 5px;
          font-family: 'Playfair Display', serif;
          font-size: 80px;
          line-height: 1;
          opacity: 0.08;
          color: currentColor;
        }

        .mantra-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .mantra-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-style: italic;
          font-weight: 500;
          line-height: 1.65;
          color: #2C1810;
        }

        /* Dual dosha note */
        .dual-note {
          border-radius: 14px;
          padding: 1.3rem 1.6rem;
          margin-bottom: 1.8rem;
          border: 1.5px dashed;
        }

        .dual-note-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .dual-note-text {
          font-size: 13px;
          color: #4A2C14;
          line-height: 1.65;
          white-space: pre-line;
        }

        /* Reset button */
        .reset-btn {
          width: 100%;
          padding: 14px;
          background: var(--cream);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
          margin-top: 2rem;
          letter-spacing: 0.3px;
        }

        .reset-btn:hover {
          background: #F0E8D8;
          border-color: var(--border);
          color: var(--ink);
          transform: translateY(-1px);
        }

        /* Seasonal tip */
        .season-tip {
          background: linear-gradient(135deg, #1A0808, #4A2010);
          border-radius: 14px;
          padding: 1.5rem 1.6rem;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          box-shadow: 0 4px 20px rgba(30,10,5,0.2);
        }

        .season-tip-icon {
          font-size: 22px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .season-tip-text {
          font-size: 14px;
          color: rgba(248,237,216,0.8);
          line-height: 1.7;
          font-style: italic;
        }

        /* ── Diet Planner CTA ── */
        .diet-planner-cta {
          margin-top: 1.8rem;
          border: 1.5px solid;
          border-radius: 18px;
          padding: 1.6rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .diet-cta-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .diet-cta-icon-wrap {
          width: 50px;
          height: 50px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        .diet-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 5px;
        }

        .diet-cta-sub {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .diet-cta-pills { display: flex; flex-wrap: wrap; gap: 7px; }

        .diet-cta-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 11px;
          border-radius: 99px;
          border: 1.5px solid;
          background: rgba(255,255,255,0.7);
          letter-spacing: 0.2px;
        }

        .diet-cta-preview {
          background: rgba(255,255,255,0.65);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .diet-cta-preview-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 9px;
        }

        .diet-cta-preview-foods { display: flex; flex-wrap: wrap; gap: 7px; }

        .diet-cta-food-chip {
          font-size: 12px;
          font-weight: 500;
          color: #3D2010;
          background: #FFF;
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 5px 10px;
          transition: border-color .2s;
        }

        .diet-cta-food-chip:hover { border-color: var(--border); }

        .diet-cta-actions { display: flex; flex-direction: column; gap: 9px; }

        .diet-cta-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px 17px;
          border: none;
          border-radius: 13px;
          cursor: pointer;
          transition: all 0.22s;
          text-align: left;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .diet-cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
        }

        .diet-cta-btn-secondary {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1.5px solid;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }

        .diet-cta-btn-secondary:hover { background: rgba(255,255,255,0.55); }

        .diet-cta-trust {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          padding: 9px 12px;
          background: rgba(255,255,255,0.5);
          border-radius: 9px;
          border: 1px dashed var(--border);
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .dp-nav { padding: 0 1.2rem; }
          .dp-progress-wrap { padding: 9px 1.2rem; }
          .dp-main { padding: 1.8rem 1rem 3.5rem; }
          .intro-body, .result-body { padding: 1.6rem 1.4rem; }
          .intro-hero { padding: 2.2rem 1.6rem 2rem; }
          .result-hero { padding: 2.2rem 1.6rem 2rem; }
          .intro-features { grid-template-columns: 1fr; gap: 10px; }
          .diet-cols { grid-template-columns: 1fr; }
          .result-tabs { padding: 0 0.5rem; }
          .q-icon-wrap { width: 42px; height: 42px; font-size: 20px; }
          .q-title { font-size: 22px; }
        }
      `}</style>

      <div className="dp-root">
        <div className="dp-bg" />
        <div className="dp-grain" />
        <div className="dp-top-accent" />

        {/* Navbar */}
        <nav className="dp-nav">
          <div className="dp-nav-brand">
            <div className="dp-nav-icon">🌿</div>
            Āyurveda
            <div className="dp-nav-divider" />
            <span className="dp-nav-sub">Dosha Detector</span>
          </div>
          {step > 0 && !loading && (
            <button className="dp-nav-back" onClick={reset}>
              ← Start Over
            </button>
          )}
        </nav>

        {/* Progress bar (questions only) */}
        {isQuestion && (
          <div className="dp-progress-wrap">
            <div className="dp-progress-meta">
              <span>Question {step} of {totalQuestions}</span>
              <span>{Math.round((step / totalQuestions) * 100)}% complete</span>
            </div>
            <div className="dp-progress-bar">
              <div className="dp-progress-fill" style={{ width: `${(step / totalQuestions) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="dp-main">
          <div className="dp-content">

            {/* ── INTRO ── */}
            {step === 0 && (
              <div className="intro-card">
                <div className="intro-hero">
                  <div className="intro-eyebrow">
                    <span className="intro-eyebrow-dot" />
                    Ayurvedic Constitution Test
                  </div>
                  <h1 className="intro-title">
                    Discover your<br /><em>Prakriti</em>
                  </h1>
                  <p className="intro-sub">
                    Your Dosha is your unique physiological and psychological blueprint — inherited at birth and refined through life. Know it to thrive.
                    {" "}This assessment walks through <strong style={{ fontWeight: 600, color: "rgba(245,222,179,0.75)" }}>{QUESTIONS.length} questions</strong> aligned with our training dataset for a full multi-feature read.
                  </p>
                  <div className="intro-pills">
                    {Object.entries(DOSHA_THEME).map(([name, t]) => (
                      <div key={name} className="intro-pill">
                        {t.symbol} {name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="intro-body">
                  <div className="intro-section-label">What you'll discover</div>
                  <div className="intro-features">
                    <div className="intro-feat">
                      <span className="intro-feat-icon">🤖</span>
                      <div className="intro-feat-label">ML-Powered</div>
                      <div className="intro-feat-desc">Random Forest model trained on Ayurvedic data</div>
                    </div>
                    <div className="intro-feat">
                      <span className="intro-feat-icon">📖</span>
                      <div className="intro-feat-label">Classically Rooted</div>
                      <div className="intro-feat-desc">Charaka Samhita trait weights validated</div>
                    </div>
                    <div className="intro-feat">
                      <span className="intro-feat-icon">🌿</span>
                      <div className="intro-feat-label">Rich Guidance</div>
                      <div className="intro-feat-desc">Diet, herbs, lifestyle & yoga by dosha</div>
                    </div>
                  </div>
                  <button className="start-btn" onClick={() => setStep(1)}>
                    Begin the Assessment &nbsp;→
                  </button>
                </div>
              </div>
            )}

            {/* ── QUESTION ── */}
            {isQuestion && currentQ && (
              <div className="q-card" key={animKey}>
                <div className="q-header">
                  <div className="q-step-badge">
                    Step {step} of {totalQuestions} &nbsp;·&nbsp; {currentQ.icon} {currentQ.label}
                  </div>
                  <div className="q-icon-row">
                    <div className="q-icon-wrap">{currentQ.icon}</div>
                    <h2 className="q-title">{currentQ.label}</h2>
                  </div>
                  <p className="q-subtitle">{currentQ.subtitle}</p>
                </div>

                <div className="q-options">
                  {currentQ.options.map(opt => (
                    <div
                      key={opt.value}
                      className={`q-option${selected === opt.value ? " selected" : ""}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <div className="q-opt-radio">
                        <div className="q-opt-dot" />
                      </div>
                      <div>
                        <div className="q-opt-label">{opt.label}</div>
                        <div className="q-opt-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="q-footer">
                  <button className="q-back-btn" onClick={handleBack}>← Back</button>
                  <button
                    className="q-next-btn"
                    onClick={handleNext}
                    disabled={!selected}
                  >
                    {step === totalQuestions ? "✨ Reveal My Dosha" : "Continue →"}
                  </button>
                </div>
              </div>
            )}

            {/* ── LOADING ── */}
            {loading && (
              <div className="loading-wrap">
                <div className="loading-orb-outer">
                  <div className="loading-orb-ring" />
                  <div className="loading-orb-ring-2" />
                  <div className="loading-orb">🌿</div>
                </div>
                <div className="loading-title">Analysing your constitution…</div>
                <p className="loading-sub">Consulting the Charaka Samhita and ML model</p>
              </div>
            )}

            {/* ── RESULT ── */}
            {!loading && result && step === totalQuestions + 1 && (() => {
              const t = DOSHA_THEME[result.dominant_dosha];
              const r = result;
              const circumference = 2 * Math.PI * 27;
              return (
                <div className="result-card">
                  {/* Hero */}
                  <div className="result-hero" data-symbol={t.symbol} style={{ background: t.bg }}>
                    <div className="result-label">Your Prakriti — Constitution Type</div>
                    <div className="result-dosha-name">{r.dominant_dosha}</div>
                    <div className="result-tagline">{r.tagline}</div>

                    {/* Meters */}
                    <div className="dosha-meters">
                      {["Vata","Pitta","Kapha"].map(d => {
                        const pct = r.percentages[d] || 0;
                        const offset = circumference - (pct / 100) * circumference;
                        return (
                          <div key={d} className="meter">
                            <div className="meter-ring">
                              <svg width="68" height="68" viewBox="0 0 68 68">
                                <circle className="meter-ring-bg" cx="34" cy="34" r="27" strokeWidth="4" />
                                <circle
                                  className="meter-ring-fill"
                                  cx="34" cy="34" r="27" strokeWidth="4"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                />
                              </svg>
                              <div className="meter-value">{pct}%</div>
                            </div>
                            <div className="meter-label">{d}</div>
                          </div>
                        );
                      })}
                    </div>

                    {r.is_dual_dosha && r.secondary_dosha && (
                      <div className="dual-badge">
                        ✦ Dual constitution: {r.dominant_dosha}-{r.secondary_dosha}
                      </div>
                    )}
                  </div>

                  {(r.offline_fallback || error) && (
                    <div className={`offline-dosha-notice${error ? " err" : ""}`}>
                      {error ? (
                        <>
                          <strong>API issue:</strong> {error}
                          <div style={{ marginTop: 8, opacity: 0.9 }}>
                            From project root run <code>python api_server.py</code> (port 5050), then restart <code>npm start</code> so the CRA proxy forwards <code>POST /dosha</code>. Or set <code>REACT_APP_API_URL=http://127.0.0.1:5050</code> for a full URL.
                          </div>
                        </>
                      ) : (
                        <>Offline preview — start the API on port 5050 and use the dev proxy (restart <code>npm start</code> after adding proxy).</>
                      )}
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="result-tabs">
                    {[
                      { id: "overview",  label: "Overview"   },
                      { id: "diet",      label: "Diet & Food" },
                      { id: "herbs",     label: "Herbs"       },
                      { id: "lifestyle", label: "Lifestyle"   },
                      { id: "yoga",      label: "Yoga"        },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        className={`result-tab${activeTab === tab.id ? " active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Body */}
                  <div className="result-body">

                    {activeTab === "overview" && (
                      <>
                        {r.dual_info && (
                          <div className="dual-note" style={{ background: `${t.color}10`, borderColor: `${t.color}40` }}>
                            <div className="dual-note-title" style={{ color: t.color }}>
                              ✦ Dual Dosha: {r.dominant_dosha}-{r.secondary_dosha}
                            </div>
                            <div className="dual-note-text">{r.dual_info.description}</div>
                            <div className="dual-note-text" style={{ marginTop: 6, fontWeight: 600 }}>
                              Key Tip: {r.dual_info.key_tip}
                            </div>
                          </div>
                        )}

                        <div className="result-section">
                          <div className="result-section-title">About Your Constitution</div>
                          <p className="result-desc">{r.description}</p>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Core Qualities</div>
                          <div className="quality-tags">
                            {(r.qualities || []).map((q, i) => (
                              <span key={i} className="quality-tag"
                                style={{ background: `${t.color}12`, borderColor: `${t.color}35`, color: t.text }}>
                                {q}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Your Strengths</div>
                          <div className="result-list">
                            {(r.strengths || []).map((s, i) => (
                              <div key={i} className="result-list-item">
                                <div className="result-list-dot" style={{ background: t.color }} />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Signs of Imbalance</div>
                          <div className="result-list">
                            {(r.imbalance_signs || []).map((s, i) => (
                              <div key={i} className="result-list-item" style={{ background: "#FFF5F0", borderColor: "#F4BBAA" }}>
                                <div className="result-list-dot" style={{ background: "#C0392B" }} />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mantra-box" style={{ background: `${t.color}0E`, border: `1px solid ${t.color}25` }}>
                          <div className="mantra-label">Your Mantra</div>
                          <div className="mantra-text" style={{ color: t.text }}>"{r.mantra}"</div>
                        </div>
                      </>
                    )}

                    {activeTab === "diet" && (
                      <>
                        <div className="diet-cols">
                          <div className="diet-panel" style={{ background: "#EAF7F0", border: "1px solid #9FD9C0" }}>
                            <div className="diet-panel-title" style={{ color: "#1E7A4A" }}>✓ Favor</div>
                            {(r.diet?.favor || []).map((item, i) => (
                              <div key={i} className="diet-item">{item}</div>
                            ))}
                          </div>
                          <div className="diet-panel" style={{ background: "#FFF0F0", border: "1px solid #F4BBBB" }}>
                            <div className="diet-panel-title" style={{ color: "#C0392B" }}>✗ Avoid</div>
                            {(r.diet?.avoid || []).map((item, i) => (
                              <div key={i} className="diet-item">{item}</div>
                            ))}
                          </div>
                        </div>

                        <div className="season-tip" style={{ marginTop: "1.6rem" }}>
                          <span className="season-tip-icon">🌿</span>
                          <span className="season-tip-text">{r.seasonal_tip}</span>
                        </div>

                        {/* Diet Planner Navigation CTA */}
                        <div className="diet-planner-cta" style={{ background: `linear-gradient(135deg, ${t.light} 0%, #FDFAF5 100%)`, borderColor: `${t.color}35` }}>
                          <div className="diet-cta-header">
                            <div className="diet-cta-icon-wrap" style={{ background: t.bg }}>
                              <span style={{ fontSize: 22 }}>{t.symbol}</span>
                            </div>
                            <div>
                              <div className="diet-cta-title" style={{ color: t.text }}>
                                Explore Your Full {r.dominant_dosha} Meal Plan
                              </div>
                              <div className="diet-cta-sub">
                                Get a complete AI-generated daily thali — personalised to your dosha, season & goal
                              </div>
                            </div>
                          </div>

                          <div className="diet-cta-pills">
                            {[
                              { icon: "🍽️", label: "5-meal daily schedule" },
                              { icon: "🌶️", label: "Dosha spice blends"    },
                              { icon: "⏰", label: "Dinacharya timing"      },
                              { icon: "🩸", label: "Blood test analysis"    },
                              { icon: "🌿", label: "Herbal support"         },
                              { icon: "⚠️", label: "Foods to avoid"         },
                            ].map((f, i) => (
                              <span key={i} className="diet-cta-pill" style={{ borderColor: `${t.color}30`, color: t.text }}>
                                {f.icon} {f.label}
                              </span>
                            ))}
                          </div>

                          <div className="diet-cta-preview">
                            <div className="diet-cta-preview-label">Based on your {r.dominant_dosha} constitution, expect dishes like:</div>
                            <div className="diet-cta-preview-foods">
                              {({
                                Vata:  ["🥣 Moong Dal Khichdi", "🫓 Ajwain Paratha", "🍲 Lauki Sabzi", "☕ CCF Kadha", "🍛 Dal Tadka + Ghee"],
                                Pitta: ["🥥 Nariyal Poha", "🍚 Basmati + Moong Dal", "☕ Saunf Sharbat", "🥗 Kheera Raita", "🍲 Lauki Khichdi"],
                                Kapha: ["🌱 Sprout Bhel", "🫘 Masoor Dal + Bajra Roti", "☕ Trikatu Kadha", "🥬 Methi Sabzi", "🍲 Thin Moong Shorba"],
                              }[r.dominant_dosha] || []).map((f, i) => (
                                <span key={i} className="diet-cta-food-chip">{f}</span>
                              ))}
                            </div>
                          </div>

                          <div className="diet-cta-actions">
                            <button
                              className="diet-cta-btn-primary"
                              style={{ background: t.bg }}
                              onClick={() => {
                                sessionStorage.setItem("ayur_dosha_nav", JSON.stringify({
                                  dosha: r.dominant_dosha, secondary: r.secondary_dosha,
                                  isDual: r.is_dual_dosha, percentages: r.percentages,
                                  from: "dosha_test", timestamp: Date.now(),
                                }));
                                if (window.__navigate) window.__navigate("/diet");
                                else window.location.href = "/diet";
                              }}
                            >
                              <span style={{ fontSize: 18 }}>{t.symbol}</span>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Open My Diet Planner</div>
                                <div style={{ fontSize: 11, color: t.color, opacity: 0.8, marginTop: 1 }}>
                                  Your {r.dominant_dosha} dosha auto-loaded
                                </div>
                              </div>
                              <span style={{ marginLeft: "auto", fontSize: 18, color: t.color }}>→</span>
                            </button>

                            <button
                              className="diet-cta-btn-secondary"
                              style={{ borderColor: `${t.color}50`, color: t.text }}
                              onClick={() => {
                                sessionStorage.setItem("ayur_dosha_nav", JSON.stringify({
                                  dosha: r.dominant_dosha, secondary: r.secondary_dosha,
                                  isDual: r.is_dual_dosha, percentages: r.percentages,
                                  from: "dosha_test", autoGenerate: true, timestamp: Date.now(),
                                }));
                                if (window.__navigate) window.__navigate("/diet");
                                else window.location.href = "/diet";
                              }}
                            >
                              ✦ Auto-Generate My Plan Now
                            </button>
                          </div>

                          <div className="diet-cta-trust">
                            <span>🔒</span>
                            <span>Your dosha results carry over automatically — no need to re-select anything</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "herbs" && (
                      <div className="herb-grid">
                        {(r.herbs || []).map((h, i) => (
                          <div key={i} className="herb-card" style={{ borderColor: `${t.color}30` }}>
                            <div className="herb-name" style={{ color: t.text }}>🌱 {h.name}</div>
                            <div className="herb-benefit">{h.benefit}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "lifestyle" && (
                      <div className="result-list">
                        {(r.lifestyle || []).map((l, i) => (
                          <div key={i} className="result-list-item">
                            <div className="result-list-dot" style={{ background: t.color }} />
                            {l}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "yoga" && (
                      <>
                        <div className="result-list">
                          {(r.yoga || []).map((y, i) => (
                            <div key={i} className="result-list-item">
                              <div className="result-list-dot" style={{ background: t.color }} />
                              {y}
                            </div>
                          ))}
                        </div>
                        <div className="season-tip" style={{ marginTop: "1.6rem" }}>
                          <span className="season-tip-icon">🧘</span>
                          <span className="season-tip-text">
                            Consistency is more important than duration. Even 20 minutes daily of the right yoga transforms your doshic balance.
                          </span>
                        </div>
                      </>
                    )}

                    <button className="reset-btn" onClick={reset}>
                      🔄 &nbsp;Retake the Assessment
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </>
  );
}
