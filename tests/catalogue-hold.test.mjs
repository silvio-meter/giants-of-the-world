/**
 * Catalogue opening, 11 Nov 2026: hold list, withdrawn images, membership off.
 *
 * Source and data assertions run on every `npm test`. The served-HTML half
 * (sitemap, JSON-LD, /pricing redirect) runs when BASE is set, like the other
 * served checks:
 *   npm run build && PORT=3114 npm start
 *   BASE=http://localhost:3114 npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CATALOGUE_HOLD_SLUGS,
  HOLD_LIVING_TRADITIONS,
  HOLD_MODERN_MILITARY,
  isCatalogueHeld,
} from "../src/lib/catalogue-hold.ts";
import { MEMBERSHIP_SALES_OPEN } from "../src/lib/membership.ts";
import {
  ITCH_URL,
  SRD_ATTRIBUTION,
  SAMPLE_NEWSLETTER_SOURCE,
  SAMPLE_SKU,
} from "../src/lib/bestiary.ts";
import { normalizeNewsletterSource } from "../src/lib/newsletter.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const master = JSON.parse(read("src/data/giants.json"));
const publicEntries = JSON.parse(read("src/data/giants.public.json"));
const bySlug = new Map(publicEntries.map((g) => [g.slug, g]));

/** Exactly the (a) + (b) entries of Catalogue's open-92 checklist. */
const EXPECTED_HOLD = [
  "amazimu", "budj-bim", "chinny-kinik", "dzunukwa", "gaoh", "giant-of-kandahar",
  "giant-of-kunar", "giant-of-the-forest", "guanche-giants", "kahui-tipua",
  "kee-wakw", "mapinguari", "murkupang", "nawao", "pangu",
  "papinijuwari", "patagonian-giants", "stallo", "thardid-jimbo",
  "tsul-kalu",
];
/** Held entries that were already free before the opening; they stay free. */
const HELD_ALREADY_FREE = [
  "budj-bim", "chinny-kinik", "giant-of-the-forest", "murkupang",
  "thardid-jimbo", "tsul-kalu",
];
/** ENTRY_SEO records that held slugs already had before the opening. */
const HELD_WITH_PREEXISTING_SEO = [
  "giant-of-kandahar", "giant-of-kunar", "guanche-giants", "mapinguari",
  "pangu", "patagonian-giants",
];
const IMAGES_REMOVED = [
  "budj-bim", "murkupang", "papinijuwari", "patagonian-giants", "thardid-jimbo",
  "tsul-kalu",
];
/** Never-open entries whose image was withdrawn too (Silvio, 11 Nov 20:47). */
const NEVER_OPEN_IMAGES_REMOVED = ["dzunukwa"];

test("hold list is the 18 living traditions plus Kandahar and Kunar", () => {
  assert.equal(HOLD_LIVING_TRADITIONS.length, 18);
  assert.deepEqual([...HOLD_MODERN_MILITARY], ["giant-of-kandahar", "giant-of-kunar"]);
  assert.deepEqual([...CATALOGUE_HOLD_SLUGS].sort(), EXPECTED_HOLD);
  for (const slug of CATALOGUE_HOLD_SLUGS) {
    assert.ok(bySlug.has(slug), `${slug} is not a catalogue slug`);
  }
});

test("every entry outside the hold list is open; held entries keep their old access", () => {
  for (const g of publicEntries) {
    if (isCatalogueHeld(g.slug)) {
      assert.equal(
        g.freeEntry,
        HELD_ALREADY_FREE.includes(g.slug),
        `${g.slug}: a held entry must keep the access it had before the opening`
      );
    } else {
      assert.equal(g.freeEntry, true, `${g.slug} should be open`);
    }
  }
  assert.equal(bySlug.get("dzunukwa").freeEntry, false, "dzunukwa stays closed");
  const dz = master.find((g) => g.slug === "dzunukwa");
  assert.equal(dz.handling?.publishable, false);
});

