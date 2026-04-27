import React, { useEffect, useMemo, useRef, useState } from "react";
import { useScenarioStore } from "../stores/scenarioStore";

const cn = (...xs) => xs.filter(Boolean).join(" ");
const MENU_WIDTH = 208;

function ScenarioCard({ scenario, onOpen, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSide, setMenuSide] = useState("right");
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onDoc = (e) => {
      const btn = menuBtnRef.current;
      const menu = menuRef.current;

      if (btn && btn.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;

      setMenuOpen(false);
    };

    document.addEventListener("click", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);

    return () => {
      document.removeEventListener("click", onDoc, true);
      document.removeEventListener("touchstart", onDoc, true);
    };
  }, [menuOpen]);

  function toggleMenu(e) {
    e.stopPropagation();

    const btn = menuBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 0;
      // If button is in the right half of the screen, anchor menu to the right
      // edge of the card (right-0) so it opens leftward into available space.
      // If in the left half, anchor to left-0 so it opens rightward.
      setMenuSide(rect.left > viewportWidth / 2 ? "right" : "left");
    }

    setMenuOpen((prev) => !prev);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-press
      onClick={() => onOpen?.(scenario)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(scenario);
        }
      }}
      className={cn(
        "z-card",
        "w-full text-left cursor-pointer",
        "p-4 sm:p-5",
        "min-h-[148px]",
        "flex flex-col justify-center",
        "relative overflow-visible",
        "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]",
        "hover:bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.14),rgba(255,255,255,0.03)_38%,rgba(255,255,255,0.01)_100%)]",
        "transition-colors",
        "focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
      )}
    >
      <div
        className="absolute top-3 right-3 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={menuBtnRef}
          type="button"
          data-press
          aria-label="Scenario actions"
          className="
            text-zinc-400 hover:text-zinc-100
            text-[22px] leading-none
            px-2 py-1
          "
          onClick={toggleMenu}
        >
          ⋯
        </button>
      </div>

      {/* Menu rendered as child of card (relative) not button wrapper, so
          absolute positioning is relative to the full card width — this lets
          right-0 / left-0 stay within the viewport on both columns. */}
      {menuOpen ? (
        <div
          ref={menuRef}
          className={cn(
            "absolute top-10 z-30",
            "w-52 max-w-[calc(100vw-16px)]",
            "overflow-hidden rounded-2xl",
            "border border-white/10",
            "bg-zinc-950/90 backdrop-blur",
            "shadow-[0_16px_50px_rgba(0,0,0,0.65)]",
            menuSide === "right" ? "right-0" : "left-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
            onClick={() => {
              setMenuOpen(false);
              onRename?.(scenario);
            }}
          >
            Rename scenario
          </button>

          <button
            type="button"
            className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10"
            onClick={() => {
              setMenuOpen(false);
              onDelete?.(scenario);
            }}
          >
            Delete scenario
          </button>
        </div>
      ) : null}

      <div className="min-w-0 w-full flex items-center justify-center text-center">
        <div className="text-[18px] sm:text-[19px] font-semibold tracking-tight text-zinc-100 break-words">
          {scenario?.title || "Untitled scenario"}
        </div>
      </div>
    </div>
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
                  if (ok) setTitle("");
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

export default function ScenariosView({ T, onOpenScenario, confirmAction }) {
  const scenarios = useScenarioStore((s) => s.scenarios);
  const createScenario = useScenarioStore((s) => s.createScenario);
  const renameScenario = useScenarioStore((s) => s.renameScenario);
  const deleteScenario = useScenarioStore((s) => s.deleteScenario);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameScenarioRow, setRenameScenarioRow] = useState(null);

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
    onOpenScenario?.(scenario?.id);
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

  async function handleDeleteScenario(scenario) {
    const title = scenario?.title || "Untitled scenario";
    const ok = await confirmAction({
      title: "Delete scenario?",
      body: `This will delete "${title}" and remove its phrase ordering. The phrases themselves will stay in your library.`,
      confirmLabel: "Delete scenario",
      cancelLabel: "Cancel",
      destructive: true,
    });
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
            onClick={() => setCreateOpen(true)}
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
                onRename={handleRenameOpen}
                onDelete={handleDeleteScenario}
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

      <RenameScenarioModal
        open={renameOpen}
        scenario={renameScenarioRow}
        onClose={() => {
          setRenameOpen(false);
          setRenameScenarioRow(null);
        }}
        onSave={handleRenameSave}
      />
    </>
  );
}
