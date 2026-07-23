import type { Giant } from "@/lib/types";

interface Props {
  giant: Giant;
}

/** Parse a rough meter estimate from free-text height, if possible. */
function estimateMeters(height: string | null): number | null {
  if (!height) return null;
  const lower = height.toLowerCase();
  if (lower.includes("cosmic") || lower.includes("titanic") || lower.includes("vast"))
    return 30;
  if (lower.includes("mountain")) return 25;
  if (lower.includes("cyclopean") || lower.includes("gigantic") || lower.includes("colossal"))
    return 12;
  if (lower.includes("18 feet") || lower.includes("18 ft")) return 5.5;
  if (lower.includes("12 cubit")) return 5.5;
  if (lower.includes("15 feet") || lower.includes("12–15") || lower.includes("12-15"))
    return 4;
  if (lower.includes("10-foot") || lower.includes("ten-foot")) return 3;
  if (lower.includes("six cubits")) return 2.9;
  if (lower.includes("four cubits")) return 1.8;
  const feet = lower.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft)/);
  if (feet) return parseFloat(feet[1]) * 0.3048;
  const meters = lower.match(/(\d+(?:\.\d+)?)\s*m(?:eter)?s?\b/);
  if (meters) return parseFloat(meters[1]);
  if (lower.includes("giant") || lower.includes("jötunn") || lower.includes("jotunn"))
    return 4.5;
  return null;
}

export function SizeComparison({ giant }: Props) {
  const meters = estimateMeters(giant.height);
  if (!meters) return null;

  const human = 1.75;
  const maxBar = Math.max(meters, human * 1.2);
  const giantPct = Math.min(100, (meters / maxBar) * 100);
  const humanPct = (human / maxBar) * 100;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Scale (illustrative)
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Approximate visual only — mythic heights are not measurements.
        {giant.height ? ` Tradition: ${giant.height}` : ""}
      </p>
      <div className="mt-6 flex h-44 items-end justify-center gap-8">
        <div className="flex h-full flex-col items-center justify-end gap-2">
          <div
            className="w-10 rounded-t border border-accent-gold/30 bg-gradient-to-t from-accent-gold/40 to-accent-gold/10"
            style={{ height: `${Math.max(giantPct, 18)}%` }}
          />
          <span className="max-w-[5.5rem] text-center text-xs text-text-muted">
            {giant.name}
          </span>
        </div>
        <div className="flex h-full flex-col items-center justify-end gap-2">
          <div
            className="w-6 rounded-t border border-border bg-text-muted/30"
            style={{ height: `${Math.max(humanPct, 10)}%` }}
          />
          <span className="max-w-[5.5rem] text-center text-xs text-text-muted">
            Human (~1.75 m)
          </span>
        </div>
      </div>
    </section>
  );
}
