import type { Metadata } from "next";
import Link from "next/link";
import {
  findingUrlSlug,
  getAllFindings,
  getGiantBySlug,
  isShippedFindingSlug,
} from "@/lib/giants";
import type { Finding, FindingCategory } from "@/lib/types";
import { FreeBadge } from "@/components/FreeBadge";
import { ChainOfCustody } from "@/components/ChainOfCustody";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export const metadata: Metadata = {
  title: "Bones & Shadows",
  description:
    "Archaeological claims, hoaxes, and modern legends, clearly labelled.",
  alternates: { canonical: "/findings" },
  // File-based opengraph-image / twitter-image supply the 1200×630 card.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/findings",
    title: "Bones & Shadows · Giants of the World",
    description:
      "Archaeological claims, hoaxes, and modern legends, clearly labelled.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: "Bones & Shadows · Giants of the World",
    description:
      "Archaeological claims, hoaxes, and modern legends, clearly labelled.",
  },
};

const categoryStyle: Record<
  FindingCategory,
  { label: string; className: string }
> = {
  archaeological: {
    label: "Archaeological context",
    className: "border-sky-800/60 bg-sky-950/40 text-sky-200",
  },
  claim: {
    label: "Unverified claim",
    className: "border-amber-800/60 bg-amber-950/40 text-amber-200",
  },
  hoax: {
    label: "Hoax / fraud",
    className: "border-rose-800/60 bg-rose-950/40 text-rose-200",
  },
  "modern-legend": {
    label: "Modern legend",
    className: "border-violet-800/60 bg-violet-950/40 text-violet-200",
  },
};

/**
 * Prefer a documentary finding image; otherwise the related entry's art as a
 * visual handle (never pretend it is evidence of the claim).
 */
function resolveFindingVisual(f: Finding): {
  src: string;
  alt: string;
  credit?: string;
  isEntryArt: boolean;
} {
  if (f.image) {
    return {
      src: f.image,
      alt: f.imageAlt || f.title,
      credit: f.imageCredit,
      isEntryArt: false,
    };
  }
  if (f.relatedGiantSlug) {
    const g = getGiantBySlug(f.relatedGiantSlug);
    if (g?.image) {
      return {
        src: g.image,
        alt: g.imageAlt || g.name,
        credit: `Catalogue art for ${g.name} (illustration, not a photograph of the claim)`,
        isEntryArt: true,
      };
    }
  }
  return {
    src: "",
    alt: f.title,
    isEntryArt: false,
  };
}

export default function FindingsPage() {
  const findings = getAllFindings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Evidence & rumor
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Bones & Shadows
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Claims, hoaxes, and modern military legends live here under clear
          labels. Mystery is welcome; misrepresentation is not. Verified hoaxes
          are marked as such. Unverified stories stay unverified. Where a
          period photograph exists under a clear licence, it is shown; elsewhere
          you see catalogue art or mist, never a generated fake of a site.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/evidence"
            className="text-accent-gold underline underline-offset-2 hover:text-accent-gold/80"
          >
            How this archive treats evidence
          </Link>
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2 text-[10px] tracking-wide uppercase">
        {Object.values(categoryStyle).map((c) => (
          <span
            key={c.label}
            className={`rounded border px-2 py-1 ${c.className}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <ul className="space-y-8">
        {findings.map((f) => {
          const cat = categoryStyle[f.category];
          const visual = resolveFindingVisual(f);
          const permalink = findingUrlSlug(f);
          const shipped = isShippedFindingSlug(permalink);
          return (
            <li
              key={f.id}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="grid sm:grid-cols-[minmax(0,240px)_1fr]">
                <div className="relative border-b border-border sm:border-b-0 sm:border-r">
                  <ImagePlaceholder
                    src={visual.src}
                    alt={visual.alt}
                    size="card"
                    className="rounded-none border-0"
                  />
                  {visual.credit && (
                    <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 font-mono text-[9px] leading-snug text-text-muted/90">
                      {visual.isEntryArt ? "Related entry art · " : ""}
                      {visual.credit}
                    </p>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] tracking-wide uppercase ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] tracking-wide uppercase ${
                        f.verified
                          ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-200"
                          : "border-border text-text-muted"
                      }`}
                    >
                      {f.verified ? "Status known" : "Unverified"}
                    </span>
                  </div>
                  <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-xl tracking-wide text-text-primary">
                    {shipped ? (
                      <Link
                        href={`/findings/${permalink}`}
                        className="hover:text-accent-gold hover:underline"
                      >
                        {f.title}
                      </Link>
                    ) : (
                      f.title
                    )}
                  </h2>
                  {(f.year || f.location) && (
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      {[f.year, f.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-medium text-text-primary/90">
                    {f.summary}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {f.detail}
                  </p>
                  {f.sources.length > 0 && (
                    <p className="mt-4 font-mono text-[11px] text-text-muted/80">
                      Sources: {f.sources.join("; ")}
                    </p>
                  )}
                  {f.chain && (
                    <ChainOfCustody
                      slug={f.id}
                      endpoint="/api/chain"
                      summary={{
                        claim: f.chain.claim,
                        verdict: f.chain.verdict,
                        rungCount: f.chain.rungs.length,
                      }}
                    />
                  )}
                  {f.relatedGiantSlug && (
                    <span className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/giants/${f.relatedGiantSlug}`}
                        className="inline-block text-sm text-accent-gold hover:underline"
                      >
                        Related giant entry →
                      </Link>
                      <FreeBadge
                        freeEntry={
                          getGiantBySlug(f.relatedGiantSlug)?.freeEntry ?? false
                        }
                      />
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
