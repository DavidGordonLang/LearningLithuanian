import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { hasRecoverableLibrary, recoverLegacyLibrary } from "../stores/legacyLibrary";

export default function LegacyLibraryRecovery({ confirmAction, showToast }) {
  const user = useAuthStore((s) => s.user);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  if (completed || !hasRecoverableLibrary(user?.id)) return null;

  async function recover() {
    const userId = user.id;
    const ok = await confirmAction({
      title: "Recover your previous library?",
      body: `Only continue if the library previously used on this device is yours. It will be added to ${user.email || "your current account"}, together with its scenario collections. Existing entries and the original recovery copy will be kept.`,
      confirmLabel: "This is my library — recover",
      cancelLabel: "Not now",
    });
    if (!ok) return;
    try {
      recoverLegacyLibrary(userId);
      setCompleted(true);
      showToast?.("Your previous library and scenarios have been recovered.");
    } catch (err) { setError(err?.message || "Recovery failed. Your original data has been kept."); }
  }

  return (
    <div className="z-inset p-4 space-y-2">
      <div className="font-semibold">Your previous library</div>
      <p className="text-sm text-zinc-400">This device has data from an earlier version. Confirm that it belongs to you before adding it to this account.</p>
      {error ? <p role="alert" className="text-sm text-rose-400">{error}</p> : null}
      <button type="button" className="z-btn z-btn-secondary px-4 py-2 rounded-xl" onClick={recover}>Recover previous library</button>
    </div>
  );
}
