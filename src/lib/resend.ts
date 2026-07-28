import "server-only";
import { siteUrl } from "./site";

/**
 * Plain fetch against Resend's REST API rather than their SDK. The app only
 * needs one call shape (send a transactional email); pulling in a dependency
 * for that is not worth it yet. Reconsider if Audiences/broadcast sending
 * gets built later.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set — welcome email not sent");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Giants of the World <hello@giantscodex.com>",
      to: email,
      subject: "You are now marked in the codex",
      html: welcomeEmailHtml(),
    }),
  });

  if (!res.ok) {
    // Signup already succeeded (the DB row is the source of truth); a failed
    // welcome email is not a reason to tell the reader signup failed.
    console.error("Resend send failed", res.status, await res.text());
  }
}

function welcomeEmailHtml(): string {
  return `
    <div style="background:#0d1117;color:#e6edf3;font-family:Georgia,serif;padding:40px 24px;">
      <div style="max-width:480px;margin:0 auto;">
        <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a227;margin:0 0 16px;">
          Giants of the World
        </p>
        <h1 style="font-size:22px;color:#c9a227;margin:0 0 20px;font-weight:normal;">
          You are now marked in the codex.
        </h1>
        <p style="font-size:15px;line-height:1.6;color:#8b949e;margin:0 0 16px;">
          New giants surface without warning. When they do, you will hear
          about it first.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#8b949e;margin:0;">
          <a href="${siteUrl}/giants" style="color:#c9a227;">Return to the catalogue</a>
        </p>
      </div>
    </div>
  `;
}
