/**
 * Unsourced figures removed from held entries (Catalogue's hold-list review,
 * 11 Nov 2026, approved by Silvio). Checks every reader-facing field; the
 * internal `handling` notes are editorial and not rendered.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = JSON.parse(readFileSync(join(root, "src/data/giants.json"), "utf8"));
const bySlug = new Map(master.map((g) => [g.slug, g]));

function readerText(slug) {
  const { handling: _h, ...rest } = bySlug.get(slug);
  void _h;
  return JSON.stringify(rest);
}

const REMOVED = {
  "patagonian-giants": [/Fifteen feet in 1520/],
  "guanche-giants": [/1\.75 (to|and) 1\.82/, /forty-six|46 genomes/i],
  mapinguari: [/thousands of teeth/i],
  pangu: [/tomb/i],
  "giant-of-kunar": [/flashpoint that can be dated with confidence is around 2016/],
};

test("the unsourced sentences are gone from reader-facing text", () => {
  for (const [slug, patterns] of Object.entries(REMOVED)) {
    for (const re of patterns) {
      assert.doesNotMatch(readerText(slug), re, `${slug} still has ${re}`);
    }
  }
});

test("Catalogue's replacement lines are used where the review gives one", () => {
  assert.ok(
    bySlug.get("mapinguari").sections.story.includes(
      "The mouth is described as running vertically from the nose to the stomach. The cited sources do not give a tooth count."
    )
  );
  assert.ok(
    bySlug.get("pangu").sections.origins.includes(
      "Xu Zheng, writing in the third century CE, is the earliest surviving written version, not the inventor of the myth."
    )
  );
  assert.ok(
    bySlug.get("giant-of-kunar").sections.origins.includes(
      "The 2016 Marzulli interview belongs to the Kandahar telling."
    )
  );
  assert.ok(
    bySlug.get("patagonian-giants").fullDescription.startsWith(
      "Pigafetta, in the 1520s, described a man taller than the Europeans looking at him, without giving a height in feet."
    )
  );
});

const HEIGHT_WORDING = {
  "tsul-kalu": "Not stated as a measurement in the sources.",
  "kee-wakw": "Not stated as a measurement in the sources.",
  gaoh: "A powerful being with a cosmological office. No numeric height in the sources.",
  "budj-bim": "Ancestral scale. Not a measured height.",
  papinijuwari: "Not stated as a measurement in the sources.",
  murkupang: "Not stated as a measurement in the sources.",
  "thardid-jimbo": "Not stated as a measurement in the sources.",
  "chinny-kinik": "Not stated as a measurement in the sources.",
  "kahui-tipua": "Supernatural scale in the sources. Not a measured height.",
  amazimu: "Large in the tales. Not a measured height.",
  stallo: "Large in the tales. Not a measured height.",
  "patagonian-giants":
    "Later reports claimed twelve to fifteen feet. Bougainville, published 1771, gave the tallest as five feet nine French feet, about six English feet.",
};

test("Catalogue's height wording is applied and still gives no chart", () => {
  const pub = new Map(
    JSON.parse(readFileSync(join(root, "src/data/giants.public.json"), "utf8")).map((g) => [g.slug, g])
  );
  for (const [slug, text] of Object.entries(HEIGHT_WORDING)) {
    assert.equal(bySlug.get(slug).height, text, slug);
    assert.equal(pub.get(slug).heightMeters, null, `${slug} has a chart`);
  }
});

test("Thardid Jimbo no longer retells the plot or gives a height", () => {
  const t = readerText("thardid-jimbo");
  assert.doesNotMatch(t, /over two metres/i);
  assert.doesNotMatch(t, /taking a woman|takes a woman/i);
  const g = bySlug.get("thardid-jimbo");
  assert.ok(g.fullDescription.endsWith("so this entry does not retell the plot or give a height."));
  assert.ok(g.sections.story.startsWith("As with Murkupang,"));
  assert.ok(g.sections.story.includes("This entry therefore does not retell narrative details."));
  assert.equal(g.fate, "Not confirmed, and not retold here.");
});

test("Kandahar origins, Patagonian fate and the two short descriptions use Catalogue's text", () => {
  assert.ok(
    bySlug.get("giant-of-kandahar").sections.origins.startsWith(
      "The story has no primary source. Traceable broadcasts include Coast to Coast AM programme pages from 2005 and 2008"
    )
  );
  assert.equal(
    bySlug.get("patagonian-giants").fate,
    "Ended by measurement. Bougainville's 1771 voyage account gives the tallest as five feet nine French feet, about six English feet."
  );
  assert.equal(
    bySlug.get("papinijuwari").shortDescription,
    "One-eyed giant spirits of Tiwi tradition, associated with sickness, death and falling stars."
  );
  assert.ok(bySlug.get("murkupang").shortDescription.startsWith("A cannibal giant recorded under this name"));
});
