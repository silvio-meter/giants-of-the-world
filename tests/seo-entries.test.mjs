import test from "node:test";
import assert from "node:assert/strict";
import { ENTRY_SEO, getEntrySeo } from "../src/lib/seo-entries.ts";

test("SEO overrides exist only for four promotable free entries", () => {
  assert.deepEqual(Object.keys(ENTRY_SEO).sort(), [
    "atlas",
    "goliath",
    "nephilim",
    "ymir",
  ]);
  for (const slug of ["tsul-kalu", "si-te-cah", "balor"]) {
    assert.equal(getEntrySeo(slug), null);
  }
});

test("SEO copy has no em dash and names the search hook", () => {
  const em = "\u2014";
  assert.ok(ENTRY_SEO.atlas.title.toLowerCase().includes("globe"));
  assert.ok(ENTRY_SEO.goliath.title.toLowerCase().includes("tall"));
  assert.ok(ENTRY_SEO.nephilim.description.toLowerCase().includes("verses"));
  assert.ok(ENTRY_SEO.ymir.title.toLowerCase().includes("body"));
  for (const row of Object.values(ENTRY_SEO)) {
    assert.ok(!row.title.includes(em));
    assert.ok(!row.description.includes(em));
  }
});
