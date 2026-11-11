/**
 * /bestiary and /bestiary/free-sample: constants and copy.
 *
 * Copy comes only from the SEO drafts (seo-bestiary-drafts-2026-11-11.md) and
 * Catalogue's sample draft (bestiary-sample-draft-2026-11-11.md). Draft lines
 * that still carry a [placeholder] (entry count, contents, refund window) are
 * left out until Catalogue / Monetization fill them. No em dash, and never the
 * name of the game the 5E notes are compatible with: "5E compatible" only.
 *
 * Plain data with no imports, so node --test can load it directly.
 */

/**
 * The paid Vol. 1 is sold on itch.io first (owner decision, 11 Nov 2026).
 * The buy button, the Product schema and the refund FAQ stay hidden while
 * this is null. Set it to the itch.io product URL to show them.
 */
export const ITCH_URL = null as string | null;

/** Public path of the free sample. The file itself goes in public/downloads/. */
export const SAMPLE_PDF_PATH = "/downloads/giants-bestiary-sample.pdf";

/** Umami pdf_sample_download sku. */
export const SAMPLE_SKU = "sample-3-giants";

/** One Seam source tag for the optional form on the sample page. */
export const SAMPLE_NEWSLETTER_SOURCE = "prep-sample";

/** The three sample entries, with the italic line from Catalogue's draft. */
export const SAMPLE_GIANTS = [
  { slug: "balor", name: "Balor", line: "Fomorian king. Irish tradition." },
  {
    slug: "kumbhakarna",
    name: "Kumbhakarna",
    line: "Brother of Ravana. The Ramayana.",
  },
  {
    slug: "cailleach",
    name: "The Cailleach",
    line: "The veiled one. Gaelic tradition of Ireland, Scotland and Man.",
  },
] as const;

export const COPYRIGHT_LINE = "© LOGOSOM";

/**
 * The exact attribution the SRD 5.2 Legal Information page requires
 * (checked by Catalogue on 11 Nov 2026). Do not edit the wording.
 */
export const SRD_ATTRIBUTION =
  "This work includes material from the System Reference Document 5.2 (“SRD 5.2”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.";

export type Faq = { question: string; answer: string };

export const BESTIARY_SEO = {
  title: "Giants Bestiary PDF: sourced giants for your table",
  // SEO draft meta with the [N] entry-count placeholder left out.
  description:
    "A printable PDF bestiary of giants from world myth and folklore, each with sources, motifs and table notes. Read a free sample of three entries first.",
  h1: "The Giants Bestiary",
};

export const BESTIARY_FAQS: Faq[] = [
  {
    question: "Can I try it first?",
    answer:
      "Yes. The free sample has three full entries: Balor, Kumbhakarna and the Cailleach.",
  },
  {
    question: "Can I use it at my table?",
    answer:
      "Yes. Each entry has optional 5E compatible notes built on SRD 5.2 material, credited in the PDF under CC BY 4.0.",
  },
];

/** Only shown once ITCH_URL is set: it answers a buyer, and nothing is on sale yet. */
export const BESTIARY_REFUND_FAQ: Faq = {
  question: "What if it is not for me?",
  answer: "Write to hello@giantscodex.com and we will refund you.",
};

export const SAMPLE_SEO = {
  title: "Free giants bestiary sample: Balor, Kumbhakarna, Cailleach",
  description:
    "Download three full entries from the Giants Bestiary for free: Balor of the Evil Eye, Kumbhakarna the sleeper and the Cailleach. Sourced, printable PDF.",
  h1: "A free sample: three giants",
};

export const SAMPLE_FAQS: Faq[] = [
  {
    question: "Do I need an account to download the sample?",
    answer:
      "No. The download is free and needs no account. You can join One Seam on the same page if you want one giant story a week.",
  },
  {
    question: "Why these three giants?",
    answer:
      "They come from three traditions, Irish myth, the Ramayana and Gaelic folklore, and each shows a different kind of giant: a war king, a sleeper and a builder of the land.",
  },
];
