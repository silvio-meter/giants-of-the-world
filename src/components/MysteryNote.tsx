interface Props {
  note: string;
}

export function MysteryNote({ note }: Props) {
  if (!note) return null;
  return (
    <aside
      className="relative my-8 border-l-2 border-accent-gold/60 bg-accent-gold/5 px-5 py-4"
      aria-label="Mystery note"
    >
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.3em] text-accent-gold/80 uppercase">
        Whispered aside
      </p>
      <p className="mt-2 font-serif text-base italic leading-relaxed text-accent-gold sm:text-lg">
        “{note}”
      </p>
    </aside>
  );
}
