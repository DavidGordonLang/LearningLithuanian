import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const BATCH_SIZE = 10; // safe starting point

async function generateIPA(lithuanian) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY the Lithuanian IPA transcription. No explanation.",
        },
        {
          role: "user",
          content: lithuanian,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  const json = await res.json();
  const ipa = json.choices?.[0]?.message?.content?.trim();

  if (!ipa) throw new Error("Empty IPA response");

  return ipa;
}

export default async function handler(req, res) {
  try {
    // 1️⃣ Fetch pending jobs
    const { data: jobs, error: fetchError } = await supabase
      .from("phonetic_ipa_backfill_jobs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    if (!jobs || jobs.length === 0) {
      return res.json({ message: "No pending jobs." });
    }

    const results = [];

    for (const job of jobs) {
      try {
        // mark processing attempt
        await supabase
          .from("phonetic_ipa_backfill_jobs")
          .update({
            attempts: job.attempts + 1,
          })
          .eq("id", job.id);

        const ipa = await generateIPA(job.lithuanian);

        // 2️⃣ Update phrase JSONB safely
        const { error: updateError } = await supabase.rpc(
          "update_phrase_phonetic_ipa",
          {
            phrase_id_input: job.phrase_id,
            ipa_input: ipa,
          }
        );

        if (updateError) throw updateError;

        // 3️⃣ Mark job done
        await supabase
          .from("phonetic_ipa_backfill_jobs")
          .update({ status: "done" })
          .eq("id", job.id);

        results.push({ phrase_id: job.phrase_id, status: "done" });
      } catch (err) {
        await supabase
          .from("phonetic_ipa_backfill_jobs")
          .update({
            status: "error",
            last_error: err.message,
          })
          .eq("id", job.id);

        results.push({
          phrase_id: job.phrase_id,
          status: "error",
          error: err.message,
        });
      }
    }

    res.json({
      processed: jobs.length,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}