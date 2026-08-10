/**
 * One Seam content issues. Source of truth for campaigns (not Resend drafts).
 * Welcome mail stays separate in resend.ts.
 *
 * Subject uses a plain hyphen (not U+2014) so verify-copy stays green.
 * No @/ imports here - unit tests load this file with plain Node.
 */

export const ONE_SEAM_BRAND = {
  listName: "One Seam",
  fromName: "Giants Codex",
  footerLine: "One crack in a giant story, once a week.",
} as const;

export interface OneSeamIssue {
  id: string;
  /** Internal short name */
  slug: string;
  subject: string;
  preheader: string;
  /** Path only; host is attached when rendering for send. */
  entryPath: string;
  entryLabel: string;
}

export const ISSUE_01_ATLAS: OneSeamIssue = {
  id: "01",
  slug: "atlas-pillars",
  subject: "One Seam - Atlas, pillars not shoulders",
  preheader: "Homer and Hesiod do not agree on what he holds.",
  entryPath: "/giants/atlas",
  entryLabel: "Full entry",
};

export const ONE_SEAM_ISSUES: OneSeamIssue[] = [ISSUE_01_ATLAS];

export function getIssue(id: string): OneSeamIssue | undefined {
  return ONE_SEAM_ISSUES.find((i) => i.id === id);
}

/** Phrase required on the full-send endpoint so a mis-click cannot blast the list. */
export const FULL_SEND_CONFIRM = "SEND ISSUE 1 TO ALL";

export function issueEntryUrl(
  issue: OneSeamIssue,
  siteOrigin: string
): string {
  const base = siteOrigin.replace(/\/$/, "");
  return `${base}${issue.entryPath}`;
}

export function renderIssueText(
  issue: OneSeamIssue,
  unsubscribeUrl: string,
  siteOrigin = "https://www.giantscodex.com"
): string {
  const entryUrl = issueEntryUrl(issue, siteOrigin);
  if (issue.id === "01") {
    return [
      "\"who holds the pillars that keep earth and sky apart\"",
      "- Odyssey 1",
      "",
      "\"he holds the sky away from the earth\"",
      "- Hesiod",
      "",
      "Pillars. Not shoulders.",
      "The globe is a later idea, read back into an older punishment.",
      "",
      "The ancient image is not a man carrying the world.",
      "It is a man keeping two things apart that would otherwise close.",
      "",
      `${issue.entryLabel}:`,
      entryUrl,
      "",
      "-",
      `${ONE_SEAM_BRAND.listName} · ${ONE_SEAM_BRAND.fromName}`,
      ONE_SEAM_BRAND.footerLine,
      `Unsubscribe: ${unsubscribeUrl}`,
    ].join("\n");
  }

  throw new Error(`No body template for issue ${issue.id}`);
}

/**
 * Plain, mobile-first HTML. Dark-archive friendly palette.
 * No hero, no product list, no Lifetime pitch. One content link only.
 */
export function renderIssueHtml(
  issue: OneSeamIssue,
  unsubscribeUrl: string,
  siteOrigin = "https://www.giantscodex.com"
): string {
  if (issue.id !== "01") {
    throw new Error(`No body template for issue ${issue.id}`);
  }

  const entryUrl = issueEntryUrl(issue, siteOrigin);
  const pre = escapeHtml(issue.preheader);
  const entry = escapeHtml(entryUrl);
  const unsub = escapeHtml(unsubscribeUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(issue.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0d1117;color:#e6edf3;">
  <!-- preheader: hidden in most clients, shows in inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0d1117;opacity:0;">
    ${pre}
  </div>
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.65;color:#e6edf3;max-width:560px;margin:0 auto;padding:32px 20px 48px;">
    <blockquote style="margin:0 0 8px;padding:0 0 0 16px;border-left:3px solid #c9a227;font-style:italic;color:#e6edf3;">
      &ldquo;who holds the pillars that keep earth and sky apart&rdquo;
    </blockquote>
    <p style="margin:0 0 28px;font-size:14px;color:#8b949e;font-style:normal;font-family:Helvetica,Arial,sans-serif;">
      - Odyssey 1
    </p>

    <blockquote style="margin:0 0 8px;padding:0 0 0 16px;border-left:3px solid #c9a227;font-style:italic;color:#e6edf3;">
      &ldquo;he holds the sky away from the earth&rdquo;
    </blockquote>
    <p style="margin:0 0 32px;font-size:14px;color:#8b949e;font-family:Helvetica,Arial,sans-serif;">
      - Hesiod
    </p>

    <p style="margin:0 0 16px;">Pillars. Not shoulders.<br/>
    The globe is a later idea, read back into an older punishment.</p>

    <p style="margin:0 0 28px;">The ancient image is not a man carrying the world.<br/>
    It is a man keeping two things apart that would otherwise close.</p>

    <p style="margin:0 0 40px;font-family:Helvetica,Arial,sans-serif;font-size:16px;">
      ${escapeHtml(issue.entryLabel)}:<br/>
      <a href="${entry}" style="color:#c9a227;">${entry}</a>
    </p>

    <hr style="border:none;border-top:1px solid #30363d;margin:0 0 20px;" />

    <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8b949e;">
      ${escapeHtml(ONE_SEAM_BRAND.listName)} · ${escapeHtml(ONE_SEAM_BRAND.fromName)}
    </p>
    <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8b949e;">
      ${escapeHtml(ONE_SEAM_BRAND.footerLine)}
    </p>
    <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8b949e;">
      <a href="${unsub}" style="color:#8b949e;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
