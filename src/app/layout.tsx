import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlanProvider } from "@/components/PlanProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";
import { siteUrl } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  // Search Console token. Public by nature (it ships in the HTML), but kept in
  // an env var so it can be set or rotated without a code change.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
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
        alt: "Giants of the World - a giant in the mist under a pale moon",
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
        <PlanProvider>
          <FavouritesProvider>
            <Header />
            <main className="relative flex-1">{children}</main>
            <Footer />
          </FavouritesProvider>
        </PlanProvider>
        <Analytics />
      </body>
    </html>
  );
}
