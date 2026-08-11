import Link from "next/link";
import { GiantCard } from "@/components/GiantCard";
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
    body: "Classical, biblical, indigenous, and regional giants, kept distinct from modern rumor.",
    href: "/giants",
  },
  {
    title: "World Map",
    body: "Pins in the dark. Trace where tradition places the large ones across the earth.",
    href: "/map",
  },
  {
    title: "Bones & Shadows",
    body: "Claims, hoaxes, and unverified legends, labeled so mystery never pretends to be proof.",
    href: "/findings",
  },
];

const tools = [
  {
    title: "Compare",
    body: "Two giants side by side: scale, fate, and the motifs they share.",
    href: "/compare",
  },
  {
    title: "Near you",
    body: "How many traditions sit within a few hundred kilometres of where you stand.",
    href: "/near",
  },
  {
    title: "Evidence",
    body: "How sources are treated here, and what modern legends are not.",
    href: "/evidence",
  },
  {
    title: "My Codex",
    body: "Completion across the catalogue, and the seals of the motifs you collect.",
    href: "/my-codex",
  },
];

/**
 * Homepage strip only: curated showcase, not "every free entry".
 * freeEntry is a separate access question. Living-community and
 * no-attributable-community free entries stay free to read but are not
 * listed here (see HANDOFF "Free set").
 * Recognition first, then range. Exactly these ten, no fallback.
 */
const FREE_STRIP_ORDER = [
  "ymir",
  "nephilim",
  "goliath",
  "atlas",
  "polyphemus",
  "ravana",
  "oni",
  "jentilak",
  "fomorians",
  "budj-bim",
];

export default function HomePage() {
  const count = getAllGiants().length;
  const free = getFreeGiants();
  const freeCount = free.length;
  const freeBySlug = new Map(free.map((g) => [g.slug, g]));
  const freeStrip = FREE_STRIP_ORDER.map((s) => freeBySlug.get(s)).filter(
    (g): g is NonNullable<typeof g> => Boolean(g)
  );

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="hero-atmosphere relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-20">
        <div className="fog-layer absolute inset-0" aria-hidden />

        <div
          className="pointer-events-none absolute left-1/2 top-1/3 z-[2] h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <div className="rise-in relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.4em] text-accent-gold/80 uppercase sm:text-xs">
            A sourced codex
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl leading-tight tracking-wide text-accent-gold sm:text-5xl md:text-6xl">
            Giants of the World
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            From frost-born Ymir to the whispered shadows of modern conflict:
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

          <p className="mt-12 font-mono text-xs tracking-wider text-text-muted">
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

      {freeStrip.length > 0 && (
        <section className="relative border-t border-border px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 max-w-2xl">
              <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
                Start here
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
                Open entries
              </h2>
              <p className="mt-3 text-sm text-text-muted sm:text-base">
                These pages ship the full account free. The rest of the codex
                opens with a real first paragraph; the deeper layers unlock with
                a membership.
              </p>
            </header>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {freeStrip.slice(0, 6).map((giant, i) => (
                <GiantCard key={giant.slug} giant={giant} index={i} />
              ))}
            </div>
            {freeStrip.length > 6 && (
              <p className="mt-8 text-center text-sm text-text-muted">
                <Link href="/giants" className="text-accent-gold hover:underline">
                  Browse the full catalogue
                </Link>
                {" · "}
                {freeCount} open in full
              </p>
            )}
          </div>
        </section>
      )}

      <section className="relative border-t border-border bg-surface/20 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 max-w-2xl">
            <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
              Tools
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
              Built into the codex
            </h2>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rise-in group block h-full rounded-lg border border-border bg-surface p-5 transition hover:border-accent-gold/40"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <h3 className="font-[family-name:var(--font-cinzel)] text-base tracking-wide text-accent-gold">
                  {tool.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted group-hover:text-text-primary/90">
                  {tool.body}
                </p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-text-muted">
            <Link href="/welcome" className="text-accent-gold hover:underline">
              New here? Three steps in
            </Link>
            {" · "}
            <Link href="/evidence" className="text-accent-gold hover:underline">
              How we treat sources
            </Link>
            {" · "}
            <Link href="/pricing" className="text-accent-gold hover:underline">
              What membership unlocks
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
