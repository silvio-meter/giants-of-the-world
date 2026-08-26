import type { NextConfig } from "next";

/**
 * Origins the browser legitimately talks to:
 *  - CartoDB   dark map tiles on /map
 *  - Supabase  browser auth client on /login and /signup
 *  - Vercel    analytics; same-origin in production, va.* on previews
 *  - Umami     cookieless analytics, and it needs TWO different origins:
 *              cloud.umami.is serves the tracker script, but the tracker
 *              posts its hits to gateway.umami.is. Missing the gateway
 *              origin blocks every event while looking completely healthy,
 *              because the tracker wraps its fetch in a try/catch that
 *              swallows the CSP rejection without logging anything.
 */
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "https://*.supabase.co";

const VERCEL_ANALYTICS = "https://va.vercel-scripts.com";
const CARTO_TILES = "https://*.basemaps.cartocdn.com";
const UMAMI_SCRIPT = "https://cloud.umami.is";
const UMAMI_COLLECT = "https://gateway.umami.is";

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
  `script-src 'self' 'unsafe-inline' ${VERCEL_ANALYTICS} ${UMAMI_SCRIPT}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${CARTO_TILES}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${VERCEL_ANALYTICS} ${UMAMI_SCRIPT} ${UMAMI_COLLECT}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseSecurityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Redundant next to frame-ancestors, kept for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
];

/** Default: geolocation off. /near is the only page that may prompt. */
const permissionsOff =
  "camera=(), microphone=(), geolocation=(), payment=()";
const permissionsNear =
  "camera=(), microphone=(), geolocation=(self), payment=()";

/**
 * Short links for social profiles.
 *
 * A profile bio has to show the URL it links to, and a raw UTM string reads
 * as clutter next to a handle: giantscodex.com/?utm_source=x&utm_medium=bio
 * is what X actually prints on the profile. These give the same attribution
 * behind a link that looks like something a person would type.
 *
 * Not permanent: a 308 gets cached hard by browsers, and the destination here
 * is marketing metadata that may well be retuned later. A temporary redirect
 * keeps that editable.
 */
const socialShortLinks = ["x", "instagram", "youtube", "pinterest"];

const nextConfig: NextConfig = {
  images: {
    // Local /public assets; formats help Lighthouse / mobile.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return socialShortLinks.map((source) => ({
      source: `/${source}`,
      destination: `/?utm_source=${source}&utm_medium=bio`,
      permanent: false,
    }));
  },
  async headers() {
    // /near is the only source with geolocation=(self). The other sources
    // exclude that path so they cannot AND-disable the prompt. Camera,
    // microphone and payment stay disabled everywhere. Coords stay out of
    // the URL in NearClient; this header only lets the browser prompt.
    return [
      {
        source: "/near",
        headers: [
          ...baseSecurityHeaders,
          { key: "Permissions-Policy", value: permissionsNear },
        ],
      },
      {
        source: "/",
        headers: [
          ...baseSecurityHeaders,
          { key: "Permissions-Policy", value: permissionsOff },
        ],
      },
      {
        source: "/((?!near$).*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "Permissions-Policy", value: permissionsOff },
        ],
      },
    ];
  },
};

export default nextConfig;
