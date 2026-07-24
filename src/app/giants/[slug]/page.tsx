import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatType,
  getAllGiants,
  getGiantBySlug,
  getRelatedGiants,
} from "@/lib/giants";
import { getGiantLore } from "@/lib/giants-lore";
import { getFreePreview, hasMoreContent } from "@/lib/content";
import { canViewFullDescription } from "@/lib/access";
import { getUserPlan } from "@/lib/profile";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { FullDescription } from "@/components/FullDescription";
import { FavouriteButton } from "@/components/FavouriteButton";
import { SizeComparison } from "@/components/SizeComparison";

/** Per-request plan check — do not bake full lore into static HTML. */
export const dynamic = "force-dynamic";

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
  return {
    title: giant.name,
    description: giant.shortDescription,
    openGraph: {
      title: `${giant.name} · Giants of the World`,
      description: giant.shortDescription,
      images: giant.image ? [{ url: giant.image }] : undefined,
    },
  };
}

export default async function GiantDetailPage({ params }: Props) {
  const { slug } = await params;
  const giant = getGiantBySlug(slug);
  if (!giant) notFound();

  const lore = getGiantLore(giant.slug);
  if (!lore) notFound();

  const plan = await getUserPlan();
  const unlocked = canViewFullDescription(plan);
  const freePreview = getFreePreview(lore.fullDescription);
  const hasMore = hasMoreContent(lore.fullDescription, lore.mysteryNote);

  const related = getRelatedGiants(giant);
  const isModern = giant.type === "modern-legend";

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
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
            {formatType(giant.type)}
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
          <strong className="font-medium text-amber-200">
            Unverified modern legend.
          </strong>{" "}
          This entry is circulating oral tradition - not confirmed fact. No
          official records corroborate the account.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_220px]">
        <div>
          <FullDescription
            freePreview={freePreview}
            fullDescription={unlocked ? lore.fullDescription : null}
            mysteryNote={unlocked ? lore.mysteryNote : null}
            unlocked={unlocked}
            hasMore={hasMore}
          />

          {giant.sources.length > 0 && (
            <section className="mt-8">
              <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
                Sources
              </h2>
              <ul className="mt-3 space-y-1 font-mono text-xs text-text-muted">
                {giant.sources.map((s) => (
                  <li key={s}>- {s}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <dl className="rounded-lg border border-border bg-surface p-4 text-sm">
            {giant.height && (
              <div className="border-b border-border pb-3">
                <dt className="text-xs text-text-muted">Height (tradition)</dt>
                <dd className="mt-1 text-text-primary">{giant.height}</dd>
              </div>
            )}
            {giant.coordinates && (
              <div className="border-b border-border py-3">
                <dt className="text-xs text-text-muted">Coordinates</dt>
                <dd className="mt-1 font-mono text-xs text-text-primary">
                  {giant.coordinates[0].toFixed(2)},{" "}
                  {giant.coordinates[1].toFixed(2)}
                </dd>
                <Link
                  href={`/map?focus=${encodeURIComponent(giant.slug)}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded border border-accent-gold/50 bg-accent-gold/10 px-3 py-2 text-xs font-medium tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/20"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full bg-accent-gold shadow-[0_0_6px_rgba(201,162,39,0.9)]"
                  />
                  View on map
                </Link>
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
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          <SizeComparison giant={giant} />
        </aside>
      </div>

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
                  className="block rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent-gold/40"
                >
                  <span className="font-[family-name:var(--font-cinzel)] text-accent-gold">
                    {r.name}
                  </span>
                  <span className="mt-1 block text-xs text-text-muted">
                    {r.culture} · {r.shortDescription.slice(0, 80)}
                    {r.shortDescription.length > 80 ? "…" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
