import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatType,
  getAllGiants,
  getGiantBySlug,
  getRelatedGiants,
} from "@/lib/giants";
import { getGiantLore } from "@/lib/giants-lore";
import { getFirstSentence, getFreePreview, hasMoreContent } from "@/lib/content";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { FullDescription } from "@/components/FullDescription";
import { LockedLore } from "@/components/LockedLore";
import { FavouriteButton } from "@/components/FavouriteButton";
import { SizeComparison } from "@/components/SizeComparison";
import { ChainOfCustody } from "@/components/ChainOfCustody";
import { EmailCapture } from "@/components/EmailCapture";
import { DiscoveryTracker } from "@/components/DiscoveryTracker";
import { ScholarlyNotesSection } from "@/components/ScholarlyNotesSection";
import { GlossaryText } from "@/components/GlossaryText";
import { EntryLocationMapLoader } from "@/components/EntryLocationMapLoader";
import { SourcesSection } from "@/components/SourcesSection";
import { JourneyMarks } from "@/components/JourneyMarks";
import { siteUrl } from "@/lib/site";
import { resolveMotifs } from "@/lib/motifs";
import { getEntrySeo } from "@/lib/seo-entries";
import { isFolkloreNoCheckout } from "@/lib/paywall-copy";

/**
 * Statically prerendered. The page contains no per-user content: open entries
 * render their lore inline, paywalled ones ship only the preview and let
 * <LockedLore> fetch the rest through a server-checked route.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGiants().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const giant = getGiantBySlug(slug);
  if (!giant) return { title: "Not found" };

  // Images: opengraph-image.tsx + twitter-image.tsx under this segment emit
  // fixed 1200×630 PNGs. Do not also set openGraph.images / twitter.images to
  // the catalogue JPG — a second tag (or a shallow merge with the root
  // featured.jpg) is how X cards end up showing the site-wide art instead of
  // the giant. Title/description still must be set here: file-based images do
  // not carry those fields, and Next only merges twitter/openGraph one level.
  //
  // A few high-demand slugs override title/description for search and share
  // text only. The visible H1 and basic account stay on the catalogue fields.
  const seo = getEntrySeo(giant.slug);
  const title = seo?.title ?? giant.name;
  const description = seo?.description ?? giant.shortDescription;
  const shareTitle = `${title} · Giants of the World`;

  return {
    title,
    description,
    alternates: { canonical: `/giants/${giant.slug}` },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: "Giants of the World",
      url: `/giants/${giant.slug}`,
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

export default async function GiantDetailPage({ params }: Props) {
  const { slug } = await params;
  const giant = getGiantBySlug(slug);
  if (!giant) notFound();

  const lore = getGiantLore(giant.slug);
  if (!lore) notFound();

  const freePreview = getFreePreview(lore.fullDescription);
  const hasMore = hasMoreContent(lore.fullDescription, lore.mysteryNote);
  // First sentence only — free HTML never carries the rest of disputed.
  const disputedTeaser = getFirstSentence(lore.sections?.disputed);

  const motifs = resolveMotifs(giant.motifs, giant.slug);
  const motifNames = motifs.map((m) => m.name);
  const related = getRelatedGiants(giant);
  const isModern = giant.type === "modern-legend";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${siteUrl}/giants/${giant.slug}#article`,
        headline: giant.name,
        description: giant.shortDescription,
        about: {
          "@type": "Thing",
          name: giant.name,
          alternateName: giant.alsoKnownAs,
        },
        image: giant.image ? `${siteUrl}${giant.image}` : undefined,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Giants of the World",
          url: siteUrl,
        },
        keywords: [giant.culture, giant.region, ...giant.tags].join(", "),
        citation: giant.sources,
        // Paywall markup: tells Google the page is intentionally partial
        // rather than cloaked. Open entries declare themselves fully free.
        isAccessibleForFree: giant.freeEntry,
        ...(giant.freeEntry
          ? {}
          : {
              hasPart: {
                "@type": "WebPageElement",
                isAccessibleForFree: false,
                cssSelector: ".paywalled-account",
              },
            }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Catalogue",
            item: `${siteUrl}/giants`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: giant.name,
            item: `${siteUrl}/giants/${giant.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DiscoveryTracker slug={giant.slug} />
      <nav className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 text-sm text-text-muted">
        <Link href="/giants" className="shrink-0 hover:text-accent-gold">
          Catalogue
        </Link>
        <span className="opacity-40" aria-hidden>
          /
        </span>
        <span className="min-w-0 truncate text-text-primary">{giant.name}</span>
      </nav>

      <div className="mb-8 w-full max-w-full">
        <ImagePlaceholder
          src={giant.image}
          alt={giant.imageAlt}
          size="detail"
          priority
        />
      </div>

      <header>
        <div className="flex flex-wrap items-center gap-2 text-xs tracking-wider text-text-muted uppercase">
          <span className="text-accent-gold">{giant.culture}</span>
          <span aria-hidden>·</span>
          <span>{giant.region}</span>
          <span aria-hidden>·</span>
          <span className="rounded border border-border px-2 py-0.5">
            <GlossaryText text={formatType(giant.type)} />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="min-w-0 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl md:text-5xl">
            {giant.name}
          </h1>
          <FavouriteButton
            slug={giant.slug}
            name={giant.name}
            variant="detail"
          />
        </div>
        {giant.alsoKnownAs.length > 0 && (
          <p className="mt-2 text-sm text-text-muted">
            Also known as: {giant.alsoKnownAs.join(", ")}
          </p>
        )}
        <div className="mt-4">
          <p className="text-[10px] tracking-[0.25em] text-text-muted uppercase">
            Basic account
          </p>
          <p className="mt-2 text-lg leading-relaxed text-text-primary/90">
            {giant.shortDescription}
          </p>
        </div>
      </header>

      {isModern && (
        <div
          className="mt-6 rounded border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90"
          role="note"
        >
          {/*
            statusLine overrides the default claim where "modern legend" is
            not what the entry is actually saying. si-te-cah is a nineteenth
            century written account that later grew into a giant story, so
            calling it a modern legend would misdescribe it.
          */}
          <strong className="font-medium text-amber-200">
            {giant.statusLine ?? "Unverified modern legend."}
          </strong>{" "}
          This entry is circulating oral tradition, not confirmed fact. No
          official records corroborate the account.{" "}
          {/*
            The primary placement for the evidence page. This is the exact
            moment a reader is being told something is not confirmed, so it is
            where the question "how do you decide that?" actually occurs to
            them.
          */}
          <Link
            href="/evidence"
            className="text-amber-200 underline underline-offset-2 hover:text-amber-100"
          >
            How this archive treats evidence
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div className="paywalled-account">
          {giant.freeEntry ? (
            <FullDescription
              fullDescription={lore.fullDescription}
              mysteryNote={lore.mysteryNote}
              sections={lore.sections}
              motifs={motifs}
              restrained={giant.restrained}
              heading="Account"
            />
          ) : (
            <LockedLore
              slug={giant.slug}
              motifs={motifs}
              motifNames={motifNames}
              disputedTeaser={disputedTeaser}
              freePreview={freePreview}
              hasMore={hasMore}
            />
          )}

          <SourcesSection sources={giant.sources} freeEntry={giant.freeEntry} />

          {/*
            Below the sources block and outside the paywalled account on
            purpose. This is an offer to withdraw material at a community's
            request, and an offer a reader has to pay to discover is not an
            offer. It renders identically whether or not anyone is signed in.
          */}
          {giant.communityNote && (
            <section className="mt-8 rounded border border-border bg-surface/60 px-4 py-3">
              <p className="text-sm leading-relaxed text-text-muted">
                {giant.communityNote}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <dl className="rounded-lg border border-border bg-surface p-4 text-sm">
            {giant.height && (
              <div className="border-b border-border pb-3">
                <dt className="text-xs text-text-muted">Height (tradition)</dt>
                <dd className="mt-1 text-text-primary">
                  <GlossaryText text={giant.height} />
                </dd>
              </div>
            )}
            {giant.coordinates && (
              <div className="border-b border-border py-3">
                <dt className="text-xs text-text-muted">Location</dt>
                <dd className="mt-2">
                  <EntryLocationMapLoader
                    coordinates={giant.coordinates}
                    name={giant.name}
                  />
                </dd>
                <dd className="mt-2 font-mono text-xs text-text-primary">
                  {giant.coordinates[0].toFixed(2)},{" "}
                  {giant.coordinates[1].toFixed(2)}
                </dd>
                <p className="mt-1 text-[10px] leading-snug text-text-muted/80">
                  Map pin from catalogue coordinates, not a photograph of the
                  site.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/map?focus=${encodeURIComponent(giant.slug)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded border border-accent-gold/50 bg-accent-gold/10 px-3 py-2 text-xs font-medium tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/20"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full bg-accent-gold shadow-[0_0_6px_rgba(201,162,39,0.9)]"
                    />
                    Open full map
                  </Link>
                  <Link
                    href="/near"
                    className="text-center text-[11px] text-text-muted hover:text-accent-gold"
                  >
                    Giants near a place you choose
                  </Link>
                </div>
              </div>
            )}
            {giant.tags.length > 0 && (
              <div className="pt-3">
                <dt className="text-xs text-text-muted">Tags</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {giant.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border px-2 py-0.5 text-[10px] tracking-wide text-text-muted"
                    >
                      <GlossaryText text={t} />
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <SizeComparison giant={giant} freeEntry={giant.freeEntry} />

          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] tracking-[0.2em] text-text-muted uppercase">
              Compare
            </p>
            {related.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {related.slice(0, 4).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/compare?a=${encodeURIComponent(giant.slug)}&b=${encodeURIComponent(r.slug)}`}
                      className="block text-xs text-accent-gold hover:underline"
                    >
                      vs {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href={`/compare?a=${encodeURIComponent(giant.slug)}`}
              className="mt-2 flex items-center justify-center gap-2 rounded border border-border px-3 py-2 text-xs font-medium tracking-wide text-text-muted transition hover:border-accent-gold/50 hover:text-accent-gold"
            >
              {related.length > 0 ? "Pick any other…" : "Compare with another giant"}
            </Link>
          </div>
        </aside>
      </div>

      {giant.hasScholarlyNotes && <ScholarlyNotesSection slug={giant.slug} />}

      {giant.chainSummary && (
        <ChainOfCustody slug={giant.slug} summary={giant.chainSummary} />
      )}

      <JourneyMarks
        slug={giant.slug}
        allowCheckout={!giant.freeEntry && !isFolkloreNoCheckout(giant.slug)}
      />

      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            Related giants
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/giants/${r.slug}`}
                  className="flex gap-3 overflow-hidden rounded-lg border border-border bg-surface transition hover:border-accent-gold/40"
                >
                  {r.image ? (
                    <span className="relative h-20 w-20 shrink-0 bg-[#0a0e14]">
                      <Image
                        src={r.image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 px-3 py-3">
                    <span className="font-[family-name:var(--font-cinzel)] text-accent-gold">
                      {r.name}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {r.culture} · {r.shortDescription.slice(0, 80)}
                      {r.shortDescription.length > 80 ? "..." : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
        Bottom of the entry, on every entry, free and paid alike.
        On a paid entry this sits well below the paywall block, so the buy ask
        is always seen before the email ask. Someone who hits the paywall is a
        better capture candidate than someone who finished a free entry, which
        is why it is not restricted to free entries.
      */}
      <div className="mt-14 border-t border-border pt-10">
        <EmailCapture variant="detail" sourcePage="entry" />
      </div>
    </article>
  );
}
