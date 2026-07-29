export interface JourneyStop {
  slug: string;
  name: string;
  culture: string;
  coordinates: [number, number];
}

/** Equirectangular projection onto the map panel's pixel box. */
function project(
  [lat, lng]: [number, number],
  width: number,
  height: number
): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

/**
 * The shareable "My Journey" image: saved giants plotted on a generated
 * graticule, not a real map — html2canvas can't reliably rasterize live
 * Leaflet tiles (async loading, cross-origin tiles), and there's no art
 * asset pipeline for a hand-drawn world outline. Same fixed 270x480
 * off-screen template shape as CompareExportCard.
 */
export function MyJourneyCard({ stops }: { stops: JourneyStop[] }) {
  const mapW = 232;
  const mapH = 220;
  const points = stops.map((s) => project(s.coordinates, mapW, mapH));
  const cultures = [...new Set(stops.map((s) => s.culture))];

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
          margin: "4px 0 18px",
        }}
      >
        My Journey
      </p>

      <svg
        width={mapW}
        height={mapH}
        viewBox={`0 0 ${mapW} ${mapH}`}
        style={{
          border: "1px solid rgba(201,162,39,0.35)",
          borderRadius: 6,
          background: "rgba(201,162,39,0.04)",
        }}
      >
        {/* Graticule — generated lines, not a cartographic asset. */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={`v${f}`}
            x1={mapW * f}
            y1={0}
            x2={mapW * f}
            y2={mapH}
            stroke="rgba(201,162,39,0.12)"
            strokeWidth={0.5}
          />
        ))}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={`h${f}`}
            x1={0}
            y1={mapH * f}
            x2={mapW}
            y2={mapH * f}
            stroke="rgba(201,162,39,0.12)"
            strokeWidth={0.5}
          />
        ))}

        {points.length > 1 && (
          <polyline
            points={points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="#c9a227"
            strokeWidth={0.75}
            strokeDasharray="2 3"
            opacity={0.6}
          />
        )}

        {points.map(([x, y], i) => (
          <circle key={stops[i].slug} cx={x} cy={y} r={3} fill="#c9a227" opacity={0.9} />
        ))}
      </svg>

      <p style={{ fontSize: 13, color: "#c9a227", margin: "16px 0 2px", textAlign: "center" }}>
        {stops.length} giant{stops.length === 1 ? "" : "s"} visited
      </p>
      <p
        style={{
          fontSize: 9,
          color: "#8b949e",
          margin: 0,
          textAlign: "center",
          maxWidth: 220,
          lineHeight: 1.5,
        }}
      >
        Across {cultures.length} tradition{cultures.length === 1 ? "" : "s"}:{" "}
        {cultures.slice(0, 5).join(", ")}
        {cultures.length > 5 ? "…" : ""}
      </p>

      <div style={{ flex: 1 }} />
      <p style={{ fontSize: 9, letterSpacing: 1, color: "rgba(201,162,39,0.7)", margin: 0 }}>
        giantscodex.com
      </p>
    </div>
  );
}
