/** Split long lore into paragraphs for display. */
export function splitParagraphs(text: string): string[] {
  const byBreak = text
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byBreak.length >= 2) return byBreak;

  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 2) return [text.trim()];

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join("").trim());
  }
  return chunks.filter(Boolean);
}

/** Free tier: only the opening chunk — never send the rest to the client. */
export function getFreePreview(fullDescription: string): string {
  return splitParagraphs(fullDescription)[0] ?? fullDescription.slice(0, 400);
}

export function hasMoreContent(
  fullDescription: string,
  mysteryNote: string
): boolean {
  const paras = splitParagraphs(fullDescription);
  return paras.length > 1 || Boolean(mysteryNote?.trim());
}

/**
 * One-line teaser for free readers on a locked entry.
 * First sentence only — never the full disputed section.
 */
export function getFirstSentence(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  const trimmed = text.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^[^.!?]+[.!?]+/);
  if (match) return match[0].trim();
  // No terminator: cap so a run-on paragraph cannot become a free full section.
  return trimmed.length > 160 ? `${trimmed.slice(0, 157).trimEnd()}…` : trimmed;
}
