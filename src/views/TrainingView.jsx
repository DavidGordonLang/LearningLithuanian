// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import LearningHome from "./training/LearningHome";
import LearningSectionView from "./training/LearningSectionView";
import LearningModuleView from "./training/LearningModuleView";
import LearningLessonView from "./training/LearningLessonView";
import ModuleCompleteView from "./training/ModuleCompleteView";
import SectionCompleteView from "./training/SectionCompleteView";
import VocabSaveView from "./training/VocabSaveView";
import RecallFlipView from "./training/RecallFlipView";
import BlindRecallView from "./training/BlindRecallView";
import MatchPairsView from "./training/MatchPairsView";
import ExamPrepHome from "./training/ExamPrepHome";
import ExamReadingTaskView from "./training/ExamReadingTaskView";
import ExamListeningTaskView from "./training/ExamListeningTaskView";
import ExamWritingTaskView from "./training/ExamWritingTaskView";
import { useTrainingFocus } from "../hooks/training/useTrainingFocus";
import { useGameStore } from "../stores/gameStore";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import createSection1 from "../content/learning/section1";
import { buildSection1Profile } from "../content/learning/section1/profile";
import createSection2 from "../content/learning/section2";
import createSection3 from "../content/learning/section3";
import createSection4 from "../content/learning/section4";
import createSection5 from "../content/learning/section5";
import SequenceDebugView from "./training/SequenceDebugView";

const ADMIN_EMAILS = ["davidgordonlang@gmail.com", "rokas.zemaitis@proton.me"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Builds a synthetic module for VocabSaveView that aggregates word_match pairs
// from every checkpoint in the section (module checkpoints + section checkpoint).
// This ensures phrases skipped at module-level vocab saves are caught here.
function buildSectionVocabModule(sec, fallbackCheckpoint) {
  const seenLt = new Set();
  const allPairs = [];

  (sec?.modules || []).forEach((m) => {
    // Regular modules: checkpoint is a lesson inside m.lessons
    if (Array.isArray(m.lessons)) {
      const cpLesson = m.lessons.find((l) => l.isCheckpoint);
      if (cpLesson) {
        const wm = (cpLesson.blocks || []).find((b) => b.type === "word_match");
        (wm?.pairs || []).forEach((p) => {
          if (!seenLt.has(p.lt)) { seenLt.add(p.lt); allPairs.push(p); }
        });
      }
    }
    // Section checkpoint: blocks live directly on the module
    if (m.isSectionCheckpoint && Array.isArray(m.blocks)) {
      const wm = m.blocks.find((b) => b.type === "word_match");
      (wm?.pairs || []).forEach((p) => {
        if (!seenLt.has(p.lt)) { seenLt.add(p.lt); allPairs.push(p); }
      });
    }
  });

  if (allPairs.length === 0) return fallbackCheckpoint;

  return {
    id: (fallbackCheckpoint?.id || sec?.id || "section") + "_vocab_all",
    title: sec?.title ? `${sec.title} — All Vocabulary` : "Section Vocabulary",
    lessons: [
      {
        id: "section_vocab_aggregated",
        isCheckpoint: true,
        blocks: [
          { type: "word_match", pairs: allPairs },
        ],
      },
    ],
  };
}

function findNextLesson(sections, completedLessonIds) {
  const completed = new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);
  for (const section of sections) {
    const modules = Array.isArray(section?.modules) ? section.modules : [];
    for (const module of modules) {
      if (module?.status !== "active" && !module?.isSectionCheckpoint) continue;
      // Section checkpoint: module has blocks directly — treat module itself as the lesson
      if (module.isSectionCheckpoint) {
        if (module.id && !completed.has(module.id)) {
          return { section, module, lesson: module, lessonIndex: 0 };
        }
        continue;
      }
      const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson?.id) continue;
        if (!completed.has(lesson.id)) {
          return { section, module, lesson, lessonIndex: i };
        }
      }
    }
  }
  return null;
}

