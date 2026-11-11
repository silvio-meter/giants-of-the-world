import type { Metadata } from "next";
import Link from "next/link";
import {
  BESTIARY_FAQS,
  BESTIARY_REFUND_FAQ,
  BESTIARY_SEO,
  ITCH_URL,
} from "@/lib/bestiary";
import { BestiaryFaq, BestiaryLicence, faqJsonLd } from "@/components/BestiaryParts";
import { siteUrl } from "@/lib/site";

/**
 * The paid bestiary's product page. Title, meta, H1, FAQ and schema come from
 * the SEO drafts (11 Nov 2026). The buy button and the Product schema stay
 * hidden until ITCH_URL is set (src/lib/bestiary.ts): Vol. 1 is sold on
 * itch.io first, and there is no own Stripe PDF checkout in this change.
 */
export const metadata: Metadata = {
  title: BESTIARY_SEO.title,
  description: BESTIARY_SEO.description,
  alternates: { canonical: "/bestiary" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/bestiary",
    title: `${BESTIARY_SEO.title} · Giants of the World`,
    description: BESTIARY_SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: `${BESTIARY_SEO.title} · Giants of the World`,
    description: BESTIARY_SEO.description,
  },
};

export default function BestiaryPage() {
  const onSale = Boolean(ITCH_URL);
  const faqs = onSale ? [...BESTIARY_FAQS, BESTIARY_REFUND_FAQ] : BESTIARY_FAQS;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Bestiary",
          item: `${siteUrl}/bestiary`,
        },
      ],
    },
    faqJsonLd(faqs, `${siteUrl}/bestiary#faq`),
  ];
  if (onSale && ITCH_URL) {
    // No AggregateRating until real reviews exist (SEO draft).
    graph.push({
      "@type": "Product",
      name: "The Giants Bestiary, Vol. 1",
      description: BESTIARY_SEO.description,
      url: `${siteUrl}/bestiary`,
      offers: {
        "@type": "Offer",
        price: "6",
        priceCurrency: "USD",
        url: ITCH_URL,
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
        }}
      />
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          {BESTIARY_SEO.h1}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          {BESTIARY_SEO.description}
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href="/bestiary/free-sample"
          className="inline-flex items-center justify-center rounded border border-accent-gold/60 bg-accent-gold/10 px-5 py-2.5 text-sm font-medium tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/20"
        >
          Read the free sample
        </Link>
        {onSale && ITCH_URL ? (
          <a
            href={ITCH_URL}
            rel="noopener"
            className="inline-flex items-center justify-center rounded border border-border px-5 py-2.5 text-sm text-text-muted transition hover:border-accent-gold/50 hover:text-accent-gold"
          >
            Get Vol. 1 on itch.io
          </a>
        ) : null}
      </div>

      <BestiaryFaq faqs={faqs} />
      <BestiaryLicence />
    </div>
  );
}
