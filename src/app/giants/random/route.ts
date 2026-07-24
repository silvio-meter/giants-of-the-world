import { NextResponse } from "next/server";
import { getRandomGiant } from "@/lib/giants";
import { getSiteUrl } from "@/lib/stripe";

/**
 * Picks a giant server-side so the Random button stays a plain link — the
 * catalog never has to reach the browser just to choose a slug.
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const base = new URL(request.url).origin || getSiteUrl();
  const target = new URL(`/giants/${getRandomGiant().slug}`, base);
  return NextResponse.redirect(target, { status: 307 });
}
