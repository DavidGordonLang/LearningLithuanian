import InteractivePhraseText from "../../components/audio/InteractivePhraseText";
import { isScenarioTurnAudioEnabled } from "../../utils/scenarioAudio.js";
import { getScenarioHelpOption, getScenarioHelpTurn, withScenarioHelpOption } from "../../utils/scenarioHelp.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function shuffledCopy(items) {
  const out = Array.isArray(items) ? [...items] : [];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SCENARIO_V2_GENDER_VOICES = {
  female: "lt-LT-OnaNeural",
  male: "lt-LT-LeonasNeural",
};

function ActionButton({ children, onClick, disabled = false, variant = "primary", className }) {
  const tone = variant === "primary"
    ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
    : variant === "secondary"
    ? "bg-white/[0.05] hover:bg-white/[0.08] border-white/10 text-zinc-100"
    : "bg-transparent hover:bg-white/[0.05] border-white/10 text-zinc-300";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold transition", tone, disabled ? "cursor-not-allowed opacity-50" : "", className)}
    >
      {children}
    </button>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone = accent === "emerald"
    ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
    : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight", tone)}>
      {children}
    </div>
  );
}

function AudioIconButton({ text, playText, playOptions, label = "Play audio" }) {
  if (!text) return null;
  return (
    <button
      type="button"
      data-press
      aria-label={label}
      onClick={() => { try { playText?.(text, playOptions); } catch {} }}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition hover:bg-white/[0.07]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6.8 9H4v6h2.8L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function ScenarioV2Styles() {
  return (
    <style>{`
      .scenario-v2-frame {
        padding-top: max(1.25rem, env(safe-area-inset-top));
        padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
        padding-left: max(1.25rem, env(safe-area-inset-left));
        padding-right: max(1.25rem, env(safe-area-inset-right));
      }
      .scenario-v2-soft-answer { color: #fcd34d; }
      .scenario-v2-user-bubble.scenario-v2-soft-bubble { --scenario-v2-bubble-bg: #713f12; --scenario-v2-bubble-border: #d97706; }
      .scenario-v2-soft-bubble .scenario-v2-user-label { color: #fde68a; }
      .scenario-v2-intro-screen {
        background:
          radial-gradient(700px 360px at 50% 8%, rgba(16,185,129,0.16), transparent 68%),
          radial-gradient(540px 440px at 90% 82%, rgba(20,184,166,0.08), transparent 72%),
          #09090b;
      }
      .scenario-v2-intro-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035));
        border-color: rgba(255,255,255,0.12);
        box-shadow: 0 28px 80px rgba(0,0,0,0.38);
      }
      .scenario-v2-intro-badge {
        border-color: rgba(52,211,153,0.20);
        background: rgba(16,185,129,0.10);
        color: #a7f3d0;
      }
      .scenario-v2-intro-meta-card {
        border-color: rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.04);
      }
      html[data-theme="light"] .scenario-v2-screen { background: #f6eede; color: #1c1917; }
      html[data-theme="light"] .scenario-v2-intro-screen {
        background:
          radial-gradient(700px 360px at 50% 8%, rgba(107,143,110,0.18), transparent 68%),
          radial-gradient(520px 420px at 88% 84%, rgba(191,153,92,0.10), transparent 72%),
          linear-gradient(180deg, #f4ead8 0%, #f6eede 48%, #efe2ca 100%);
      }
      html[data-theme="light"] .scenario-v2-intro-card {
        background: linear-gradient(145deg, rgba(255,250,241,0.90), rgba(247,237,219,0.82));
        border-color: rgba(94,75,45,0.16);
        box-shadow: 0 24px 70px rgba(81,64,38,0.14);
      }
      html[data-theme="light"] .scenario-v2-intro-badge {
        border-color: rgba(74,125,80,0.22);
        background: rgba(107,143,110,0.11);
        color: #3f6f4e;
      }
      html[data-theme="light"] .scenario-v2-intro-meta-card {
        border-color: rgba(94,75,45,0.12);
        background: rgba(255,255,255,0.34);
      }
      html[data-theme="light"] .scenario-v2-soft-answer { color: #92400e; }
      html[data-theme="light"] .scenario-v2-user-bubble.scenario-v2-soft-bubble { --scenario-v2-bubble-bg: #fef3c7; --scenario-v2-bubble-border: #d97706; }
      html[data-theme="light"] .scenario-v2-soft-bubble .scenario-v2-user-label { color: #78350f; }
      html[data-theme="light"] .scenario-v2-soft-bubble .scenario-v2-user-text { color: #92400e; }
      @keyframes scenarioV2Fade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scenarioV2Pop {
        from { opacity: 0; transform: translateY(8px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .scenario-v2-fade { animation: scenarioV2Fade 260ms ease-out both; }
      .scenario-v2-pop { animation: scenarioV2Pop 180ms ease-out both; }
      .scenario-v2-intro-card { background: rgba(0,0,0,0.15); border-color: rgba(255,255,255,0.10); }
      .scenario-v2-chat-window { background: rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.10); }
      .scenario-v2-bubble {
        position: relative;
        border-color: var(--scenario-v2-bubble-border);
        background: var(--scenario-v2-bubble-bg);
        box-shadow: 0 10px 24px rgba(0,0,0,0.16);
      }
      .scenario-v2-bubble-left::after {
        content: "";
        position: absolute;
        bottom: 12px;
        left: -4px;
        width: 14px;
        height: 14px;
        background: var(--scenario-v2-bubble-bg);
        border-bottom-left-radius: 5px;
        box-shadow: -1px 1px 0 var(--scenario-v2-bubble-border);
        transform: rotate(45deg);
      }
      .scenario-v2-tail {
        position: absolute;
        right: -11px;
        bottom: 7px;
        width: 20px;
        height: 24px;
        overflow: visible;
        pointer-events: none;
      }
      .scenario-v2-tail-fill {
        fill: var(--scenario-v2-bubble-bg);
      }
      .scenario-v2-tail-stroke {
        fill: none;
        stroke: var(--scenario-v2-bubble-border);
        stroke-width: 1.25;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
      .scenario-v2-speaker-bubble { --scenario-v2-bubble-bg: rgba(255,255,255,0.075); --scenario-v2-bubble-border: rgba(255,255,255,0.075); }
      .scenario-v2-final-bubble { --scenario-v2-bubble-bg: rgba(16,185,129,0.12); --scenario-v2-bubble-border: rgba(52,211,153,0.12); }
      .scenario-v2-user-bubble { --scenario-v2-bubble-bg: rgba(22,163,74,0.88); --scenario-v2-bubble-border: rgba(134,239,172,0.18); }
      .scenario-v2-user-label { color: rgba(240,253,244,0.78); }
      .scenario-v2-user-text { color: #ffffff; }
      .scenario-v2-user-support { color: rgba(240,253,244,0.78); }
      .scenario-v2-support-panel { background: rgba(14,165,233,0.08); border-color: rgba(56,189,248,0.22); color: #e0f2fe; }
      .scenario-v2-support-label { color: rgba(125,211,252,0.92); }
      .scenario-v2-translation-reveal { background: rgba(139,92,246,0.08); border-color: rgba(167,139,250,0.24); }
      .scenario-v2-translation-label { color: rgba(196,181,253,0.96); }
      .scenario-v2-reply-tray { background: rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.10); }
      .scenario-v2-option { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
      .scenario-v2-option:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.25); }
      .scenario-v2-option:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255,255,255,0.16);
        border-color: rgba(255,255,255,0.34);
      }
      .scenario-v2-option-selected { background: rgba(16,185,129,0.08); border-color: rgba(52,211,153,0.25); }
      .scenario-v2-feedback-backdrop { background: rgba(0,0,0,0.35); }
      .scenario-v2-feedback-card { background: rgba(24,24,27,0.94); border-color: rgba(255,255,255,0.14); color: #f4f4f5; }
      .scenario-v2-feedback-inset { background: rgba(0,0,0,0.18); border-color: rgba(255,255,255,0.10); }
      .scenario-v2-complete-action { background: rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.10); }

      html[data-theme="light"] .scenario-v2-intro-card,
      html[data-theme="light"] .scenario-v2-chat-window,
      html[data-theme="light"] .scenario-v2-reply-tray {
        background: rgba(246,238,222,0.96);
        border-color: rgba(94,75,45,0.18);
      }
      html[data-theme="light"] .scenario-v2-speaker-bubble,
      html[data-theme="light"] .scenario-v2-feedback-inset,
      html[data-theme="light"] .scenario-v2-option {
        --scenario-v2-bubble-bg: rgba(247,239,224,0.98);
        --scenario-v2-bubble-border: rgba(94,75,45,0.11);
        background: var(--scenario-v2-bubble-bg);
        border-color: var(--scenario-v2-bubble-border);
      }
      html[data-theme="light"] .scenario-v2-final-bubble {
        --scenario-v2-bubble-bg: rgba(225,239,224,0.98);
        --scenario-v2-bubble-border: rgba(107,143,110,0.18);
        background: var(--scenario-v2-bubble-bg);
        border-color: var(--scenario-v2-bubble-border);
      }
      html[data-theme="light"] .scenario-v2-user-bubble {
        --scenario-v2-bubble-bg: rgba(109,151,113,0.92);
        --scenario-v2-bubble-border: rgba(67,110,76,0.16);
        background: var(--scenario-v2-bubble-bg);
        border-color: var(--scenario-v2-bubble-border);
      }
      html[data-theme="light"] .scenario-v2-option-selected {
        --scenario-v2-bubble-bg: rgba(107,143,110,0.17);
        --scenario-v2-bubble-border: rgba(107,143,110,0.28);
        background: var(--scenario-v2-bubble-bg);
        border-color: var(--scenario-v2-bubble-border);
      }
      html[data-theme="light"] .scenario-v2-support-panel {
        background: rgba(233,243,235,0.97);
        border-color: rgba(74,108,83,0.28);
        color: #243f2f;
      }
      html[data-theme="light"] .scenario-v2-support-label { color: #3f6f4e; }
      html[data-theme="light"] .scenario-v2-translation-reveal {
        background: rgba(239,233,252,0.98);
        border-color: rgba(111,78,157,0.22);
      }
      html[data-theme="light"] .scenario-v2-translation-label { color: #69488f; }
      html[data-theme="light"] .scenario-v2-feedback-backdrop {
        background: rgba(55,44,27,0.26);
      }
      html[data-theme="light"] .scenario-v2-feedback-card {
        background: rgba(246,238,222,0.99);
        border-color: rgba(94,75,45,0.22);
        color: #1c1917;
      }
      html[data-theme="light"] .scenario-v2-complete-action {
        background: rgba(246,238,222,0.97);
        border-color: rgba(94,75,45,0.18);
      }
      html[data-theme="light"] .scenario-v2-option:hover {
        background: rgba(244,235,217,0.98);
        border-color: rgba(94,75,45,0.25);
      }
      html[data-theme="light"] .scenario-v2-option:focus-visible {
        box-shadow: 0 0 0 3px rgba(94,75,45,0.16);
        border-color: rgba(94,75,45,0.36);
      }
    `}</style>
  );
}

function autoplayOnce(startedKeysRef, key, text, playText, playOptions) {
  if (!key || !text || startedKeysRef.current.has(key)) return;
  startedKeysRef.current.add(key);
  try { return Promise.resolve(playText?.(text, playOptions)).catch(() => {}); }
  catch { return Promise.resolve(); }
}

function formatParticipantName(participant, fallback = "Speaker") {
  const base = participant?.name || participant?.label || fallback;
  return participant?.gender ? `${base} (${participant.gender})` : base;
}

function getParticipant(block, speakerId) {
  if (!Array.isArray(block?.participants)) return null;
  return block.participants.find((p) => p.id === speakerId) || null;
}

function getSpeakerLabel(block, turn) {
  const participant = getParticipant(block, turn?.speakerId);
  return formatParticipantName(participant, turn?.speakerLabel || "Speaker");
}

function getScenarioVoiceForGender(gender) {
  const key = String(gender || "").trim().toLowerCase();
  return SCENARIO_V2_GENDER_VOICES[key] || null;
}

function getTurnVoiceOptions(block, turn) {
  const participant = getParticipant(block, turn?.speakerId);
  const voice = getScenarioVoiceForGender(participant?.gender || turn?.speakerGender || turn?.gender);
  return voice ? { voice } : undefined;
}

function ParticipantPill({ participant }) {
  const label = formatParticipantName(participant, participant?.label || "Participant");
  const role = participant?.role || participant?.label || "";
  return (
    <SmallMetaPill>
      {role ? `${label} - ${role}` : label}
    </SmallMetaPill>
  );
}

function optionCanProgress(option) {
  const result = option?.result || "wrong";
  return (
    result === "best" ||
    result === "acceptable" ||
    result === "awkward" ||
    (result === "repair" && option?.progresses === true)
  );
}

function optionNeedsFeedback(option) {
  const result = option?.result || "wrong";
  if (result === "best") return false;
  if (result === "acceptable") return true;
  return true;
}

function resultMeta(option) {
  const result = option?.result || "wrong";
  const progresses = optionCanProgress(option);
  if (result === "best") return { label: "Best answer", tone: "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-200" };
  if (result === "acceptable") return { label: "Acceptable", tone: "border-amber-400/25 bg-amber-500/[0.07] text-amber-200" };
  if (result === "awkward") return { label: "Awkward, but understandable", tone: "border-amber-400/25 bg-amber-500/[0.07] text-amber-200" };
  if (result === "repair" && progresses) return { label: "Useful repair", tone: "border-violet-400/25 bg-violet-500/[0.07] text-violet-200" };
  if (result === "repair") return { label: "Repair does not fit here", tone: "border-rose-400/25 bg-rose-500/[0.07] text-rose-200" };
  return { label: "Try again", tone: "border-rose-400/25 bg-rose-500/[0.07] text-rose-200" };
}

function ScenarioV2FeedbackSheet({ option, onRetry, onContinue, playText, plainText = false }) {
  if (!option) return null;
  const meta = resultMeta(option);
  const progresses = optionCanProgress(option);
  const canTryInstead = option?.result === "awkward";
  const softPass = ["acceptable", "awkward"].includes(option.result);

  return (
    <div className="fixed inset-0 z-[12020] flex items-center justify-center px-4 py-6">
      <div className="scenario-v2-feedback-backdrop absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="scenario-v2-pop relative w-full max-w-sm">
        <div className={cn("scenario-v2-feedback-card max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-[28px] border px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.48)]", meta.tone)}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">{meta.label}</div>
              <div className="scenario-v2-feedback-inset mt-1 rounded-2xl border px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Your answer</div>
                <div className={cn("mt-0.5 text-[14px] font-semibold", softPass ? "scenario-v2-soft-answer" : option.result === "best" ? "z-correct-answer" : "text-rose-300")}>{plainText ? option.text : <InteractivePhraseText text={option.text} playText={playText} />}</div>
              </div>
              {option.feedback ? <div className="mt-2 text-[13px] leading-snug text-zinc-200">{option.feedback}</div> : null}
              {option.betterAnswer ? (
                <div className="scenario-v2-feedback-inset mt-2 rounded-xl border px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">Better here</div>
                  <div className="mt-0.5 text-[13px] font-semibold z-correct-answer">{plainText ? option.betterAnswer : <InteractivePhraseText text={option.betterAnswer} playText={playText} />}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            {progresses ? (
              <div className="grid gap-2">
                <ActionButton onClick={onContinue} className="w-full">Continue</ActionButton>
                {canTryInstead ? (
                  <ActionButton variant="secondary" onClick={onRetry} className="w-full">Try another answer</ActionButton>
                ) : null}
              </div>
            ) : (
              <ActionButton variant="secondary" onClick={onRetry} className="w-full">Try another answer</ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioV2TranslationReveal({ items }) {
  const rows = Array.isArray(items)
    ? items.filter((item) => item && (item.lt || item.en))
    : [];
  if (!rows.length) return null;

  return (
    <div className="scenario-v2-fade scenario-v2-translation-reveal rounded-2xl border px-3 py-3">
      <div className="scenario-v2-translation-label text-[10px] uppercase tracking-widest">Meaning revealed</div>
      <div className="mt-2 space-y-2">
        {rows.map((item, index) => (
          <div key={item.id || `translation_${index}`}>
            {item.lt ? <div className="text-[13px] font-semibold leading-snug text-zinc-100">{item.lt}</div> : null}
            {item.en ? <div className="mt-0.5 text-[12px] leading-snug text-zinc-400">{item.en}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioV2SystemTurn({ block, turn, phase = "speaker", playText, final = false }) {
  if (!turn) return null;
  const showScene = !!turn.sceneDirection && (phase === "scene" || phase === "speaker");
  const hasSpeakerText = !!String(turn.speakerText || "").trim();
  const showSpeaker = phase === "speaker" && hasSpeakerText;
  const showSupport = phase === "speaker" && !!(turn.supportText || turn.meaningText);
  const showTranslationReveal = phase === "speaker" && Array.isArray(turn.translationReveal) && turn.translationReveal.length > 0;
  const speakerLabel = getSpeakerLabel(block, turn);
  const audioEnabled = isScenarioTurnAudioEnabled(turn);
  const playOptions = audioEnabled ? getTurnVoiceOptions(block, turn) : undefined;

  return (
    <div className="space-y-2">
      {showScene ? (
        <div className="scenario-v2-fade px-1 text-[12px] italic leading-snug text-zinc-500">
          {turn.sceneDirection}
        </div>
      ) : null}

      {showSpeaker ? (
        <div className="scenario-v2-fade flex justify-start">
          <div className={cn("scenario-v2-bubble scenario-v2-bubble-left max-w-[86%] rounded-[22px] border px-4 py-3", final ? "scenario-v2-final-bubble" : "scenario-v2-speaker-bubble")}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="min-w-0 text-[11px] font-semibold text-zinc-400">{speakerLabel}</div>
              {audioEnabled ? <AudioIconButton text={turn.speakerText} playText={playText} playOptions={playOptions} label="Replay speaker line" /> : null}
            </div>
            <div className="text-[17px] font-semibold leading-snug text-zinc-100">
              {audioEnabled ? (
                <InteractivePhraseText text={turn.speakerText} playText={(text, options) => playText?.(text, { ...playOptions, ...options })} />
              ) : (
                <span>{turn.speakerText}</span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showSupport ? (
        <div className="scenario-v2-fade scenario-v2-support-panel max-w-[86%] rounded-2xl border px-3 py-2">
          <div className="scenario-v2-support-label text-[10px] uppercase tracking-widest">Meaning</div>
          <div className="mt-0.5 text-[12px] leading-snug">{turn.supportText || turn.meaningText}</div>
        </div>
      ) : null}

      {showTranslationReveal ? (
        <ScenarioV2TranslationReveal items={turn.translationReveal} />
      ) : null}
    </div>
  );
}

function ScenarioV2UserBubble({ item, playText }) {
  return (
    <div className="flex justify-end">
      <div className={cn("scenario-v2-bubble scenario-v2-user-bubble max-w-[84%] rounded-[22px] border px-4 py-3", ["acceptable", "awkward"].includes(item.result) && "scenario-v2-soft-bubble")}>
        <svg className="scenario-v2-tail" viewBox="0 0 20 24" aria-hidden="true">
          <path className="scenario-v2-tail-fill" d="M1 1C2.4 8.6 6.8 14.2 18 16.2C13.6 20.4 8.5 22.6 1 22.8Z" />
          <path className="scenario-v2-tail-stroke" d="M1 1C2.4 8.6 6.8 14.2 18 16.2C13.6 20.4 8.5 22.6 1 22.8" />
        </svg>
        <div className="scenario-v2-user-label relative z-[1] text-[11px] font-semibold">You</div>
        <div className="scenario-v2-user-text relative z-[1] mt-1 text-[15px] font-semibold leading-snug"><InteractivePhraseText text={item.text} playText={playText} /></div>
        {item.supportText ? <div className="scenario-v2-user-support relative z-[1] mt-1 text-[11px] leading-snug">{item.supportText}</div> : null}
      </div>
    </div>
  );
}

function ScenarioV2HistoryItem({ block, item, playText }) {
  if (item.role === "learner") return <ScenarioV2UserBubble item={item} playText={playText} />;
  return (
    <ScenarioV2SystemTurn
      block={block}
      turn={item}
      phase="speaker"
      playText={playText}
    />
  );
}

function ScenarioV2CompleteAction({ onComplete }) {
  return (
    <div className="scenario-v2-complete-action mt-3 rounded-[26px] border px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
      <div className="mb-3 rounded-[20px] border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-2">
        <div className="text-[14px] font-semibold text-emerald-200">Scenario complete</div>
        <div className="mt-0.5 text-[12px] text-zinc-400">You completed the conversation naturally.</div>
      </div>
      <ActionButton onClick={onComplete} className="w-full">Continue</ActionButton>
    </div>
  );
}

function ScenarioV2FocusedMode({ block, playText: suppliedPlayText, onWrongAnswer, onExit, onComplete }) {
  const lifetimeRef = useRef(null);
  if (!lifetimeRef.current) lifetimeRef.current = new AbortController();
  const learnerAudioRef = useRef(false);
  const [learnerAudioPending, setLearnerAudioPending] = useState(false);
  useEffect(() => {
    lifetimeRef.current = new AbortController();
    return () => lifetimeRef.current.abort();
  }, []);
  // Replay/help controls must not interrupt the learner turn while it is being
  // spoken. The same TTS owner supplies completion and scoped cancellation.
  const playText = (text, options) => learnerAudioRef.current ? Promise.resolve() :
    suppliedPlayText?.(text, { ...options, signal: lifetimeRef.current.signal });
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const timersRef = useRef([]);
  const autoplayStartedKeysRef = useRef(new Set());
  const revealedTurnKeyRef = useRef(null);
  const playTextRef = useRef(playText);
  const feedRef = useRef(null);
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [turnPhase, setTurnPhase] = useState("scene");
  const [followUpTurn, setFollowUpTurn] = useState(null);
  const [followUpPhase, setFollowUpPhase] = useState("scene");
  const [helpTurn, setHelpTurn] = useState(null);
  const [helpPhase, setHelpPhase] = useState("scene");
  const [helpCounts, setHelpCounts] = useState({});
  const [finalTurn, setFinalTurn] = useState(null);
  const [finalPhase, setFinalPhase] = useState("scene");
  const [complete, setComplete] = useState(false);

  const step = steps[stepIndex] || null;
  const authoredOptions = Array.isArray(step?.options) ? step.options : [];
  const shuffledAuthoredOptions = useMemo(() => shuffledCopy(authoredOptions), [step?.id]);
  const helpCount = step?.id ? (helpCounts[step.id] || 0) : 0;
  const options = useMemo(
    () => withScenarioHelpOption(shuffledAuthoredOptions, step, helpCount),
    [shuffledAuthoredOptions, step, helpCount]
  );
  const participant = Array.isArray(block?.participants)
    ? block.participants.find((p) => p.id === step?.speakerId)
    : null;
  const speakerLabel = step?.speakerLabel || participant?.label || "Speaker";
  const activeStepTurnKey = step?.id ? `step:${step.id}` : null;
  const followUpTurnKey = followUpTurn?.speakerText ? `followup:${step?.id || "step"}:${followUpTurn.speakerText}` : null;
  const helpTurnKey = helpTurn ? `help:${step?.id || "step"}:${helpTurn.helpLevel || 0}:${helpTurn.speakerText || helpTurn.sceneDirection || "context"}` : null;
  const finalTurnKey = finalTurn?.speakerText ? `final:${step?.id || "step"}:${finalTurn.speakerText}` : null;
  const selectedOptionForStep = selectedOption?.stepId === step?.id ? selectedOption.option : null;
  const isComprehensionStep = step?.interactionMode === "comprehension";
  const stepSpeakerHistoryId = step?.id ? `${step.id}_speaker` : null;
  const stepSpeakerCommitted = !!stepSpeakerHistoryId && history.some((item) => item.id === stepSpeakerHistoryId);

  function clearTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }

  function queueTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }

  useEffect(() => {
    playTextRef.current = playText;
  }, [playText]);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    setSelectedOption(null);
  }, [activeStepTurnKey]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, [history, stepIndex, turnPhase, followUpPhase, helpPhase, helpTurn, finalPhase, finalTurn, complete]);

  useEffect(() => {
    clearTimers();
    if (!step || followUpTurn || helpTurn || finalTurn || complete) return;
    if (stepSpeakerCommitted) {
      setTurnPhase("speaker");
      return;
    }
    const turnKey = activeStepTurnKey;
    revealedTurnKeyRef.current = null;
    setTurnPhase(step.sceneDirection ? "scene" : "speaker");
    const delay = step.sceneDirection ? 650 : 120;
    queueTimeout(() => {
      setTurnPhase("speaker");
      revealedTurnKeyRef.current = turnKey;
      if (isScenarioTurnAudioEnabled(step)) {
        autoplayOnce(autoplayStartedKeysRef, turnKey, step.speakerText, playTextRef.current, getTurnVoiceOptions(block, step));
      }
    }, delay);
  }, [activeStepTurnKey, step?.sceneDirection, step?.speakerText, stepSpeakerCommitted, followUpTurn, helpTurn, finalTurn, complete]);

  useEffect(() => {
    if (!followUpTurn) return;
    clearTimers();
    const turnKey = followUpTurnKey;
    revealedTurnKeyRef.current = null;
    setFollowUpPhase(followUpTurn.sceneDirection ? "scene" : "speaker");
    const delay = followUpTurn.sceneDirection ? 650 : 120;
    const signal = lifetimeRef.current.signal;
    queueTimeout(async () => {
      setFollowUpPhase("speaker");
      revealedTurnKeyRef.current = turnKey;
      if (isScenarioTurnAudioEnabled(followUpTurn)) {
        await autoplayOnce(autoplayStartedKeysRef, turnKey, followUpTurn.speakerText, playTextRef.current, getTurnVoiceOptions(block, followUpTurn));
      }
      if (signal.aborted) return;
      setHistory((prev) => [
        ...prev,
        {
          id: `${followUpTurn.speakerId || "speaker"}_${Date.now()}`,
          role: "speaker",
          speakerId: followUpTurn.speakerId,
          speakerLabel: followUpTurn.speakerLabel,
          speakerText: followUpTurn.speakerText || "",
          sceneDirection: null,
          supportText: followUpTurn.supportText || followUpTurn.meaningText || "",
          audio: followUpTurn.audio,
          spokenLanguage: followUpTurn.spokenLanguage || followUpTurn.language || null,
        },
      ]);
      const nextStepId = followUpTurn?.nextStepId || null;
      setFollowUpTurn(null);
      advanceAfterProgressingAnswer(nextStepId);
    }, delay);
  }, [followUpTurnKey, followUpTurn?.sceneDirection, followUpTurn?.speakerText]);

  useEffect(() => {
    if (!helpTurn) return;
    clearTimers();
    const turnKey = helpTurnKey;
    revealedTurnKeyRef.current = null;
    setHelpPhase(helpTurn.sceneDirection ? "scene" : "speaker");
    const delay = helpTurn.sceneDirection ? 650 : 120;
    const signal = lifetimeRef.current.signal;
    queueTimeout(async () => {
      setHelpPhase("speaker");
      revealedTurnKeyRef.current = turnKey;
      if (helpTurn.speakerText && isScenarioTurnAudioEnabled(helpTurn)) {
        await autoplayOnce(autoplayStartedKeysRef, turnKey, helpTurn.speakerText, playTextRef.current, getTurnVoiceOptions(block, helpTurn));
      }
      if (signal.aborted) return;
      setHistory((prev) => [
        ...prev,
        {
          id: `${step?.id || "step"}_help_response_${helpTurn.helpLevel || 1}`,
          role: "speaker",
          speakerId: helpTurn.speakerId,
          speakerLabel: helpTurn.speakerLabel,
          speakerText: helpTurn.speakerText || "",
          sceneDirection: helpTurn.sceneDirection || null,
          supportText: helpTurn.supportText || helpTurn.meaningText || "",
          translationReveal: helpTurn.translationReveal || null,
          audio: helpTurn.audio,
          spokenLanguage: helpTurn.spokenLanguage || helpTurn.language || null,
        },
      ]);
      setHelpTurn(null);
    }, delay);
  }, [helpTurnKey, helpTurn?.sceneDirection, helpTurn?.speakerText]);

  useEffect(() => {
    if (!finalTurn) return;
    clearTimers();
    const turnKey = finalTurnKey;
    revealedTurnKeyRef.current = null;
    setFinalPhase(finalTurn.sceneDirection ? "scene" : "speaker");
    const delay = finalTurn.sceneDirection ? 650 : 120;
    const signal = lifetimeRef.current.signal;
    queueTimeout(async () => {
      setFinalPhase("speaker");
      revealedTurnKeyRef.current = turnKey;
      if (isScenarioTurnAudioEnabled(finalTurn)) {
        await autoplayOnce(autoplayStartedKeysRef, turnKey, finalTurn.speakerText, playTextRef.current, getTurnVoiceOptions(block, finalTurn));
      }
      if (!signal.aborted) setComplete(true);
    }, delay);
  }, [finalTurnKey, finalTurn?.sceneDirection, finalTurn?.speakerText]);

  function addComprehensionExchange(option) {
    setHistory((prev) => {
      const speakerHistoryId = `${step?.id || "step"}_speaker`;
      const additions = [];
      if (!prev.some((item) => item.id === speakerHistoryId)) {
        additions.push({
          id: speakerHistoryId,
          role: "speaker",
          speakerId: step?.speakerId,
          speakerLabel,
          text: step?.speakerText || "",
          speakerText: step?.speakerText || "",
          sceneDirection: null,
          supportText: step?.supportText || step?.meaningText || "",
          audio: step?.audio,
          spokenLanguage: step?.spokenLanguage || step?.language || null,
        });
      }

      const learnerText = String(option?.learnerText || "").trim();
      if (learnerText) {
        additions.push({
          id: `${step?.id || "step"}_${option?.id || "option"}_learner`,
          role: "learner",
          speakerLabel: "You",
          text: learnerText,
          result: option?.result,
          supportText: option?.learnerSupportText || "",
        });
      }

      return [...prev, ...additions];
    });
  }

  function addCurrentExchange(option, learnerHistoryId = null) {
    setHistory((prev) => {
      const speakerHistoryId = `${step?.id || "step"}_speaker`;
      const additions = [];
      if (!prev.some((item) => item.id === speakerHistoryId)) {
        additions.push({
          id: speakerHistoryId,
          role: "speaker",
          speakerId: step?.speakerId,
          speakerLabel,
          text: step?.speakerText || "",
          speakerText: step?.speakerText || "",
          sceneDirection: null,
          supportText: step?.supportText || step?.meaningText || "",
          audio: step?.audio,
          spokenLanguage: step?.spokenLanguage || step?.language || null,
        });
      }
      additions.push({
        id: learnerHistoryId || `${step?.id || "step"}_${option?.id || "option"}`,
        role: "learner",
        speakerLabel: "You",
        text: option?.text || "",
        result: option?.result,
        supportText: option?.supportText || option?.meaningText || "",
      });
      return [...prev, ...additions];
    });
  }

  function handleScenarioHelp(option) {
    const turn = getScenarioHelpTurn(step, helpCount);
    if (!turn) return;
    addCurrentExchange(option, `${step?.id || "step"}_help_request_${helpCount + 1}`);
    setHelpCounts((prev) => ({ ...prev, [step.id]: helpCount + 1 }));
    setHelpTurn(turn);
  }

  function handleOption(option) {
    if (selectedOptionForStep || helpTurn || complete || learnerAudioRef.current) return;
    if (option?.isScenarioHelp || option?.result === "help") {
      handleScenarioHelp(option);
      return;
    }
    if (!optionCanProgress(option)) onWrongAnswer?.();
    if (!optionNeedsFeedback(option)) {
      processProgressingOption(option);
      return;
    }
    setSelectedOption({ stepId: step?.id || null, option: {
      ...option,
      betterAnswer: option.betterAnswer || (["acceptable", "awkward"].includes(option.result)
        ? step.options.find(candidate => candidate.result === "best")?.text : null),
    } });
  }

  function handleFeedbackContinue() {
    if (!selectedOptionForStep || !optionCanProgress(selectedOptionForStep)) return;
    const option = selectedOptionForStep;
    setSelectedOption(null);
    processProgressingOption(option);
  }

  async function processProgressingOption(option) {
    if (learnerAudioRef.current) return;
    const signal = lifetimeRef.current.signal;
    if (isComprehensionStep) addComprehensionExchange(option);
    else addCurrentExchange(option);
    if (isComprehensionStep && option.learnerText) {
      learnerAudioRef.current = true;
      setLearnerAudioPending(true);
      try { await suppliedPlayText?.(option.learnerText, { signal }); } catch {}
      finally {
        learnerAudioRef.current = false;
        if (!signal.aborted) setLearnerAudioPending(false);
      }
      if (signal.aborted) return;
    }
    const nextStepId = option?.nextStepId || null;
    if (option?.followUp?.speakerText) {
      setFollowUpTurn({ ...option.followUp, nextStepId });
      return;
    }

    advanceAfterProgressingAnswer(nextStepId);
  }

  function advanceAfterProgressingAnswer(nextStepId = null) {
    if (nextStepId) {
      const nextIndex = steps.findIndex((candidate) => candidate?.id === nextStepId);
      if (nextIndex >= 0) {
        setStepIndex(nextIndex);
        return;
      }
    }

    if (step?.finalSystemLine) {
      setFinalTurn(step.finalSystemLine);
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setComplete(true);
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  const activeSpeakerReady = (stepSpeakerCommitted || turnPhase === "speaker") && !followUpTurn && !helpTurn && !finalTurn && !complete && !learnerAudioPending;
  const activeTurn = step && !stepSpeakerCommitted
    ? {
      speakerId: step.speakerId,
      speakerLabel: step.speakerLabel,
      speakerText: step.speakerText,
      sceneDirection: step.sceneDirection,
      supportText: step.supportText || step.meaningText,
      audio: step.audio,
      spokenLanguage: step.spokenLanguage || step.language || null,
    }
    : null;

  const content = (
    <div className="scenario-v2-screen fixed inset-0 z-[12000] overflow-y-auto bg-zinc-950 text-zinc-100">
      <div className="scenario-v2-frame mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">Scenario</div>
            <h1 ref={headingRef} tabIndex={-1} className="break-words text-[18px] font-semibold text-zinc-100 outline-none">{block?.title || "Scenario"}</h1>
            {(block?.sceneIntro || block?.goal) ? (
              <div className="mt-0.5 text-[12px] leading-snug text-zinc-500">
                {block.sceneIntro || block.goal}
              </div>
            ) : null}
          </div>
          <button type="button" data-press onClick={() => { lifetimeRef.current.abort(); onExit?.(); }} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200">
            Exit
          </button>
        </div>

        <div className="scenario-v2-chat-window min-h-[12rem] flex-1 overflow-hidden rounded-[28px] border shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
          <div ref={feedRef} className={cn("max-h-[45dvh] overflow-y-auto px-4 py-4 space-y-4", selectedOptionForStep ? "pb-44" : "")}>
            {history.map((item) => (
              <ScenarioV2HistoryItem key={item.id} block={block} item={item} playText={playText} />
            ))}

            {!complete && !followUpTurn && !helpTurn && !finalTurn && step && activeTurn ? (
              <ScenarioV2SystemTurn block={block} turn={activeTurn} phase={turnPhase} playText={playText} />
            ) : null}

            {followUpTurn ? (
              <ScenarioV2SystemTurn block={block} turn={followUpTurn} phase={followUpPhase} playText={playText} />
            ) : null}

            {helpTurn ? (
              <ScenarioV2SystemTurn block={block} turn={helpTurn} phase={helpPhase} playText={playText} />
            ) : null}

            {finalTurn ? (
              <ScenarioV2SystemTurn block={block} turn={finalTurn} phase={finalPhase} playText={playText} final />
            ) : null}
          </div>
        </div>

        {!complete && step ? (
          <div
            aria-busy={!activeSpeakerReady}
            className={cn(
              "scenario-v2-reply-tray mt-3 rounded-[24px] border px-4 py-3 transition-opacity duration-150",
              activeSpeakerReady ? "opacity-100" : "opacity-80"
            )}
          >
            {step.helperText && activeSpeakerReady ? (
              <div className="scenario-v2-support-panel mb-3 rounded-2xl border px-3 py-2 text-[12px] leading-snug">
                {step.helperText}
              </div>
            ) : null}
            {isComprehensionStep ? <div className="mb-1 text-[10px] uppercase tracking-widest text-zinc-500">Comprehension check</div> : null}
            {step.learnerPrompt ? <div className="mb-3 text-[14px] font-semibold leading-snug text-zinc-100">{step.learnerPrompt}</div> : null}
            <div className="grid gap-2">
              {options.map((option) => {
                const optionDisabled = !activeSpeakerReady || !!selectedOptionForStep;
                const chooseOption = () => {
                  if (optionDisabled) return;
                  handleOption(option);
                };
                return (
                  <div
                    key={`${step.id}:${option.id}`}
                    role="button"
                    tabIndex={optionDisabled ? -1 : 0}
                    aria-disabled={optionDisabled}
                    aria-label={`${isComprehensionStep ? "Choose meaning" : "Choose reply"}: ${option.text}`}
                    onClick={chooseOption}
                    onKeyDown={(event) => {
                      if (optionDisabled || (event.key !== "Enter" && event.key !== " ")) return;
                      event.preventDefault();
                      chooseOption();
                    }}
                    className={cn(
                      "scenario-v2-option rounded-2xl border px-3 py-3 transition",
                      optionDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                  >
                    <div className="text-[15px] font-semibold">
                      {option.text}
                    </div>
                    {option.supportText ? (
                      <div className="mt-1 text-[11px] leading-snug text-zinc-500">{option.supportText}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {learnerAudioPending ? <div role="status" className="mt-2 text-sm text-zinc-400">Your reply is playing…</div> : null}

        {complete ? (
          <ScenarioV2CompleteAction onComplete={onComplete} />
        ) : null}
      </div>

      {selectedOptionForStep ? (
        <ScenarioV2FeedbackSheet
          playText={playText}
          option={selectedOptionForStep}
          plainText={isComprehensionStep}
          onRetry={() => setSelectedOption(null)}
          onContinue={handleFeedbackContinue}
        />
      ) : null}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

export default function ScenarioV2Block({ block, playText, onComplete, onWrongAnswer, onAdvance, onExit }) {
  const [started, setStarted] = useState(false);
  const titleRef = useRef(null);
  useEffect(() => { if (!started) titleRef.current?.focus(); }, [started]);
  function finish() { onComplete?.(); onAdvance?.(); }
  const intro = (
    <section className="scenario-v2-screen scenario-v2-intro-screen fixed inset-0 z-[12000] overflow-y-auto bg-zinc-950 text-zinc-100" aria-labelledby="scenario-intro-title">
      <div className="scenario-v2-frame mx-auto flex min-h-[100dvh] max-w-xl flex-col px-5 py-5">
        {onExit ? <button type="button" onClick={onExit} className="self-start rounded-full border border-white/15 bg-white/[0.035] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.07] hover:text-zinc-200">Back</button> : null}
        <div className="flex flex-1 items-center py-8 sm:py-10">
          <div className="scenario-v2-intro-card w-full rounded-[32px] border px-5 py-6 sm:px-7 sm:py-8">
            <div className="scenario-v2-intro-badge inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17.5L4.5 19V7.75A2.75 2.75 0 0 1 7.25 5h9.5a2.75 2.75 0 0 1 2.75 2.75v6.5A2.75 2.75 0 0 1 16.75 17H8.1L7 17.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Scenario practice
            </div>
            <h1 id="scenario-intro-title" ref={titleRef} tabIndex={-1} className="mt-5 break-words text-[2.15rem] font-semibold leading-[1.08] tracking-tight outline-none sm:text-[2.5rem]">{block?.title || "Scenario"}</h1>
            <p className="mt-4 whitespace-pre-line break-words text-[1.08rem] leading-relaxed text-zinc-300 sm:text-[1.15rem]">{block?.sceneIntro || block?.description || block?.goal}</p>
            {(block?.location || block?.userRole || block?.participants?.length) ? (
              <dl className="mt-7 grid gap-3 sm:grid-cols-3">
                {block?.location ? (
                  <div className="scenario-v2-intro-meta-card rounded-2xl border px-4 py-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Where</dt>
                    <dd className="mt-1 text-[15px] font-medium leading-snug text-zinc-200">{block.location}</dd>
                  </div>
                ) : null}
                {block?.userRole ? (
                  <div className="scenario-v2-intro-meta-card rounded-2xl border px-4 py-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Your role</dt>
                    <dd className="mt-1 text-[15px] font-medium leading-snug text-zinc-200 capitalize">{block.userRole}</dd>
                  </div>
                ) : null}
                {block?.participants?.length ? (
                  <div className="scenario-v2-intro-meta-card rounded-2xl border px-4 py-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">With</dt>
                    <dd className="mt-1 text-[15px] font-medium leading-snug text-zinc-200">{block.participants.map(p => [p.name || p.label, p.role].filter(Boolean).join(" — ")).join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
        <ActionButton onClick={() => setStarted(true)} className="w-full shrink-0 py-4 text-[15px]">Start scenario</ActionButton>
      </div>
    </section>
  );
  return <>
    <ScenarioV2Styles />
    {started ? <ScenarioV2FocusedMode block={block} playText={playText} onWrongAnswer={onWrongAnswer}
      onExit={() => setStarted(false)} onComplete={finish} />
      : typeof document !== "undefined" ? createPortal(intro, document.body) : intro}
  </>;
}