function findLessonAfter(sections, lessonId) {
  const allLessons = [];
  for (const section of sections) {
    const modules = Array.isArray(section?.modules) ? section.modules : [];
    for (const module of modules) {
      if (module?.status !== "active" && !module?.isSectionCheckpoint) continue;
      // Section checkpoint: module itself is the lesson
      if (module.isSectionCheckpoint) {
        allLessons.push({ section, module, lesson: module, lessonIndex: 0 });
        continue;
      }
      const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
      lessons.forEach((lesson, i) => {
        allLessons.push({ section, module, lesson, lessonIndex: i });
      });
    }
  }
  const currentIdx = allLessons.findIndex((l) => l.lesson?.id === lessonId);
  if (currentIdx === -1 || currentIdx >= allLessons.length - 1) return null;
  return allLessons[currentIdx + 1];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingView({ T, rows, setRows, playText, preloadText, stopText, showToast }) {
  const [screen, setScreen] = useState("home");
  const [showSequenceDebug, setShowSequenceDebug] = useState(false);
  const [moduleCompletePayload, setModuleCompletePayload] = useState(null);
  const [sectionCompletePayload, setSectionCompletePayload] = useState(null);
  const [pendingSectionComplete, setPendingSectionComplete] = useState(false);
  const [vocabSaveModule, setVocabSaveModule] = useState(null);
  const [moduleWrongAnswers, setModuleWrongAnswers] = React.useState(0);
  const [moduleScoreableBlocks, setModuleScoreableBlocks] = React.useState(0);
  const [moduleXpEarned, setModuleXpEarned] = React.useState(0);
  const [devMode, setDevMode] = React.useState(() => {
    try { return localStorage.getItem("zodis_dev_mode") === "true"; } catch { return false; }
  });

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev;
      try { localStorage.setItem("zodis_dev_mode", String(next)); } catch {}
      return next;
    });
  };

  const [focus, setFocus] = useTrainingFocus();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonReturnScreen, setLessonReturnScreen] = useState("home");

  const user = useAuthStore((s) => s.user);
  const userEmail = String(user?.email || "").toLowerCase();
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);
  const showDevControls = import.meta.env.DEV || isAdmin;
  const effectiveDevMode = showDevControls && devMode;
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const hasSeenModuleComplete = useGameStore((s) => s.hasSeenModuleComplete);
  const markModuleCompleteSeen = useGameStore((s) => s.markModuleCompleteSeen);
  const hasSeenSectionComplete = useGameStore((s) => s.hasSeenSectionComplete);
  const markSectionCompleteSeen = useGameStore((s) => s.markSectionCompleteSeen);
  const completeLesson = useGameStore((s) => s.completeLesson);

  const userName = useSettingsStore((s) => s.userName);
  const speakerGender = useSettingsStore((s) => s.speakerGender);
  const fromCountryCode = useSettingsStore((s) => s.fromCountryCode);
  const livesInCountryCode = useSettingsStore((s) => s.livesInCountryCode);
  const dateOfBirth = useSettingsStore((s) => s.dateOfBirth);

  const section1Profile = useMemo(
    () => buildSection1Profile({ userName, speakerGender, fromCountryCode, livesInCountryCode, dateOfBirth }),
    [userName, speakerGender, fromCountryCode, livesInCountryCode, dateOfBirth]
  );

  const counts = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const sheet = (r) => String(r?.Sheet || "Phrases");
    const phrases = list.filter((r) => { const s = sheet(r); return s === "Phrases" || s === "Questions"; }).length;
    const words = list.filter((r) => sheet(r) === "Words").length;
    const numbers = list.filter((r) => sheet(r) === "Numbers").length;
    return { phrases, words, numbers, all: phrases + words };
  }, [rows]);

  const eligibleCount = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const s = (r) => String(r?.Sheet || "Phrases");
    const matchFocus = (r) => {
      if (focus === "all") return s(r) === "Phrases" || s(r) === "Questions" || s(r) === "Words";
      if (focus === "phrases") return s(r) === "Phrases" || s(r) === "Questions";
      if (focus === "words") return s(r) === "Words";
      if (focus === "numbers") return s(r) === "Numbers";
      return s(r) === "Phrases" || s(r) === "Questions";
    };
    return list.filter(matchFocus).length;
  }, [rows, focus]);

  const allSections = useMemo(
    () => [createSection1(section1Profile), createSection2(section1Profile), createSection3(section1Profile), createSection4(section1Profile), createSection5(section1Profile)],
    [section1Profile]
  );

  const nextLesson = useMemo(
    () => findNextLesson(allSections, completedLessonIds),
    [allSections, completedLessonIds]
  );

  const allComplete = !nextLesson;

  const learningSection = useMemo(() => {
    if (selectedLessonId || selectedModuleId) {
      for (const sec of allSections) {
        const modules = Array.isArray(sec?.modules) ? sec.modules : [];
        for (const mod of modules) {
          if (selectedModuleId && mod.id === selectedModuleId) return sec;
          if (selectedLessonId) {
            const found = (mod.lessons || []).find((l) => l.id === selectedLessonId);
            if (found) return sec;
            // Section checkpoint: module id IS the lesson id
            if (mod.isSectionCheckpoint && mod.id === selectedLessonId) return sec;
          }
        }
      }
    }
    return nextLesson?.section || allSections[0];
  }, [allSections, selectedModuleId, selectedLessonId, nextLesson]);

  const learningModule = useMemo(() => {
    const modules = Array.isArray(learningSection?.modules) ? learningSection.modules : [];
    if (selectedModuleId) return modules.find((m) => m?.id === selectedModuleId) || null;
    if (selectedLessonId) {
      for (const mod of modules) {
        const found = (mod.lessons || []).find((l) => l.id === selectedLessonId);
        if (found) return mod;
        // Section checkpoint: module id IS the lesson id
        if (mod.isSectionCheckpoint && mod.id === selectedLessonId) return mod;
      }
    }
    if (nextLesson?.module) return nextLesson.module;
    return modules.find((m) => m?.status === "active") || modules[0] || null;
  }, [learningSection, selectedModuleId, selectedLessonId, nextLesson]);

  const learningLesson = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (selectedLessonId) {
      const found = lessons.find((l) => l?.id === selectedLessonId);
      if (found) return found;
      // Section checkpoint: module has blocks but no lessons — the module IS the lesson
      if (learningModule?.blocks && learningModule.id === selectedLessonId) return learningModule;
      return null;
    }
    if (nextLesson?.lesson) return nextLesson.lesson;
    return lessons[0] || null;
  }, [learningModule, selectedLessonId, nextLesson]);

  const learningLessonIndex = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (!learningLesson) return 0;
    if (nextLesson?.lesson?.id === learningLesson.id) return nextLesson.lessonIndex;
    const idx = lessons.findIndex((l) => l?.id === learningLesson.id);
    return idx >= 0 ? idx : 0;
  }, [learningModule, learningLesson, nextLesson]);

  const nextLessonAfterCurrent = useMemo(() => {
    if (!learningLesson?.id) return null;
    return findLessonAfter(allSections, learningLesson.id);
  }, [allSections, learningLesson]);

  const isModuleFullyComplete = (mod) => {
    if (!mod) return false;
    if (Array.isArray(mod.lessons)) return mod.lessons.every((l) => completedLessonIds.includes(l.id));
    if (mod.blocks && mod.id) return completedLessonIds.includes(mod.id); // checkpoint module
    return false;
  };

  const isSectionFullyComplete = (sec) => {
    if (!sec?.modules) return false;
    return sec.modules.every((m) => isModuleFullyComplete(m));
  };

  const nextLessonLabel = nextLessonAfterCurrent
    ? `Lesson ${nextLessonAfterCurrent.lessonIndex + 1} — ${nextLessonAfterCurrent.lesson.title}`
    : null;

  const handleNextLesson = nextLessonAfterCurrent ? () => {
    const { module, lesson } = nextLessonAfterCurrent;
    setSelectedLessonId(lesson.id);
    setSelectedModuleId(module.id);
    setLessonReturnScreen("home");
    setScreen("learningLesson");
  } : null;

  const learningCardTitle = allComplete
    ? "All lessons complete"
    : nextLesson
    ? `${nextLesson.lesson.title}`
    : "Start learning";

  const learningCardMeta = allComplete
    ? "Browse course to review any lesson"
    : nextLesson
    ? `${nextLesson.section.title} · Lesson ${nextLesson.lessonIndex + 1}`
    : "";

  if (screen === "learningHome") {
    return (
      <LearningHome
        onBack={() => setScreen("home")}
        allSections={allSections}
        onOpenSection={(sectionId) => {
          const sec = allSections.find((s) => s.id === sectionId);
          if (!sec) return;
          const firstMod = sec.modules?.[0];
          if (firstMod) setSelectedModuleId(firstMod.id);
          setSelectedLessonId(null);
          setScreen("learningSection");
        }}
      />
    );
  }

  if (screen === "learningSection") {
    return (
      <LearningSectionView
        section={learningSection}
        onBack={() => { setSelectedModuleId(null); setScreen("learningHome"); }}
        onOpenModule={(moduleId) => {
          if (!moduleId) return;
          setSelectedModuleId(moduleId);
          setSelectedLessonId(null);
          setScreen("learningModule");
        }}
      />
    );
  }

  if (screen === "learningModule") {
    return (
      <LearningModuleView
        section={learningSection}
        module={learningModule}
        devMode={effectiveDevMode}
        onBack={() => setScreen("learningSection")}
        onOpenLesson={(lessonId) => {
          if (!lessonId) return;
          setSelectedLessonId(lessonId);
          setLessonReturnScreen("learningModule");
          setScreen("learningLesson");
        }}
      />
    );
  }

  if (screen === "vocabSave" && vocabSaveModule) {
    return (
      <div className="h-full overflow-y-auto overscroll-contain">
        <VocabSaveView
          module={vocabSaveModule}
          rows={rows}
          setRows={setRows}
          showToast={showToast}
          onDone={() => {
            setVocabSaveModule(null);
            // If section just completed, fire celebration screen
            if (pendingSectionComplete && sectionCompletePayload) {
              setPendingSectionComplete(false);
              setScreen("sectionComplete");
              return;
            }
            const next = findNextLesson(allSections, completedLessonIds);
            if (next) {
              setSelectedLessonId(next.lesson.id);
              setSelectedModuleId(next.module.id);
              setModuleWrongAnswers(0);
              setModuleScoreableBlocks(0);
              setModuleXpEarned(0);
              setLessonReturnScreen("home");
              setScreen("learningLesson");
            } else {
              setSelectedLessonId(null);
              setSelectedModuleId(null);
              setScreen("home");
            }
          }}
        />
      </div>
    );
  }

  if (screen === "sectionComplete" && sectionCompletePayload) {
    const completedSectionIndex = allSections.findIndex(
      (section) => section?.id === sectionCompletePayload.section?.id
    );
    const nextSectionForComplete =
      completedSectionIndex >= 0 ? allSections[completedSectionIndex + 1] || null : null;

    return (
      <SectionCompleteView
        section={sectionCompletePayload.section}
        nextSection={nextSectionForComplete}
        modules={sectionCompletePayload.modules}
        xpEarned={sectionCompletePayload.xpEarned}
        accuracyPct={sectionCompletePayload.accuracyPct}
        onContinue={() => {
          setSectionCompletePayload(null);
          const next = findNextLesson(allSections, completedLessonIds);
          if (next) {
            setSelectedLessonId(next.lesson.id);
            setSelectedModuleId(next.module.id);
            setModuleWrongAnswers(0);
            setModuleScoreableBlocks(0);
            setModuleXpEarned(0);
            setLessonReturnScreen("home");
            setScreen("learningLesson");
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        onHome={() => {
          setSectionCompletePayload(null);
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "moduleComplete" && moduleCompletePayload) {
    return (
      <ModuleCompleteView
        section={moduleCompletePayload.section}
        module={moduleCompletePayload.module}
        xpEarned={moduleCompletePayload.xpEarned}
        accuracyPct={moduleCompletePayload.accuracyPct}
        onSaveVocab={() => {
          const mod = moduleCompletePayload?.module;
          setModuleCompletePayload(null);
          setVocabSaveModule(mod);
          setScreen("vocabSave");
        }}
        onContinue={() => {
          setModuleCompletePayload(null);
          const next = findNextLesson(allSections, completedLessonIds);
          if (next) {
            setSelectedLessonId(next.lesson.id);
            setSelectedModuleId(next.module.id);
            setModuleWrongAnswers(0);
            setModuleScoreableBlocks(0);
            setModuleXpEarned(0);
            setLessonReturnScreen("home");
            setScreen("learningLesson");
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        onHome={() => {
          setModuleCompletePayload(null);
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "learningLesson") {
    return (
      <LearningLessonView
        key={learningLesson?.id}
        section={learningSection}
        module={learningModule}
        lesson={learningLesson}
        lessonIndex={learningLessonIndex}
        playText={playText}
        showToast={showToast}
        userId={user?.id}
        onBack={() => {
          if (lessonReturnScreen === "learningModule") {
            setScreen(lessonReturnScreen);
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen(lessonReturnScreen);
          }
        }}
        onBrowseCourse={() => {
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("learningHome");
        }}
        onLessonComplete={(metrics) => {
          if (metrics?.scoreableBlocks > 0) {
            setModuleWrongAnswers((n) => n + (metrics.wrongAnswers || 0));
            setModuleScoreableBlocks((n) => n + (metrics.scoreableBlocks || 0));
          }
          setModuleXpEarned((n) => n + (metrics?.xpAwarded || 0));
        }}
        preloadText={preloadText}
        onNailedItContinue={(completedLessonId) => {
          let mod = learningModule;
          let sec = learningSection;
          if (completedLessonId) {
            outer: for (const s of allSections) {
              for (const m of (s.modules || [])) {
                if ((m.lessons || []).find(l => l.id === completedLessonId)) { mod = m; sec = s; break outer; }
                if (m.blocks && m.id === completedLessonId) { mod = m; sec = s; break outer; } // checkpoint
              }
            }
          }
          const modComplete = mod && isModuleFullyComplete(mod);
          const secComplete = sec && isSectionFullyComplete(sec) && !hasSeenSectionComplete(sec.id);
          const modAccuracy = moduleScoreableBlocks > 0
            ? Math.round(((moduleScoreableBlocks - moduleWrongAnswers) / moduleScoreableBlocks) * 100)
            : null;

          // Section complete check runs independently — fires even if module
          // complete screen was previously seen (e.g. via dev mode or earlier playthrough)
          if (modComplete && secComplete) {
            if (!hasSeenModuleComplete(mod.id)) markModuleCompleteSeen(mod.id, user?.id);
            markSectionCompleteSeen(sec.id, user?.id);
            setSectionCompletePayload({
              section: sec,
              modules: sec.modules || [],
              accuracyPct: modAccuracy,
              xpEarned: moduleXpEarned > 0 ? moduleXpEarned : null,
            });
            setPendingSectionComplete(true);
            const checkpoint = (sec.modules || []).find((m) => m.isSectionCheckpoint) || mod;
            setVocabSaveModule(buildSectionVocabModule(sec, checkpoint));
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("vocabSave");
          } else if (modComplete && !hasSeenModuleComplete(mod.id)) {
            markModuleCompleteSeen(mod.id, user?.id);
            setModuleCompletePayload({
              module: mod,
              section: sec,
              accuracyPct: modAccuracy,
              xpEarned: moduleXpEarned > 0 ? moduleXpEarned : null,
            });
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("moduleComplete");
          } else if (typeof handleNextLesson === "function") {
            handleNextLesson();
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        nextLessonLabel={nextLessonLabel}
      />
    );
  }

  if (screen === "recallFlip") return <RecallFlipView rows={rows} focus={focus} playText={playText} onBack={() => setScreen("home")} />;
  if (screen === "blindRecall") return <BlindRecallView rows={rows} focus={focus} playText={playText} showToast={showToast} onBack={() => setScreen("home")} />;
  if (screen === "matchPairs") return <MatchPairsView rows={rows} focus={focus} playText={playText} preloadText={preloadText} onBack={() => setScreen("home")} />;

  if (screen === "examPrepHome") {
    return (
      <ExamPrepHome
        onBack={() => setScreen("home")}
        onOpenReading={() => setScreen("examReading")}
        onOpenListening={() => setScreen("examListening")}
        onOpenWriting={() => setScreen("examWriting")}
      />
    );
  }
  if (screen === "examReading") return <ExamReadingTaskView onBack={() => setScreen("examPrepHome")} />;
  if (screen === "examListening") {
    return <ExamListeningTaskView playText={playText} preloadText={preloadText} stopText={stopText} showToast={showToast} onBack={() => setScreen("examPrepHome")} />;
  }
  if (screen === "examWriting") return <ExamWritingTaskView onBack={() => setScreen("examPrepHome")} />;

  if (showSequenceDebug) {
    return (
      <SequenceDebugView
        allSections={allSections}
        completedLessonIds={completedLessonIds}
        completeLesson={completeLesson}
        userId={user?.id}
        onBack={() => setShowSequenceDebug(false)}
        onJumpTo={({ section, module, lesson }) => {
          setShowSequenceDebug(false);
          setSelectedLessonId(lesson.id);
          setSelectedModuleId(module.id);
          setModuleWrongAnswers(0);
          setModuleScoreableBlocks(0);
          setModuleXpEarned(0);
          setLessonReturnScreen("home");
          setScreen("learningLesson");
        }}
      />
    );
  }

  return (
    <TrainingHome
      T={T}
      focus={focus}
      setFocus={setFocus}
      counts={counts}
      eligibleCount={eligibleCount}
      learningEntryMode={completedLessonIds?.length > 0 ? "continue" : "start"}
      learningCurrentTitle={learningCardTitle}
      learningCurrentMeta={learningCardMeta}
      onStartLearning={allComplete ? null : () => {
        const lessonToPinId = nextLesson?.lesson?.id || null;
        const moduleToPinId = nextLesson?.module?.id || null;
        setSelectedLessonId(lessonToPinId);
        setSelectedModuleId(moduleToPinId);
        setLessonReturnScreen("home");
        setModuleWrongAnswers(0);
        setModuleScoreableBlocks(0);
        setModuleXpEarned(0);
        setScreen("learningLesson");
      }}
      devMode={effectiveDevMode}
      showDevControls={showDevControls}
      onToggleDevMode={toggleDevMode}
      devTestModules={effectiveDevMode
        ? [
            {
              id: "sequence_debug",
              label: "⚡ Sequence Walker",
              onClick: () => setShowSequenceDebug(true),
            },
          ]
        : []}
      onBrowseCourse={() => setScreen("learningHome")}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}
