import "server-only";
import { siteUrl } from "./site";
import { newsletterFromAddress, ONE_SEAM } from "./newsletter";

/**
 * Plain fetch against Resend's REST API rather than their SDK. The app only
 * needs a few transactional shapes; a dependency is not worth it yet.
 */

async function sendResendEmail(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set, email not sent:", payload.subject);
    return;
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
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      headers: payload.headers,
    }),
  });

  if (!res.ok) {
    console.error("Resend send failed", res.status, await res.text());
  }
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
 * Sent only after double opt-in succeeds. One Seam welcome - no product
 * funnel, no feature spam. Unsubscribe link is required.
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string
): Promise<void> {
  const unsubUrl = `${siteUrl}/subscribe/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const home = siteUrl;

  const text = [
    "You are on the list.",
    "",
    "Once a week you will get one seam:",
    "a place where a giant story splits between the older version and the one that travelled farther.",
    "",
    "No digests.",
    "No product spam.",
    "If an entry on Giants Codex is relevant, the link will be at the bottom.",
    "",
    "The first seam arrives next week.",
    "",
    `- ${ONE_SEAM.fromName}`,
    home,
    "",
    `Unsubscribe: ${unsubUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;">
      <p>You are on the list.</p>
      <p>Once a week you will get one seam:<br/>
      a place where a giant story splits between the older version and the one that travelled farther.</p>
      <p>No digests.<br/>No product spam.<br/>
      If an entry on Giants Codex is relevant, the link will be at the bottom.</p>
      <p>The first seam arrives next week.</p>
      <p>- ${ONE_SEAM.fromName}<br/>
      <a href="${home}">${home.replace(/^https?:\/\//, "")}</a></p>
      <p style="color:#666;font-size:13px;"><a href="${unsubUrl}">Unsubscribe</a></p>
    </div>
  `;

  await sendResendEmail({
    to: email,
    subject: ONE_SEAM.listName,
    text,
    html,
    headers: {
      // Human unsubscribe URL (welcome + future weekly issues). One-click POST
      // is omitted until a dedicated endpoint exists.
      "List-Unsubscribe": `<${unsubUrl}>`,
    },
  });
}
