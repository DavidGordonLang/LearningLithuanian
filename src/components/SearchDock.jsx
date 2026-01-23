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
  return (
    <div
      className="sticky z-40"
      style={{ top: Math.max(0, offsetTop) }}
      data-page={page}
    >
      <div className="z-page">
        <div className="z-surface p-3 sm:p-4 backdrop-blur">
          <div className="space-y-3">
            {SearchBox ? <SearchBox placeholder={placeholder} /> : null}

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-zinc-400">{T.sort}</span>

              {["Oldest", "Newest"].map((mode) => {
                const active = sortMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    data-press
                    onClick={() => setSortMode?.(mode)}
                    className={
                      "z-btn px-3 py-2 rounded-2xl text-xs sm:text-sm " +
                      (active
                        ? "bg-emerald-600/40 text-emerald-200 border border-emerald-500/25"
                        : "z-btn-secondary text-zinc-100")
                    }
                  >
                    {mode === "Oldest" ? T.oldest : T.newest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />
    </div>
  );
}