import React, { useState } from "react";
import ModalShell from "./ModalShell";
import InteractivePhraseText from "./audio/InteractivePhraseText";

export default function QuickStartModal({ playText, stopText, onClose }) {
  const [heardWord, setHeardWord] = useState(false);
  const [triedSlow, setTriedSlow] = useState(false);
  const finish = () => { stopText?.(); onClose?.(); };
  const tryWord = (text, options) => {
    // These track the attempted gesture, not a claim about successful playback.
    setHeardWord(true);
    if (options?.slow) setTriedSlow(true);
    return playText?.(text, options);
  };
  return (
    <ModalShell open title="Make your first words count" subtitle="Try one small thing before you begin."
      onClose={finish} closeOnBackdrop={false} zIndex="z-[11000]"
      headerAction={<button type="button" className="z-btn z-btn-secondary px-3 py-2" onClick={finish}>Skip</button>}>
      <div className="p-5 space-y-5 overflow-y-auto max-h-[70dvh]">
        <div className="z-inset p-5 text-center space-y-3">
          <div className="text-3xl font-semibold"><InteractivePhraseText text="Labas rytas!" playText={tryWord} /></div>
          <div className="text-sm text-zinc-400">Good morning!</div>
          <button type="button" className="z-btn z-btn-secondary px-4 py-2" onClick={() => playText?.("Labas rytas!")}>Hear the whole phrase</button>
        </div>
        <div className="space-y-3 text-sm" aria-live="polite">
          <p><strong>Tap a word.</strong> Hear just that word, as often as you need.{heardWord ? " Try the other word too." : " Try ‘rytas’ above."}</p>
          <p><strong>Hold a word.</strong> Keep your finger on it to hear it slowly.{triedSlow ? " You’ve tried the slow-play gesture." : " No need to replay the whole sentence."}</p>
        </div>
        <p className="text-sm text-zinc-400">Translate something you want to say, then save it to your Library. Lessons are ready when you want guided practice.</p>
        <p className="text-xs text-zinc-400">Prefer pronunciation hints? Choose English phonetics or IPA in Settings → Voice. Your profile and theme can be changed there too.</p>
        <button type="button" className="z-btn w-full px-4 py-3 bg-emerald-500 text-black font-semibold" onClick={finish}>Let’s begin</button>
        <p className="text-xs text-center text-zinc-400">The full guide stays in Settings. You don’t need to learn everything now.</p>
      </div>
    </ModalShell>
  );
}
