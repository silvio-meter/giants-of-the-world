import "server-only";
import { randomUUID } from "node:crypto";
import { siteUrl } from "@/lib/site";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendOneSeamIssueEmail } from "@/lib/resend";
import {
  getIssue,
  renderIssueHtml,
  renderIssueText,
  type OneSeamIssue,
} from "./issues";

// siteUrl is resolved at send time so preview/prod hosts stay correct.

export type ActiveSubscriber = {
  id: string;
  email: string;
  unsubscribe_token: string | null;
};

function unsubUrl(token: string): string {
  return `${siteUrl}/subscribe/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Ensure each recipient has an unsubscribe token (legacy rows may lack one). */
export async function ensureUnsubscribeToken(
  row: ActiveSubscriber
): Promise<string> {
  if (row.unsubscribe_token) return row.unsubscribe_token;

  const token = randomUUID();
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("subscribers")
    .update({ unsubscribe_token: token })
    .eq("id", row.id);

  if (error) {
    console.error("ensure unsubscribe token", error.message);
    // Still send with a fresh token so the link is not empty; row may lag.
  }
  return token;
}

export async function listActiveSubscribers(): Promise<ActiveSubscriber[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("subscribers")
    .select("id, email, unsubscribe_token")
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null);

  if (error) {
    console.error("list active subscribers", error.message);
    throw new Error("Could not load subscribers.");
  }

  return (data ?? []).filter((r) => Boolean(r.email)) as ActiveSubscriber[];
}

export function buildIssuePayload(
  issue: OneSeamIssue,
  unsubscribeToken: string
): { subject: string; text: string; html: string; unsubscribeUrl: string } {
  const unsubscribeUrl = unsubUrl(unsubscribeToken);
  return {
    subject: issue.subject,
    text: renderIssueText(issue, unsubscribeUrl, siteUrl),
    html: renderIssueHtml(issue, unsubscribeUrl, siteUrl),
    unsubscribeUrl,
  };
}

/** Preview: exactly one address (the signed-in grant owner). */
export async function sendIssuePreview(
  issueId: string,
  toEmail: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const issue = getIssue(issueId);
  if (!issue) return { ok: false, error: "Unknown issue." };

  // Preview uses a disposable token shape so we never write the admin row.
  // Link still hits the real unsubscribe page (invalid until a real token).
  const previewToken = `preview-${randomUUID()}`;
  const payload = buildIssuePayload(issue, previewToken);

  const result = await sendOneSeamIssueEmail({
    to: toEmail,
    ...payload,
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

/**
 * Full list send. Caller must already have verified the confirm phrase.
 * Sends one by one so each person gets their own unsubscribe link.
 */
export async function sendIssueToAll(
  issueId: string
): Promise<
  | { ok: true; sent: number; failed: number; errors: string[] }
  | { ok: false; error: string }
> {
  const issue = getIssue(issueId);
  if (!issue) return { ok: false, error: "Unknown issue." };

  let rows: ActiveSubscriber[];
  try {
    rows = await listActiveSubscribers();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not load subscribers.",
    };
  }

  if (rows.length === 0) {
    return { ok: false, error: "No active subscribers." };
  }

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const token = await ensureUnsubscribeToken(row);
      const payload = buildIssuePayload(issue, token);
      const result = await sendOneSeamIssueEmail({
        to: row.email,
        ...payload,
      });
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        errors.push(`${row.email}: ${result.error}`);
      }
    } catch (e) {
      failed += 1;
      errors.push(
        `${row.email}: ${e instanceof Error ? e.message : "send failed"}`
      );
    }
  }

  return { ok: true, sent, failed, errors: errors.slice(0, 10) };
}
