// src/views/training/LearningLessonView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function BackCircle({ onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        "h-10 w-10 rounded-full border flex items-center justify-center",
        "bg-white/[0.06] border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition"
      )}
      aria-label="Back"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </button>
  );
}

function SurfaceCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-black/20 backdrop-blur",
        "shadow-[0_0_24px_rgba(0,0,0,0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone =
    accent === "emerald"
      ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
      : accent === "red"
      ? "border-rose-400/18 bg-rose-500/[0.08] text-rose-200"
      : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[11px] font-medium tracking-tight",
        tone
      )}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className,
}) {
  const tone =
    variant === "primary"
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
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        tone,
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {children}
    </button>
  );
}

function AudioIconButton({ text, playText, label = "Play audio" }) {
  return (
    <button
      type="button"
      data-press
      aria-label={label}
      onClick={async () => {
        try {
          await playText?.(text);
        } catch {}
      }}
      className="
        h-9 w-9 rounded-full border border-white/10
        bg-white/[0.04] text-zinc-200
        flex items-center justify-center
        hover:bg-white/[0.07] transition
      "
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M11 5L6.8 9H4v6h2.8L11 19V5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function LearnBlock({ block, playText, onComplete, completed }) {
  const items = Array.isArray(block?.items) ? block.items : [];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[18px] font-semibold text-zinc-100">
                {item.lt}
              </div>
              <div className="text-[13px] text-zinc-400 mt-1">{item.en}</div>
            </div>

            {item.audioText ? (
              <AudioIconButton text={item.audioText} playText={playText} />
            ) : null}
          </div>
        </div>
      ))}

      <div className="pt-2">
        <ActionButton
          onClick={onComplete}
          variant={completed ? "secondary" : "primary"}
        >
          {completed ? "Reviewed" : "Continue"}
        </ActionButton>
      </div>
    </div>
  );
}

function ChoiceOption({ option, selected, revealState, onClick }) {
  const stateClass =
    revealState === "idle"
      ? selected
        ? "border-white/20 bg-white/[0.07] text-zinc-100"
        : "border-white/10 bg-white/[0.03] text-zinc-300"
      : option.isCorrect
      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
      : selected
      ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-100"
      : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-3 transition",
        stateClass
      )}
    >
      {option.text}
    </button>
  );
}

