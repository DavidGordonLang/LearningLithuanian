// src/components/SearchDock.jsx
import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placeholder,
  T,
  offsetTop = 56,
  page,
}) {
  const isLibrary = page === "library";

  return (
    <div
      className="
        sticky z-40
        border-b border-white/8
        bg-zinc-950/92 backdrop-blur
      "
      style={{ top: offsetTop }}
    >
      <div className="z-page py-2">
        {isLibrary && (
          <div className="space-y-2 pb-1">
            {/* Search */}
            <div className="flex">
              <SearchBox placeholder={placeholder} />
            </div>

            {/* Sort controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-zinc-400">{T.sort}</span>

              {["RAG", "Newest", "Oldest"].map((mode) => {
                const active = sortMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    data-press
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-xs sm:text-sm select-none",
                      "transition-colors",
                      active
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/8"
                    )}
                    onClick={() => setSortMode(mode)}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    aria-pressed={active}
                  >
                    {mode === "RAG"
                      ? T.rag
                      : mode === "Newest"
                      ? T.newest
                      : T.oldest}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}