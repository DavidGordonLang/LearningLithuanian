import React, { useMemo, useState } from "react";
import TrainingBackButton from "./TrainingBackButton";
import ScenarioV2Block from "./ScenarioV2Block";
import { ScenarioChainBlock } from "./LearningLessonView";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function buildScenarioItems(sections) {
  const items = [];

  function addBlocks({ section, module, lesson, blocks }) {
    (Array.isArray(blocks) ? blocks : []).forEach((block, blockIndex) => {
      if (block?.type !== "scenario_chain" && block?.type !== "scenario_v2") return;
      const key = [
        section?.id || "section",
        module?.id || "module",
        lesson?.id || "lesson",
        block?.id || blockIndex,
        block?.type || "scenario",
      ].join(":");

      items.push({
        key,
        section,
        module,
        lesson,
        block,
        blockIndex,
      });
    });
  }

  (Array.isArray(sections) ? sections : []).forEach((section) => {
    if (Array.isArray(section?.blocks)) {
      addBlocks({ section, module: null, lesson: null, blocks: section.blocks });
    }

    (Array.isArray(section?.modules) ? section.modules : []).forEach((module) => {
      if (Array.isArray(module?.blocks)) {
        addBlocks({ section, module, lesson: null, blocks: module.blocks });
      }

      (Array.isArray(module?.lessons) ? module.lessons : []).forEach((lesson) => {
        addBlocks({ section, module, lesson, blocks: lesson?.blocks });
      });
    });
  });

  return items;
}

function MetaRow({ label, value }) {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-2 text-[12px] leading-snug">
      <div className="text-zinc-600">{label}</div>
      <div className="min-w-0 text-zinc-300 break-words">{value || "-"}</div>
    </div>
  );
}

function ScenarioPreview({ item, playText, resetKey }) {
  if (!item?.block) return null;

  const noop = () => {};
  const previewKey = `${item.key}:${resetKey}`;
  const frameClass = "rounded-[28px] border border-white/10 bg-black/20 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)]";

  return (
    <div key={previewKey} className={frameClass}>
      {item.block.type === "scenario_v2" ? (
        <ScenarioV2Block
          block={item.block}
          playText={playText}
          onComplete={noop}
          onAdvance={noop}
          onWrongAnswer={noop}
        />
      ) : (
        <ScenarioChainBlock
          block={item.block}
          playText={playText}
          onComplete={noop}
          onAdvance={noop}
          onWrongAnswer={noop}
        />
      )}
    </div>
  );
}

export default function ScenarioReviewView({ allSections, playText, onBack }) {
  const scenarios = useMemo(() => buildScenarioItems(allSections), [allSections]);
  const [index, setIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const selected = scenarios[index] || null;
  const typeLabel = selected?.block?.type === "scenario_v2" ? "Scenario V2" : "Scenario Chain";

  function goTo(nextIndex) {
    const bounded = Math.max(0, Math.min(scenarios.length - 1, nextIndex));
    setIndex(bounded);
    setResetKey((n) => n + 1);
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-24">
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <TrainingBackButton onClick={onBack} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-zinc-200">Scenario Review</div>
            <div className="text-[11px] text-zinc-500">
              {scenarios.length ? `${index + 1} / ${scenarios.length}` : "No scenario blocks found"}
            </div>
          </div>
        </div>

        {!selected ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-zinc-400">
            No scenario blocks were found in the current learning content.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                  selected.block.type === "scenario_v2"
                    ? "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-200"
                    : "border-sky-400/20 bg-sky-500/[0.07] text-sky-200"
                )}>
                  {typeLabel}
                </span>
                <span className="text-[11px] text-zinc-600">Block {selected.blockIndex + 1}</span>
              </div>

              <div className="space-y-1.5">
                <MetaRow label="Section" value={[selected.section?.code, selected.section?.title].filter(Boolean).join(" / ")} />
                <MetaRow label="Module" value={[selected.module?.code, selected.module?.title].filter(Boolean).join(" / ")} />
                <MetaRow label="Lesson" value={[selected.lesson?.code, selected.lesson?.title].filter(Boolean).join(" / ")} />
                <MetaRow label="Block ID" value={selected.block?.id || "(missing id)"} />
                <MetaRow label="Type" value={selected.block?.type} />
                <MetaRow label="Title" value={selected.block?.title} />
                {selected.block?.description ? <MetaRow label="Desc" value={selected.block.description} /> : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                data-press
                onClick={() => goTo(index - 1)}
                disabled={index <= 0}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] font-semibold text-zinc-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                data-press
                onClick={() => setResetKey((n) => n + 1)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] font-semibold text-zinc-200 transition hover:bg-white/[0.07]"
              >
                Reset preview
              </button>
              <button
                type="button"
                data-press
                onClick={() => goTo(index + 1)}
                disabled={index >= scenarios.length - 1}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] font-semibold text-zinc-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>

            <ScenarioPreview item={selected} playText={playText} resetKey={resetKey} />
          </div>
        )}
      </div>
    </div>
  );
}
