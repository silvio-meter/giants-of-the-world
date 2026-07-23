import { Suspense } from "react";
import type { Metadata } from "next";
import { GiantCard } from "@/components/GiantCard";
import { CatalogueFilters } from "@/components/CatalogueFilters";
import {
  filterGiants,
  getCultures,
  getRegions,
  getTypes,
} from "@/lib/giants";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Browse giants by culture, type, region, or search.",
};

interface Props {
  searchParams: Promise<{
    culture?: string;
    type?: string;
    region?: string;
    q?: string;
  }>;
}

export default async function GiantsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const results = filterGiants({
    culture: sp.culture,
    type: sp.type,
    region: sp.region,
    search: sp.q,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          The codex
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Catalogue of Giants
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Filter by culture, type, or region. Search by name or tag.
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
          <p className="mt-2 text-sm text-text-muted/70">
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
