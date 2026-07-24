import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refreshes the Supabase session cookie.
 *
 * Renamed from `middleware.ts`, which Next 16 deprecates in favour of `proxy`.
 *
 * The matcher is deliberately narrow. This used to run on nearly every request
 * — including static pages, the sitemap and robots.txt — costing a network
 * round trip to Supabase each time. Only routes that actually read the session
 * need it; /api/me runs on every page view, so tokens still refresh promptly.
 * The Stripe webhook is excluded: it authenticates by signature, not cookie.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/favourites",
    "/api/me",
    "/api/auth/:path*",
    "/api/favourites/:path*",
    "/api/lore/:path*",
    "/api/checkout",
    "/api/portal",
    "/api/demo/:path*",
  ],
};
