import React, { useRef } from "react";
import { usePhraseStore } from "../stores/phraseStore";

export default function LibraryView({
  T,
  rows,
  setRows,
  fetchStarter,
  installNumbersOnly,
  importJsonFile,
  clearLibrary,
  dupeResults,
  scanDupes,
  normalizeRag,
  removePhrase,
}) {
  const fileRef = useRef(null);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
      <div style={{ height: 56 + 112 }} />

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => fetchStarter("EN2LT")}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        >
          {T.installEN}
        </button>
        <button
          onClick={() => fetchStarter("LT2EN")}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        >
          {T.installLT}
        </button>
        <button
          onClick={installNumbersOnly}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        >
          {T.installNums}
        </button>
      </div>

      <div className="mt-3 col-span-1 sm:col-span-3 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJsonFile(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        >
          {T.importJSON}
        </button>
        <button
          onClick={() => {
            try {
              const blob = new Blob([JSON.stringify(rows, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "lithuanian_trainer_export.json";
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              alert("Export failed: " + e.message);
            }
          }}
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        >
          Export JSON
        </button>
        <button
          onClick={clearLibrary}
          className="bg-zinc-900 border border-red-600 text-red-400 rounded-md px-3 py-2"
        >
          {T.clearAll}
        </button>
      </div>
{/* Phrase list */}
<div className="mt-6">
  <h2 className="text-xl font-semibold mb-3">{T.libraryTitle}</h2>

  {rows.length === 0 ? (
    <div className="text-zinc-400 text-sm">
      Your library is empty. Install a starter pack or import JSON.
    </div>
  ) : (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-zinc-100">
                {r.English} — {r.Lithuanian}
              </div>

              <div className="text-xs text-zinc-400 mt-1">
                Sheet: {r.Sheet}
              </div>

              {r.Usage && (
                <div className="text-xs text-zinc-400 mt-1">
                  <span className="text-zinc-500">{T.usage}: </span>
                  {r.Usage}
                </div>
              )}

              {r.Notes && (
                <div className="text-xs text-zinc-400 mt-1">
                  <span className="text-zinc-500">{T.notes}: </span>
                  {r.Notes}
                </div>
              )}
            </div>

            <button
              onClick={() => removePhrase(r._id)}
              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
            >
              {T.delete}
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Duplicates UI */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">{T.dupFinder}</div>
          <button
            onClick={scanDupes}
            className="bg-zinc-800 px-3 py-2 rounded-md"
          >
            {T.scan}
          </button>
        </div>

        <div className="text-sm text-zinc-400 mb-2">
          {T.exactGroups}: {dupeResults.exact.length} group(s)
        </div>
        <div className="space-y-3 mb-6">
          {dupeResults.exact.map((group, gi) => (
            <div
              key={gi}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.map((ridx) => {
                  const row = rows[ridx];
                  if (!row) return null;
                  return (
                    <div
                      key={ridx}
                      className="border border-zinc-800 rounded-md p-2"
                    >
                      <div className="font-medium">
                        {row.English} — {row.Lithuanian}{" "}
                        <span className="text-xs text-zinc-400">
                          [{row.Sheet}]
                        </span>
                      </div>

                      {(row.Usage || row.Notes) && (
                        <div className="mt-1 text-xs text-zinc-400 space-y-1">
                          {row.Usage && (
                            <div>
                              <span className="text-zinc-500">{T.usage}: </span>
                              {row.Usage}
                            </div>
                          )}
                          {row.Notes && (
                            <div>
                              <span className="text-zinc-500">{T.notes}: </span>
                              {row.Notes}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2">
                        <button
                          className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                          onClick={() => removePhrase(row._id)}
                        >
                          {T.delete}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-zinc-400 mb-2">
          {T.closeMatches}: {dupeResults.close.length} pair(s)
        </div>
        <div className="space-y-3">
          {dupeResults.close.map(([i, j, s]) => {
            const A = rows[i];
            const B = rows[j];
            if (!A || !B) return null;
            return (
              <div
                key={`${i}-${j}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
              >
                <div className="text-xs text-zinc-400 mb-2">
                  {T.similarity}: {(s * 100).toFixed(0)}%
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ row: A, idx: i }, { row: B, idx: j }].map(
                    ({ row, idx: ridx }) => (
                      <div
                        key={ridx}
                        className="border border-zinc-800 rounded-md p-2"
                      >
                        <div className="font-medium">
                          {row.English} — {row.Lithuanian}{" "}
                          <span className="text-xs text-zinc-400">
                            [{row.Sheet}]
                          </span>
                        </div>

                        {(row.Usage || row.Notes) && (
                          <div className="mt-1 text-xs text-zinc-400 space-y-1">
                            {row.Usage && (
                              <div>
                                <span className="text-zinc-500">{T.usage}: </span>
                                {row.Usage}
                              </div>
                            )}
                            {row.Notes && (
                              <div>
                                <span className="text-zinc-500">{T.notes}: </span>
                                {row.Notes}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2">
                          <button
                            className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                            onClick={() => removePhrase(row._id)}
                          >
                            {T.delete}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
