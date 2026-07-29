import { motifHue } from "@/lib/motif-color";

/**
 * A collectible wax-seal stamp for a motif shared by two or more of a
 * reader's saved giants. Generated, not illustrated — no art asset pipeline
 * exists for this yet, so the seal is built entirely from inline SVG.
 */
export function MotifSeal({ motif }: { motif: { key: string; name: string } }) {
  const hue = motifHue(motif.key);
  return (
    <div className="flex flex-col items-center gap-2" title={motif.name}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="shrink-0">
        <circle cx="32" cy="32" r="30" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.55" />
        <circle cx="32" cy="32" r="24" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.35" />
        <circle
          cx="32"
          cy="32"
          r="18"
          fill={`hsl(${hue} 40% 16%)`}
          stroke="#c9a227"
          strokeWidth="1"
        />
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontSize="16"
          fill="#c9a227"
          fontFamily="Georgia, serif"
        >
          {motif.name.charAt(0).toUpperCase()}
        </text>
      </svg>
      <span className="max-w-[84px] text-center text-[10px] leading-tight text-text-muted">
        {motif.name}
      </span>
    </div>
  );
}
