"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RandomGiantButton } from "@/components/RandomGiantButton";
import { getAllGiants } from "@/lib/giants";

export default function HomePage() {
  const count = getAllGiants().length;

  return (
    <div className="relative">
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

        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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
            {count} entries · worldwide · dark by design
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-text-muted uppercase">
            <span>Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-text-muted to-transparent" />
          </div>
        </motion.div>
      </section>

      <section className="relative border-t border-border bg-surface/30 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {[
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
          ].map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={card.href}
                className="group block h-full rounded-lg border border-border bg-surface p-6 transition hover:border-accent-gold/40"
              >
                <h2 className="font-[family-name:var(--font-cinzel)] text-lg tracking-wide text-accent-gold">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted group-hover:text-text-primary/90">
                  {card.body}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
