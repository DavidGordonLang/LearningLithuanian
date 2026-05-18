import React, { useEffect, useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import { COUNTRY_OPTIONS_EN } from "../constants/countries";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export default function OnboardingProfileModal({
  open,
  required = false,
  initialValues = {},
  onSave,
  onClose,
}) {
  const [speakerGender, setSpeakerGender] = useState("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fromCountryCode, setFromCountryCode] = useState("");
  const [livesInCountryCode, setLivesInCountryCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSpeakerGender(initialValues?.speakerGender === "female" ? "female" : "male");
    setDateOfBirth(initialValues?.dateOfBirth || "");
    setFromCountryCode(initialValues?.fromCountryCode || "");
    setLivesInCountryCode(initialValues?.livesInCountryCode || "");
    setSaving(false);
    setError("");
  }, [open, initialValues]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const isValid =
    (speakerGender === "male" || speakerGender === "female") &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) &&
    dateOfBirth <= today &&
    !!fromCountryCode &&
    !!livesInCountryCode;

  async function handleSubmit() {
    if (saving) return;
    if (!isValid) {
      setError("Please complete all profile fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave?.({
        speakerGender,
        dateOfBirth,
        fromCountryCode,
        livesInCountryCode,
      });
    } catch (e) {
      setError(e?.message || "Could not save profile setup.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      open={open}
      title="Set up your profile"
      subtitle="This helps Žodis adapt Lithuanian to you."
      onClose={required ? undefined : onClose}
      closeOnBackdrop={!required}
      closeOnEscape={!required}
      maxWidth="max-w-lg"
      zIndex="z-[220]"
      panelClassName="flex flex-col"
      panelStyle={{ maxHeight: "calc(100dvh - 32px)" }}
      headerAction={
        required ? null : (
          <button
            type="button"
            className="z-btn z-btn-secondary px-4 py-2 text-[13px]"
            onClick={onClose}
            data-press
          >
            Close
          </button>
        )
      }
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="z-inset px-4 py-3 text-sm leading-relaxed text-zinc-300">
          Žodis uses this data only inside Žodis to tailor Lithuanian translations,
          examples, forms of address, country phrases, and age-relevant lesson
          content. You can edit it later in Settings. It is not used for ads or
          unrelated profiling.
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-200">Speaker gender</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["male", "Male"],
                ["female", "Female"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  data-press
                  className={cn(
                    "z-btn px-4 py-2.5 rounded-2xl text-sm font-semibold justify-center",
                    speakerGender === value
                      ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
                      : "z-btn-secondary text-zinc-100"
                  )}
                  onClick={() => setSpeakerGender(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-xs text-zinc-500">
              Lithuanian endings can change depending on the speaker.
            </div>
          </div>

          <label className="block space-y-2">
            <span className="block text-sm font-medium text-zinc-200">Date of birth</span>
            <input
              type="date"
              value={dateOfBirth}
              max={today}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="z-input !py-2.5 !px-3 !rounded-2xl w-full"
            />
            <span className="block text-xs text-zinc-500">
              This lets age-related lessons update automatically.
            </span>
          </label>

          <label className="block space-y-2">
            <span className="block text-sm font-medium text-zinc-200">Country you are from</span>
            <select
              className="z-input !py-2.5 !px-3 !rounded-2xl w-full"
              value={fromCountryCode}
              onChange={(e) => setFromCountryCode(e.target.value)}
            >
              <option value="">Select country</option>
              {COUNTRY_OPTIONS_EN.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="block text-sm font-medium text-zinc-200">Country you live in</span>
            <select
              className="z-input !py-2.5 !px-3 !rounded-2xl w-full"
              value={livesInCountryCode}
              onChange={(e) => setLivesInCountryCode(e.target.value)}
            >
              <option value="">Select country</option>
              {COUNTRY_OPTIONS_EN.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-3 pt-1">
          {!required ? (
            <button
              type="button"
              data-press
              className="z-btn z-btn-secondary px-5 py-2.5 rounded-2xl text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            data-press
            disabled={saving || !isValid}
            className={cn(
              "z-btn px-5 py-2.5 rounded-2xl text-sm font-semibold bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black",
              saving || !isValid ? "z-disabled" : ""
            )}
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
