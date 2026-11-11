"use client";

import type { GiantCardData } from "@/lib/format";
import {
  HUMAN_HEIGHT_M,
  barHeightPx,
  chartScaleToM,
  formatMeters,
} from "@/lib/scale";
import { PAYWALL_COPY } from "@/lib/paywall-copy";
import { CUBIT_ASSUMPTION, NO_MEASURED_HEIGHT, toldIn } from "@/lib/height";
import { usePlan } from "./PlanProvider";

interface Props {
  giant: Pick<
    GiantCardData,
    "name" | "heightMeters" | "heightSource" | "heightAlt" | "heightCubitBased"
  >;
  /** Showcase free entries show scale with no checkout CTA. */
  freeEntry?: boolean;
}

const CHART_H = 168;

export function SizeComparison({ giant, freeEntry = false }: Props) {
  const { isPaid, ready } = usePlan();
  // Precomputed in the data. Only a measure a source states in a unit gets a
  // number; everything else says so instead of drawing a guessed figure.
  const meters = giant.heightMeters;
  if (!meters) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Scale
        </h3>
        <p className="mt-2 text-xs text-text-muted">{NO_MEASURED_HEIGHT}</p>
      </section>
    );
  }
  const alt = giant.heightAlt?.meters ? giant.heightAlt : null;

  // Free 19: show the chart, never a checkout ask. Paid entries: later lock,
  // no button, so the page keeps a single gold wall on the account fade.
  if (!freeEntry && ready && !isPaid) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Scale
        </h3>
        <p className="mt-2 text-xs text-text-muted">{PAYWALL_COPY.scaleLater}</p>
      </section>
    );
  }

  // Scale to this pair, not a 12 m cosmic cap. Goliath at 2.9 m must fill
  // the card; a human at 1.75 m is then about three-fifths as tall.
  const scaleTo = chartScaleToM(meters, alt?.meters, HUMAN_HEIGHT_M);
  const giantH = barHeightPx(meters, CHART_H, 20, scaleTo);
  const altH = alt?.meters ? barHeightPx(alt.meters, CHART_H, 20, scaleTo) : 0;
  const primaryToldIn = toldIn(giant.heightSource);
  const humanH = barHeightPx(HUMAN_HEIGHT_M, CHART_H, 20, scaleTo);

  return (
    <section
      className="rounded-lg border border-border bg-surface p-4"
      aria-label={`Scale: ${giant.name} ${formatMeters(meters)}${
        primaryToldIn ? ` ${primaryToldIn}` : ""
      }${
        alt?.meters ? `, or ${formatMeters(alt.meters)} ${toldIn(alt.source)}` : ""
      }, human ~${HUMAN_HEIGHT_M} m`}
    >
      <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Scale
      </h3>
      <p className="mt-1 text-[11px] leading-snug text-text-muted">
        Illustrative only. The figure is the tale&apos;s, not a measurement.
      </p>
      {alt?.meters ? (
        <p className="mt-1 text-[11px] leading-snug text-text-muted">
          {alt.note}
        </p>
      ) : null}
      {giant.heightCubitBased ? (
        <p className="mt-1 text-[11px] leading-snug text-text-muted">
          Metres: {CUBIT_ASSUMPTION}.
        </p>
      ) : null}

      <div
        className={`mt-4 grid items-start gap-3 ${alt ? "grid-cols-3" : "grid-cols-2"}`}
      >
        <FigureColumn
          barClassName="w-9 rounded-t border border-accent-gold/40 bg-gradient-to-t from-accent-gold/55 to-accent-gold/15 sm:w-10"
          barHeight={giantH}
          title={`~${meters} m (illustrative)`}
          name={giant.name}
          meters={formatMeters(meters)}
          note={primaryToldIn}
        />
        {alt?.meters ? (
          <FigureColumn
            barClassName="w-9 rounded-t border border-accent-gold/30 bg-gradient-to-t from-accent-gold/35 to-accent-gold/10 sm:w-10"
            barHeight={altH}
            title={`~${alt.meters} m (illustrative)`}
            name={giant.name}
            meters={formatMeters(alt.meters)}
            note={toldIn(alt.source)}
          />
        ) : null}
        <FigureColumn
          barClassName="w-6 rounded-t border border-text-muted/50 bg-text-muted/35 sm:w-7"
          barHeight={humanH}
          title={`~${HUMAN_HEIGHT_M} m`}
          name="Human"
          // Not formatMeters: that rounds to 1 decimal for approximate mythic
          // heights, which would show 1.75 as "1.8". This figure is exact.
          meters={`~${HUMAN_HEIGHT_M} m`}
        />
      </div>
    </section>
  );
}

function FigureColumn({
  barClassName,
  barHeight,
  title,
  name,
  meters,
  note,
}: {
  barClassName: string;
  barHeight: number;
  title: string;
  name: string;
  meters: string;
  note?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        className="flex w-full items-end justify-center border-b border-border"
        style={{ height: CHART_H }}
      >
        <div className={barClassName} style={{ height: barHeight }} title={title} />
      </div>
      <span className="mt-2 w-full text-center text-xs font-medium leading-tight text-text-primary">
        {name}
      </span>
      <span className="mt-0.5 text-[10px] tabular-nums text-text-muted">{meters}</span>
      {note ? (
        <span className="mt-0.5 text-center text-[10px] leading-tight text-text-muted/80">
          {note}
        </span>
      ) : null}
    </div>
  );
}
