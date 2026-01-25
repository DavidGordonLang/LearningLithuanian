import React from "react";

export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placeholder,
  T,
  offsetTop = 0,
  page,
}) {
  const mode = sortMode === "Oldest" ? "Oldest" : "Newest";
  const toggle = () => {
    const next = mode === "Newest" ? "Oldest" : "Newest";
    setSortMode?.(next);
  };

  return (
    <div
      className="sticky z-40"
      style={{ top: Math.max(0, offsetTop) }}
      data-page={page}
    >
      <div className="z-page">
        <div className="py-2 backdrop-blur">
          <div className="space-y-2">
            {SearchBox ? <SearchBox placeholder={placeholder} /> : null}

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-zinc-400">{T.sort}</span>

              <button
                type="button"
                data-press
                onClick={toggle}
                className={
                  "z-btn " +
                  "px-3 py-1.5 " + // shorter
                  "rounded-full " +
                  "text-xs sm:text-sm " +
                  "bg-emerald-600/30 text-emerald-200 " +
                  "border border-emerald-500/20 " +
                  "hover:bg-emerald-600/40"
                }
                aria-label="Toggle sort order"
              >
                {mode === "Oldest" ? T.oldest : T.newest}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />
    </div>
  );
}
