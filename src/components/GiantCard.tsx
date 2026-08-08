import Link from "next/link";
import { formatType, type GiantCardData } from "@/lib/format";
import { FavouriteButton } from "./FavouriteButton";
import { FreeBadge } from "./FreeBadge";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface Props {
  giant: GiantCardData;
  index?: number;
}

export function GiantCard({ giant, index = 0 }: Props) {
  return (
    <article
      className="rise-in relative"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
    >
      <FavouriteButton slug={giant.slug} name={giant.name} variant="card" />
      <Link
        href={`/giants/${giant.slug}`}
        className="group block overflow-hidden rounded-lg border border-border bg-surface transition hover:border-accent-gold/40 hover:shadow-[0_0_30px_rgba(201,162,39,0.06)]"
      >
        <ImagePlaceholder
          src={giant.image}
          alt={giant.imageAlt}
          size="card"
          className="rounded-none border-0 border-b border-border"
        />
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-wider text-text-muted uppercase">
            <span className="text-accent-gold/80">{giant.culture}</span>
            <span aria-hidden>·</span>
            <span>{formatType(giant.type)}</span>
            <FreeBadge freeEntry={giant.freeEntry} />
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-lg tracking-wide text-text-primary transition group-hover:text-accent-gold">
            {giant.name}
          </h2>
          {(giant.hasScholarlyNotes || giant.chainSummary) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {giant.hasScholarlyNotes && (
                <span className="rounded border border-accent-gold/30 px-1.5 py-0.5 text-[9px] tracking-wider text-accent-gold/90 uppercase">
                  Scholarly
                </span>
              )}
              {giant.chainSummary && (
                <span className="rounded border border-border px-1.5 py-0.5 text-[9px] tracking-wider text-text-muted uppercase">
                  Chain
                </span>
              )}
            </div>
          )}
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {giant.shortDescription}
          </p>
        </div>
      </Link>
    </article>
  );
}
