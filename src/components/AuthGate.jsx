// src/components/AuthGate.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthGate() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      console.error("Google sign-in failed:", error);
      alert(error.message);
    }
  }

  async function signInWithEmailOtp(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) throw error;

      alert("Check your email for the sign-in link.");
      setEmail("");
    } catch (err) {
      console.error("Email OTP sign-in failed:", err);
      alert(err.message || "Email sign-in failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
        <h1 className="text-xl font-bold mb-2">Žodis Beta</h1>
        <p className="text-sm text-zinc-300 mb-4">
          This beta is invite-only. Please sign in to continue.
        </p>

        <button
          type="button"
          className="w-full bg-emerald-500 text-black rounded-full px-4 py-2 text-sm font-semibold hover:bg-emerald-400 active:bg-emerald-300 select-none"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-zinc-800 flex-1" />
          <div className="text-xs text-zinc-500">or</div>
          <div className="h-px bg-zinc-800 flex-1" />
        </div>

        <form onSubmit={signInWithEmailOtp} className="space-y-3">
          <label className="block">
            <div className="text-xs text-zinc-400 mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-zinc-800 text-zinc-100 rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-700 active:bg-zinc-600 disabled:opacity-60 select-none"
          >
            {sending ? "Sending link…" : "Send me a sign-in link"}
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-4">
          If you’re invited but can’t get in, double-check you’re using the same
          email address you were invited with.
        </p>
      </div>
    </div>
  );
}
