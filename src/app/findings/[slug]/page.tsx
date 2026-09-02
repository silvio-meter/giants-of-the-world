import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findingUrlSlug,
  getFindingBySlug,
  getGiantBySlug,
  getShippedFindingSlugs,
  isShippedFindingSlug,
} from "@/lib/giants";
import {
  getFindingSeo,
  getFindingSeeAlsoSlug,
} from "@/lib/finding-seo";
import type { Finding, FindingCategory } from "@/lib/types";
import { FreeBadge } from "@/components/FreeBadge";
import { ChainOfCustody } from "@/components/ChainOfCustody";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { siteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

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

export function generateStaticParams() {
  return getShippedFindingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isShippedFindingSlug(slug)) return { title: "Not found" };
  const finding = getFindingBySlug(slug);
  const seo = getFindingSeo(slug);
  if (!finding || !seo) return { title: "Not found" };

  const title = seo.title;
  const description = seo.description;
  const path = `/findings/${slug}`;
  const shareTitle = `${title} · Giants of the World`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: "Giants of the World",
      url: path,
      title: shareTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      site: "@TheGiantsCodex",
      title: shareTitle,
      description,
    },
  };
}

export default async function FindingDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!isShippedFindingSlug(slug)) notFound();
  const finding = getFindingBySlug(slug);
  const seo = getFindingSeo(slug);
  if (!finding || !seo) notFound();

  const urlSlug = findingUrlSlug(finding);
  const cat = categoryStyle[finding.category];
  const visual = resolveFindingVisual(finding);
  const relatedGiant = finding.relatedGiantSlug
    ? getGiantBySlug(finding.relatedGiantSlug)
    : undefined;
  const seeAlsoSlug = getFindingSeeAlsoSlug(slug);
  const seeAlso = seeAlsoSlug ? getFindingBySlug(seeAlsoSlug) : undefined;
  const seeAlsoSeo = seeAlsoSlug ? getFindingSeo(seeAlsoSlug) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${siteUrl}/findings/${urlSlug}#article`,
        headline: seo.h1,
        description: seo.description,
        about: {
          "@type": "Thing",
          name: seo.h1,
        },
        image: visual.src ? `${siteUrl}${visual.src}` : undefined,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Giants of the World",
          url: siteUrl,
        },
        citation: finding.sources,
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Findings",
            item: `${siteUrl}/findings`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: seo.h1,
            item: `${siteUrl}/findings/${urlSlug}`,
          },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 text-sm text-text-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="shrink-0 hover:text-accent-gold">
          Home
        </Link>
        <span className="opacity-40" aria-hidden>
          /
        </span>
        <Link href="/findings" className="shrink-0 hover:text-accent-gold">
          Findings
        </Link>
        <span className="opacity-40" aria-hidden>
          /
        </span>
        <span className="min-w-0 truncate text-text-primary">{seo.h1}</span>
      </nav>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="grid sm:grid-cols-[minmax(0,280px)_1fr]">
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
                  finding.verified
                    ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-200"
                    : "border-border text-text-muted"
                }`}
              >
                {finding.verified ? "Status known" : "Unverified"}
              </span>
            </div>

            <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
              {seo.h1}
            </h1>

            {(finding.year || finding.location) && (
              <p className="mt-2 font-mono text-xs text-text-muted">
                {[finding.year, finding.location].filter(Boolean).join(" · ")}
              </p>
            )}

            <p className="mt-4 text-sm font-medium text-text-primary/90 sm:text-base">
              {finding.summary}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {finding.detail}
            </p>

            {finding.sources.length > 0 && (
              <p className="mt-5 font-mono text-[11px] text-text-muted/80">
                Sources: {finding.sources.join("; ")}
              </p>
            )}

            {finding.chain && (
              <ChainOfCustody
                slug={finding.id}
                endpoint="/api/chain"
                summary={{
                  claim: finding.chain.claim,
                  verdict: finding.chain.verdict,
                  rungCount: finding.chain.rungs.length,
                }}
              />
            )}

            {finding.relatedGiantSlug && relatedGiant && (
              <span className="mt-5 flex items-center gap-2">
                <Link
                  href={`/giants/${finding.relatedGiantSlug}`}
                  className="inline-block text-sm text-accent-gold hover:underline"
                >
                  Related giant entry →
                </Link>
                <FreeBadge freeEntry={relatedGiant.freeEntry} />
              </span>
            )}

            {seeAlso && seeAlsoSlug && (
              <p className="mt-5 text-sm text-text-muted">
                See also:{" "}
                <Link
                  href={`/findings/${seeAlsoSlug}`}
                  className="text-accent-gold underline underline-offset-2 hover:text-accent-gold/80"
                >
                  {seeAlsoSeo?.h1 ?? seeAlso.title}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm">
        <Link
          href="/findings"
          className="text-accent-gold underline underline-offset-2 hover:text-accent-gold/80"
        >
          Back to Bones & Shadows
        </Link>
      </p>
    </article>
  );
}
