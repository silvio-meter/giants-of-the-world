import type { Metadata } from "next";
import Link from "next/link";
import { GiantsMapLoader } from "@/components/GiantsMapLoader";
import {
  getAllGiants,
  getGiantBySlug,
  getGiantsWithCoordinates,
} from "@/lib/giants";

export const metadata: Metadata = {
  title: "World Map",
  description: "Dark interactive map of giants across the world.",
};

interface Props {
  searchParams: Promise<{ focus?: string }>;
}

export default async function MapPage({ searchParams }: Props) {
  const sp = await searchParams;
  const all = getAllGiants();
  const located = getGiantsWithCoordinates();
  const focusSlug = sp.focus?.trim() || null;
  const focusGiant = focusSlug ? getGiantBySlug(focusSlug) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Geography of the large
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          World Map
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Pins mark traditional, literary, or reported associations - not
          archaeological proof. Click a marker to open the entry.{" "}
          <span className="font-mono text-xs">
            {located.length} of {all.length} with coordinates
          </span>
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
            <Link href="/map" className="text-text-muted hover:text-accent-gold">
              Clear focus
            </Link>
          </p>
        )}
      </header>

      <GiantsMapLoader giants={all} focusSlug={focusSlug} />
    </div>
  );
}
