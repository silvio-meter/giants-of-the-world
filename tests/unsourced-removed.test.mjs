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
