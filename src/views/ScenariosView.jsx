// src/views/ScenariosView.jsx
import React, { useMemo, useState } from "react";
import { useScenarioStore } from "../stores/scenarioStore";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function ScenarioCard({ scenario, onOpen, onMenu }) {
  return (
    <button
      type="button"
      data-press
      onClick={() => onOpen?.(scenario)}
      className={cn(
        "z-card",
        "w-full text-left",
        "p-4 sm:p-5",
        "min-h-[124px]",
        "flex items-start justify-between gap-3",
        "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]",
        "hover:bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.14),rgba(255,255,255,0.03)_38%,rgba(255,255,255,0.01)_100%)]",
        "transition-colors"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[18px] sm:text-[19px] font-semibold tracking-tight text-zinc-100 break-words">
          {scenario?.title || "Untitled scenario"}
        </div>

        <div className="mt-2 text-sm text-zinc-400">
          Curated phrases for one real-life situation.
        </div>
      </div>

      <div
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          data-press
          aria-label="Scenario actions"
          className="
            inline-flex items-center justify-center
            w-10 h-10 rounded-full
            border border-white/10 bg-white/[0.04]
            text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06]
          "
          onClick={() => onMenu?.(scenario)}
        >
          ⋯
        </button>
      </div>
    </button>
  );
}

function CreateScenarioModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full h-full px-3 pb-4 flex justify-center items-center">
        <div
          className="w-full max-w-md z-card shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 pb-3 border-b border-white/10">
            <h3 className="z-title">Create Scenario</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Give this scenario a short, clear title.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Scenario title</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. At a café"
                className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                data-press
                className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
                onClick={() => {
                  setTitle("");
                  onClose?.();
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                data-press
                className="
                  z-btn px-5 py-2.5 rounded-2xl text-sm font-semibold
                  bg-emerald-600/90 hover:bg-emerald-500
                  border border-emerald-300/20
                  text-black
                "
                onClick={() => {
                  const ok = onCreate?.(title);
                  if (ok) {
                    setTitle("");
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScenariosView({ T, onCreateScenario }) {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const createScenario = useScenarioStore((s) => s.createScenario);

  const [createOpen, setCreateOpen] = useState(false);

  const hasScenarios = (scenarios?.length || 0) > 0;

  const cards = useMemo(() => {
    return Array.isArray(scenarios) ? scenarios : [];
  }, [scenarios]);

  function handleCreate(title) {
    const result = createScenario(title);

    if (!result?.ok) {
      alert(result?.error || "Could not create scenario.");
      return false;
    }

    setCreateOpen(false);
    return true;
  }

  function handleOpenScenario(scenario) {
    alert(`Scenario detail coming next:\n\n${scenario?.title || "Scenario"}`);
  }

  function handleScenarioMenu(scenario) {
    alert(`Scenario actions coming next:\n\n${scenario?.title || "Scenario"}`);
  }

  return (
    <>
      <div className="z-page z-page-y pb-28 space-y-4">
        <div className="space-y-1">
          <h2 className="z-title">Scenarios</h2>
          <p className="z-subtitle">
            Organise phrases by real-life situation.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            data-press
            className="
              z-btn px-4 py-2.5 rounded-2xl text-sm font-semibold
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black
            "
            onClick={() => {
              if (typeof onCreateScenario === "function") {
                // old prop is now ignored by design, but kept harmlessly compatible
              }
              setCreateOpen(true);
            }}
          >
            Create Scenario
          </button>
        </div>

        {!hasScenarios ? (
          <section
            className={cn(
              "z-card",
              "p-5 sm:p-6",
              "min-h-[220px]",
              "flex flex-col items-center justify-center text-center",
              "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]"
            )}
          >
            <div className="max-w-sm space-y-3">
              <div className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-zinc-100">
                No scenarios yet
              </div>

              <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-400">
                Create scenario cards for things like cafés, travel, small talk, or exam topics.
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
                  onClick={() => setCreateOpen(true)}
                >
                  Create your first scenario
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onOpen={handleOpenScenario}
                onMenu={handleScenarioMenu}
              />
            ))}
          </div>
        )}
      </div>

      <CreateScenarioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}