import { Suspense } from "react";
import type { Metadata } from "next";
import { GiantCard } from "@/components/GiantCard";
import { CatalogueFilters } from "@/components/CatalogueFilters";
import {
  filterGiants,
  getCultures,
  getRegions,
  getTypes,
  type GiantSort,
} from "@/lib/giants";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Browse giants by culture, type, region, or search.",
  alternates: { canonical: "/giants" },
  // File-based opengraph-image / twitter-image supply the 1200x630 card.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/giants",
    title: "Catalogue · Giants of the World",
    description: "Browse giants by culture, type, region, or search.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: "Catalogue · Giants of the World",
    description: "Browse giants by culture, type, region, or search.",
  },
};

const SORTS = new Set<GiantSort>([
  "name",
  "culture",
  "free-first",
  "scholarly-first",
]);

interface Props {
  searchParams: Promise<{
    culture?: string;
    type?: string;
    region?: string;
    q?: string;
    free?: string;
    scholarly?: string;
    chain?: string;
    sort?: string;
  }>;
}

export default async function GiantsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = SORTS.has(sp.sort as GiantSort)
    ? (sp.sort as GiantSort)
    : "name";
  const results = filterGiants({
    culture: sp.culture,
    type: sp.type,
    region: sp.region,
    search: sp.q,
    free: sp.free === "1",
    scholarly: sp.scholarly === "1",
    chain: sp.chain === "1",
    sort,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          The codex
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Catalogue of Giants
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Filter by culture, type, region, free access, scholarly notes, or
          chain of custody. Search by name or tag.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="mb-8 h-24 animate-pulse rounded-lg border border-border bg-surface" />
        }
      >
        <CatalogueFilters
          cultures={getCultures()}
          types={getTypes()}
          regions={getRegions()}
        />
      </Suspense>

      <p className="mt-6 mb-4 font-mono text-xs text-text-muted">
        {results.length} {results.length === 1 ? "entry" : "entries"}
      </p>

      {results.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <p className="text-text-muted">No giants match these filters.</p>
          <p className="mt-2 text-sm text-text-muted">
            Clear the fog and try again.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((giant, i) => (
            <GiantCard key={giant.id} giant={giant} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
