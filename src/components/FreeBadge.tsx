/**
 * The Free badge, in one place.
 *
 * A badge is a promise: someone who clicks Free and lands on a price does not
 * think "bug", they think they were misled. The promise has to be made from
 * the same field the entry page gates on, which is `freeEntry`, so this takes
 * the entry rather than a boolean and reads that field itself. Three surfaces
 * rendering three copies of the same span is how the two drift apart.
 *
 * It carries its own `uppercase tracking-wider` rather than inheriting them.
 * On the catalogue the parent row sets both and the badge reads FREE; in a map
 * popup and in a findings row it would have read Free, which is the same
 * promise in two voices.
 */
export function FreeBadge({ freeEntry }: { freeEntry: boolean }) {
  if (!freeEntry) return null;

  return (
    <span className="rounded-full border border-accent-gold/40 px-1.5 py-px text-[9px] tracking-wider text-accent-gold uppercase">
      Free
    </span>
  );
}
