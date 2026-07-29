"use client";

import Link from "next/link";
import type { GiantCardData } from "@/lib/format";
import { HUMAN_HEIGHT_M, barHeightPx, formatMeters } from "@/lib/scale";
import { usePlan } from "./PlanProvider";

interface Props {
  giant: Pick<GiantCardData, "name" | "height" | "heightMeters">;
}

export function SizeComparison({ giant }: Props) {
  const { isPaid, ready } = usePlan();
  // Precomputed in the data. Entries whose tradition gives no usable figure
  // carry null and simply do not render a chart.
  const meters = giant.heightMeters;
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

  const chartH = 160;
  const giantH = barHeightPx(meters, chartH, 48);
  const humanH = barHeightPx(HUMAN_HEIGHT_M, chartH);

  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Scale (illustrative)
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Approximate visual only. Mythic heights are not measurements.
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
            {formatMeters(meters)}
          </span>
        </div>

        <div className="flex w-[40%] max-w-[7rem] flex-col items-center gap-2">
          <div
            className="w-8 rounded-t border border-text-muted/50 bg-text-muted/40 sm:w-9"
            style={{ height: humanH }}
            title={`~${HUMAN_HEIGHT_M} m`}
          />
          <span className="w-full text-center text-xs font-medium leading-tight text-text-primary">
            Human
          </span>
          {/* Not formatMeters: that rounds to 1 decimal for approximate mythic
              heights, which would show 1.75 as "1.8" — this figure is exact. */}
          <span className="text-[10px] text-text-muted">
            ~{HUMAN_HEIGHT_M} m
          </span>
        </div>
      </div>
    </section>
  );
}
