/**
 * Pure text-scanning logic for glossary tooltips. Takes the glossary map as
 * a parameter rather than importing glossary.json, so it stays unit-testable
 * under plain `node --test` (which can't resolve the `@/` alias the way the
 * Next.js build can) — same reasoning as map-connections.ts staying
 * import-free.
 */

export interface GlossaryEntry {
  term: string;
  aliases: string[];
  definition: string;
}

export type GlossaryMap = Record<string, GlossaryEntry>;

export interface GlossarySegment {
  text: string;
  glossaryKey: string | null;
}

/** Preserves the source text's own casing ("Six cubits") — only the lookup is case-insensitive. */
export function scanTextForTerms(text: string, map: GlossaryMap): GlossarySegment[] {
  const aliasToKey = new Map<string, string>();
  for (const [key, entry] of Object.entries(map)) {
    for (const alias of entry.aliases) {
      aliasToKey.set(alias.toLowerCase(), key);
    }
  }
  // Longest alias first so "frost giant" matches before a lone "giant"
  // would (which isn't in the table today, but the principle holds).
  const sortedAliases = [...aliasToKey.keys()].sort((a, b) => b.length - a.length);
  if (sortedAliases.length === 0 || !text) return [{ text, glossaryKey: null }];

  const pattern = new RegExp(
    `\\b(${sortedAliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  const segments: GlossarySegment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), glossaryKey: null });
    }
    segments.push({
      text: match[0],
      glossaryKey: aliasToKey.get(match[0].toLowerCase()) ?? null,
    });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), glossaryKey: null });
  }
  return segments;
}
