import React, { useRef, useState } from "react";
import ModalShell from "./ModalShell";
import InteractivePhraseText from "./audio/InteractivePhraseText";

const steps = [
  { title: "Say something you actually need", subtitle: "1 of 4 · Translate" },
  { title: "Listen your way", subtitle: "2 of 4 · Try word audio" },
  { title: "Keep it. Use it again.", subtitle: "3 of 4 · Library & Scenarios" },
  { title: "Practise as yourself", subtitle: "4 of 4 · Lessons & your preferences" },
];

export default function QuickStartModal({ playText, stopText, onClose }) {
  const [step, setStep] = useState(0);
  const [heardWord, setHeardWord] = useState(false);
  const [triedSlow, setTriedSlow] = useState(false);
  const [phraseActive, setPhraseActive] = useState(false);
  const request = useRef(0);
  const stop = () => { request.current += 1; setPhraseActive(false); stopText?.(); };
  const finish = () => { stop(); onClose?.(); };
  const navigate = (index) => { stop(); setStep(index); };
  const tryWord = (text, options) => {
    stop();
    setHeardWord(true);
    if (options?.slow) setTriedSlow(true);
    return playText?.(text, options);
  };
  const playPhrase = async () => {
    if (phraseActive) { stop(); return; }
    const id = ++request.current;
    setPhraseActive(true);
    try { await playText?.("Labas rytas!"); }
    finally { if (id === request.current) setPhraseActive(false); }
  };
  const card = "z-inset p-4 space-y-2";
  return (
    <ModalShell open title={steps[step].title} subtitle={steps[step].subtitle}
      onClose={finish} closeOnBackdrop={false} zIndex="z-[11000]"
      headerAction={<button type="button" className="z-btn z-btn-secondary px-3 py-2" onClick={finish}>Skip</button>}>
      <div className="p-5 space-y-5 overflow-y-auto max-h-[65dvh]">
        <div className="flex gap-2" aria-label={`Introduction step ${step + 1} of 4`}>
          {steps.map((item, i) => <span key={item.title} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-zinc-400/25"}`} />)}
        </div>
        {step === 0 ? <>
          <p className="text-sm">Start on Home with something you want to say. Type it or hold the microphone to speak.</p>
          <div className={card}>
            <div className="text-xs text-zinc-400">For example</div>
            <div className="text-lg font-semibold">Good morning!</div>
            <div className="border-t border-current/10 pt-3">
              <div className="text-xs text-zinc-400">Your Lithuanian phrase</div>
              <div className="text-2xl font-semibold mt-1">Labas rytas!</div>
            </div>
          </div>
          <p className="text-sm text-zinc-400">Get the Lithuanian, understand its English meaning, and hear how it sounds. You can translate Lithuanian back into English too.</p>
        </> : null}
        {step === 1 ? <>
          <div className={`${card} text-center`}>
            <div className="text-3xl font-semibold"><InteractivePhraseText text="Labas rytas!" playText={tryWord} /></div>
            <div className="text-sm text-zinc-400">Good morning!</div>
            <button type="button" aria-pressed={phraseActive}
              className={`z-btn z-btn-secondary px-4 py-3 transition ${phraseActive ? "ring-2 ring-emerald-500 bg-emerald-500/20 motion-safe:animate-pulse" : ""}`}
              onClick={playPhrase}>{phraseActive ? "Stop audio" : "Hear the whole phrase"}</button>
            <div className="text-xs text-zinc-400 min-h-4" aria-live="polite">{phraseActive ? "Audio requested · tap again to stop" : ""}</div>
          </div>
          <div className="space-y-3 text-sm">
            <p><strong>Tap a word.</strong> Hear just that word.{heardWord ? " Try the other word too." : " Try ‘rytas’ above."}</p>
            <p><strong>Hold a word.</strong> Hear it slowly.{triedSlow ? " You’ve tried the slow-play gesture." : " Keep your finger on it for a moment."}</p>
          </div>
        </> : null}
        {step === 2 ? <>
          <p className="text-sm">A useful translation can become part of your own learning material.</p>
          <div className={card}>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Save to Library</div>
            <div className="text-xl font-semibold">Labas rytas!</div>
            <p className="text-sm">Keep phrases, replay them, and revisit their meaning and notes. Search your Library when you need one again.</p>
          </div>
          <div className={card}>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Group into Scenarios</div>
            <div className="flex gap-2 flex-wrap text-sm"><span className="rounded-full border border-current/20 px-3 py-1">At the café</span><span className="rounded-full border border-current/20 px-3 py-1">Meeting people</span></div>
            <p className="text-sm">Make a collection for a real situation and add phrases from Home or your Library. Keep what you’ll need together.</p>
          </div>
        </> : null}
        {step === 3 ? <>
          <div className={card}>
            <div className="text-lg font-semibold">A guided path in Training</div>
            <p className="text-sm">Listen, build phrases, match words and practise speaking. Lesson conversations let you choose a reply and see how it fits the situation.</p>
          </div>
          <div className={card}>
            <div className="text-lg font-semibold">Your life belongs in your lessons</div>
            <p className="text-sm">Your profile helps tailor examples to your country, age and speaker gender. Lithuanian word forms can change depending on who is speaking.</p>
          </div>
          <p className="text-sm"><strong>Make it comfortable.</strong> In Settings, choose English-style pronunciation hints or IPA, pick a voice, and switch between light and dark mode. You can edit your profile there too.</p>
          <p className="text-xs text-zinc-400">The full guide stays in Settings whenever you need it.</p>
        </> : null}
        <div className="flex items-center justify-between gap-3 pt-1">
          {step > 0 ? <button type="button" className="z-btn z-btn-secondary px-4 py-3" onClick={() => navigate(step - 1)}>Back</button> : <span />}
          <button type="button" className="z-btn px-5 py-3 bg-emerald-500 text-black font-semibold" onClick={() => step < 3 ? navigate(step + 1) : finish()}>{step === 3 ? "Let’s begin" : step === 0 ? "Try the audio" : "Next"}</button>
        </div>
      </div>
    </ModalShell>
  );
}
