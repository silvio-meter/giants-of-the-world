/**
 * PR1 Finding permalinks: five shipped slugs, exact SEO copy, no Kandahar,
 * no em dashes in new SEO/user-facing Finding strings.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const findings = require(join(root, "src/data/findings.json"));
const seoSrc = readFileSync(join(root, "src/lib/finding-seo.ts"), "utf8");
const giantsSrc = readFileSync(join(root, "src/lib/giants.ts"), "utf8");
const pageSrc = readFileSync(
  join(root, "src/app/findings", "[slug]", "page.tsx"),
  "utf8"
);
const sitemapSrc = readFileSync(join(root, "src/app/sitemap.ts"), "utf8");
const hubSrc = readFileSync(join(root, "src/app/findings/page.tsx"), "utf8");

const SHIPPED = [
  "cardiff-giant",
  "goliath-height-manuscripts",
  "og-iron-bed",
  "lovelock-si-te-cah-remains",
  "solid-muldoon",
];

const ID_TO_SLUG = {
  "cardiff-giant": "cardiff-giant",
  "goliath-height-variants": "goliath-height-manuscripts",
  "og-bed-dimensions": "og-iron-bed",
  "si-te-cah-bones": "lovelock-si-te-cah-remains",
  "solid-muldoon": "solid-muldoon",
};

const EM = "\u2014";

test("findings.json carries slug on the five PR1 entries", () => {
  for (const [id, slug] of Object.entries(ID_TO_SLUG)) {
    const f = findings.find((x) => x.id === id);
    assert.ok(f, `missing finding id ${id}`);
    assert.equal(f.slug, slug);
  }
});

test("FIRST_FINDING_PERMALINKS lists exactly the five shipped URLs", () => {
  for (const slug of SHIPPED) {
    assert.ok(giantsSrc.includes(`"${slug}"`), slug);
  }
  assert.ok(!giantsSrc.includes("kandahar"));
  assert.ok(!giantsSrc.includes("kunar"));
  assert.ok(!pageSrc.toLowerCase().includes("kandahar"));
});

test("FINDING_SEO titles omit brand suffix and match SEO brief", () => {
  const suffix = " · Giants of the World";
  assert.ok(seoSrc.includes('title: "Cardiff Giant: the 1869 gypsum hoax"'));
  assert.ok(
    seoSrc.includes('title: "Goliath\'s height in the Hebrew manuscripts"')
  );
  assert.ok(seoSrc.includes('title: "Og\'s iron bed in Deuteronomy 3:11"'));
  assert.ok(
    seoSrc.includes(
      'title: "Lovelock Cave: Si-Te-Cah remains and the tradition"'
    )
  );
  assert.ok(
    seoSrc.includes('Solid Muldoon: the 1877 Colorado "petrified man"')
  );
  // Comment may mention the template suffix; title field values must omit it.
  for (const m of seoSrc.matchAll(/title: (["'])([\s\S]*?)\1/g)) {
    assert.ok(!m[2].includes(suffix), `title has site suffix: ${m[2]}`);
  }
  // User-facing string literals (h1/title/description) must not use em dash.
  const literals = [...seoSrc.matchAll(/(?:h1|title|description): (["'])([\s\S]*?)\1/g)].map(
    (m) => m[2]
  );
  for (const lit of literals) {
    assert.ok(!lit.includes(EM), `em dash in SEO literal: ${lit.slice(0, 60)}`);
  }
});

test("FINDING_SEO H1s match the SEO brief", () => {
  assert.ok(seoSrc.includes('h1: "The Cardiff Giant (1869)"'));
  assert.ok(seoSrc.includes('h1: "Goliath\'s height in the manuscripts"'));
  assert.ok(seoSrc.includes('h1: "Og\'s iron bed (Deuteronomy 3:11)"'));
  assert.ok(
    seoSrc.includes('h1: "Lovelock Cave and the Si-Te-Cah remains"')
  );
  assert.ok(seoSrc.includes('h1: "The Solid Muldoon (1877)"'));
});

test("hub links shipped H2s; sitemap includes the five URLs", () => {
  assert.ok(hubSrc.includes("isShippedFindingSlug"));
  assert.ok(hubSrc.includes("findingUrlSlug"));
  assert.ok(hubSrc.includes("`/findings/${permalink}`"));
  assert.ok(sitemapSrc.includes("getShippedFindingSlugs"));
  assert.ok(sitemapSrc.includes("`${siteUrl}/findings/${slug}`"));
});

test("detail page uses SEO helpers and static params for shipped only", () => {
  assert.ok(pageSrc.includes("getFindingSeo"));
  assert.ok(pageSrc.includes("getShippedFindingSlugs"));
  assert.ok(pageSrc.includes("isShippedFindingSlug"));
  assert.ok(pageSrc.includes("getFindingSeeAlsoSlug"));
  assert.ok(pageSrc.includes("notFound()"));
});
