import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function EmptyState({ onBack }) {
  return (
    <section
      className={cn(
        "z-card",
        "p-5 sm:p-6",
        "min-h-[240px]",
        "flex flex-col items-center justify-center text-center",
        "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]"
      )}
    >
      <div className="max-w-sm space-y-3">
        <div className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-zinc-100">
          Scenario not found
        </div>

        <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-400">
          This scenario may have been deleted or is no longer available.
        </p>

        <div className="pt-2">
          <button
            type="button"
            data-press
            className="
              z-btn px-5 py-3 rounded-2xl
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black font-semibold
            "
            onClick={onBack}
          >
            Back to scenarios
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ScenarioDetailView({
  scenario,
  rows,
  playText,
  onBack,
  showToast,
}) {
  const linkedRows = useMemo(() => {
    if (!scenario) return [];

    const phraseIds = Array.isArray(scenario.phraseIds) ? scenario.phraseIds : [];
    const allRows = Array.isArray(rows) ? rows : [];

    return phraseIds
      .map((id) => allRows.find((r) => (r?.id || r?._id) === id))
      .filter(Boolean);
  }, [scenario, rows]);

  if (!scenario) {
    return <EmptyState onBack={onBack} />;
  }

  return (
    <div className="pb-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          data-press
          className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="space-y-1">
        <h2 className="z-title">{scenario.title || "Untitled scenario"}</h2>
        <p className="z-subtitle">
          Curated phrases for one real-life situation.
        </p>
      </div>

      <section
        className={cn(
          "z-card",
          "p-5 sm:p-6",
          "space-y-4",
          "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]"
        )}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-zinc-100">Scenario phrases</div>
            <div className="text-xs text-zinc-500 mt-1">
              Reordering and add-to-scenario are next.
            </div>
          </div>

          <div className="text-sm text-zinc-400">
            {linkedRows.length} phrase{linkedRows.length === 1 ? "" : "s"}
          </div>
        </div>

        {linkedRows.length === 0 ? (
          <div className="z-inset p-5 text-center">
            <div className="text-sm font-semibold text-zinc-200">
              No phrases in this scenario yet
            </div>
            <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Next step will let you add phrases from translation and library.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedRows.map((row) => {
              const rowId = row?.id || row?._id;

              return (
                <div
                  key={rowId}
                  className="z-inset p-4 flex items-start gap-3"
                >
                  <button
                    type="button"
                    data-press
                    className="
                      w-11 h-11 rounded-full shrink-0
                      border border-emerald-300/20
                      bg-emerald-900/20 hover:bg-emerald-900/30
                      flex items-center justify-center
                      shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_0_22px_rgba(16,185,129,0.10),0_12px_30px_rgba(0,0,0,0.45)]
                    "
                    onClick={() => playText?.(row?.Lithuanian || "")}
                    aria-label="Play phrase"
                  >
                    <span className="text-emerald-200 text-base">▶</span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-emerald-200 leading-snug break-words">
                      {row?.Lithuanian || "—"}
                    </div>

                    <div className="text-sm text-zinc-300 mt-1 leading-snug break-words">
                      {row?.English || "—"}
                    </div>

                    {row?.Phonetic || row?.PhoneticIPA ? (
                      <div className="text-xs text-zinc-500 mt-1 italic leading-snug break-words">
                        {String(row?.PhoneticIPA || row?.Phonetic || "").trim()}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            data-press
            className="
              z-btn px-4 py-2 rounded-2xl text-sm font-semibold
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black
            "
            onClick={() => showToast?.("Add phrases to scenario is next")}
          >
            Add phrases
          </button>

          <button
            type="button"
            data-press
            className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
            onClick={() => showToast?.("Reordering is next")}
          >
            Reorder
          </button>
        </div>
      </section>
    </div>
  );
}