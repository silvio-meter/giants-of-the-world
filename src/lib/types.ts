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

/** One named entry in a giant's Scholarly Notes — etymology, comparative myth, disputed readings. */
export interface ScholarlyNote {
  heading: string;
  body: string;
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
  /**
   * One-line ending, for the Compare tool's premium data row. Lore, not
   * catalog data — stays out of the public/client bundle the same way
   * fullDescription and mysteryNote do.
   */
  fate: string;
  /** Present on deep entries only. */
  sections?: GiantSections;
  /**
   * Academic/etymological commentary, gated independently of freeEntry —
   * a second premium layer on top of the base account, so it stays locked
   * even on entries (like Ymir) whose main text is open. Lore, not catalog
   * data; stripped from the public bundle like fullDescription.
   */
  scholarlyNotes?: ScholarlyNote[];
  /** Shared citation list for scholarlyNotes, distinct from the entry's own `sources`. */
  scholarlySources?: string[];
  /**
   * Public flag mirroring whether scholarlyNotes is non-empty, so the static
   * page knows whether to render the (locked) section at all — without the
   * lore content itself ever reaching the client bundle.
   */
  hasScholarlyNotes?: boolean;
  /**
   * The ladder of surviving witnesses behind one claim, oldest last. Lore, so
   * it is stripped from the public bundle; only chainSummary crosses over.
   */
  chain?: Chain;
  /**
   * The free half: the claim and the one sentence of verdict, plus how many
   * rungs are waiting. Public by design, since it is what opens the question.
   */
  chainSummary?: { claim: string; verdict: string; rungCount: number };
  /** Keys into motifs.json — the cross-cultural layer. Not lore; safe for the client. */
  motifs?: string[];
  /**
   * An offer to remove or correct the entry at a community's request.
   *
   * Deliberately public rather than lore, and rendered outside the paywalled
   * account: an offer to withdraw material that a reader has to pay 4.99 USD
   * to discover is worse than not making the offer.
   */
  communityNote?: string;
  /**
   * Overrides the default text of the unverified warning box. Set where the
   * standard "Unverified modern legend" wording is not the right claim.
   */
  statusLine?: string;
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

/** One surviving witness. `evidence` is our audit trail and never leaves the server. */
export interface ChainRung {
  witness: string;
  date: string;
  sortYear: number;
  reads: string;
  kind:
    | "manuscript"
    | "printed"
    | "fieldwork"
    | "excavation"
    | "scholarship"
    | "press";
  note?: string;
  evidence?: string;
}

export interface Chain {
  claim: string;
  verdict: string;
  rungs: ChainRung[];
  floor: string;
}

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
  /**
   * Optional chain of custody (today: cardiff-giant and anasazi-giants).
   * findings.json is read only on the server, and the rungs are served through
   * /api/chain/[id] behind the same plan check the entries use.
   */
  chain?: Chain;
}
