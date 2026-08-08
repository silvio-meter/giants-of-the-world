import type { ReactElement } from "react";

/**
 * The shared share-card, so five segments cannot drift into five looks.
 *
 * No custom font, and that is a decision rather than an omission. ImageResponse
 * in this version accepts only ttf, otf and woff, while next/font caches Cinzel
 * as woff2, so the brand face is not reachable from anything already in the
 * repository. Bundling a TTF would mean adding a binary and reading its licence
 * first, which is not a call to make quietly. The palette, the gold rule and
 * the wide caps carry the brand instead; swapping a face in later is one prop.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#0d1117";
const GOLD = "#c9a227";
const TEXT = "#e6edf3";
const MUTED = "#8b949e";

export function ogCard({
  eyebrow,
  title,
  context,
}: {
  eyebrow: string;
  title: string;
  /** One line built from the data, never a number typed by hand. */
  context: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: GOLD,
            opacity: 0.85,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 88,
            lineHeight: 1.05,
            letterSpacing: -1,
            color: GOLD,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 32, height: 3, width: 180, background: GOLD }} />
        <div style={{ marginTop: 32, fontSize: 36, color: TEXT }}>{context}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 24,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        <span>Giants of the World</span>
        <span style={{ color: GOLD, opacity: 0.7 }}>giantscodex.com</span>
      </div>
    </div>
  );
}
