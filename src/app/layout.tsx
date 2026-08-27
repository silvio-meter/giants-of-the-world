import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutReturn } from "@/components/CheckoutReturn";
import { PlanProvider } from "@/components/PlanProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";
import { siteUrl, UMAMI_SCRIPT_SRC } from "@/lib/site";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Emits <meta name="color-scheme" content="dark">, read by the browser before
 * CSS parses. The globals.css `color-scheme: dark` on :root is the durable
 * declaration; this meta tag is the documented belt-and-braces addition
 * (see web.dev/articles/color-scheme) so native controls theme correctly from
 * the first paint rather than waiting on stylesheet load.
 *
 * Note this does not cover a mobile <select>'s option list, which Chrome for
 * Android themes from the OS regardless — hence FilterSelect.tsx.
 */
export const viewport: Viewport = {
  colorScheme: "dark",
};

/**
 * Site verification tokens. Public by nature, since they ship in the HTML, but
 * kept in env vars so either can be set or rotated without a code change.
 *
 * Built as two independent spreads rather than a branch, so adding Pinterest
 * cannot change what happens when only the Search Console token is set.
 */
const verificationTags = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.PINTEREST_DOMAIN_VERIFY
    ? { other: { "p:domain_verify": process.env.PINTEREST_DOMAIN_VERIFY } }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  verification: Object.keys(verificationTags).length
    ? verificationTags
    : undefined,
  title: {
    default: "Giants of the World",
    template: "%s · Giants of the World",
  },
  description:
    "A dark codex of giants from mythology, folklore, and modern legend across the world.",
  applicationName: "Giants of the World",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Giants of the World",
    title: "Giants of the World",
    description:
      "A dark codex of giants from mythology, folklore, and modern legend across the world.",
    images: [
      {
        url: "/images/featured.jpg",
        width: 1280,
        height: 720,
        alt: "Giants of the World: a giant in the mist under a pale moon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Giants of the World",
    description:
      "A dark codex of giants from mythology, folklore, and modern legend across the world.",
    images: ["/images/featured.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} ${mono.variable}`}>
      <body className="grain flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border focus:border-accent-gold focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-accent-gold"
        >
          Skip to content
        </a>
        <PlanProvider>
          <FavouritesProvider>
            <Header />
            <main id="main" className="relative flex-1">
              <Suspense fallback={null}>
                <CheckoutReturn />
              </Suspense>
              {children}
            </main>
            <Footer />
          </FavouritesProvider>
        </PlanProvider>
        <Analytics />
        {/*
          Umami Cloud, cookieless by design, which is why this site carries no
          consent banner and needs none. Replaced GA4, which set cookies and
          would have required one.

          Guarded so `npm run dev` never fires at the real property: NODE_ENV
          is "development" there and "production" for every real build,
          matching how the rest of the stack guards this.
        */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
          process.env.NODE_ENV === "production" && (
            <Script
              src={UMAMI_SCRIPT_SRC}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              strategy="afterInteractive"
            />
          )}
      </body>
    </html>
  );
}
