import { getGlossaryEntry, scanForGlossaryTerms } from "@/lib/glossary";
import { GlossaryTerm } from "./GlossaryTerm";

/**
 * Wraps any known glossary terms found in `text` with an interactive
 * definition. Server component: the scan is pure string matching, so only
 * the individual matched terms need to hydrate as GlossaryTerm.
 */
export function GlossaryText({ text }: { text: string }) {
  const segments = scanForGlossaryTerms(text);

  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.glossaryKey) return <span key={i}>{seg.text}</span>;
        const entry = getGlossaryEntry(seg.glossaryKey);
        if (!entry) return <span key={i}>{seg.text}</span>;
        return (
          <GlossaryTerm key={i} term={entry.term} definition={entry.definition}>
            {seg.text}
          </GlossaryTerm>
        );
      })}
    </>
  );
}
