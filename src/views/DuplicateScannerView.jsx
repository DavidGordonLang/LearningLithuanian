// src/views/DuplicateScannerView.jsx
import React, { useMemo, useState } from "react";

export default function DuplicateScannerView({ T, rows, removePhrase, onBack }) {
  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  function scanDuplicates() {
    setIsScanning(true);

    const map = new Map();

    for (const r of rows) {
      const en = (r.English || "").trim().toLowerCase();
      const lt = (r.Lithuanian || "").trim().toLowerCase();
      if (!en && !lt) continue; // ignore totally blank

      const key = `${en}||${lt}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }

    const grouped = [];
    for (const [key, items] of map.entries()) {
      if (items.length > 1) {
        grouped.push({ key, items });
      }
    }

    setGroups(grouped);
    setHasScanned(true);
    setIsScanning(false);
  }

  function handleDelete(id) {
    // remove from store
    removePhrase(id);

    // remove from local snapshot WITHOUT rescanning
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items.filter((r) => r._id !== id),
        }))
        .filter((g) => g.items.length > 1)
    );
  }

  const totalGroups = groups.length;
  const totalItems = useMemo(
    () => groups.reduce((acc, g) => acc + g.items.length, 0),
    [groups]
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-4 mt-2">
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
          onClick={onBack}
        >
          ← Back to settings
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black text-sm font-semibold"
            onClick={scanDuplicates}
            disabled={isScanning}
          >
            {isScanning ? "Scanning…" : "Scan for duplicates"}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-1">Duplicate scanner</h2>
      <p className="text-sm text-zinc-400 mb-4">
        This looks for exact duplicates where both{" "}
        <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match.
      </p>

      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {totalGroups === 0 ? (
            <span>No duplicate groups found.</span>
          ) : (
            <span>
              Found{" "}
              <span className="font-semibold">{totalGroups}</span> duplicate
              group{totalGroups > 1 ? "s" : ""} containing{" "}
              <span className="font-semibold">{totalItems}</span> item
              {totalItems > 1 ? "s" : ""}.
            </span>
          )}
        </div>
      )}

      {!hasScanned && (
        <div className="mt-8 text-sm text-zinc-400">
          Tap <span className="font-semibold">“Scan for duplicates”</span> to
          see groups of duplicate entries. You can then remove unwanted copies
          one by one.
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4 mt-4">
        {groups.map((g, groupIdx) => {
          const sample = g.items[0] || {};
          return (
            <section
              key={g.key}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    Group {groupIdx + 1} • {g.items.length} items
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {sample.English || "—"}{" "}
                    <span className="text-zinc-500">/</span>{" "}
                    <span className="text-emerald-300">
                      {sample.Lithuanian || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {g.items.map((r) => (
                  <article
                    key={r._id}
                    className="flex items-start gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                  >
                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {r.English || "—"}
                      </div>
                      <div className="text-sm text-emerald-300 truncate">
                        {r.Lithuanian || "—"}
                      </div>
                      {r.Phonetic && (
                        <div className="text-[11px] text-zinc-400 italic truncate">
                          {r.Phonetic}
                        </div>
                      )}

                      <div className="mt-1 space-y-1 text-[11px] text-zinc-300">
                        {r.Usage && (
                          <div>
                            <span className="text-zinc-500">
                              {T.usage}:{" "}
                            </span>
                            {r.Usage}
                          </div>
                        )}
                        {r.Notes && (
                          <div>
                            <span className="text-zinc-500">
                              {T.notes}:{" "}
                            </span>
                            {r.Notes}
                          </div>
                        )}
                        {r.Category && (
                          <div>
                            <span className="text-zinc-500">
                              {T.category}:{" "}
                            </span>
                            {r.Category}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete control */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-lg select-none"
                        onClick={() => {
                          if (window.confirm(T.confirm)) {
                            handleDelete(r._id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
