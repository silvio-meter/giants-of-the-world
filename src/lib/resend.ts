import "server-only";
import { siteUrl } from "./site";

/**
 * Plain fetch against Resend's REST API rather than their SDK. The app only
 * needs one call shape (send a transactional email); pulling in a dependency
 * for that is not worth it yet. Reconsider if Audiences/broadcast sending
 * gets built later.
 */

/**
 * The confirmation email is the single point of failure in double opt-in: if
 * it does not arrive, the person never becomes a subscriber.
 *
 * The domain is now fully authenticated: SPF on the sending subdomain, DKIM
 * via resend._domainkey, and DMARC at p=none, which is monitoring rather than
 * enforcement. That covers the mechanics, but authentication only proves the
 * mail is genuinely from us. It does not stop a filter deciding a message
 * looks promotional.
 *
 * So it is deliberately plain. No dark background, no gold headings, no
 * imagery, nothing that reads as a campaign. One sentence, one link, and a
 * line saying what to do if it was not you. It also ships a text/plain
 * alternative alongside the HTML, because HTML-only mail scores worse with
 * spam filters than a proper multipart message.
 */
export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set, confirmation email not sent");
    return;
  }

  const url = `${siteUrl}/subscribe/confirm?token=${encodeURIComponent(token)}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Giants of the World <hello@giantscodex.com>",
      to: email,
      subject: "Confirm your subscription",
      text: [
        "Please confirm you want emails from Giants of the World.",
        "",
        `Confirm: ${url}`,
        "",
        "You will not be subscribed until you open that link.",
        "If you did not request this, ignore this email and nothing happens.",
      ].join("\n"),
      html: confirmationEmailHtml(url),
    }),
  });

  if (!res.ok) {
    console.error("Resend send failed", res.status, await res.text());
  }
}

function confirmationEmailHtml(url: string): string {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;">
      <p>Please confirm you want emails from Giants of the World.</p>
      <p><a href="${url}">Confirm your subscription</a></p>
      <p>You will not be subscribed until you open that link.</p>
      <p style="color:#666;">If you did not request this, ignore this email and nothing happens.</p>
    </div>
  `;
}

/**
 * Sent only after double opt-in succeeds. Plain on purpose (same filter
 * reasoning as the confirmation mail). Three links, no campaign chrome:
 * a free entry, how sources are treated, and membership when they want it.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set, welcome email not sent");
    return;
  }

  const ymir = `${siteUrl}/giants/ymir?utm_source=email&utm_medium=welcome&utm_campaign=lifecycle`;
  const evidence = `${siteUrl}/evidence?utm_source=email&utm_medium=welcome&utm_campaign=lifecycle`;
  const pricing = `${siteUrl}/pricing?utm_source=email&utm_medium=welcome&utm_campaign=lifecycle`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Giants of the World <hello@giantscodex.com>",
      to: email,
      subject: "You are on the list",
      text: [
        "You are confirmed on Giants of the World.",
        "",
        "Three places to start:",
        `A free full entry (Ymir): ${ymir}`,
        `How we treat sources: ${evidence}`,
        `Membership when you want the sealed layers: ${pricing}`,
        "",
        "You can unsubscribe from any message we send.",
      ].join("\n"),
      html: welcomeEmailHtml(ymir, evidence, pricing),
    }),
  });

  if (!res.ok) {
    console.error("Resend welcome failed", res.status, await res.text());
  }
}

function welcomeEmailHtml(
  ymir: string,
  evidence: string,
  pricing: string
): string {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;">
      <p>You are confirmed on Giants of the World.</p>
      <p>Three places to start:</p>
      <ul>
        <li><a href="${ymir}">A free full entry (Ymir)</a></li>
        <li><a href="${evidence}">How we treat sources</a></li>
        <li><a href="${pricing}">Membership when you want the sealed layers</a></li>
      </ul>
      <p style="color:#666;">You can unsubscribe from any message we send.</p>
    </div>
  `;
}
