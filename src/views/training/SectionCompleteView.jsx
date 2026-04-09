// src/views/training/SectionCompleteView.jsx
//
// Full-screen celebration screen shown after completing all modules
// in a section. Bigger and more dramatic than ModuleCompleteView.
// Phase 1: Full-screen emerald burst animation (~2s)
// Phase 2: Fade to celebration card with stats, highlights, actions

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// ─── Celebration sound ────────────────────────────────────────────────────────
// Richer, longer chord sequence than the module complete sound.

function playSectionCompleteSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Rising arpeggio — C4 E4 G4 C5 E5 G5 C6
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.07;
      const end = start + 0.9;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, end);
      osc.start(start);
      osc.stop(end);
    });

    // Sustained shimmer chord — major triad held
    [[1046.50, 0.35], [1318.51, 0.42], [1567.98, 0.50]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.2);
      osc.start(now + delay);
      osc.stop(now + delay + 2.3);
    });
  } catch {}
}

// ─── Styles injected once ─────────────────────────────────────────────────────

const STYLE_ID = "z-section-complete-styles-v4";
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes scBurstRing {
      0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
      100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
    }
    @keyframes scBurstRing2 {
      0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.7; }
      100% { transform: translate(-50%, -50%) scale(4.5); opacity: 0; }
    }
    @keyframes scBurstRing3 {
      0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.5; }
      100% { transform: translate(-50%, -50%) scale(6); opacity: 0; }
    }
    @keyframes scGlowPulse {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      30%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      70%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
    }
    @keyframes scLogoIn {
      0%   { opacity: 0; transform: scale(0.4); filter: blur(8px); }
      50%  { opacity: 1; transform: scale(1.1); filter: blur(0px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0px); }
    }
    @keyframes scParticle {
      0%   { opacity: 1; transform: translate(-50%, -50%); }
      100% { opacity: 0; transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0); }
    }
    @keyframes scSlideUp {
      0%   { opacity: 0; transform: translateY(32px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes scCheckIn {
      0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
      60%  { transform: scale(1.2) rotate(4deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    .sc-ring {
      position: absolute;
      border-radius: 9999px;
      border: 2px solid rgba(52,211,153,0.6);
      width: 120px; height: 120px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: scBurstRing 1.4s cubic-bezier(0.2,0.8,0.4,1) forwards;
    }
    .sc-ring-2 {
      border-color: rgba(52,211,153,0.4);
      animation: scBurstRing2 1.6s 0.1s cubic-bezier(0.2,0.8,0.4,1) forwards;
    }
    .sc-ring-3 {
      border-color: rgba(52,211,153,0.25);
      animation: scBurstRing3 1.8s 0.2s cubic-bezier(0.2,0.8,0.4,1) forwards;
    }
    .sc-glow {
      position: absolute;
      border-radius: 9999px;
      width: 300px; height: 300px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(52,211,153,0.35) 0%, rgba(16,185,129,0.15) 40%, transparent 70%);
      animation: scGlowPulse 1.8s ease-out forwards;
    }
    .sc-logo {
      animation: scLogoIn 0.7s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    .sc-particle {
      position: absolute;
      width: 6px; height: 6px;
      border-radius: 9999px;
      background: rgba(110,231,183,0.9);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: scParticle 1.2s ease-out forwards;
    }
    .sc-card {
      animation: scSlideUp 0.6s cubic-bezier(0.34,1.2,0.64,1) both;
    }
    .sc-check {
      animation: scCheckIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
  `;
  document.head.appendChild(el);
}

// ─── Particles ────────────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const dist = 120 + Math.random() * 80;
  return {
    id: i,
    px: `${Math.cos(angle) * dist}px`,
    py: `${Math.sin(angle) * dist}px`,
    delay: `${0.1 + (i % 4) * 0.05}s`,
    size: 4 + Math.random() * 4,
    opacity: 0.5 + Math.random() * 0.5,
  };
});

// ─── Phase 1: Burst screen ────────────────────────────────────────────────────

function BurstScreen({ onDone }) {
  useEffect(() => {
    ensureStyles();
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "#060608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Radial glow */}
      <div className="sc-glow" />

      {/* Expanding rings */}
      <div className="sc-ring" />
      <div className="sc-ring sc-ring-2" />
      <div className="sc-ring sc-ring-3" />

      {/* Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="sc-particle"
          style={{
            "--px": p.px,
            "--py": p.py,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Logo */}
      <div className="relative z-10 sc-logo">
        <div
          className="text-[72px] font-bold text-emerald-300 select-none"
          style={{
            textShadow: "0 0 40px rgba(52,211,153,0.8), 0 0 80px rgba(52,211,153,0.4)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Ž
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Module pill ──────────────────────────────────────────────────────────────

function ModulePill({ module, delay }) {
  return (
    <div
      className="sc-check flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-3 py-2"
      style={{ animationDelay: delay }}
    >
      <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2.5L8 3" stroke="rgba(110,231,183,0.9)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-[12px] text-emerald-200">{module.title}</span>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[22px] font-semibold text-emerald-200">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
    </div>
  );
}

// ─── Highlight item ───────────────────────────────────────────────────────────

function HighlightItem({ text, delay }) {
  return (
    <div
      className="sc-card flex items-start gap-2.5"
      style={{ animationDelay: delay }}
    >
      <div className="mt-0.5 h-4 w-4 rounded-full border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center shrink-0">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
      </div>
      <span className="text-[13px] text-zinc-300 leading-snug">{text}</span>
    </div>
  );
}

// ─── Phase 2: Celebration card ────────────────────────────────────────────────

const HIGHLIGHTS = [
  "Greet and say goodbye in the right register",
  "Introduce yourself and say where you're from",
  "Signal when you don't understand — and ask for help",
  "Ask where things are using Kur yra…?",
  "Use Ar galiu? and Ar galime? to get things done",
  "Know the difference between tu and jūs",
];

function CelebrationCard({
  section,
  modules,
  xpEarned,
  accuracyPct,
  onContinue,
  onHome,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    ensureStyles();
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const nonCheckpointModules = (modules || []).filter((m) => !m.isSectionCheckpoint);

  return (
    createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        overflowY: "auto",
        overscrollBehavior: "contain",
        background: "linear-gradient(180deg, #070708 0%, #0a0a0b 50%, #070708 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-5 pb-12" style={{ paddingTop: "8vh" }}>

        {/* Section badge */}
        <div
          className={cn(
            "px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] text-[10px] uppercase tracking-widest text-emerald-400 transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "50ms" }}
        >
          Section {section?.code || "1"} Complete
        </div>

        {/* Hero text */}
        <div
          className={cn(
            "mt-4 text-center transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "120ms" }}
        >
          <div className="text-[32px] font-semibold text-emerald-200 leading-tight">
            {section?.title || "First Contact"}
          </div>
          <div className="text-[14px] text-zinc-500 mt-1">
            You've completed Section {section?.code || "1"}
          </div>
        </div>

        {/* Stats row */}
        <div
          className={cn(
            "mt-7 flex items-center gap-6 transition-all duration-500",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          {xpEarned ? <StatPill value={`+${xpEarned}`} label="XP earned" /> : null}
          {xpEarned && accuracyPct != null ? <div className="w-px h-8 bg-white/[0.08]" /> : null}
          {accuracyPct != null ? <StatPill value={`${accuracyPct}%`} label="Accuracy" /> : null}
          {(xpEarned || accuracyPct != null) && nonCheckpointModules.length ? <div className="w-px h-8 bg-white/[0.08]" /> : null}
          {nonCheckpointModules.length ? <StatPill value={nonCheckpointModules.length} label="Modules" /> : null}
        </div>

        {/* Modules completed */}
        {nonCheckpointModules.length > 0 && (
          <div
            className={cn(
              "mt-7 w-full max-w-sm transition-all duration-500",
              visible ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: "280ms" }}
          >
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 text-center">
              Modules completed
            </div>
            <div className="space-y-2">
              {nonCheckpointModules.map((mod, i) => (
                <ModulePill
                  key={mod.id}
                  module={mod}
                  delay={`${0.32 + i * 0.06}s`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          className={cn(
            "mt-8 w-full max-w-sm h-px bg-white/[0.06] transition-all duration-500",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "520ms" }}
        />

        {/* Now you can... */}
        <div
          className={cn(
            "mt-7 w-full max-w-sm transition-all duration-500",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "560ms" }}
        >
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4 text-center">
            Now you can…
          </div>
          <div className="space-y-3">
            {HIGHLIGHTS.map((text, i) => (
              <HighlightItem
                key={i}
                text={text}
                delay={`${0.58 + i * 0.05}s`}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "mt-8 w-full max-w-sm h-px bg-white/[0.06] transition-all duration-500",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDelay: "880ms" }}
        />

        {/* Actions */}
        <div
          className={cn(
            "mt-7 w-full max-w-sm flex flex-col gap-3 transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "920ms" }}
        >
          <button
            type="button"
            data-press
            onClick={onContinue}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.05] transition"
          >
            Continue to Section {parseInt(section?.code || "1") + 1}
          </button>
          <button
            type="button"
            data-press
            onClick={onHome}
            className="w-full rounded-2xl border border-white/[0.06] bg-transparent px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-white/[0.03] transition"
          >
            Learning home
          </button>
        </div>

      </div>
    </div>,
    document.body
    )
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SectionCompleteView({
  section,
  modules,       // all modules in the section (including checkpoint)
  xpEarned,
  accuracyPct,
  onContinue,
  onHome,
}) {
  const [phase, setPhase] = useState("burst"); // "burst" | "card"
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playSectionCompleteSound();
    }
  }, []);

  if (phase === "burst") {
    return <BurstScreen onDone={() => setPhase("card")} />;
  }

  return (
    <CelebrationCard
      section={section}
      modules={modules}
      xpEarned={xpEarned}
      accuracyPct={accuracyPct}
      onContinue={onContinue}
      onHome={onHome}
    />
  );
}
