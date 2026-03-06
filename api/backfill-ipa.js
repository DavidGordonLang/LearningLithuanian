import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const BATCH_SIZE = 10;

async function generateIPA(lithuanian) {
  const input = String(lithuanian || "").trim();
  if (!input) {
    throw new Error("Missing Lithuanian text");
  }

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
          content: "Return ONLY the Lithuanian IPA transcription. No explanation.",
        },
        {
          role: "user",
          content: input,
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
    const { data: jobs, error: fetchError } = await supabase
      .from("phonetic_ipa_backfill_jobs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    if (!jobs || jobs.length === 0) {
      return res.json({ message: "No pending jobs.", processed: 0, results: [] });
    }

    const results = [];

    for (const job of jobs) {
      try {
        await supabase
          .from("phonetic_ipa_backfill_jobs")
          .update({
            attempts: (job.attempts || 0) + 1,
          })
          .eq("id", job.id);

        const { data: phraseRow, error: phraseError } = await supabase
          .from("phrases")
          .select("id, data")
          .eq("id", job.phrase_id)
          .single();

        if (phraseError) throw phraseError;

        const lithuanian = String(phraseRow?.data?.Lithuanian || "").trim();
        if (!lithuanian) {
          throw new Error("Phrase row missing data.Lithuanian");
        }

        const ipa = await generateIPA(lithuanian);

        const { error: updateError } = await supabase.rpc(
          "update_phrase_phonetic_ipa",
          {
            phrase_id_input: job.phrase_id,
            ipa_input: ipa,
          }
        );

        if (updateError) throw updateError;

        await supabase
          .from("phonetic_ipa_backfill_jobs")
          .update({
            status: "done",
            last_error: null,
          })
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

    return res.json({
      processed: jobs.length,
      results,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}