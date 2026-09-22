import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Mid-page and welcome One Seam captures must keep distinct source tags.
 * Previously entry-mid:* and welcome collapsed to footer.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/lib/newsletter.ts"), "utf8");

test("normalizeNewsletterSource recognizes entry-mid and welcome", () => {
  assert.ok(src.includes('"entry-mid"'));
  assert.ok(src.includes('"welcome"'));
  assert.ok(src.includes('raw.startsWith("entry-mid:")'));
  assert.ok(src.includes('raw === "welcome" || raw === "welcome-paid"'));
  assert.ok(src.includes("export type NewsletterSource"));
});

test("normalizeNewsletterSource still maps known surfaces", () => {
  assert.ok(src.includes('raw === "journey"'));
  assert.ok(src.includes('raw === "footer" || raw === ""'));
  assert.ok(src.includes('raw.startsWith("/giants/")'));
});
