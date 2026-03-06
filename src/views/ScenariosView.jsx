// src/views/ScenariosView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
        "min-h-[148px]",
        "flex flex-col justify-center",
        "relative",
        "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]",
        "hover:bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.14),rgba(255,255,255,0.03)_38%,rgba(255,255,255,0.01)_100%)]",
        "transition-colors"
      )}
    >
      <button
        type="button"
        data-press
        aria-label="Scenario actions"
        className="
          absolute top-3 right-3
          text-zinc-400 hover:text-zinc-100
          text-[22px] leading-none
          px-2 py-1
        "
        onClick={(e) => {
          e.stopPropagation();
          onMenu?.(scenario);
        }}
      >
        ⋯
      </button>

      <div className="min-w-0 w-full flex items-center justify-center text-center">
        <div className="text-[18px] sm:text-[19px] font-semibold tracking-tight text-zinc-100 break-words">
          {scenario?.title || "Untitled scenario"}
        </div>
      </div>
    </button>
  );
}

function CreateScenarioModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) setTitle("");
  }, [open]);

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
                onClick={onClose}
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

function RenameScenarioModal({ open, scenario, onClose, onSave }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(open ? String(scenario?.title || "") : "");
  }, [open, scenario]);

  if (!open || !scenario) return null;

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
            <h3 className="z-title">Rename Scenario</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Update the title for this scenario.
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
                className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                data-press
                className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
                onClick={onClose}
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
                onClick={() => onSave?.(title)}
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

function ScenarioMenu({ scenario, anchorRef, open, onClose, onRename, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e) => {
      const anchor = anchorRef?.current;
      const menu = menuRef.current;

      if (anchor && anchor.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;

      onClose?.();
    };

    document.addEventListener("click", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);

    return () => {
      document.removeEventListener("click", onDoc, true);
      document.removeEventListener("touchstart", onDoc, true);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !scenario) return null;

  return (
    <div
      ref={menuRef}
      className="
        fixed z-[60]
        right-4 top-[220px]
        w-52 overflow-hidden rounded-2xl
        border border-white/10
        bg-zinc-950/90 backdrop-blur
        shadow-[0_16px_50px_rgba(0,0,0,0.65)]
      "
    >
      <button
        type="button"
        className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
        onClick={() => {
          onClose?.();
          onRename?.(scenario);
        }}
      >
        Rename scenario
      </button>

      <button
        type="button"
        className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10"
        onClick={() => {
          onClose?.();
          onDelete?.(scenario);
        }}
      >
        Delete scenario
      </button>
    </div>
  );
}

export default function ScenariosView({ T, onCreateScenario }) {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const createScenario = useScenarioStore((s) => s.createScenario);
  const renameScenario = useScenarioStore((s) => s.renameScenario);
  const deleteScenario = useScenarioStore((s) => s.deleteScenario);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameScenarioRow, setRenameScenarioRow] = useState(null);
  const [menuScenario, setMenuScenario] = useState(null);

  const menuAnchorRef = useRef(null);

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
    setMenuScenario(scenario);
  }

  function handleRenameOpen(scenario) {
    setRenameScenarioRow(scenario);
    setRenameOpen(true);
  }

  function handleRenameSave(title) {
    const result = renameScenario(renameScenarioRow?.id, title);

    if (!result?.ok) {
      alert(result?.error || "Could not rename scenario.");
      return;
    }

    setRenameOpen(false);
    setRenameScenarioRow(null);
  }

  function handleDeleteScenario(scenario) {
    const ok = window.confirm(
      `Delete scenario "${scenario?.title || "Untitled scenario"}"?`
    );
    if (!ok) return;

    deleteScenario(scenario?.id);
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
                // kept harmlessly compatible
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
              <div
                key={scenario.id}
                ref={menuScenario?.id === scenario.id ? menuAnchorRef : null}
              >
                <ScenarioCard
                  scenario={scenario}
                  onOpen={handleOpenScenario}
                  onMenu={handleScenarioMenu}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateScenarioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RenameScenarioModal
        open={renameOpen}
        scenario={renameScenarioRow}
        onClose={() => {
          setRenameOpen(false);
          setRenameScenarioRow(null);
        }}
        onSave={handleRenameSave}
      />

      <ScenarioMenu
        scenario={menuScenario}
        anchorRef={menuAnchorRef}
        open={!!menuScenario}
        onClose={() => setMenuScenario(null)}
        onRename={handleRenameOpen}
        onDelete={handleDeleteScenario}
      />
    </>
  );
}