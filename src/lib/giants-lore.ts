import "server-only";
import loreData from "@/data/giants.lore.json";

type LoreEntry = {
  fullDescription: string;
  mysteryNote: string;
};

const lore = loreData as Record<string, LoreEntry>;

/** Server-only full account text — never import from client components. */
export function getGiantLore(slug: string): LoreEntry | null {
  return lore[slug] ?? null;
}
