import { MysteryNote } from "./MysteryNote";
import { DeepSections } from "./DeepSections";
import { splitParagraphs } from "@/lib/content";
import type { GiantSections } from "@/lib/types";

interface Props {
  fullDescription: string;
  mysteryNote: string;
  /** Deep entries render structured sections instead of a wall of prose. */
  sections?: GiantSections;
  motifs?: string[];
  slug: string;
  /** Heading label — "Full account" once unlocked, "Account" for open entries. */
  heading?: string;
}

/**
 * Renders lore that the server has already decided the reader may see.
 * Server component: open entries ship no JavaScript for their main text.
 */
export function FullDescription({
  fullDescription,
  mysteryNote,
  sections,
  motifs,
  slug,
  heading = "Full account",
}: Props) {
  const paragraphs = splitParagraphs(fullDescription);

  return (
    <>
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        {heading}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-text-primary/90">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {sections && (
        <div className="mt-10">
          <DeepSections sections={sections} motifs={motifs} slug={slug} />
        </div>
      )}
      {mysteryNote ? <MysteryNote note={mysteryNote} /> : null}
    </>
  );
}
