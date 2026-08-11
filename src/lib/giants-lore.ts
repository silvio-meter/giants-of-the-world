import "server-only";
import loreData from "@/data/giants.lore.json";

import type {
  Chain,
  GiantHandling,
  GiantSections,
  ScholarlyNote,
} from "./types";

type LoreEntry = {
  fullDescription: string;
  mysteryNote: string;
  fate: string;
  sections?: GiantSections;
  scholarlyNotes?: ScholarlyNote[];
  scholarlySources?: string[];
  /** The chain of custody, evidence URLs and all. Stripped before it is served. */
  chain?: Chain;
  /** Editorial / legal handling — not served to the client catalogue. */
  handling?: GiantHandling;
};

const lore = loreData as Record<string, LoreEntry>;

/** Server-only full account text — never import from client components. */
export function getGiantLore(slug: string): LoreEntry | null {
  return lore[slug] ?? null;
}
