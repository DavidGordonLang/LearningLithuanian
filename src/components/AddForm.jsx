// src/components/AddForm.jsx
import React, { useState, useRef } from "react";

export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
}) {
  const [draft, setDraft] = useState({
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: tab || "Phrases",
  });
  const [busy, setBusy] = useState(false);
  const enRef = useRef(null);
  const ltRef = useRef(null);

  // keep Sheet in sync with current tab
  React.useEffect(() => {
    setDraft((d) => ({ ...d, Sheet: tab || "Phrases" }));
  }, [tab]);

  function update(k, v) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  async function doTranslate(dir /* "en>lt" | "lt>en" | "auto" */) {
    try {
      let from = "auto";
      let to = "lt";
      let text = "";

      const en = draft.English.trim();
      const lt = draft.Lithuanian.trim();

      if (dir === "en>lt" || (dir === "auto" && en && !lt)) {
        from = "en";
        to = "lt";
        text = en;
      } else if (dir === "lt>en" || (dir === "auto" && lt && !en)) {
        from = "lt";
        to = "en";
        text = lt;
      } else if (dir === "auto" && en && lt) {
        // if both present, prefer translating from the one you just edited (fallback: EN→LT)
        const last = document.activeElement === ltRef.current ? "lt>en" : "en>lt";
        return doTranslate(last);
      } else {
        alert("Type something in English or Lithuanian first.");
        return;
      }

      setBusy(true);
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      const j = await r.json();

      if (!r.ok) {
        throw new Error(j?.error || "Translate failed");
      }

      // Apply results; when using translate, default RAG to 🔴
      if (to === "lt") {
        setDraft((d) => ({
          ...d,
          Lithuanian: j.translation || d.Lithuanian,
          Phonetic: j.phonetic || d.Phonetic,
          Usage: cap(j.usage || d.Usage || ""),
          Notes: j.notes || d.Notes || "",
          "RAG Icon": "🔴",
        }));
        // keep caret where the user was typing
        ltRef.current?.focus({ preventScroll: true });
      } else {
        setDraft((d) => ({
          ...d,
          English: j.translation || d.English,
          Usage: cap(j.usage || d.Usage || ""),
          Notes: j.notes || d.Notes || "",
          // phonetic for EN targets is rarely useful; leave as-is
          "RAG Icon": "🔴",
        }));
        enRef.current?.focus({ preventScroll: true });
      }
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  function save() {
    const E = String(draft.English || "").trim();
    const L = String(draft.Lithuanian || "").trim();
    if (!E && !L) return alert("Add at least English or Lithuanian.");
    const row = {
      ...draft,
      English: E,
      Lithuanian: L,
      Phonetic: String(draft.Phonetic || "").trim(),
      Category: String(draft.Category || "").trim(),
      Usage: String(draft.Usage || "").trim(),
      Notes: String(draft.Notes || "").trim(),
      "RAG Icon": normalizeRag(draft["RAG Icon"] || "🟠"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(draft.Sheet)
        ? draft.Sheet
        : "Phrases",
      _id: genId(),
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };
    setRows((prev) => [row, ...prev]);
    // reset but keep Sheet and RAG default amber for manual entries
    setDraft({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: tab || "Phrases",
    });
    enRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="mt-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="text-xs mb-1">{T.english}</div>
          <textarea
            ref={enRef}
            value={draft.English}
            onChange={(e) => update("English", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[60px]"
            placeholder="Type English…"
          />
        </div>
        <div>
          <div className="text-xs mb-1">{T.lithuanian}</div>
          <textarea
            ref={ltRef}
            value={draft.Lithuanian}
            onChange={(e) => update("Lithuanian", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[60px]"
            placeholder="Įrašyk lietuviškai…"
          />
        </div>
      </div>

      {/* Translate controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={busy}
          onClick={() => doTranslate("auto")}
          className="px-3 py-1.5 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          title="Translate from the side you filled"
        >
          {busy ? "Translating…" : "Translate (Auto)"}
        </button>
        <button
          disabled={busy}
          onClick={() => doTranslate("en>lt")}
          className="px-2 py-1 rounded-md text-xs bg-zinc-800 disabled:opacity-50"
          title="English → Lithuanian"
        >
          EN→LT
        </button>
        <button
          disabled={busy}
          onClick={() => doTranslate("lt>en")}
          className="px-2 py-1 rounded-md text-xs bg-zinc-800 disabled:opacity-50"
          title="Lithuanian → English"
        >
          LT→EN
        </button>
        <div className="text-xs text-zinc-400">
          When Translate is used, RAG defaults to 🔴.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="text-xs mb-1">{T.phonetic}</div>
          <input
            value={draft.Phonetic}
            onChange={(e) => update("Phonetic", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            placeholder="ar ga-li-me gau-ti…"
          />
        </div>
        <div>
          <div className="text-xs mb-1">{T.category}</div>
          <input
            value={draft.Category}
            onChange={(e) => update("Category", e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            placeholder="e.g. Dining"
          />
        </div>
      </div>

      <div>
        <div className="text-xs mb-1">{T.usage}</div>
        <input
          value={draft.Usage}
          onChange={(e) => update("Usage", e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="e.g. Eating out"
        />
      </div>

      <div>
        <div className="text-xs mb-1">{T.notes}</div>
        <textarea
          value={draft.Notes}
          onChange={(e) => update("Notes", e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[60px]"
          placeholder="Alt phrasing, register, etc."
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs">{T.ragLabel}:</div>
        {["🔴", "🟠", "🟢"].map((r) => (
          <button
            key={r}
            onClick={() => update("RAG Icon", r)}
            className={`px-2 py-1 rounded-md text-sm border ${
              draft["RAG Icon"] === r
                ? "bg-emerald-600 border-emerald-600"
                : "bg-zinc-900 border-zinc-700"
            }`}
          >
            {r}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={save}
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold"
          >
            {T.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function cap(s = "") {
  if (!s) return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
