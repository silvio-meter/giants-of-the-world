import { NextResponse } from "next/server";
import { isLifetimeGrantEmail } from "@/lib/access";
import { getSessionUser } from "@/lib/profile";
import {
  FULL_SEND_CONFIRM,
  ISSUE_01_ATLAS,
  ONE_SEAM_ISSUES,
  issueEntryUrl,
} from "@/lib/one-seam/issues";
import { sendIssuePreview, sendIssueToAll } from "@/lib/one-seam/send";
import { newsletterFromAddress } from "@/lib/newsletter";
import { siteUrl } from "@/lib/site";

/**
 * Admin One Seam campaign controls.
 * GET  - issue metadata (draft list)
 * POST - preview (owner only) or full send (explicit confirm phrase)
 */
export const dynamic = "force-dynamic";
/** Full send can take a while on larger lists. */
export const maxDuration = 60;

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user?.email || !isLifetimeGrantEmail(user.email)) {
    return null;
  }
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(
    {
      from: newsletterFromAddress(),
      issues: ONE_SEAM_ISSUES.map((i) => ({
        id: i.id,
        slug: i.slug,
        subject: i.subject,
        preheader: i.preheader,
        entryUrl: issueEntryUrl(i, siteUrl),
      })),
      fullSendConfirm: FULL_SEND_CONFIRM,
      issue01: {
        id: ISSUE_01_ATLAS.id,
        subject: ISSUE_01_ATLAS.subject,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin?.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: string;
    issueId?: string;
    confirm?: string;
  } | null;

  const issueId = body?.issueId?.trim() || "01";
  const action = body?.action?.trim();

  if (action === "preview") {
    // Exactly one recipient: the signed-in grant owner. Never the full list.
    const result = await sendIssuePreview(issueId, admin.email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      mode: "preview",
      to: admin.email,
      issueId,
    });
  }

  if (action === "send") {
    if (body?.confirm !== FULL_SEND_CONFIRM) {
      return NextResponse.json(
        {
          error: `Full send requires confirm: "${FULL_SEND_CONFIRM}"`,
        },
        { status: 400 }
      );
    }

    const result = await sendIssueToAll(issueId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      mode: "send",
      issueId,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
    });
  }

  return NextResponse.json(
    { error: 'action must be "preview" or "send".' },
    { status: 400 }
  );
}
