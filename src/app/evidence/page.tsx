import type { Metadata } from "next";

/**
 * Static, public, indexable, no paywall and no login. This is the page a
 * sceptical reader is sent to from the "unverified" warning box, so it has to
 * be readable by someone who has never signed in.
 */
export const metadata: Metadata = {
  title: "How this archive treats evidence",
  description:
    "Every entry names its sources: the book, the chapter, the collector and the year. How Giants of the World separates documented tradition from unverified claim.",
  alternates: { canonical: "/evidence" },
  openGraph: {
    type: "article",
    url: "/evidence",
    title: "How this archive treats evidence · Giants of the World",
    description:
      "Every entry names its sources: the book, the chapter, the collector and the year. How Giants of the World separates documented tradition from unverified claim.",
    images: [{ url: "/images/featured.jpg", width: 1280, height: 720 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How this archive treats evidence · Giants of the World",
    description:
      "Every entry names its sources: the book, the chapter, the collector and the year. How Giants of the World separates documented tradition from unverified claim.",
    images: ["/images/featured.jpg"],
  },
};

export default function EvidencePage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Method
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          How this archive treats evidence
        </h1>
      </header>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-text-primary/90">
        <p>
          Every entry in the Codex names its sources. Not &quot;ancient
          texts&quot; or &quot;legend has it&quot;, but the book, the chapter,
          the collector and the year: Prose Edda Gylfaginning, 1 Samuel 17,
          Argonautica Book 4, Barandiarán working in the field in the Basque
          country, Sébillot&apos;s questionnaire of 1883.
        </p>
        <p>The catalogue is split in two, and the split is the point.</p>
        <p>
          Myth and Folklore holds traditions that are documented. Someone wrote
          them down, and we say who and when. Where the manuscripts disagree
          with each other, the entry says so rather than quietly choosing the
          version that reads better.
        </p>
        <p>
          Bones and Shadows holds claims. Modern sightings, disputed finds,
          stories with no named witness and no photograph. These entries exist
          because the claims exist and people go looking for them. They are
          labelled unverified, and they stay labelled unverified no matter how
          good the story is.
        </p>
        <p>
          Some entries here are deliberately short. Where a tradition cannot be
          reliably attributed to the community it belongs to, we say so, because
          writing a fuller account would have meant inventing one. An empty
          space is information too.
        </p>
        <p>
          Nothing here is presented as hidden history. Where the evidence stops,
          the entry stops.
        </p>
      </div>

      {/*
        Public, no paywall, no login. A corrections log that a reader has to
        sign in to see would not be a corrections log.
        Newest first: add new entries directly below this comment.
      */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Corrections
        </h2>

        <article className="mt-6">
          <h3 className="font-[family-name:var(--font-cinzel)] text-sm text-accent-gold">
            4 August 2026, the daeva post
          </h3>
          <div className="mt-3 space-y-4 text-sm leading-relaxed text-text-primary/90">
            <p>
              A long post published on X on 4 August traced the word for giant
              from Proto-Indo-European through Avestan into Persian, Georgian,
              South Slavic and Albanian. Four things in it were stated more
              firmly than the evidence allows.
            </p>
            <p>
              The post said the usual reading is that a reform demonised the
              gods of a rival cult. That sentence merges two different
              scholarly explanations of the Avestan inversion into one, and
              they are not the same argument.
            </p>
            <p>
              The post said the reversal itself is not in doubt. Encyclopaedia
              Iranica lists whether the daivas were originally gods among the
              questions still open, so that was too strong.
            </p>
            <p>
              The post glossed the Proto-Indo-European root as the shining one.
              The standard gloss is the celestial one, and Slavic divo and
              diviti se sit on the same root without meaning god at all.
            </p>
            <p>
              The post named Albanian div and dif in its opening line. We have
              not been able to source that to a reference work we can cite, and
              we are not repeating it until we can.
            </p>
            <p>
              The Georgian point stands. Georgian is Kartvelian, the word did
              not descend into it, and it was carried in. The borrowing route
              into South Slavic stands too, and is better supported than the
              post allowed.
            </p>
          </div>
        </article>
      </section>
    </article>
  );
}
