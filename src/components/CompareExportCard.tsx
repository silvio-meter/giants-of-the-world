import { barHeightPx, chartScaleToM, formatMeters } from "@/lib/scale";

export interface ExportGiant {
  name: string;
  culture: string;
  image: string;
  heightMeters: number | null;
  /** Only passed when the viewer is on a paid plan — the export mirrors what they were shown. */
  fate?: string;
}

/**
 * The actual shareable image, laid out at a fixed 270x480 (9:16) and
 * rasterized by html2canvas at 4x scale for a 1080x1920 output — a purpose
 * -built export template, not a screenshot of the results page. Absolute
 * pixel sizes throughout rather than the app's usual responsive classes,
 * since this never renders in a real viewport.
 */
export function CompareExportCard({
  a,
  b,
}: {
  a: ExportGiant;
  b: ExportGiant;
}) {
  const chartPx = 90;
  const scaleToM = chartScaleToM(a.heightMeters, b.heightMeters);

  return (
    <div
      style={{
        width: 270,
        height: 480,
        background: "linear-gradient(180deg, #0d1117 0%, #12161d 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "22px 16px",
        fontFamily: "Georgia, serif",
        color: "#e6edf3",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontSize: 8,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#c9a227",
          margin: 0,
        }}
      >
        Giants of the World
      </p>
      <p
        style={{
          fontSize: 10,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#8b949e",
          margin: "4px 0 20px",
        }}
      >
        A comparison from the codex
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        {[a, b].map((g) => (
          <div
            key={g.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 105,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element --
                This node is rasterized off-screen by html2canvas, never
                painted to a real viewport; next/image's lazy loading and
                _next/image proxying would fight the capture step below. */}
            <img
              src={g.image}
              width={90}
              height={90}
              style={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid rgba(201,162,39,0.4)",
              }}
              alt=""
            />
            <p
              style={{
                fontSize: 13,
                color: "#c9a227",
                margin: "10px 0 2px",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {g.name}
            </p>
            <p
              style={{
                fontSize: 9,
                color: "#8b949e",
                margin: "0 0 10px",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {g.culture}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: chartPx,
              }}
            >
              {g.heightMeters ? (
                <div
                  style={{
                    width: 26,
                    height: barHeightPx(g.heightMeters, chartPx, 10, scaleToM),
                    background:
                      "linear-gradient(0deg, rgba(201,162,39,0.15), rgba(201,162,39,0.55))",
                    border: "1px solid rgba(201,162,39,0.4)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              ) : (
                <p style={{ fontSize: 8, color: "#8b949e", maxWidth: 70 }}>
                  Scale beyond measurement
                </p>
              )}
            </div>
            <p style={{ fontSize: 9, color: "#8b949e", margin: "6px 0 0" }}>
              {g.heightMeters ? formatMeters(g.heightMeters) : ""}
            </p>

            {g.fate && (
              <p
                style={{
                  fontSize: 8,
                  color: "#8b949e",
                  marginTop: 10,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {g.fate}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <p
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: "rgba(201,162,39,0.7)",
          margin: 0,
        }}
      >
        giantscodex.com
      </p>
    </div>
  );
}
