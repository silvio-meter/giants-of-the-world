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
  getTags,
  getTypes,
} from "@/lib/giants";

export const metadata: Metadata = {
  title: "World Map",
  description: "Dark interactive map of giants across the world.",
};

interface Props {
  searchParams: Promise<{
    focus?: string;
    culture?: string;
    type?: string;
    region?: string;
    tag?: string;
    fav?: string;
  }>;
}

export default async function MapPage({ searchParams }: Props) {
  const sp = await searchParams;
  const all = getAllGiants();
  const focusSlug = sp.focus?.trim() || null;
  const focusGiant = focusSlug ? getGiantBySlug(focusSlug) : undefined;

  const baseFiltered = filterGiants({
    culture: sp.culture,
    type: sp.type,
    region: sp.region,
    tag: sp.tag,
    requireCoordinates: true,
  });

  const favOnly = sp.fav === "1";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-6">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Geography of the large
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          World Map
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Pins mark traditional, literary, or reported associations - not
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

      <Suspense
        fallback={
          <div className="mb-6 h-24 animate-pulse rounded-lg border border-border bg-surface" />
        }
      >
        <MapFilters
          cultures={getCultures()}
          types={getTypes()}
          regions={getRegions()}
          tags={getTags()}
        />
      </Suspense>

      <MapClientShell
        giants={baseFiltered}
        allCount={all.filter((g) => g.coordinates).length}
        focusSlug={focusSlug}
        favOnly={favOnly}
      />
    </div>
  );
}
