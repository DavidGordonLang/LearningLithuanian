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
      className="sticky z-40 border-b border-zinc-800 bg-zinc-950"
      style={{ top: offsetTop }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-2">
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
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-xs sm:text-sm select-none",
                      active
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    )}
                    onClick={() => setSortMode(mode)}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
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
