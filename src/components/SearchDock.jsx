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
  setPage,
}) {
  const isLibrary = page === "library";

  const tabs = [
    { id: "home", label: T.navHome },
    { id: "library", label: T.navLibrary },
    { id: "settings", label: T.navSettings },
  ];

  return (
    <div
      className="sticky z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur"
      style={{ top: offsetTop }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-2">
        {/* Top row: nav pills */}
        <div className="flex justify-center sm:justify-start">
          <nav className="inline-flex rounded-full bg-zinc-900 p-1 text-xs sm:text-sm">
            {tabs.map((tab) => {
              const active = page === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-full font-medium transition",
                    active
                      ? "bg-emerald-500 text-zinc-950 shadow"
                      : "text-zinc-300 hover:bg-zinc-800"
                  )}
                  onClick={() => setPage(tab.id)}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Library-only: search + sort */}
        {isLibrary && (
          <div className="space-y-2 pb-1">
            {/* Search gets whole row */}
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
                      "px-2.5 py-1 rounded-full border text-xs sm:text-sm",
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
