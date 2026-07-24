import type { NextConfig } from "next";

/**
 * Origins the browser legitimately talks to:
 *  - CartoDB   dark map tiles on /map
 *  - Supabase  browser auth client on /login and /signup
 *  - Vercel    analytics; same-origin in production, va.* on previews
 */
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "https://*.supabase.co";

const VERCEL_ANALYTICS = "https://va.vercel-scripts.com";
const CARTO_TILES = "https://*.basemaps.cartocdn.com";

/**
 * 'unsafe-inline' in script-src is deliberate. Next's bootstrap and our
 * JSON-LD blocks are inline, and the nonce alternative forces every page to
 * render per request — which would undo the static prerendering the giant
 * pages depend on. The policy still blocks third-party script origins,
 * framing, base-tag hijacking and plugin content; it does not defend against
 * inline injection. Revisit if that trade stops being worth it.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${VERCEL_ANALYTICS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${CARTO_TILES}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${VERCEL_ANALYTICS}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Redundant next to frame-ancestors, kept for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Local /public assets; formats help Lighthouse / mobile.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
