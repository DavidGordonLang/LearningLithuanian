export async function enrichSavedRow(lt, en, rowId, setRows) {
  try {
    // Step 1: translate to get phonetics
    const transResp = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lt, sourceLang: "lt" }),
    });

    if (transResp.ok) {
      const transData = await transResp.json();
      if (String(transData?.lt || "").trim() !== lt.trim()) return;
      const phonetic = String(transData?.phonetics || "").trim();
      const phoneticIPA = String(transData?.phonetics_ipa || "").trim();
      const enNatural = en;
      const enLiteral = en;

      setRows((prev) => Array.isArray(prev) ? prev.map((r) => {
        if ((r._id || r.id) === rowId && !r._deleted && r.Lithuanian === lt) {
          return { ...r, Phonetic: r.Phonetic || phonetic, PhoneticIPA: r.PhoneticIPA || phoneticIPA };
        }
        return r;
      }) : prev);

      // Step 2: enrich for Notes/Usage/Category
      try {
        const enrichResp = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lt,
            en_natural: enNatural || en,
            en_literal: enLiteral || en,
            phonetics: phonetic,
          }),
        });

        if (enrichResp.ok) {
          const enrichData = await enrichResp.json();
          const category = String(enrichData?.Category || "General").trim();
          const usage = String(enrichData?.Usage || "").trim();
          const notes = String(enrichData?.Notes || "").trim();

          setRows((prev) => Array.isArray(prev) ? prev.map((r) => {
            if ((r._id || r.id) === rowId && !r._deleted && r.Lithuanian === lt) {
              return { ...r, Category: r.Category && r.Category !== "General" ? r.Category : category, Usage: r.Usage || usage, Notes: r.Notes || notes };
            }
            return r;
          }) : prev);
        }
      } catch {}
    }
  } catch {}
}

