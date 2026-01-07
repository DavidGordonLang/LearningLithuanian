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
        <h1 className="text-xl font-bold mb-2">Early access required</h1>

        <p className="text-sm text-zinc-300 mb-3">
          You’re signed in as{" "}
          <span className="font-semibold break-all">{email}</span>, but this
          email isn’t currently on the Žodis beta list.
        </p>

        <p className="text-sm text-zinc-300 mb-3">
          If you requested beta access, make sure you’ve signed in with the same
          email address you used on the signup form.
        </p>

        <p className="text-sm text-zinc-300 mb-4">
          Žodis is still in closed beta and access is being rolled out gradually
          to keep things stable.
        </p>

        <a
          href="https://zodis.app"
          target="_blank"
          rel="noopener noreferrer"
          className="
            block w-full text-center
            bg-emerald-500 text-black rounded-full
            px-4 py-2 text-sm font-semibold
            hover:bg-emerald-400 active:bg-emerald-300
            select-none mb-3
          "
        >
          Request beta access
        </a>

        <button
          type="button"
          className="
            w-full bg-zinc-800 text-zinc-100 rounded-full
            px-4 py-2 text-sm font-semibold
            hover:bg-zinc-700 active:bg-zinc-600
            select-none
          "
          onClick={signOut}
        >
          Sign out and try a different email
        </button>
      </div>
    </div>
  );
}
