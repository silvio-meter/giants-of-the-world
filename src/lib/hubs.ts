/**
 * Motif and culture hubs. Explicit slug lists, never string matching on
 * culture labels (the data is inconsistent there). Unknown hub slugs 404.
 */
import { getGiantBySlug, isShippedFindingSlug } from "@/lib/giants";
import type { GiantCardData } from "@/lib/giants";

export type HubKind = "motifs" | "culture";

export type HubGroup = { label: string; members: string[] };

export type Hub = {
  kind: HubKind;
  slug: string;
  h1: string;
  /** Document title; the root template appends " · Giants of the World". */
  title: string;
  description: string;
  intro: string;
  /** Members in display order, optionally grouped. */
  groups: HubGroup[];
  /** Per-member card notes (labels, not promotional copy). */
  notes?: Record<string, string>;
  related: { href: string; label: string }[];
  findings?: { slug: string; label: string }[];
};

export const HUBS: Hub[] = [
  {
    kind: "motifs",
    slug: "one-eyed-giant",
    h1: "One-eyed giants",
    title: "One-eyed giants: Polyphemus, Balor and the single eye",
    description:
      "One-eyed giants across the catalogue: Homer's Polyphemus, Irish Balor, Tepegöz of Dede Korkut, and more. Shared motif, not proof of contact.",
    intro:
      "One eye, set in the middle of a face, turns up in stories that never met. Homer gives it to Polyphemus in Odyssey IX; the Irish Cath Maige Tuired gives Balor an eye that ruins what it sees; the Book of Dede Korkut blinds Tepegöz in his cave. The catalogue keeps them side by side because the echo is interesting, not because an echo proves a common source.",
    groups: [
      {
        label: "",
        members: [
          "polyphemus",
          "balor",
          "tepegoz",
          "ysbaddaden",
          "katallani",
          "ojancanu",
          "mapinguari",
          "cailleach",
          "croatian-giants-lesser",
        ],
      },
    ],
    related: [
      { href: "/culture/greek", label: "Greek giants, Titans and Cyclopes" },
      { href: "/culture/irish", label: "Irish giants and the Fomorians" },
      { href: "/motifs", label: "All motifs" },
    ],
  },
  {
    kind: "culture",
    slug: "norse",
    h1: "Norse giants",
    title: "Norse giants: the jötnar of the Eddas",
    description:
      "The jötnar of Norse myth, from Ymir whose body became the world to Surtr's fire at its end. Read from the Poetic Edda and Snorri's Prose Edda. Sourced.",
    intro:
      "In the Norse sources the giants are older than the gods, related to them, and never quite their enemies in a simple way. Ymir's body becomes the world in Snorri's Gylfaginning; Bestla, a giantess, is Odin's mother; Surtr waits with fire for the end. Everything here is read from the Poetic Edda and Snorri's Prose Edda, medieval Icelandic witnesses to older tradition, not from games or films that share the names.",
    groups: [
      {
        label: "",
        members: ["ymir", "surtr", "thrym", "hrungnir", "skrymir", "bestla"],
      },
    ],
    related: [{ href: "/motifs", label: "All motifs" }],
  },
  {
    kind: "motifs",
    slug: "giants-in-the-bible",
    h1: "Giants in the Bible",
    title: "Giants in the Bible: Nephilim, Goliath and Og",
    description:
      "Giants in the Hebrew Bible: the Nephilim of Genesis 6, Goliath of Gath, and Og of Bashan, last of the Rephaim. What each text says, kept distinct.",
    intro:
      "The Hebrew Bible has no single word for giant, and its tall figures are not one people. The Nephilim appear in Genesis 6:1-4 and Numbers 13:33; Goliath fights David in 1 Samuel 17, with a different height in the Septuagint; Og's iron bedstead is measured in Deuteronomy 3. Later retelling enlarged all three, and this page keeps the text and the enlargement apart.",
    groups: [
      { label: "", members: ["nephilim", "goliath", "og-of-bashan", "uj-ibn-anaq"] },
    ],
    notes: {
      "uj-ibn-anaq": "Later Arabic and Persian retelling of Og, not a biblical text.",
    },
    related: [{ href: "/motifs", label: "All motifs" }],
    findings: [
      { slug: "goliath-height-manuscripts", label: "Goliath's height in the manuscripts" },
      { slug: "og-iron-bed", label: "Og's iron bed" },
    ],
  },
  {
    kind: "culture",
    slug: "greek",
    h1: "Greek giants, Titans and Cyclopes",
    title: "Greek giants, Titans and Cyclopes: who is which",
    description:
      "Atlas is a Titan, Polyphemus a Cyclops, the Gigantes fought the Olympians. Greek giants as Hesiod, Homer and Apollodorus divide them. Sourced entries.",
    intro:
      "Greek myth has several kinds of large beings, and they are often blurred. Hesiod's Theogony makes Atlas a Titan; Homer's Odyssey makes Polyphemus a Cyclops; Apollodorus' Bibliotheca gives the Gigantes their war against the Olympians. This page sorts the catalogue's Greek figures by what the sources call them, and notes where the sources themselves disagree.",
    groups: [
      { label: "Titans", members: ["atlas"] },
      { label: "Cyclopes", members: ["polyphemus"] },
      {
        label: "Gigantomachy",
        members: ["gigantes", "enceladus", "porphyrion", "alcyoneus", "polybotes"],
      },
      {
        label: "Others",
        members: ["talos", "antaeus", "briareus", "geryon", "tityus", "orion"],
      },
    ],
    related: [{ href: "/motifs/one-eyed-giant", label: "One-eyed giants" }],
  },
  {
    kind: "culture",
    slug: "irish",
    h1: "Irish giants and the Fomorians",
    title: "Irish giants: the Fomorians, Balor and the Cailleach",
    description:
      "Irish giant tradition: the Fomorians of Lebor Gabála Érenn, Balor of the Evil Eye from Cath Maige Tuired, and the Cailleach of the hills. Sourced.",
    intro:
      "Irish tradition remembers an older, darker people who held the land before the gods and came, in the oldest layer, from under the sea. The Fomorians are set down in Lebor Gabála Érenn and Cath Maige Tuired; their king Balor falls there to his grandson Lugh. The Cailleach belongs to a different, landscape layer, shared with Scotland and Man.",
    groups: [{ label: "", members: ["fomorians", "balor", "cailleach"] }],
    notes: { cailleach: "Shared Gaelic tradition: Irish, Scottish and Manx." },
    related: [{ href: "/motifs/one-eyed-giant", label: "One-eyed giants" }],
  },
];

export function getHub(kind: HubKind, slug: string): Hub | undefined {
  return HUBS.find((h) => h.kind === kind && h.slug === slug);
}

export function hubsOfKind(kind: HubKind): Hub[] {
  return HUBS.filter((h) => h.kind === kind);
}

export function hubPath(h: Hub): string {
  return `/${h.kind}/${h.slug}`;
}

/** Members resolved against giants.json; throws at build if a slug is missing. */
export function hubGroups(h: Hub): { label: string; giants: GiantCardData[] }[] {
  return h.groups.map((g) => ({
    label: g.label,
    giants: g.members
      .map((s) => {
        const giant = getGiantBySlug(s);
        if (!giant) throw new Error(`Hub ${h.slug}: unknown giant slug ${s}`);
        return giant;
      })
      // Free first, then locked; listed order kept within each.
      .sort((a, b) => Number(b.freeEntry) - Number(a.freeEntry)),
  }));
}

export function hubFindings(h: Hub): { slug: string; label: string }[] {
  return (h.findings ?? []).filter((f) => isShippedFindingSlug(f.slug));
}

export function hubsForGiant(slug: string): Hub[] {
  return HUBS.filter((h) => h.groups.some((g) => g.members.includes(slug)));
}
