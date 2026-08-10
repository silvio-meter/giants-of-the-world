import type { Metadata } from "next";
import {
  JourneyPageClient,
  type JourneyGiantMeta,
} from "@/components/JourneyPageClient";
import { getAllGiants } from "@/lib/giants";

export const metadata: Metadata = {
  title: "My Journey",
  description:
    "Private marks on giant entries: what unsettled you, what you were taught differently, what rule you still keep.",
  alternates: { canonical: "/journey" },
  robots: { index: false, follow: true },
};

export default function JourneyPage() {
  const giants: Record<string, JourneyGiantMeta> = {};
  for (const g of getAllGiants()) {
    giants[g.slug] = {
      slug: g.slug,
      name: g.name,
      culture: g.culture,
      coordinates: g.coordinates,
    };
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Private
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          My Journey
        </h1>
        <p className="mt-3 max-w-xl text-sm text-text-muted sm:text-base">
          Marks are private. They are not a collection score. They are a record
          of what held weight.
        </p>
      </header>
      <JourneyPageClient giants={giants} />
    </div>
  );
}
