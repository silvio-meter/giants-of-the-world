import type { Metadata } from "next";
import Link from "next/link";
import { ComparePicker } from "@/components/ComparePicker";
import { CompareResults } from "@/components/CompareResults";
import { getComparePickerOptions, getGiantBySlug } from "@/lib/giants";

/** Depends on plan and on which pair is requested — never statically cacheable. */
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { a, b } = await searchParams;
  const base: Metadata = {
    title: "Compare",
    description:
      "Set two giants side by side: scale, culture, fate, and the motifs they share.",
    alternates: { canonical: "/compare" },
    // File-based opengraph-image / twitter-image supply the 1200×630 card.
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Giants of the World",
      url: "/compare",
      title: "Compare Giants · Giants of the World",
      description:
        "Set two giants side by side: scale, culture, fate, and the motifs they share.",
    },
    twitter: {
      card: "summary_large_image",
      site: "@TheGiantsCodex",
      title: "Compare Giants · Giants of the World",
      description:
        "Set two giants side by side: scale, culture, fate, and the motifs they share.",
    },
  };
  // A specific pair is thin, near-duplicate content across ~1,600 possible
  // combinations — index the tool itself, not every result.
  if (a && b) {
    return { ...base, robots: { index: false, follow: true } };
  }
  return base;
}

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;
  const options = getComparePickerOptions();

  const giantA = sp.a ? getGiantBySlug(sp.a) : undefined;
  const giantB = sp.b ? getGiantBySlug(sp.b) : undefined;
  const bothValid = Boolean(giantA && giantB && giantA.slug !== giantB.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Set them side by side
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Compare
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Choose two giants. Scale, culture and region are always free; the
          fuller picture, including which traditions the pair actually
          shares, unlocks with any paid plan.
        </p>
      </header>

      <ComparePicker options={options} initialA={sp.a} initialB={sp.b} />

      {sp.a && sp.b && !bothValid && (
        <p className="mt-6 text-sm text-text-muted">
          One of those slugs was not recognised.{" "}
          <Link href="/compare" className="text-accent-gold hover:underline">
            Start over
          </Link>
        </p>
      )}

      {bothValid && giantA && giantB && (
        <div className="mt-8">
          <CompareResults giantA={giantA} giantB={giantB} />
        </div>
      )}
    </div>
  );
}
