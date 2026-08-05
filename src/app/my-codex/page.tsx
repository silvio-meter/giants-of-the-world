import type { Metadata } from "next";
import Link from "next/link";
import { canUseFavourites, canViewFullDescription } from "@/lib/access";
import { completionByCulture, fogBand, overallCompletion } from "@/lib/codex";
import { getComparisonsMade } from "@/lib/comparisons";
import { getDiscoveredSlugs } from "@/lib/discovery";
import { getFavouriteSlugs } from "@/lib/favourites-server";
import { getAllGiants, getCultures } from "@/lib/giants";
import { sharedMotifsAmong } from "@/lib/motifs";
import { getProfile } from "@/lib/profile";
import { MotifSeal } from "@/components/MotifSeal";
import { PremiumLock } from "@/components/PremiumLock";

/** Private page: per-user progress, rendered per request, never indexed. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Codex",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
        My Codex
      </h1>
      {children}
    </div>
  );
}

export default async function MyCodexPage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <Shell>
        <p className="mt-4 text-sm text-text-muted">
          Sign in to track how much of the codex you have uncovered.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/login?next=/my-codex" className="text-accent-gold hover:underline">
            Sign in
          </Link>
          <Link href="/pricing" className="text-accent-gold hover:underline">
            View pricing
          </Link>
        </div>
      </Shell>
    );
  }

  const allGiants = getAllGiants();
  const discoveredSlugs = await getDiscoveredSlugs(profile.id);
  const overall = overallCompletion(allGiants, discoveredSlugs);
  const band = fogBand(overall.percent);

  const unlockedBreakdown = canViewFullDescription(profile.plan);
  const byCulture = unlockedBreakdown
    ? completionByCulture(allGiants, getCultures(), discoveredSlugs)
    : [];

  const unlockedCollection = canUseFavourites(profile.plan);
  const favouriteSlugs = unlockedCollection ? await getFavouriteSlugs(profile.id) : [];
  const seals = unlockedCollection ? sharedMotifsAmong(favouriteSlugs) : [];

  const comparisonsMade = await getComparisonsMade(profile.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Your progress through the archive
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          My Codex
        </h1>
      </header>

      <section className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            {band.label}
          </p>
          <p className="font-mono text-sm text-text-muted">
            {overall.discovered} / {overall.total} · {overall.percent}%
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-gold/40 to-accent-gold transition-[width]"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-text-muted">{band.description}</p>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          By culture
        </h2>
        {unlockedBreakdown ? (
          <dl className="mt-4 space-y-3">
            {byCulture.map((c) => {
              const pct = c.total === 0 ? 0 : Math.round((c.discovered / c.total) * 100);
              return (
                <div key={c.culture}>
                  <div className="flex items-baseline justify-between text-sm">
                    <dt className="text-text-primary/90">{c.culture}</dt>
                    <dd className="font-mono text-xs text-text-muted">
                      {c.discovered} / {c.total}
                    </dd>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-accent-gold/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </dl>
        ) : (
          <div className="mt-4">
            <PremiumLock label="Unlock the per-culture breakdown" />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Personal collection
        </h2>
        {unlockedCollection ? (
          <>
            <p className="mt-3 text-sm text-text-muted">
              {favouriteSlugs.length === 0 ? (
                "No giants saved yet."
              ) : (
                <>
                  <span className="font-mono text-xs">{favouriteSlugs.length}</span> giants
                  saved.{" "}
                  <Link href="/favourites" className="text-accent-gold hover:underline">
                    View your shelf →
                  </Link>
                </>
              )}
            </p>
            {seals.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-text-muted">
                  Motif seals: unlocked when two or more saved giants share a tradition.
                </p>
                <div className="mt-4 flex flex-wrap gap-5">
                  {seals.map((m) => (
                    <MotifSeal key={m.key} motif={m} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4">
            <PremiumLock label="Unlock your personal collection and motif seals" />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Comparisons made
        </h2>
        <p className="mt-3 text-2xl text-text-primary">{comparisonsMade}</p>
        <p className="mt-1 text-xs text-text-muted">
          <Link href="/compare" className="text-accent-gold hover:underline">
            Compare two giants →
          </Link>
        </p>
      </section>
    </div>
  );
}
