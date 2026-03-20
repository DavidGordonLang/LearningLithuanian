// src/views/training/ModuleCompleteView.jsx
//
// One-time celebration screen shown after completing all lessons
// in a module (including checkpoint). Triggered from TrainingView
// when the checkpoint NailedItCard Continue is tapped.
// Only shows once per module — tracked in gameStore.seenModuleCompleteIds.

import React, { useEffect, useState, useRef } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// ─── Celebration sound ────────────────────────────────────────────────────────
// Single ascending chord using Web Audio API. Fires once on mount.

function playModuleCompleteSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + i * 0.08;
      const end = start + 0.6;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.start(start);
      osc.stop(end);
    });

    // Soft shimmer on top — high sine that fades slowly
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.type = "sine";
    shimmer.frequency.value = 2093; // C7
    shimmerGain.gain.setValueAtTime(0, now + 0.28);
    shimmerGain.gain.linearRampToValueAtTime(0.08, now + 0.38);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    shimmer.start(now + 0.28);
    shimmer.stop(now + 1.5);

  } catch {}
}

// ─── Glow ring animation ──────────────────────────────────────────────────────

function GlowRing({ visible }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      {/* Outer pulse ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-emerald-400/30 transition-all duration-700",
        visible ? "scale-100 opacity-100" : "scale-75 opacity-0"
      )} style={{ animationName: visible ? "mp-green-takeover" : "none" }} />
      {/* Middle ring */}
      <div className={cn(
        "absolute rounded-full border border-emerald-400/20 transition-all duration-500",
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
      )} style={{ width: 76, height: 76, transitionDelay: "80ms" }} />
      {/* Inner circle */}
      <div className={cn(
        "relative h-16 w-16 rounded-full border border-emerald-400/30 bg-emerald-500/[0.14] flex items-center justify-center transition-all duration-400",
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
      )} style={{ transitionDelay: "120ms" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12l6 6L20 6" stroke="rgba(110,231,183,0.9)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            className={cn("transition-all duration-500", visible ? "opacity-100" : "opacity-0")}
            style={{ transitionDelay: "250ms" }}
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-[18px] font-semibold text-emerald-200">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function ModuleCompleteView({
  section,      // section object { title, code }
  module,       // module object { title, code, lessons }
  xpEarned,     // total XP earned in this session (optional)
  onContinue,   // called when user taps "Continue"
  onHome,       // called when user taps "Learning home"
}) {
  const [visible, setVisible] = useState(false);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        playModuleCompleteSound();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
  const lessonCount = lessons.filter((l) => !l.isCheckpoint).length;
  const phraseCount = lessons.reduce((acc, l) => {
    if (l.isCheckpoint) return acc;
    return acc + (Array.isArray(l.blocks) ? l.blocks.reduce((a, b) => {
      if (b.type === "learn" && Array.isArray(b.items)) return a + b.items.length;
      return a;
    }, 0) : 0);
  }, 0);

  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ paddingTop: "10vh" }}
    >
      {/* Glow ring */}
      <GlowRing visible={visible} />

      {/* Section label */}
      <div className={cn(
        "mt-6 text-[11px] uppercase tracking-widest text-zinc-600 transition-all duration-400",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "200ms" }}>
        {section?.title || "First Contact"}
      </div>

      {/* Module title */}
      <div className={cn(
        "mt-2 text-[11px] text-zinc-500 transition-all duration-400",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "250ms" }}>
        {module?.title || ""}
      </div>

      {/* Hero text */}
      <div className={cn(
        "mt-3 text-[30px] font-semibold text-emerald-200 text-center leading-tight transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )} style={{ transitionDelay: "180ms" }}>
        Module complete!
      </div>

      {/* Stats */}
      <div className={cn(
        "mt-6 flex items-center gap-8 transition-all duration-400",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "320ms" }}>
        <StatPill value={lessonCount} label="Lessons" />
        <div className="w-px h-6 bg-white/[0.08]" />
        {phraseCount > 0 ? (
          <>
            <StatPill value={phraseCount} label="Phrases" />
            <div className="w-px h-6 bg-white/[0.08]" />
          </>
        ) : null}
        {xpEarned ? <StatPill value={`+${xpEarned}`} label="XP earned" /> : null}
      </div>

      {/* Next module teaser */}
      <div className={cn(
        "mt-8 w-full max-w-xs rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center transition-all duration-400",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "400ms" }}>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">What's next</div>
        <div className="text-[13px] text-zinc-300">Next module unlocked</div>
      </div>

      {/* Actions */}
      <div className={cn(
        "mt-8 w-full max-w-xs flex flex-col gap-3 transition-all duration-400",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "460ms" }}>
        <button
          type="button"
          data-press
          onClick={onContinue}
          className="w-full rounded-2xl border border-emerald-300/20 bg-emerald-600/90 hover:bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition"
        >
          Continue →
        </button>
        <button
          type="button"
          data-press
          onClick={onHome}
          className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.05] transition"
        >
          Learning home
        </button>
      </div>
    </div>
  );
}
