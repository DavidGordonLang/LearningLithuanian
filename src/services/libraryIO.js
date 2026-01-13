// src/services/libraryIO.js

/**
 * Library IO + Starter pack merge helpers
 * Kept deliberately dependency-injected so App.jsx stays in control.
 * No side effects beyond the explicit calls passed in.
 */

export async function mergeRows(newRows, { setRows, normalizeRag, genId, nowTs }) {
  const cleaned = newRows
    .map((r) => ({
      English: r.English?.trim() || "",
      Lithuanian: r.Lithuanian?.trim() || "",
      Phonetic: r.Phonetic?.trim() || "",
      Category: r.Category?.trim() || "",
      Usage: r.Usage?.trim() || "",
      Notes: r.Notes?.trim() || "",
      "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
        ? r.Sheet
        : "Phrases",
      _id: r._id || genId(),
      _ts: r._ts || nowTs(),
      _qstat:
        r._qstat || {
          red: { ok: 0, bad: 0 },
          amb: { ok: 0, bad: 0 },
          grn: { ok: 0, bad: 0 },
        },
    }))
    .filter((r) => r.English || r.Lithuanian);

  setRows((prev) => [...cleaned, ...prev]);
}

export async function mergeStarterRows(newRows, {
  setRows,
  normalizeRag,
  makeLtKey,
  genId,
  nowTs,
}) {
  const cleaned = newRows
    .map((r) => {
      const base = {
        English: r.English?.trim() || "",
        Lithuanian: r.Lithuanian?.trim() || "",
        Phonetic: r.Phonetic?.trim() || "",
        Category: r.Category?.trim() || "",
        Usage: r.Usage?.trim() || "",
        Notes: r.Notes?.trim() || "",
        "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
          ? r.Sheet
          : "Phrases",
        _id: r._id || genId(),
        _ts: r._ts || nowTs(),
        _qstat:
          r._qstat || {
            red: { ok: 0, bad: 0 },
            amb: { ok: 0, bad: 0 },
            grn: { ok: 0, bad: 0 },
          },
        Source: "starter",
        Touched: false,
      };

      const ck = makeLtKey(base);
      return { ...base, contentKey: ck };
    })
    .filter((r) => r.English || r.Lithuanian);

  setRows((prev) => {
    const existingKeys = new Set(
      prev
        .map((p) => p?.contentKey)
        .filter((k) => typeof k === "string" && k.length > 0)
    );

    const merged = [...prev];

    for (const row of cleaned) {
      const key = row?.contentKey;
      if (!key) {
        const existsById = prev.some((p) => p?._id === row._id);
        if (!existsById) merged.push(row);
        continue;
      }
      if (!existingKeys.has(key)) {
        merged.push(row);
        existingKeys.add(key);
      }
    }

    return merged;
  });
}

export async function fetchStarter(kind, {
  STARTERS,
  mergeStarterRowsImpl,
}) {
  const url = STARTERS?.[kind];
  if (!url) return alert("Starter not found");

  const res = await fetch(url);
  if (!res.ok) return alert("Failed to fetch starter");

  const data = await res.json();
  await mergeStarterRowsImpl(data);

  alert("Starter pack installed.");
}

export function clearLibrary({ T, setRows }) {
  if (confirm(T.confirm)) setRows([]);
}

export async function importJsonFile(file, { mergeRowsImpl }) {
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error();
    await mergeRowsImpl(data);
    alert("Imported.");
  } catch {
    alert("Import failed.");
  }
}
