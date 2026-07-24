import Link from "next/link";
import { RandomGiantButton } from "@/components/RandomGiantButton";
import { getAllGiants, getFreeGiants } from "@/lib/giants";
import { siteUrl } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Giants of the World",
  alternateName: "Giants Codex",
  url: siteUrl,
  description:
    "A dark codex of giants from mythology, folklore, and modern legend across the world.",
  inLanguage: "en",
};

const cards = [
  {
    title: "Myth & Folklore",
    body: "Classical, biblical, indigenous, and regional giants - kept distinct from modern rumor.",
    href: "/giants",
  },
  {
    title: "World Map",
    body: "Pins in the dark. Trace where tradition places the large ones across the earth.",
    href: "/map",
  },
  {
    title: "Bones & Shadows",
    body: "Claims, hoaxes, and unverified legends - labeled so mystery never pretends to be proof.",
    href: "/findings",
  },
];

export default function HomePage() {
  const count = getAllGiants().length;
  const freeCount = getFreeGiants().length;

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="hero-atmosphere relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-20">
        <div className="fog-layer absolute inset-0" aria-hidden />

        {/* Soft gold glow above image, below content */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 z-[2] h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <div className="rise-in relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.4em] text-accent-gold/70 uppercase sm:text-xs">
            A forbidden codex
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl leading-tight tracking-wide text-accent-gold sm:text-5xl md:text-6xl">
            Giants of the World
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            From frost-born Ymir to the whispered shadows of modern conflict -
            a catalogue of the large ones who haunt myth, folklore, and rumor.
            Open carefully. The fog does not clear for everyone.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/giants"
              className="inline-flex min-w-[180px] items-center justify-center rounded border border-accent-gold bg-accent-gold px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-background transition hover:bg-accent-gold/90"
            >
              Enter the Catalogue
            </Link>
            <RandomGiantButton />
          </div>

          <p className="mt-12 font-mono text-xs tracking-wider text-text-muted/70">
            {count} entries · {freeCount} open to read in full · worldwide
          </p>
        </div>

        <div className="fade-in-late absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-text-muted uppercase">
            <span>Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-text-muted to-transparent" />
          </div>
        </div>
      </section>

      <section className="relative border-t border-border bg-surface/30 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {cards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className="rise-in group block h-full rounded-lg border border-border bg-surface p-6 transition hover:border-accent-gold/40"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h2 className="font-[family-name:var(--font-cinzel)] text-lg tracking-wide text-accent-gold">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-muted group-hover:text-text-primary/90">
                {card.body}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
