"use client";

import Link from "next/link";
import type { GiantCardData } from "@/lib/giants";
import { usePlan } from "./PlanProvider";

interface Props {
  giant: Pick<GiantCardData, "name" | "height">;
}

/** Parse a rough meter estimate from free-text height, if possible. */
function estimateMeters(height: string | null): number | null {
  if (!height) return null;
  const lower = height.toLowerCase();
  if (
    lower.includes("cosmic") ||
    lower.includes("titanic") ||
    lower.includes("vast")
  )
    return 30;
  if (lower.includes("mountain")) return 25;
  if (
    lower.includes("cyclopean") ||
    lower.includes("gigantic") ||
    lower.includes("colossal")
  )
    return 12;
  if (lower.includes("18 feet") || lower.includes("18 ft")) return 5.5;
  if (lower.includes("12 cubit")) return 5.5;
  if (
    lower.includes("15 feet") ||
    lower.includes("12–15") ||
    lower.includes("12-15")
  )
    return 4;
  if (lower.includes("10-foot") || lower.includes("ten-foot")) return 3;
  if (lower.includes("six cubits")) return 2.9;
  if (lower.includes("four cubits")) return 1.8;
  const feet = lower.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft)/);
  if (feet) return parseFloat(feet[1]) * 0.3048;
  const meters = lower.match(/(\d+(?:\.\d+)?)\s*m(?:eter)?s?\b/);
  if (meters) return parseFloat(meters[1]);
  if (
    lower.includes("giant") ||
    lower.includes("jötunn") ||
    lower.includes("jotunn")
  )
    return 4.5;
  return null;
}

export function SizeComparison({ giant }: Props) {
  const { isPaid, ready } = usePlan();
  const meters = estimateMeters(giant.height);
  if (!meters) return null;

  if (ready && !isPaid) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Scale
        </h3>
        <p className="mt-2 text-xs text-text-muted">
          Size comparison unlocks with any paid plan.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-block text-xs text-accent-gold hover:underline"
        >
          View pricing →
        </Link>
      </section>
    );
  }

  const human = 1.75;
  // Cap visual scale so human remains readable (huge mythic heights compress)
  const visualGiant = Math.min(meters, 12);
  const chartH = 160;
  const giantH = Math.max(48, (visualGiant / 12) * chartH);
  const humanH = Math.max(28, (human / 12) * chartH);

  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Scale (illustrative)
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Approximate visual only - mythic heights are not measurements.
        {giant.height ? ` Tradition: ${giant.height}` : ""}
      </p>

      <div
        className="mt-5 flex items-end justify-center gap-6 sm:gap-10"
        style={{ height: chartH + 48 }}
      >
        <div className="flex w-[40%] max-w-[7rem] flex-col items-center gap-2">
          <div
            className="w-12 rounded-t border border-accent-gold/40 bg-gradient-to-t from-accent-gold/50 to-accent-gold/15 sm:w-14"
            style={{ height: giantH }}
            title={`~${meters} m (illustrative)`}
          />
          <span className="w-full text-center text-xs font-medium leading-tight text-text-primary">
            {giant.name}
          </span>
          <span className="text-[10px] text-text-muted">
            ~{meters >= 10 ? `${Math.round(meters)}` : meters.toFixed(1)} m
          </span>
        </div>

        <div className="flex w-[40%] max-w-[7rem] flex-col items-center gap-2">
          <div
            className="w-8 rounded-t border border-text-muted/50 bg-text-muted/40 sm:w-9"
            style={{ height: humanH }}
            title="~1.75 m"
          />
          <span className="w-full text-center text-xs font-medium leading-tight text-text-primary">
            Human
          </span>
          <span className="text-[10px] text-text-muted">~1.75 m</span>
        </div>
      </div>
    </section>
  );
}
