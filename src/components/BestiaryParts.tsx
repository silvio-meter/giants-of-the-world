import { COPYRIGHT_LINE, SRD_ATTRIBUTION, type Faq } from "@/lib/bestiary";

/** Visible FAQ list. FAQPage schema is emitted only next to this. */
export function BestiaryFaq({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section
      id="faq"
      className="mt-14 border-t border-border pt-10"
      aria-labelledby="bestiary-faq-heading"
    >
      <h2
        id="bestiary-faq-heading"
        className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase"
      >
        Frequently asked
      </h2>
      <dl className="mt-4 space-y-5">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-[family-name:var(--font-cinzel)] text-base text-text-primary">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-text-muted">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Rights line and the exact SRD 5.2 CC BY 4.0 attribution. */
export function BestiaryLicence() {
  return (
    <section className="mt-14 border-t border-border pt-6 text-xs leading-relaxed text-text-muted">
      <p>{COPYRIGHT_LINE}</p>
      <p className="mt-2">{SRD_ATTRIBUTION}</p>
    </section>
  );
}

export function faqJsonLd(faqs: Faq[], id: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
