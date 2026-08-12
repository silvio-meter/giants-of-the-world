/**
 * Search titles and descriptions for a few high-demand entries.
 *
 * These override only <title>, meta description, and the Open Graph / Twitter
 * text. The visible page (H1, basic account, lore) still uses the catalogue
 * name and shortDescription. Do not put living-community or never-promoted
 * slugs here.
 */

export type EntrySeo = {
  /** Document title; the root template appends " · Giants of the World". */
  title: string;
  description: string;
};

export const ENTRY_SEO: Record<string, EntrySeo> = {
  atlas: {
    title: "Atlas: sky and pillars, not the globe",
    description:
      "Homer has pillars between earth and sky. Hesiod has the sky. The globe on the shoulders is later. Free sourced entry.",
  },
  goliath: {
    title: "How tall was Goliath? The manuscripts disagree",
    description:
      "Six cubits and a span is one Hebrew tradition. Earlier witnesses are shorter. Free sourced entry.",
  },
  nephilim: {
    title: "Nephilim: what Genesis actually says",
    description:
      "One cluster of verses, then the story moves on. Later books and the internet do the rest. Free sourced entry.",
  },
  ymir: {
    title: "Ymir: the world made from a body",
    description:
      "In the Norse poems the earth, sea and sky are cut from the first giant. Free sourced entry.",
  },
};

export function getEntrySeo(slug: string): EntrySeo | null {
  return ENTRY_SEO[slug] ?? null;
}
