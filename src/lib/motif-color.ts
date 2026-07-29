/** Deterministic hue from a motif key, so the same motif always reads the same color. */
export function motifHue(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
  return h;
}

export function motifColor(
  key: string,
  { saturation = 65, lightness = 60 }: { saturation?: number; lightness?: number } = {}
): string {
  return `hsl(${motifHue(key)} ${saturation}% ${lightness}%)`;
}
