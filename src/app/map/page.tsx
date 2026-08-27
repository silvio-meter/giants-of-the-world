import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapClientShell } from "@/components/MapClientShell";
import { MapFilters } from "@/components/MapFilters";
import {
  filterGiants,
  getAllGiants,
  getCultures,
  getGiantBySlug,
  getRegions,
  getTypes,
} from "@/lib/giants";
import { canUseMapFilters } from "@/lib/access";
import { motifChains } from "@/lib/map-connections";
import { getAllMotifs, motifFilterOptions } from "@/lib/motifs";
import { getUserPlan } from "@/lib/profile";
import { MyJourneyButton } from "@/components/MyJourneyButton";
import { PremiumLock } from "@/components/PremiumLock";
import { PAYWALL_COPY, isFolkloreNoCheckout } from "@/lib/paywall-copy";

export const metadata: Metadata = {
  title: "World Map",
  description: "Dark interactive map of giants across the world.",
  alternates: { canonical: "/map" },
  // File-based opengraph-image / twitter-image supply the 1200×630 card.
  // Title and description still need to be set here: without them X inherits
  // the root layout ("Giants of the World" + featured.jpg pairing).
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/map",
    title: "World Map · Giants of the World",
    description:
      "Pins mark traditional, literary, or reported associations of giants across the earth.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: "World Map · Giants of the World",
    description:
      "Pins mark traditional, literary, or reported associations of giants across the earth.",
  },
};

interface Props {
  searchParams: Promise<{
    focus?: string;
    culture?: string;
    type?: string;
    region?: string;
    motif?: string;
    fav?: string;
    lines?: string;
  }>;
}

export default async function MapPage({ searchParams }: Props) {
  const sp = await searchParams;
  const all = getAllGiants();
  const focusSlug = sp.focus?.trim() || null;
  const focusGiant = focusSlug ? getGiantBySlug(focusSlug) : undefined;

  /**
   * Advertised as a paid tool, so enforce it here rather than only hiding the
   * controls. Previously any visitor could apply them by typing /map?culture=…
   *
   * Focus is not gated: it is how a giant's own page links to the map.
   */
  const plan = await getUserPlan();
  const filtersUnlocked = canUseMapFilters(plan);

  const baseFiltered = filterGiants({
    culture: filtersUnlocked ? sp.culture : undefined,
    type: filtersUnlocked ? sp.type : undefined,
    region: filtersUnlocked ? sp.region : undefined,
    motif: filtersUnlocked ? sp.motif : undefined,
    requireCoordinates: true,
  });

  const favOnly = filtersUnlocked && sp.fav === "1";
  const motifNames = Object.fromEntries(
    getAllMotifs().map((m) => [m.key, m.name])
  );

  /**
   * Which motifs actually have two or more located giants right now (so the
   * picker never offers a motif with nothing to draw), most-connected first.
   * The single most-connected one is selected by default — otherwise a
   * first-time visitor sees every motif's lines at once, an unreadable
   * hairball across ~20 colors.
   */
  const lineMotifOptions = (filtersUnlocked ? motifChains(baseFiltered) : [])
    .map((c) => ({
      key: c.key,
      name: motifNames[c.key] ?? c.key,
      count: c.points.length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const selectedLineMotifs = filtersUnlocked
    ? sp.lines !== undefined
      ? sp.lines
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : lineMotifOptions.slice(0, 1).map((m) => m.key)
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-6">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Geography of the large
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          World Map
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Pins mark traditional, literary, or reported associations, not
          archaeological proof. Click a marker to open the entry.
        </p>
        {focusGiant && (
          <p className="mt-3 text-sm text-text-muted">
            Highlighted:{" "}
            <Link
              href={`/giants/${focusGiant.slug}`}
              className="text-accent-gold hover:underline"
            >
              {focusGiant.name}
            </Link>
            {" · "}
            <Link
              href="/map"
              className="text-text-muted hover:text-accent-gold"
            >
              Clear focus
            </Link>
          </p>
        )}
      </header>

      {/*
        Curated connection stories. lines= draws motif edges; motif= also
        filters pins to that motif when map filters are unlocked (paid). Free
        visitors still get focus + the full pin set. Motif lines stay off until paid.
      */}
      <section className="mb-6 rounded-lg border border-border bg-surface/60 p-4">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.25em] text-accent-gold/80 uppercase">
          Tours
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[
            {
              key: "one-eye",
              label: "One eye",
              blurb: "Polyphemus, Balor, and the single gaze",
            },
            {
              key: "body-cosmogony",
              label: "World from a body",
              blurb: "Primordial flesh made into land and sky",
            },
            {
              key: "flood-survivor",
              label: "Flood survivors",
              blurb: "Who walked out of the deluge",
            },
            {
              key: "pre-people",
              label: "People before people",
              blurb: "Earlier races of the large",
            },
          ].map((tour) => (
            <li key={tour.key}>
              <Link
                href={
                  filtersUnlocked
                    ? `/map?motif=${encodeURIComponent(tour.key)}&lines=${encodeURIComponent(tour.key)}`
                    : `/map?lines=${encodeURIComponent(tour.key)}`
                }
                className="group flex max-w-[14rem] flex-col rounded border border-border px-3 py-2 transition hover:border-accent-gold/50"
                title={tour.blurb}
              >
                <span className="text-xs text-accent-gold group-hover:underline">
                  {tour.label}
                </span>
                <span className="mt-0.5 text-[10px] leading-snug text-text-muted">
                  {tour.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>


      {!filtersUnlocked && (
        <div className="mb-6">
          {focusSlug && isFolkloreNoCheckout(focusSlug) ? (
            <div className="rounded-lg border border-border bg-background/80 px-4 py-4 text-center sm:px-5 sm:py-5">
              <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-text-primary">
                {PAYWALL_COPY.folkloreHeadline}
              </p>
              <p className="mt-1.5 text-sm text-text-muted">
                <Link
                  href="/evidence"
                  className="text-accent-gold hover:underline"
                >
                  {PAYWALL_COPY.folkloreBody}
                </Link>
              </p>
            </div>
          ) : (
            <PremiumLock
              variant="map"
              next={
                focusSlug
                  ? `/map?focus=${encodeURIComponent(focusSlug)}`
                  : "/map"
              }
            />
          )}
        </div>
      )}

      <Suspense
        fallback={
          <div className="mb-6 h-24 animate-pulse rounded-lg border border-border bg-surface" />
        }
      >
        <MapFilters
          cultures={getCultures()}
          types={getTypes()}
          regions={getRegions()}
          motifs={motifFilterOptions()}
          lineMotifOptions={lineMotifOptions}
          selectedLineMotifs={selectedLineMotifs}
        />
      </Suspense>

      <MapClientShell
        giants={baseFiltered}
        allCount={all.filter((g) => g.coordinates).length}
        focusSlug={focusSlug}
        favOnly={favOnly}
        selectedLineMotifs={selectedLineMotifs}
        motifNames={motifNames}
      />

      <div className="mt-6 flex justify-center">
        <MyJourneyButton />
      </div>
    </div>
  );
}
