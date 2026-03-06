// src/views/ScenariosView.jsx
import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function ScenariosView({ T, onCreateScenario }) {
  return (
    <div className="z-page z-page-y pb-28 space-y-4">
      <div className="space-y-1">
        <h2 className="z-title">Scenarios</h2>
        <p className="z-subtitle">
          Organise phrases by real-life situation.
        </p>
      </div>

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
              onClick={onCreateScenario}
            >
              Create your first scenario
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}