test("lore never travels in the public catalogue", () => {
  for (const field of ["fullDescription", "mysteryNote", "sections", "sessionPrep", "chain", "handling", "scholarlyNotes"]) {
    for (const g of publicEntries) {
      assert.ok(!(field in g), `${g.slug} leaks ${field} into giants.public.json`);
    }
  }
});

test("sitemap leaves out held entries and /pricing, and lists /bestiary", () => {
  const src = read("src/app/sitemap.ts");
  assert.ok(src.includes('import { isCatalogueHeld } from "@/lib/catalogue-hold";'));
  assert.ok(src.includes(".filter((g) => !isCatalogueHeld(g.slug))"));
  assert.ok(!src.includes('"/pricing"'));
  assert.ok(src.includes('"/bestiary"'));
  assert.ok(src.includes('"/bestiary/free-sample"'));
});

test("sitemap lastModified is a committed per-entry date, never the build time", () => {
  const src = read("src/app/sitemap.ts");
  assert.ok(!/new Date\(\s*\)/.test(src), "sitemap builds a Date from the clock");
  assert.ok(!/Date\.now\(/.test(src), "sitemap reads the clock");
  assert.ok(!/\bnow\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, "")), "sitemap still uses `now`");
  assert.match(src, /lastModified: new Date\(`\$\{g\.updatedAt \?\? STATIC_LAST_MODIFIED\}T00:00:00Z`\)/);
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const g of master) {
    assert.match(g.updatedAt ?? "", iso, `${g.slug} has no updatedAt`);
    assert.ok(g.updatedAt <= "2026-11-11" && g.updatedAt >= "2026-07-01", `${g.slug} updatedAt out of range`);
  }
  // Entries this PR touched carry its date; untouched ones keep their git date.
  const masterBySlug = new Map(master.map((g) => [g.slug, g]));
  for (const slug of [...IMAGES_REMOVED, "humbaba", "thrym", "balor", "giant-of-kandahar"]) {
    assert.equal(masterBySlug.get(slug).updatedAt, "2026-11-11", slug);
  }
  assert.ok(new Set(master.map((g) => g.updatedAt)).size > 1, "every entry has the same date");
});

