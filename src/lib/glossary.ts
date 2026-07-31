import glossaryData from "@/data/glossary.json";
import {
  scanTextForTerms,
  type GlossaryEntry,
  type GlossaryMap,
  type GlossarySegment,
} from "./glossary-scan";

export type { GlossaryEntry, GlossarySegment };

const glossary = glossaryData as GlossaryMap;

export function getGlossaryEntry(key: string): GlossaryEntry | null {
  return glossary[key] ?? null;
}

export function scanForGlossaryTerms(text: string): GlossarySegment[] {
  return scanTextForTerms(text, glossary);
}
