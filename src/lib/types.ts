export type GiantType =
  | "primordial"
  | "race"
  | "individual"
  | "folklore"
  | "modern-legend"
  | "tall-tale";

/** Deep-entry sections. Optional: entries without them render the legacy layout. */
export interface GiantSections {
  /** Narrative retelling, ~250-350 words. */
  story: string;
  /** Which texts this comes from, when, and who recorded it. */
  origins: string;
  /** Where the sources disagree, and what the record cannot support. */
  disputed: string;
}

export interface Giant {
  id: string;
  slug: string;
  name: string;
  alsoKnownAs: string[];
  culture: string;
  region: string;
  type: GiantType;
  /** Open entry: full lore renders statically, no auth check, indexable. */
  freeEntry: boolean;
  height: string | null;
  /**
   * Rough metres for the size chart, or null where the tradition gives no
   * usable figure. Baked into the data so 40 lines of free-text guessing do
   * not run at render time.
   */
  heightMeters: number | null;
  shortDescription: string;
  fullDescription: string;
  mysteryNote: string;
  /** Present on deep entries only. */
  sections?: GiantSections;
  /** Keys into motifs.json — the cross-cultural layer. Not lore; safe for the client. */
  motifs?: string[];
  /**
   * Deliberately short because the record is thin or the tradition could not
   * be attributed to a specific community. Always free — we do not charge for
   * an entry whose main content is an admission.
   */
  restrained?: boolean;
  related: string[];
  coordinates: [number, number] | null;
  tags: string[];
  sources: string[];
  image: string;
  imageAlt: string;
}

export type FindingCategory = "claim" | "hoax" | "modern-legend" | "archaeological";

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  verified: boolean;
  summary: string;
  detail: string;
  relatedGiantSlug?: string;
  sources: string[];
  year?: string;
  location?: string;
}
