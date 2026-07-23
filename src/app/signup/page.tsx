"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient, isBrowserSupabaseReady } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/pricing";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!isBrowserSupabaseReady()) {
      setError("Auth is not configured. Add Supabase keys to .env.local.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (signError) {
        setError(signError.message);
        setLoading(false);
        return;
      }
      // If email confirmation is disabled, session exists immediately
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setMessage(
        "Check your email to confirm your account, then sign in."
      );
      setLoading(false);
    } catch {
      setError("Could not create account.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Join the codex
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
          Create account
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Free to browse. Unlock full accounts when you are ready.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-border bg-surface p-6"
      >
        <label className="block text-xs text-text-muted">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          />
        </label>
        <label className="block text-xs text-text-muted">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          />
        </label>

        {error && (
          <p className="text-sm text-rose-300/90" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-accent-gold" role="status">
            {message}
          </p>
        )}

        <p className="text-[11px] leading-relaxed text-text-muted/80">
          By creating an account you agree to the{" "}
          <Link href="/terms" className="text-accent-gold hover:underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent-gold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-accent-gold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-text-muted">
          Loading…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
