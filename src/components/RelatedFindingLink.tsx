import Link from "next/link";
import {
  getFindingBySlug,
  getRelatedFindingSlug,
} from "@/lib/giants";
import { getFindingSeo } from "@/lib/finding-seo";

/**
 * Brief free-door cross-link from a giant entry to its shipped Finding page.
 * PR1 map covers Goliath, Og, and Si-Te-Cah only.
 */
export function RelatedFindingLink({ giantSlug }: { giantSlug: string }) {
  const findingSlug = getRelatedFindingSlug(giantSlug);
  if (!findingSlug) return null;
  const finding = getFindingBySlug(findingSlug);
  if (!finding) return null;
  const label = getFindingSeo(findingSlug)?.h1 ?? finding.title;

  return (
    <p className="mt-6 text-sm text-text-muted">
      <Link
        href={`/findings/${findingSlug}`}
        className="text-accent-gold underline underline-offset-2 hover:text-accent-gold/80"
      >
        Related finding: {label}
      </Link>
    </p>
  );
}
