// src/components/AddForm.jsx
import React, { useState, useEffect } from "react";

export default function AddForm({ tab, setRows, T, genId, nowTs, normalizeRag }) {
  const [draft, setDraft] = useState({
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: tab,
  });

  useEffect(() => {
    setDraft((d) => ({ ...d, Sheet: tab }));
  }, [tab]);

  function addRow() {
    if (!draft.English || !draft.Lithuanian) {
      alert(`${T.english} & ${T.lithuanian} required`);
      return;
    }
    const row = {
      ...draft,
      "RAG Icon": normalizeRag(draft["RAG Icon"]),
      _id: genId(),
      _ts: nowTs(),
    };
    setRows((prev) => [row, ...prev]);
    setDraft({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: tab,
    });
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <input
        className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.english}
        value={draft.English}
        onChange={(e) => setDraft({ ...draft, English: e.target.value })}
      />
      <input
        className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.lithuanian}
        value={draft.Lithuanian}
        onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })}
      />
      <input
        className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.phonetic}
        value={draft.Phonetic}
        onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })}
      />
      <input
        className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.category}
        value={draft.Category}
        onChange={(e) => setDraft({ ...draft, Category: e.target.value })}
      />
      <input
        className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.usage}
        value={draft.Usage}
        onChange={(e) => setDraft({ ...draft, Usage: e.target.value })}
      />
      <input
        className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        placeholder={T.notes}
        value={draft.Notes}
        onChange={(e) => setDraft({ ...draft, Notes: e.target.value })}
      />
      <select
        className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        value={draft["RAG Icon"]}
        onChange={(e) =>
          setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })
        }
      >
        {["🔴", "🟠", "🟢"].map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      <select
        className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
        value={draft.Sheet}
        onChange={(e) => setDraft({ ...draft, Sheet: e.target.value })}
      >
        {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        onClick={addRow}
        className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold"
      >
        {T.save}
      </button>
    </div>
  );
}
