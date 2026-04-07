// src/views/training/SequenceDebugView.jsx
// Dev-only: shows the full lesson queue as the app sees it at runtime.
// Lets you jump to any lesson with all prior lessons marked complete,
// so you can test the flow from any point without a full manual run.

import React, { useMemo } from "react";

function buildSequence(sections, completedSet) {
  const seq = [];
  for (const section of sections) {
    for (const module of (section.modules || [])) {
      if (module?.status !== "active" && !module?.isSectionCheckpoint) continue;
      if (module.isSectionCheckpoint) {
        seq.push({ section, module, lesson: module, type: "sectionCheckpoint" });
        continue;
      }
      for (const lesson of (module.lessons || [])) {
        const isModCP = lesson.code?.endsWith?.(".C");
        seq.push({ section, module, lesson, type: isModCP ? "moduleCheckpoint" : "lesson" });
      }
    }
  }
  return seq;
}

export default function SequenceDebugView({ allSections, completedLessonIds, onJumpTo, onBack, completeLesson, userId }) {
  const completedSet = useMemo(() => new Set(completedLessonIds || []), [completedLessonIds]);
  const sequence = useMemo(() => buildSequence(allSections, completedSet), [allSections, completedSet]);

  const typeLabel = { lesson: "", moduleCheckpoint: "MOD CP", sectionCheckpoint: "SECTION CP" };
  const typeBg = { lesson: "bg-transparent", moduleCheckpoint: "bg-pink-900/40", sectionCheckpoint: "bg-purple-900/50" };

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-24">
      <div className="max-w-xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-zinc-200 text-sm">← Back</button>
          <div className="text-zinc-200 font-semibold">Lesson Sequence ({sequence.length} total)</div>
        </div>

        <div className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
          This is the exact order the app will navigate lessons for a new user. ✓ = completed.
          <br/>Press <strong className="text-zinc-300">Jump Here</strong> to mark all prior lessons complete and load that lesson directly.
        </div>

        <div className="flex flex-col gap-1">
          {sequence.map((item, idx) => {
            const id = item.lesson.id;
            const done = completedSet.has(id);
            const isNext = !done && sequence.slice(0, idx).every(s => completedSet.has(s.lesson.id));
            const badge = typeLabel[item.type];
            const bg = typeBg[item.type];

            return (
              <div
                key={id}
                className={`rounded-xl border px-3 py-2.5 flex items-center gap-3 ${bg} ${
                  isNext ? "border-emerald-500/60" : done ? "border-white/[0.05]" : "border-white/[0.09]"
                }`}
              >
                {/* Index + status */}
                <div className="w-7 text-center flex-shrink-0">
                  {done
                    ? <span className="text-emerald-400 text-sm">✓</span>
                    : <span className="text-zinc-600 text-xs">{idx + 1}</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.type === "sectionCheckpoint" ? "bg-purple-800/60 text-purple-300" :
                      item.type === "moduleCheckpoint" ? "bg-pink-800/60 text-pink-300" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {item.lesson.code || item.module.code}
                    </span>
                    {badge && <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{badge}</span>}
                    {isNext && <span className="text-[10px] text-emerald-400 font-semibold">← NEXT</span>}
                  </div>
                  <div className={`text-[12px] mt-0.5 truncate ${done ? "text-zinc-600" : "text-zinc-300"}`}>
                    {item.lesson.title || item.module.title}
                  </div>
                  <div className="text-[10px] text-zinc-600 truncate">
                    {item.section.title} › {item.module.title !== (item.lesson.title || item.module.title) ? item.module.title : ""}
                  </div>
                </div>

                {/* Jump button */}
                {!done && (
                  <button
                    onClick={() => {
                      // Mark all lessons before this one as complete
                      sequence.slice(0, idx).forEach(s => {
                        if (!completedSet.has(s.lesson.id)) {
                          completeLesson(s.lesson.id, userId);
                        }
                      });
                      // Small delay to let store update, then navigate
                      setTimeout(() => onJumpTo(item), 50);
                    }}
                    className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-700/70 hover:bg-emerald-600/80 text-emerald-100 transition"
                  >
                    Jump here
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
