"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlan } from "@/components/PlanProvider";

type LoadState =
  | { status: "idle" }
  | { status: "ok"; count: number }
  | { status: "error"; message: string };

type IssueMeta = {
  id: string;
  subject: string;
  preheader: string;
  entryUrl: string;
};

/**
 * Minimal One Seam admin: count, CSV, Issue 1 preview + gated full send.
 * API enforces LIFETIME_GRANT_EMAILS.
 */
export default function AdminSubscribersPage() {
  const { email, ready, userId } = usePlan();
  const [load, setLoad] = useState<LoadState>({ status: "idle" });
  const [issue, setIssue] = useState<IssueMeta | null>(null);
  const [from, setFrom] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [fullSendConfirm, setFullSendConfirm] = useState(
    "SEND ISSUE 1 TO ALL"
  );
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [busy, setBusy] = useState<"preview" | "send" | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;

    let cancelled = false;

    void Promise.all([
      fetch("/api/admin/subscribers", { cache: "no-store" }),
      fetch("/api/admin/one-seam", { cache: "no-store" }),
    ])
      .then(async ([subRes, issueRes]) => {
        if (subRes.status === 403 || issueRes.status === 403) {
          throw new Error("This page is only for admin grant accounts.");
        }
        if (!subRes.ok) throw new Error("Could not load subscribers.");
        if (!issueRes.ok) throw new Error("Could not load issues.");
        const subs = (await subRes.json()) as { count: number };
        const issues = (await issueRes.json()) as {
          from: string;
          fullSendConfirm: string;
          issues: IssueMeta[];
        };
        if (cancelled) return;
        setLoad({ status: "ok", count: subs.count });
        setFrom(issues.from);
        setFullSendConfirm(issues.fullSendConfirm);
        setIssue(issues.issues[0] ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoad({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  async function runAction(action: "preview" | "send") {
    setBusy(action);
    setActionMsg("");
    setActionErr("");
    try {
      const body: { action: string; issueId: string; confirm?: string } = {
        action,
        issueId: "01",
      };
      if (action === "send") body.confirm = confirmPhrase;

      const res = await fetch("/api/admin/one-seam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        error?: string;
        to?: string;
        sent?: number;
        failed?: number;
      };
      if (!res.ok) {
        setActionErr(data.error || "Request failed.");
        return;
      }
      if (action === "preview") {
        setActionMsg(`Preview sent to ${data.to ?? email ?? "you"}.`);
      } else {
        setActionMsg(
          `Sent ${data.sent ?? 0} · failed ${data.failed ?? 0}. Check Resend if any failed.`
        );
      }
    } catch {
      setActionErr("Network error.");
    } finally {
      setBusy(null);
    }
  }

  const needsSignIn = ready && !userId;
  const showLoading = ready && userId && load.status === "idle";

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
        Admin
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
        One Seam
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Confirmed subscribers, Issue 1 draft, and send controls. Weekly issues
        are not auto-generated.
      </p>
      {email && (
        <p className="mt-2 text-xs text-text-muted/80">Signed in as {email}</p>
      )}
      {from && (
        <p className="mt-1 text-xs text-text-muted/80">From: {from}</p>
      )}

      {!ready && (
        <p className="mt-8 text-sm text-text-muted" role="status">
          Loading…
        </p>
      )}
      {needsSignIn && (
        <p className="mt-8 text-sm text-text-muted" role="status">
          <Link
            href="/login?next=/admin/subscribers"
            className="text-accent-gold hover:underline"
          >
            Sign in
          </Link>{" "}
          required.
        </p>
      )}
      {showLoading && (
        <p className="mt-8 text-sm text-text-muted" role="status">
          Loading…
        </p>
      )}
      {load.status === "error" && (
        <p className="mt-8 text-sm text-rose-300" role="alert">
          {load.message}
        </p>
      )}

      {load.status === "ok" && (
        <div className="mt-8 space-y-10">
          <section>
            <p className="font-[family-name:var(--font-cinzel)] text-4xl text-accent-gold">
              {load.count}
            </p>
            <p className="text-sm text-text-muted">active subscribers</p>
            <a
              href="/api/admin/subscribers?format=csv"
              className="mt-4 inline-flex rounded border border-border px-4 py-2 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold"
            >
              Export CSV
            </a>
          </section>

          {issue && (
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
                Issue 1 draft
              </h2>
              <p className="mt-3 text-sm text-text-primary">{issue.subject}</p>
              <p className="mt-1 text-xs text-text-muted">
                Preheader: {issue.preheader}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Link:{" "}
                <a
                  href={issue.entryUrl}
                  className="text-accent-gold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issue.entryUrl}
                </a>
              </p>
              <p className="mt-4 text-xs text-text-muted">
                No Lifetime pitch. One content link. Owner must approve before
                full send.
              </p>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runAction("preview")}
                className="mt-5 w-full rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
              >
                {busy === "preview"
                  ? "Sending preview…"
                  : "Send preview to me"}
              </button>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs tracking-wide text-text-muted uppercase">
                  Full send (all confirmed)
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  Type{" "}
                  <code className="text-accent-gold">{fullSendConfirm}</code>{" "}
                  to unlock.
                </p>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-3 w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none"
                  placeholder={fullSendConfirm}
                />
                <button
                  type="button"
                  disabled={
                    busy !== null || confirmPhrase !== fullSendConfirm
                  }
                  onClick={() => void runAction("send")}
                  className="mt-3 w-full rounded border border-rose-800/60 px-4 py-2.5 text-sm text-rose-200 transition hover:border-rose-500 disabled:opacity-40"
                >
                  {busy === "send" ? "Sending to list…" : "Send Issue 1 to all"}
                </button>
              </div>

              {actionMsg && (
                <p className="mt-4 text-sm text-accent-gold" role="status">
                  {actionMsg}
                </p>
              )}
              {actionErr && (
                <p className="mt-4 text-sm text-rose-300" role="alert">
                  {actionErr}
                </p>
              )}
            </section>
          )}
        </div>
      )}

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/" className="text-accent-gold hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
