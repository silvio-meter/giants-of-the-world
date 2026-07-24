import type { Metadata } from "next";

/** The pricing page is a client component, so its metadata lives here. */
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Monthly, yearly, or lifetime access to the full codex of giants.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
