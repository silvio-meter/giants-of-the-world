"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient, isBrowserSupabaseReady } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/pricing";
  const errParam = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errParam ? "Authentication failed. Please try again." : ""
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isBrowserSupabaseReady()) {
      setError("Auth is not configured. Add Supabase keys to .env.local.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(signError.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          The codex gate
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Access your plan and unlock the sealed pages.
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
        <GoogleSignInButton next={next} label="Continue with Google" />

        <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-text-muted uppercase">
          <span className="h-px flex-1 bg-border" />
          or email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        No account yet?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-accent-gold hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-text-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
