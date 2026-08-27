import "server-only";
import { siteUrl, supportEmail } from "./site";
import { newsletterFromAddress, ONE_SEAM } from "./newsletter";
import {
  getDripStep,
  renderDripHtml,
  renderDripText,
  type DripStepId,
} from "./one-seam/drip";

/**
 * Plain fetch against Resend's REST API rather than their SDK. The app only
 * needs a few transactional shapes; a dependency is not worth it yet.
 */

export type ResendSendResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<ResendSendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const msg = "RESEND_API_KEY is not set";
    console.error(msg, payload.subject);
    return { ok: false, error: msg };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: newsletterFromAddress(),
      to: payload.to,
      reply_to: supportEmail,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      headers: payload.headers,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend send failed", res.status, body);
    return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }

  try {
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch {
    return { ok: true };
  }
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl}/subscribe/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Double opt-in confirmation. Plain on purpose so filters do not treat it
 * as a campaign. Without this click the person is not on One Seam.
 */
export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${siteUrl}/subscribe/confirm?token=${encodeURIComponent(token)}`;

  await sendResendEmail({
    to: email,
    subject: `Confirm ${ONE_SEAM.listName}`,
    text: [
      `Confirm you want ${ONE_SEAM.listName} from ${ONE_SEAM.fromName}.`,
      "",
      ONE_SEAM.promise,
      "",
      `Confirm: ${url}`,
      "",
      "You will not be on the list until you open that link.",
      "If you did not request this, ignore this email and nothing happens.",
    ].join("\n"),
    html: `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;">
      <p>Confirm you want <strong>${ONE_SEAM.listName}</strong> from ${ONE_SEAM.fromName}.</p>
      <p>${ONE_SEAM.promise}</p>
      <p><a href="${url}">Confirm your subscription</a></p>
      <p>You will not be on the list until you open that link.</p>
      <p style="color:#666;">If you did not request this, ignore this email and nothing happens.</p>
    </div>
  `,
  });
}

/**
 * One Seam content issue (not the confirm drip). Personalised unsubscribe.
 */
export async function sendOneSeamIssueEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
}): Promise<ResendSendResult> {
  return sendResendEmail({
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    headers: {
      "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
    },
  });
}

/** Confirm drip emails 1-4. List-Unsubscribe + Reply-To hello@. */
export async function sendDripEmail(
  email: string,
  unsubscribeToken: string,
  step: DripStepId
): Promise<ResendSendResult> {
  const spec = getDripStep(step);
  const unsubUrl = unsubscribeUrl(unsubscribeToken);
  return sendResendEmail({
    to: email,
    subject: spec.subject,
    text: renderDripText(spec, unsubUrl),
    html: renderDripHtml(spec, unsubUrl),
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
    },
  });
}

/**
 * Email 1 of the confirm drip. Fired only after double opt-in succeeds.
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string
): Promise<void> {
  await sendDripEmail(email, unsubscribeToken, 1);
}
