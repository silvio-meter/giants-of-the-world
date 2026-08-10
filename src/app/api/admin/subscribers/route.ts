import { NextResponse } from "next/server";
import { isLifetimeGrantEmail } from "@/lib/access";
import { getSessionUser } from "@/lib/profile";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Minimal admin: count + CSV of active One Seam subscribers.
 * Restricted to LIFETIME_GRANT_EMAILS (founder accounts).
 */
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user?.email || !isLifetimeGrantEmail(user.email)) {
    return null;
  }
  return user;
}

export async function GET(request: Request) {
  const adminUser = await requireAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get("format");
  const client = createServiceRoleClient();

  const { data, error } = await client
    .from("subscribers")
    .select("email, source_page, subscribed_at, confirmed_at")
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null)
    .order("confirmed_at", { ascending: false });

  if (error) {
    console.error("admin subscribers", error.message);
    return NextResponse.json({ error: "Could not load." }, { status: 500 });
  }

  const rows = data ?? [];

  if (format === "csv") {
    const header = "email,source,subscribed_at,confirmed_at";
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        r.email,
        r.source_page ?? "",
        r.subscribed_at ?? "",
        r.confirmed_at ?? "",
      ]
        .map((c) => escape(String(c)))
        .join(",")
    );
    const body = [header, ...lines].join("\n");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="one-seam-subscribers.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  }

  return NextResponse.json(
    {
      count: rows.length,
      // Sample only in JSON so the payload stays small; full list via CSV.
      recent: rows.slice(0, 20).map((r) => ({
        email: r.email,
        source: r.source_page,
        confirmed_at: r.confirmed_at,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