function ChoiceBlock({ block, playText, onComplete, completed }) {
  const [selectedId, setSelectedId] = useState(null);
  const [revealState, setRevealState] = useState("idle");

  const options = Array.isArray(block?.options) ? block.options : [];
  const selected = options.find((o) => o.id === selectedId) || null;

  const promptText =
    block?.prompt?.text ||
    (block?.type === "listen_mcq" ? "Choose the best answer" : "Choose the best answer");
  const audioText = block?.prompt?.audioText || "";

  const handleSelect = (option) => {
    if (revealState !== "idle") return;
    setSelectedId(option.id);
    setRevealState("revealed");
    onComplete?.();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[15px] font-semibold text-zinc-100">
          {promptText}
        </div>

        {audioText ? (
          <AudioIconButton text={audioText} playText={playText} />
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        {options.map((option) => (
          <ChoiceOption
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            revealState={revealState}
            onClick={() => handleSelect(option)}
          />
        ))}
      </div>

      {revealState === "revealed" && block?.feedback?.correct ? (
        <div className="mt-3 text-[13px] text-zinc-400 leading-snug">
          {block.feedback.correct}
        </div>
      ) : null}

      {completed ? (
        <div className="mt-4">
          <SmallMetaPill accent={selected?.isCorrect ? "emerald" : "default"}>
            {selected?.isCorrect ? "Answer reviewed" : "Correct answer shown"}
          </SmallMetaPill>
        </div>
      ) : null}
    </div>
  );
}

function SpeakSelfCheckBlock({ block, playText, onComplete, completed }) {
  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100">
        {block?.prompt || "Say it out loud"}
      </div>

      {block?.targetText ? (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[18px] font-semibold text-zinc-100">
              {block.targetText}
            </div>

            {block?.audioText ? (
              <AudioIconButton text={block.audioText} playText={playText} />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <ActionButton
          variant={completed ? "secondary" : "primary"}
          onClick={onComplete}
        >
          {completed ? "Spoken" : "I said it out loud"}
        </ActionButton>
      </div>

      <div className="mt-3 text-[13px] text-zinc-400 leading-snug">
        This speaking step is self-check only for now. Current speech capture
        will be wired in next, before scoring exists.
      </div>
    </div>
  );
}

function BuildPhraseBlock({ block, onComplete, completed }) {
  const tokens = Array.isArray(block?.tokens) ? block.tokens : [];
  const sortedTokens = [...tokens].sort((a, b) => a.correctIndex - b.correctIndex);
  const correctAnswer = block?.answerText || sortedTokens.map((t) => t.text).join(" ");

  const [built, setBuilt] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const remaining = tokens.filter((token) => !built.includes(token.id));

  const checkPhrase = () => {
    if (built.length !== tokens.length) return;
    setRevealed(true);
    onComplete?.();
  };

  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100">
        {block?.prompt?.text || "Build the phrase"}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 min-h-[72px]">
        <div className="flex flex-wrap gap-2">
          {built.length ? (
            built.map((id) => {
              const token = tokens.find((t) => t.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  data-press
                  onClick={() => {
                    if (revealed) return;
                    setBuilt((prev) => prev.filter((x) => x !== id));
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-100"
                >
                  {token?.text}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-zinc-500">
              Tap tokens below to build the phrase.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {remaining.map((token) => (
          <button
            key={token.id}
            type="button"
            data-press
            onClick={() => {
              if (revealed) return;
              setBuilt((prev) => [...prev, token.id]);
            }}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300"
          >
            {token.text}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <ActionButton
          onClick={checkPhrase}
          disabled={built.length !== tokens.length || revealed}
        >
          {revealed ? "Phrase reviewed" : "Check phrase"}
        </ActionButton>

        <ActionButton
          variant="ghost"
          onClick={() => {
            if (revealed) return;
            setBuilt([]);
          }}
        >
          Reset
        </ActionButton>
      </div>

      {revealed ? (
        <div className="mt-3 text-[13px] leading-snug">
          <span className="text-zinc-400">Correct phrase: </span>
          <span className="text-zinc-100">{correctAnswer}</span>
        </div>
      ) : null}

      {completed ? (
        <div className="mt-3">
          <SmallMetaPill accent="emerald">Phrase reviewed</SmallMetaPill>
        </div>
      ) : null}
    </div>
  );
}

function ConversationBubble({ role, text, compact = false }) {
  const isAssistant = role === "other";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[88%] rounded-3xl border px-4 py-3",
          compact ? "py-2.5" : "",
          isAssistant
            ? "border-white/10 bg-white/[0.03]"
            : "border-emerald-400/18 bg-emerald-500/[0.08]"
        )}
      >
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          {isAssistant ? "Žodis" : "You"}
        </div>
        <div className="mt-2 text-[15px] font-semibold text-zinc-100">{text}</div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Žodis
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-500/80 animate-pulse" />
          <span className="h-2 w-2 rounded-full bg-zinc-500/60 animate-pulse [animation-delay:120ms]" />
          <span className="h-2 w-2 rounded-full bg-zinc-500/40 animate-pulse [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}

function ScenarioChoice({ option, selectedId, revealState, onClick }) {
  const stateClass =
    revealState === "idle"
      ? "border-white/10 bg-white/[0.03] text-zinc-300"
      : option.isCorrect
      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
      : selectedId === option.id
      ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-100"
      : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      disabled={revealState !== "idle"}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-3 transition",
        stateClass,
        revealState !== "idle" ? "cursor-default" : ""
      )}
    >
      {option.text}
    </button>
  );
}

function ScenarioChainBlock({ block, playText, onComplete }) {
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const timeoutRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [revealState, setRevealState] = useState("idle");
  const [conversationComplete, setConversationComplete] = useState(false);

  const step = steps[stepIndex] || null;
  const options = Array.isArray(step?.options) ? step.options : [];
  const isLastStep = stepIndex >= steps.length - 1;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showAssistantStep = async (index) => {
    const nextStep = steps[index];
    if (!nextStep) return;

    setAssistantTyping(true);
    setAssistantVisible(false);
    setSelectedId(null);
    setRevealState("idle");

    timeoutRef.current = setTimeout(async () => {
      setAssistantTyping(false);
      setAssistantVisible(true);

      setHistory((prev) => [
        ...prev,
        {
          role: "other",
          text: nextStep.text,
        },
      ]);

      try {
        await playText?.(nextStep.audioText || nextStep.text);
      } catch {}
    }, 900);
  };

  const startConversation = async () => {
    if (started) return;
    setStarted(true);
    await showAssistantStep(0);
  };

  const handleSelect = (option) => {
    if (!assistantVisible || revealState !== "idle") return;

    setSelectedId(option.id);
    setRevealState("revealed");

    setHistory((prev) => [
      ...prev,
      {
        role: "you",
        text: option.text,
      },
    ]);

    if (isLastStep) {
      setConversationComplete(true);
      onComplete?.();
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setStepIndex((prev) => prev + 1);
      await showAssistantStep(stepIndex + 1);
    }, 850);
  };

  return (
    <div>
      {block?.description ? (
        <div className="text-[13px] text-zinc-400 leading-snug">
          {block.description}
        </div>
      ) : null}

      {!started ? (
        <div className="mt-4">
          <ActionButton onClick={startConversation}>Start conversation</ActionButton>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {history.map((item, index) => (
          <ConversationBubble
            key={`${item.role}-${index}-${item.text}`}
            role={item.role}
            text={item.text}
          />
        ))}

        {assistantTyping ? <TypingBubble /> : null}
      </div>

      {started && assistantVisible && !conversationComplete ? (
        <div className="mt-4 grid gap-3">
          {options.map((option) => (
            <ScenarioChoice
              key={option.id}
              option={option}
              selectedId={selectedId}
              revealState={revealState}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>
      ) : null}

      {conversationComplete ? (
        <div className="mt-4">
          <SmallMetaPill accent="emerald">Conversation reviewed</SmallMetaPill>
        </div>
      ) : null}
    </div>
  );
}

function BlockRenderer({ block, playText, onComplete, completed }) {
  switch (block?.type) {
    case "learn":
      return (
        <LearnBlock
          block={block}
          playText={playText}
          onComplete={onComplete}
          completed={completed}
        />
      );
    case "recognise_mcq":
    case "listen_mcq":
    case "best_response":
      return (
        <ChoiceBlock
          block={block}
          playText={playText}
          onComplete={onComplete}
          completed={completed}
        />
      );
    case "speak_self_check":
      return (
        <SpeakSelfCheckBlock
          block={block}
          playText={playText}
          onComplete={onComplete}
          completed={completed}
        />
      );
    case "build_phrase":
      return (
        <BuildPhraseBlock
          block={block}
          onComplete={onComplete}
          completed={completed}
        />
      );
    case "scenario_chain":
      return (
        <ScenarioChainBlock
          block={block}
          playText={playText}
          onComplete={onComplete}
        />
      );
    default:
      return (
        <div className="text-sm text-zinc-500">
          This block type is not supported yet.
        </div>
      );
  }
}

function LessonCompleteCard({ lessonTitle, onBack }) {
  return (
    <SurfaceCard className="p-4">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        Lesson complete
      </div>
      <div className="mt-2 text-[20px] font-semibold text-zinc-100">
        {lessonTitle}
      </div>
      <div className="mt-2 text-[13px] text-zinc-300 leading-snug">
        First pass complete. Next we’ll make completion persistence, rewards, and
        phrase save feel real.
      </div>

      <div className="mt-4 flex gap-3">
        <ActionButton onClick={onBack}>Back to module</ActionButton>
      </div>
    </SurfaceCard>
  );
}

export default function LearningLessonView({
  section,
  module,
  lesson,
  playText,
  onBack,
}) {
  const blocks = useMemo(
    () => (Array.isArray(lesson?.blocks) ? lesson.blocks : []),
    [lesson]
  );

  const [blockIndex, setBlockIndex] = useState(0);
  const [completedBlockIds, setCompletedBlockIds] = useState({});

  useEffect(() => {
    setBlockIndex(0);
    setCompletedBlockIds({});
  }, [lesson?.id]);

  const currentBlock = blocks[blockIndex] || null;
  const totalBlocks = blocks.length;
  const progressPct = totalBlocks
    ? Math.round(((blockIndex + 1) / totalBlocks) * 100)
    : 0;
  const isCurrentCompleted = !!currentBlock?.id && !!completedBlockIds[currentBlock.id];
  const isLastBlock = blockIndex === totalBlocks - 1;
  const lessonComplete = isLastBlock && isCurrentCompleted;

  const markCurrentComplete = () => {
    if (!currentBlock?.id) return;
    setCompletedBlockIds((prev) => {
      if (prev[currentBlock.id]) return prev;
      return { ...prev, [currentBlock.id]: true };
    });
  };

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-5 pb-8">
        <div className="text-zinc-100">No lesson found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">
          <BackCircle onClick={onBack} />
        </div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            Lesson {lesson?.code || ""}
          </div>
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-sm text-zinc-500">
          Section {section?.code} · Module {module?.code}
        </div>
        <div className="text-xl font-semibold text-zinc-100 mt-1">
          {lesson?.title || "Learning lesson"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          {lesson?.purpose || ""}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {lesson?.supportLevel ? (
          <SmallMetaPill accent="emerald">
            Support: {lesson.supportLevel}
          </SmallMetaPill>
        ) : null}
        {lesson?.newLanguageLoad ? (
          <SmallMetaPill>Load: {lesson.newLanguageLoad}</SmallMetaPill>
        ) : null}
        <SmallMetaPill>
          Block {Math.min(blockIndex + 1, totalBlocks)}/{totalBlocks}
        </SmallMetaPill>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full bg-emerald-500/80 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-5">
        {lessonComplete ? (
          <LessonCompleteCard lessonTitle={lesson.title} onBack={onBack} />
        ) : (
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              {currentBlock?.title || "Lesson block"}
            </div>

            <div className="mt-4">
              {currentBlock ? (
                <BlockRenderer
                  key={currentBlock.id}
                  block={currentBlock}
                  playText={playText}
                  onComplete={markCurrentComplete}
                  completed={isCurrentCompleted}
                />
              ) : (
                <div className="text-sm text-zinc-500">No block available.</div>
              )}
            </div>
          </SurfaceCard>
        )}
      </div>

      {lesson?.notes?.pattern || lesson?.notes?.usage?.length ? (
        <div className="mt-4">
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Pattern note
            </div>

            {lesson?.notes?.pattern ? (
              <div className="mt-2 text-[13px] text-zinc-300 leading-snug">
                {lesson.notes.pattern}
              </div>
            ) : null}

            {Array.isArray(lesson?.notes?.usage) && lesson.notes.usage.length > 0 ? (
              <div className="mt-3 space-y-2">
                {lesson.notes.usage.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300 leading-snug"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </SurfaceCard>
        </div>
      ) : null}

      {!lessonComplete ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <ActionButton
            variant="ghost"
            onClick={() => setBlockIndex((prev) => Math.max(0, prev - 1))}
            disabled={blockIndex === 0}
            className="flex-1"
          >
            Back
          </ActionButton>

          <ActionButton
            onClick={() =>
              setBlockIndex((prev) => Math.min(totalBlocks - 1, prev + 1))
            }
            disabled={!isCurrentCompleted || isLastBlock}
            className="flex-1"
          >
            Next
          </ActionButton>
        </div>
      ) : null}

      <div className="h-6" />
    </div>
  );
}