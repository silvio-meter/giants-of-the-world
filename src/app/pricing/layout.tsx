import type { Metadata } from "next";

/** The pricing page is a client component, so its metadata lives here. */
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Monthly, yearly, or lifetime access to the full codex of giants.",
  alternates: { canonical: "/pricing" },
  // File-based opengraph-image / twitter-image supply the 1200x630 card.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Giants of the World",
    url: "/pricing",
    title: "Pricing · Giants of the World",
    description:
      "Monthly, yearly, or lifetime access to the full codex of giants.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@TheGiantsCodex",
    title: "Pricing · Giants of the World",
    description:
      "Monthly, yearly, or lifetime access to the full codex of giants.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
