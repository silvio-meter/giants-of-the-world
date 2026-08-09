import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getGiantsWithCoordinates, getRegions } from "@/lib/giants";

export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "World Map · Giants of the World";

const BG = "#0d1117";
const GOLD = "#c9a227";
const TEXT = "#e6edf3";
const MUTED = "#8b949e";

/**
 * Share card for /map. Pins are drawn from live catalogue coordinates (scaled
 * into the card), so the image stays honest to the data rather than a stock map.
 */
export default function Image() {
  const located = getGiantsWithCoordinates();
  const regions = getRegions().length;
  const context = `${located.length} pins · ${regions} regions`;

  // Project lat/lng into a left panel (rough equirectangular).
  const pins = located
    .filter((g) => g.coordinates)
    .map((g) => {
      const [lat, lng] = g.coordinates as [number, number];
      const x = ((lng + 180) / 360) * 640 + 40;
      const y = ((90 - lat) / 180) * 520 + 55;
      return { x, y };
    });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
        }}
      >
        <div
          style={{
            width: "58%",
            height: "100%",
            display: "flex",
            position: "relative",
            background: "#121820",
            borderRight: `3px solid ${GOLD}`,
          }}
        >
          {/* Soft globe wash */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background:
                "radial-gradient(ellipse at 45% 50%, rgba(201,162,39,0.08) 0%, transparent 55%)",
            }}
          />
          {pins.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: GOLD,
                opacity: 0.85,
                boxShadow: "0 0 10px rgba(201,162,39,0.55)",
              }}
            />
          ))}
        </div>

        <div
          style={{
            width: "42%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: 8,
                textTransform: "uppercase",
                color: GOLD,
                opacity: 0.85,
              }}
            >
              Geography of the large
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 64,
                lineHeight: 1.05,
                letterSpacing: -1,
                color: GOLD,
              }}
            >
              World Map
            </div>
            <div
              style={{
                marginTop: 28,
                height: 3,
                width: 120,
                background: GOLD,
              }}
            />
            <div
              style={{
                marginTop: 24,
                fontSize: 28,
                lineHeight: 1.35,
                color: TEXT,
              }}
            >
              {context}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 22,
                lineHeight: 1.4,
                color: MUTED,
              }}
            >
              Pins mark tradition, not proof.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            <span>Giants of the World</span>
            <span style={{ color: GOLD, opacity: 0.8 }}>giantscodex.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
