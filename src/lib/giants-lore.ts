import "server-only";
import loreData from "@/data/giants.lore.json";

import type { GiantSections } from "./types";

type LoreEntry = {
  fullDescription: string;
  mysteryNote: string;
  sections?: GiantSections;
};

const lore = loreData as Record<string, LoreEntry>;

/** Server-only full account text — never import from client components. */
export function getGiantLore(slug: string): LoreEntry | null {
  return lore[slug] ?? null;
}
