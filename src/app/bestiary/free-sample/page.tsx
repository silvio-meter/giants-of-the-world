import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import {
  SAMPLE_FAQS,
  SAMPLE_GIANTS,
  SAMPLE_NEWSLETTER_SOURCE,
  SAMPLE_PDF_PATH,
  SAMPLE_SEO,
  SAMPLE_SKU,
} from "@/lib/bestiary";
import { BestiaryFaq, BestiaryLicence, faqJsonLd } from "@/components/BestiaryParts";
import { EmailCapture } from "@/components/EmailCapture";
import { SampleDownloadLink } from "@/components/SampleDownloadLink";
import { siteUrl } from "@/lib/site";

/**
 * The free bestiary sample. Download needs no account and no email; the One
 * Seam form below is optional (sourcePage "prep-sample"). Copy from the SEO
 * drafts and Catalogue's sample draft only. Breadcrumb schema only, no
 * Product schema: it is free.
 *
 * The PDF lives at public/downloads/giants-bestiary-sample.pdf. Until that
 * file is committed the button renders as not yet available instead of a
 * dead link (checked at build time; the page is static).
 */
export const metadata: Metadata = {
  title: { absolute: SAMPLE_SEO.title },
  description: SAMPLE_SEO.description,
  alternates: { canonical: "/bestiary/free-sample" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/bestiary/free-sample",
    title: SAMPLE_SEO.title,
    description: SAMPLE_SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: SAMPLE_SEO.title,
    description: SAMPLE_SEO.description,
  },
};

export default function FreeSamplePage() {
  const available = existsSync(
    join(process.cwd(), "public", SAMPLE_PDF_PATH.replace(/^\//, ""))
  );

  const graph = [
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
        {
          "@type": "ListItem",
          position: 3,
          name: "Free sample",
          item: `${siteUrl}/bestiary/free-sample`,
        },
      ],
    },
    faqJsonLd(SAMPLE_FAQS, `${siteUrl}/bestiary/free-sample#faq`),
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
        }}
      />
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
        <Link href="/bestiary" className="hover:text-accent-gold">
          Bestiary
        </Link>
        <span className="opacity-40" aria-hidden>
          /
        </span>
        <span className="text-text-primary">Free sample</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          {SAMPLE_SEO.h1}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          {SAMPLE_SEO.description}
        </p>
      </header>

      <ul className="space-y-3">
        {SAMPLE_GIANTS.map((g) => (
          <li key={g.slug} className="rounded-lg border border-border bg-surface px-4 py-3">
            <Link
              href={`/giants/${g.slug}`}
              className="font-[family-name:var(--font-cinzel)] text-accent-gold hover:underline"
            >
              {g.name}
            </Link>
            <p className="mt-1 text-sm text-text-muted">{g.line}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <SampleDownloadLink href={SAMPLE_PDF_PATH} sku={SAMPLE_SKU} available={available} />
        <Link href="/bestiary" className="text-sm text-accent-gold hover:underline">
          About the Giants Bestiary
        </Link>
      </div>

      <div className="mt-10">
        <EmailCapture variant="detail" sourcePage={SAMPLE_NEWSLETTER_SOURCE} />
      </div>

      <BestiaryFaq faqs={SAMPLE_FAQS} />
      <BestiaryLicence />
    </div>
  );
}
