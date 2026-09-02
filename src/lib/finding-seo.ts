/**
 * Search titles, meta descriptions, and visible H1s for shipped Finding pages.
 *
 * Document title fields omit " · Giants of the World" - the root layout
 * template appends it. Do not put Kandahar/Kunar here; PR1 is five slugs only.
 */

import type { FindingPermalinkSlug } from "./giants";

export type FindingSeo = {
  /** Visible H1 and BreadcrumbList leaf. */
  h1: string;
  /** Document title; template appends brand suffix. */
  title: string;
  description: string;
};

export const FINDING_SEO: Record<FindingPermalinkSlug, FindingSeo> = {
  "cardiff-giant": {
    h1: "The Cardiff Giant (1869)",
    title: "Cardiff Giant: the 1869 gypsum hoax",
    description:
      "The Cardiff Giant was a carved gypsum figure buried in New York State in 1869 and sold as a petrified man. Verified American hoax; press, museum, and show-circuit history.",
  },
  "goliath-height-manuscripts": {
    h1: "Goliath's height in the manuscripts",
    title: "Goliath's height in the Hebrew manuscripts",
    description:
      "Manuscript witnesses disagree on Goliath's stature (often six cubits and a span in the Masoretic tradition; a shorter reading in some Greek and Dead Sea evidence). Claim-sized note, not a second Goliath biography.",
  },
  "og-iron-bed": {
    h1: "Og's iron bed (Deuteronomy 3:11)",
    title: "Og's iron bed in Deuteronomy 3:11",
    description:
      "Deuteronomy 3:11 measures an iron bedstead (or similar object) of Og of Bashan, nine cubits by four, not a weighed skeleton. Famous biblical measure; sourced claim page.",
  },
  "lovelock-si-te-cah-remains": {
    h1: "Lovelock Cave and the Si-Te-Cah remains",
    title: "Lovelock Cave: Si-Te-Cah remains and the tradition",
    description:
      "Northern Paiute tradition of the Si-Te-Cah meets excavation history at Lovelock Cave, Nevada. Stature claims stay labelled; pairs with the free Si-Te-Cah entry.",
  },
  "solid-muldoon": {
    h1: "The Solid Muldoon (1877)",
    title: 'Solid Muldoon: the 1877 Colorado "petrified man"',
    description:
      'The Solid Muldoon was a 1877 Colorado "petrified man" tied to the Hull show network that also produced the Cardiff Giant. Documented fraud, not a fossil giant.',
  },
};

/** Sibling hoax Findings that should point at each other. */
export const FINDING_SEE_ALSO: Partial<
  Record<FindingPermalinkSlug, FindingPermalinkSlug>
> = {
  "cardiff-giant": "solid-muldoon",
  "solid-muldoon": "cardiff-giant",
};

export function getFindingSeo(
  slug: string
): FindingSeo | undefined {
  if (slug in FINDING_SEO) {
    return FINDING_SEO[slug as FindingPermalinkSlug];
  }
  return undefined;
}

export function getFindingSeeAlsoSlug(
  slug: string
): FindingPermalinkSlug | undefined {
  if (slug in FINDING_SEE_ALSO) {
    return FINDING_SEE_ALSO[slug as FindingPermalinkSlug];
  }
  return undefined;
}
