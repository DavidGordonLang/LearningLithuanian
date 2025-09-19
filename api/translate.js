// api/translate.js
// Vercel Serverless Function (CommonJS). Returns a stubbed payload the UI can consume.
// Replace this with your real OpenAI call later, but keep the same response shape.

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = (() => {
      try { return typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
      catch { return {}; }
    })();

    const english = (body?.english || "").toString().trim();
    if (!english) {
      return res.status(400).json({ error: "Missing 'english' in body" });
    }

    // ---- TEMP: deterministic stub so UI always populates ----
    const fakeLt =
      english.toLowerCase() === "hello" ? "Labas" :
      english.toLowerCase() === "good morning" ? "Labas rytas" :
      `[[LT for]] ${english}`;
    const fakePh = "la-bahs";
    const fakeUsage = "Stub response from /api/translate (wiring check).";
    const fakeNotes =
      "This payload matches { lt, ph, usage, notes }. Replace with real model later.";

    return res.status(200).json({
      lt: fakeLt,
      ph: fakePh,
      usage: fakeUsage,
      notes: fakeNotes,
    });
  } catch (err) {
    console.error("translate error:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
};
