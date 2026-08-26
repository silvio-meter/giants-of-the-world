import Link from "next/link";
import { canViewFullDescription } from "@/lib/access";
import { incrementComparisonsMade } from "@/lib/comparisons";
import { getGiantLore } from "@/lib/giants-lore";
import { formatType, type GiantCardData } from "@/lib/format";
import { getProfile } from "@/lib/profile";
import { sharedMotifs } from "@/lib/motifs";
import { barHeightPx, chartScaleToM, formatMeters } from "@/lib/scale";
import { CompareExportButton } from "./CompareExportButton";
import { CompareViewTracker } from "./CompareViewTracker";
import { PremiumLock } from "./PremiumLock";
import { PAYWALL_COPY } from "@/lib/paywall-copy";

function ScaleBar({
  giant,
  scaleToM,
}: {
  giant: GiantCardData;
  scaleToM: number;
}) {
  const chartH = 160;
  return (
    <div className="flex w-[45%] max-w-[9rem] flex-col items-center">
      <div
        className="flex w-full items-end justify-center border-b border-border"
        style={{ height: chartH }}
      >
        {giant.heightMeters ? (
          <div
            className="w-12 rounded-t border border-accent-gold/40 bg-gradient-to-t from-accent-gold/50 to-accent-gold/15 sm:w-14"
            style={{
              height: barHeightPx(giant.heightMeters, chartH, 16, scaleToM),
            }}
          />
        ) : (
          <span className="px-1 pb-2 text-center text-[10px] leading-tight text-text-muted">
            Scale beyond measurement
          </span>
        )}
      </div>
      {giant.heightMeters ? (
        <span className="mt-2 text-[10px] tabular-nums text-text-muted">
          {formatMeters(giant.heightMeters)}
        </span>
      ) : null}
      <Link
        href={`/giants/${giant.slug}`}
        className="mt-1 text-center text-sm font-medium leading-tight text-text-primary hover:text-accent-gold"
      >
        {giant.name}
      </Link>
    </div>
  );
}

function Row({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr_1fr] gap-2 border-b border-border py-2.5 text-sm last:border-0 sm:grid-cols-[120px_1fr_1fr]">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary/90">{a}</dd>
      <dd className="text-text-primary/90">{b}</dd>
    </div>
  );
}

export async function CompareResults({
  giantA,
  giantB,
}: {
  giantA: GiantCardData;
  giantB: GiantCardData;
}) {
  const profile = await getProfile();
  const unlocked = canViewFullDescription(profile?.plan);

  const loreA = unlocked ? getGiantLore(giantA.slug) : null;
  const loreB = unlocked ? getGiantLore(giantB.slug) : null;
  const shared = unlocked ? sharedMotifs(giantA.slug, giantB.slug) : [];
  const scaleToM = chartScaleToM(giantA.heightMeters, giantB.heightMeters);

  if (profile) {
    // Fire-and-forget: a comparison view shouldn't block on the counter write.
    void incrementComparisonsMade(profile.id);
  }

  return (
    <div className="space-y-8">
      <CompareViewTracker a={giantA.slug} b={giantB.slug} unlocked={unlocked} />

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start justify-center gap-4 sm:gap-6">
          <ScaleBar giant={giantA} scaleToM={scaleToM} />
          <div className="flex items-end pb-1" style={{ height: 160 }}>
            <span className="font-[family-name:var(--font-cinzel)] text-xs text-text-muted">
              vs
            </span>
          </div>
          <ScaleBar giant={giantB} scaleToM={scaleToM} />
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">
          Approximate visual only. Mythic heights are not measurements.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 pb-2 text-xs text-text-muted uppercase tracking-wide sm:grid-cols-[120px_1fr_1fr]">
          <span />
          <span className="truncate text-accent-gold">{giantA.name}</span>
          <span className="truncate text-accent-gold">{giantB.name}</span>
        </div>
        <dl>
          <Row label="Culture" a={giantA.culture} b={giantB.culture} />
          <Row label="Region" a={giantA.region} b={giantB.region} />
          <Row label="Type" a={formatType(giantA.type)} b={formatType(giantB.type)} />
          <Row
            label="Height"
            a={giantA.height ?? "Not recorded"}
            b={giantB.height ?? "Not recorded"}
          />
        </dl>

        <div className="mt-4">
          {unlocked && loreA && loreB ? (
            <dl>
              <Row label="Fate" a={loreA.fate} b={loreB.fate} />
            </dl>
          ) : (
            <PremiumLock
              variant="compare"
              next={`/compare?a=${encodeURIComponent(giantA.slug)}&b=${encodeURIComponent(giantB.slug)}`}
            />
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Shared threads
        </h2>
        {!unlocked ? (
          <div className="mt-4">
            <PremiumLock variant="later" laterText={PAYWALL_COPY.compareLater} />
          </div>
        ) : shared.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {shared.map((m) => (
              <li key={m.key} className="rounded border border-border p-3">
                <p className="text-sm text-accent-gold">{m.name}</p>
                <p className="mt-1 text-sm text-text-muted">{m.blurb}</p>
                <p className="mt-2 text-xs text-text-muted/80">
                  Carried by both {giantA.name} and {giantB.name}.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-text-muted">
            No shared motif between these two, at least none catalogued yet.
            That is not nothing: most pairs do not share one.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Mystery notes
        </h2>
        {unlocked && loreA && loreB ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <blockquote className="border-l-2 border-accent-gold/60 pl-3 font-serif text-sm italic leading-relaxed text-accent-gold">
              “{loreA.mysteryNote}”
            </blockquote>
            <blockquote className="border-l-2 border-accent-gold/60 pl-3 font-serif text-sm italic leading-relaxed text-accent-gold">
              “{loreB.mysteryNote}”
            </blockquote>
          </div>
        ) : (
          <div className="mt-4">
            <PremiumLock variant="later" laterText={PAYWALL_COPY.compareLater} />
          </div>
        )}
      </section>

      <div className="flex justify-center">
        <CompareExportButton
          a={{
            name: giantA.name,
            culture: giantA.culture,
            image: giantA.image,
            heightMeters: giantA.heightMeters,
            fate: unlocked ? loreA?.fate : undefined,
          }}
          b={{
            name: giantB.name,
            culture: giantB.culture,
            image: giantB.image,
            heightMeters: giantB.heightMeters,
            fate: unlocked ? loreB?.fate : undefined,
          }}
        />
      </div>
    </div>
  );
}
