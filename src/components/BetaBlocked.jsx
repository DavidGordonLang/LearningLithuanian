// src/components/BetaBlocked.jsx
import React from "react";
import { supabase } from "../supabaseClient";

export default function BetaBlocked({ email }) {
  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("signOut failed", e);
    } finally {
      // Ensure UI clears even if mobile PWA signOut is flaky
      window.location.reload();
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
        <h1 className="text-xl font-bold mb-2">Invite required</h1>

        <p className="text-sm text-zinc-300 mb-3">
          You’re signed in as{" "}
          <span className="font-semibold break-all">{email}</span>, but this
          account isn’t on the beta allowlist.
        </p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 mb-4">
          If you were invited, you may have signed in with a different email
          than the one you submitted on the beta form.
        </div>

        <button
          type="button"
          className="w-full bg-zinc-800 text-zinc-100 rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-700 active:bg-zinc-600 select-none"
          onClick={signOut}
        >
          Sign out and try a different account
        </button>
      </div>
    </div>
  );
}