test("homepage strip has no hold-list slug and no image-less entry", () => {
  const page = read("src/app/page.tsx");
  const block = page.split("const FREE_STRIP_ORDER = [")[1]?.split("];")[0] ?? "";
  const strip = [...block.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.ok(strip.length >= 10, "FREE_STRIP_ORDER not found");
  const masterBySlug = new Map(master.map((g) => [g.slug, g]));
  for (const slug of strip) {
    assert.ok(!CATALOGUE_HOLD_SLUGS.includes(slug), `${slug} is held but on the homepage strip`);
    assert.ok(masterBySlug.get(slug)?.image, `${slug} has no image but is on the homepage strip`);
  }
  // The render filter enforces it too, if a slug is ever added back.
  assert.match(page, /!isCatalogueHeld\(g\.slug\) && Boolean\(g\.image\)/);
});

test("footer: no refund promise, 'Free to read. Corrections:' with the support address", () => {
  const footer = read("src/components/Footer.tsx");
  assert.ok(!/refund/i.test(footer));
  assert.ok(footer.includes('Free to read. Corrections:{" "}'));
  assert.ok(footer.includes("href={`mailto:${supportEmail}`}"));
});

test("held entries keep the paywall schema; opened entries drop it", () => {
  const page = read("src/app/giants/[slug]/page.tsx");
  // Schema follows freeEntry: open -> isAccessibleForFree true and no hasPart;
  // locked (held) -> isAccessibleForFree false with the .paywalled-account part.
  assert.ok(page.includes("isAccessibleForFree: giant.freeEntry,"));
  assert.match(page, /\.\.\.\(giant\.freeEntry\s*\?\s*\{\}\s*:\s*\{\s*hasPart:/);
  assert.ok(page.includes('cssSelector: ".paywalled-account"'));
  const lockedHeld = publicEntries.filter((g) => !g.freeEntry).map((g) => g.slug);
  assert.equal(lockedHeld.length, 14);
  for (const slug of lockedHeld) assert.ok(isCatalogueHeld(slug), `${slug} locked but not held`);
});

test("Session Prep is not tied to freeEntry any more", () => {
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(!page.includes("const sessionPrepCard = !giant.freeEntry"));
  assert.ok(page.includes("giant.freeEntry && isCatalogueHeld(giant.slug)"));
  assert.ok(page.includes("<SessionPrepCard slug={giant.slug} card={sessionPrepCard} />"));
});

test("ENTRY_SEO: no new record for a held slug, no Unlock or teaser in any meta", () => {
  const src = read("src/lib/seo-entries.ts");
  const keys = [...src.matchAll(/^  (?:"([a-z-]+)"|([a-z]+)): \{$/gm)].map((m) => m[1] ?? m[2]);
  const heldKeys = keys.filter((k) => isCatalogueHeld(k)).sort();
  assert.deepEqual(heldKeys, HELD_WITH_PREEXISTING_SEO);
  const descriptions = [...src.matchAll(/description:\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const d of descriptions) {
    assert.ok(!/unlock/i.test(d), `meta still says Unlock: ${d}`);
    assert.ok(!/teaser/i.test(d), `meta still says teaser: ${d}`);
  }
});

test("Kandahar and Kunar carry the soldiers' tale status line", () => {
  for (const slug of ["giant-of-kandahar", "giant-of-kunar"]) {
    const g = bySlug.get(slug);
    assert.equal(g.statusLine, "Contemporary soldiers' tale, unverified.");
    assert.equal(g.type, "modern-legend", "statusLine renders in the modern-legend note");
  }
});

test("six withdrawn images: no image field and no file", () => {
  for (const slug of [...IMAGES_REMOVED, ...NEVER_OPEN_IMAGES_REMOVED]) {
    for (const data of [master, publicEntries]) {
      const g = data.find((e) => e.slug === slug);
      assert.ok(g, slug);
      assert.ok(!("image" in g) && !("imageAlt" in g), `${slug} still has an image field`);
    }
    for (const ext of ["jpg", "jpeg", "png", "webp", "avif"]) {
      assert.ok(
        !existsSync(join(root, "public/images/giants", `${slug}.${ext}`)),
        `public/images/giants/${slug}.${ext} must be deleted`
      );
    }
  }
  // Nobody else lost an image by accident.
  const withImage = publicEntries.filter((g) => g.image).length;
  assert.equal(withImage, publicEntries.length - IMAGES_REMOVED.length - NEVER_OPEN_IMAGES_REMOVED.length);
});

test("no-image surfaces: text-only share card, schema fallback, empty frames", () => {
  const og = read("src/app/giants/[slug]/opengraph-image.tsx");
  assert.ok(!og.includes(">\n              No image\n"), "the No image panel is gone");
  assert.ok(!/>\s*No image\s*</.test(og));
  assert.ok(og.includes("textOnlyCard(giant)"));
  assert.ok(og.includes("giant.statusLine"));
  const tw = read("src/app/giants/[slug]/twitter-image.tsx");
  assert.ok(tw.includes('from "./opengraph-image"'));
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(page.includes("`${siteUrl}/opengraph-image.jpg`"));
  assert.ok(existsSync(join(root, "src/app/opengraph-image.jpg")));
  const placeholder = read("src/components/ImagePlaceholder.tsx");
  assert.ok(placeholder.includes("const showImage = !failed && Boolean(src);"));
  const exportCard = read("src/components/CompareExportCard.tsx");
  assert.ok(exportCard.includes("{g.image ? ("));
  const motifs = read("src/app/motifs/page.tsx");
  assert.ok(motifs.includes("g.image ?"));
  for (const f of ["src/app/findings/page.tsx", "src/app/findings/[slug]/page.tsx"]) {
    assert.ok(read(f).includes("if (g?.image)"), `${f} must skip giants without an image`);
  }
});

test("remaining images carry a visible AI illustration label", () => {
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.match(page, /\{giant\.image \? \([\s\S]*?AI illustration[\s\S]*?\) : null\}/);
});

test("membership off: no pricing links in nav or footer, /pricing redirects", () => {
  assert.equal(MEMBERSHIP_SALES_OPEN, false);
  for (const f of ["src/components/Header.tsx", "src/components/Footer.tsx"]) {
    const src = read(f);
    assert.ok(!src.includes('"/pricing"'), `${f} links to /pricing`);
    assert.ok(!/>\s*Pricing\s*</.test(src), `${f} shows a Pricing label`);
  }
  const config = read("next.config.ts");
  assert.match(config, /source: "\/pricing",\s*destination: "\/giants",\s*permanent: false/);
  // Checkout plumbing stays for existing members and the webhook.
  for (const f of [
    "src/app/api/checkout/route.ts",
    "src/app/api/webhook/stripe/route.ts",
    "src/app/api/portal/route.ts",
    "src/app/pricing/page.tsx",
  ]) {
    assert.ok(existsSync(join(root, f)), `${f} must not be deleted`);
  }
});

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const f = join(dir, n);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });
}

test("no rendered href to /pricing outside the pricing route itself", () => {
  const offenders = walk(join(root, "src"))
    .filter((f) => /\.tsx$/.test(f))
    .filter((f) => !f.includes("/src/app/pricing/"))
    // Legal page: keeps its existing wording; the link now lands on /giants.
    .filter((f) => !f.endsWith("/src/app/terms/page.tsx"))
    // Gold-wall branch, rendered only when MEMBERSHIP_SALES_OPEN is true.
    .filter((f) => !f.endsWith("/src/components/PremiumLock.tsx"))
    .filter((f) => /href=["{`]+\/pricing/.test(readFileSync(f, "utf8")))
    .map((f) => f.replace(root + "/", ""));
  assert.deepEqual(offenders, []);
  const lock = read("src/components/PremiumLock.tsx");
  assert.ok(lock.includes("if (!MEMBERSHIP_SALES_OPEN) {"));
});

test("Umami: lock_view on walls, sample download by sku, no PII keys", () => {
  assert.ok(read("src/components/PremiumLock.tsx").includes("<LockViewEvent"));
  const lv = read("src/components/LockViewEvent.tsx");
  assert.ok(lv.includes('umamiEvent("lock_view"'));
  assert.ok(lv.includes("if (!ready || isPaid) return;"));
  const dl = read("src/components/SampleDownloadLink.tsx");
  assert.ok(dl.includes('umamiEvent("pdf_sample_download", { sku })'));
  assert.equal(SAMPLE_SKU, "sample-3-giants");
  const calls = walk(join(root, "src"))
    .filter((f) => /\.tsx?$/.test(f))
    .flatMap((f) => [...readFileSync(f, "utf8").matchAll(/umamiEvent\(("[\s\S]*?)\);/g)].map((m) => m[1]));
  assert.ok(calls.length > 0);
  for (const c of calls) {
    assert.ok(!/\b(email|name|userId|user_id|ip|lat|lng|latitude|longitude|customer|session_id)\s*:/.test(c), `PII-like prop in umamiEvent(${c})`);
  }
  assert.ok(!read("src/lib/umami.ts").includes("pricing_view\","));
});

test("bestiary: no buy button yet, exact SRD attribution, 5E compatible wording only", () => {
  assert.equal(ITCH_URL, null);
  assert.equal(
    SRD_ATTRIBUTION,
    "This work includes material from the System Reference Document 5.2 (“SRD 5.2”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode."
  );
  for (const f of [
    "src/lib/bestiary.ts",
    "src/app/bestiary/page.tsx",
    "src/app/bestiary/free-sample/page.tsx",
    "src/components/BestiaryParts.tsx",
  ]) {
    const src = read(f);
    assert.ok(!/D&D|D&amp;D|Dungeons/i.test(src), `${f} names the game`);
  }
  // All bestiary copy lives in src/lib/bestiary.ts. Draft placeholders like
  // [N] or [confirm contents with Catalogue] must never reach a literal.
  assert.ok(!/"[^"\n]*\[[A-Za-z][^\]\n]*\][^"\n]*"/.test(read("src/lib/bestiary.ts")));
  const sample = read("src/app/bestiary/free-sample/page.tsx");
  assert.ok(sample.includes("sourcePage={SAMPLE_NEWSLETTER_SOURCE}"));
  assert.ok(!/login|signup|required/i.test(sample.split("export default")[1]), "sample download must not need an account");
  assert.equal(SAMPLE_NEWSLETTER_SOURCE, "prep-sample");
  assert.equal(normalizeNewsletterSource("prep-sample"), "prep-sample");
});

// ---------------------------------------------------------------------------
// Served checks (BASE set).
// ---------------------------------------------------------------------------

const BASE = process.env.BASE;
const skip = BASE ? false : "BASE not set";
const get = (path, init) => fetch(BASE + path, { cache: "no-store", ...init });
const ld = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1])
  );
const article = (html) =>
  ld(html)
    .flatMap((j) => j["@graph"] ?? [j])
    .find((n) => n["@type"] === "Article");

test("served: sitemap has no held entry and no /pricing", { skip }, async () => {
  const xml = await (await get("/sitemap.xml")).text();
  for (const slug of CATALOGUE_HOLD_SLUGS) {
    assert.ok(!xml.includes(`/giants/${slug}<`), `${slug} in sitemap`);
  }
  assert.ok(!xml.includes("/pricing<"));
  assert.ok(xml.includes("/giants/humbaba<"));
  assert.ok(xml.includes("/bestiary/free-sample<"));
});

test("served: sitemap entry lastmod is the entry's updatedAt, not the build time", { skip }, async () => {
  const xml = await (await get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  let seen = 0;
  for (const g of master) {
    if (CATALOGUE_HOLD_SLUGS.includes(g.slug)) continue;
    const u = urls.find((x) => x.includes(`/giants/${g.slug}<`));
    assert.ok(u, `${g.slug} missing from sitemap`);
    const lastmod = u.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    assert.equal(lastmod, `${g.updatedAt}T00:00:00.000Z`, g.slug);
    seen++;
  }
  assert.ok(seen > 60);
  for (const u of urls) {
    const lastmod = u.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "";
    assert.match(lastmod, /T00:00:00\.000Z$/, `build-time lastmod: ${u.trim().slice(0, 80)}`);
  }
});

test("served: homepage strip and footer", { skip }, async () => {
  const html = await (await get("/")).text();
  for (const slug of CATALOGUE_HOLD_SLUGS) {
    assert.ok(!html.includes(`href="/giants/${slug}"`), `${slug} linked from the homepage`);
  }
  assert.ok(html.includes("Free to read. Corrections:"));
  assert.ok(!html.includes("-day refund"));
});

test("served: opened entry is fully open, held entry keeps its paywall schema", { skip }, async () => {
  const humbaba = await (await get("/giants/humbaba")).text();
  const a = article(humbaba);
  assert.equal(a.isAccessibleForFree, true);
  assert.equal(a.hasPart, undefined);
  assert.ok(humbaba.includes("AI illustration"));
  const kunar = await (await get("/giants/giant-of-kunar")).text();
  const k = article(kunar);
  assert.equal(k.isAccessibleForFree, false);
  assert.equal(k.hasPart?.cssSelector, ".paywalled-account");
  assert.ok(kunar.includes("Contemporary soldiers&#x27; tale, unverified.") || kunar.includes("Contemporary soldiers' tale, unverified."));
  const budj = await (await get("/giants/budj-bim")).text();
  assert.ok(article(budj).image.endsWith("/opengraph-image.jpg"));
  assert.ok(!budj.includes("/images/giants/budj-bim.jpg"));
});

test("served: /pricing redirects to /giants; removed image files 404", { skip }, async () => {
  const res = await get("/pricing", { redirect: "manual" });
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location") ?? "", /\/giants$/);
  for (const slug of IMAGES_REMOVED) {
    const img = await get(`/images/giants/${slug}.jpg`);
    assert.equal(img.status, 404, `${slug}.jpg still served`);
  }
});
