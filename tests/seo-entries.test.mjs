import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/lib/seo-entries.ts"), "utf8");

const EIGHT = [
  "atlas",
  "fomorians",
  "goliath",
  "nephilim",
  "polyphemus",
  "ravana",
  "si-te-cah",
  "ymir",
];

function entryBlock(slug) {
  const key = slug.includes("-") ? `"${slug}"` : slug;
  const re = new RegExp(`${key}: \\{([\\s\\S]*?)\\n  \\},`);
  const m = src.match(re);
  assert.ok(m, `missing ENTRY_SEO.${slug}`);
  return m[1];
}

test("SEO overrides exist for the eight free doors", () => {
  for (const slug of EIGHT) {
    assert.ok(entryBlock(slug).includes("title:"));
  }
  assert.ok(!src.includes("tsul-kalu"));
  assert.equal((src.match(/faqs:/g) || []).length, 8);
});

test("SEO titles omit the site suffix; copy has no em dash", () => {
  const em = "\u2014";
  const suffix = " · Giants of the World";
  assert.ok(src.includes('title: "Atlas: sky and pillars, not the globe"'));
  assert.ok(src.includes("How tall was Goliath?"));
  assert.ok(src.includes("what Genesis actually says"));
  assert.ok(src.includes("the world made from a body"));
  assert.ok(src.includes("the Cyclops of the Odyssey"));
  assert.ok(src.includes("ten-headed king of the Ramayana"));
  assert.ok(src.includes("Irish adversaries of the Tuatha"));
  assert.ok(src.includes("Lovelock Cave, what Winnemucca wrote"));
  assert.ok(!src.includes(suffix));
  assert.ok(!src.includes(em));
  assert.equal((src.match(/Free sourced entry\./g) || []).length, 8);
});

test("each of the eight doors ships five FAQ Q&As", () => {
  for (const slug of EIGHT) {
    const block = entryBlock(slug);
    const questions = (block.match(/question:/g) || []).length;
    assert.equal(questions, 5, `${slug} should have 5 faqs, got ${questions}`);
  }
});
