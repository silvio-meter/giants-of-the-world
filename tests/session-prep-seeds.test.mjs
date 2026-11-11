/**
 * Session Prep encounter seeds are paid lore.
 *
 * They used to be passed to the SessionPrepCard client component as props,
 * which put every seed into the static HTML of the pilot pages for anonymous
 * visitors. These tests pin the fix: the card data carries no seed text, the
 * card fetches seeds from the entitled /api/lore/[slug] route, and that route
 * only returns them to a paid plan.
 *
 * The rendered-output half of this guard (no seed text in the built or served
 * /giants/thrym page) lives in scripts/verify-bundle.test.mjs, because it
 * needs a production build and CI runs that suite after `npm run build`.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { canViewFullDescription, isPaidPlan } from "../src/lib/access.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const lore = JSON.parse(read("src/data/giants.lore.json"));
const giants = JSON.parse(read("src/data/giants.json"));
const pilots = Object.entries(lore)
  .filter(([, v]) => Array.isArray(v.sessionPrep?.encounterSeeds))
  .map(([slug]) => slug);

test("the pilot list is what the tests think it is", () => {
  assert.ok(pilots.includes("thrym"), "thrym should be a Session Prep pilot");
  assert.ok(pilots.length >= 10, `expected at least 10 pilots, found ${pilots.length}`);
});

test("Session Prep pilots are open entries now, so the seeds must be gated on plan, not freeEntry", () => {
  // Catalogue opening (11 Nov 2026): every pilot is freeEntry. The lore route
  // used to rely on pilots being paid entries; it now gates sessionPrep on the
  // plan alone (next test), and the page still mounts the card.
  const free = pilots.filter((slug) => giants.find((g) => g.slug === slug)?.freeEntry);
  assert.ok(free.length > 0, "expected opened pilots; if none, revisit this guard");
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(!page.includes("const sessionPrepCard = !giant.freeEntry"), "Session Prep must not hide on open entries");
});

test("the card data built on the server never carries seed text", () => {
  const src = read("src/lib/session-prep.ts");
  assert.ok(!/\bseeds\s*[,}]/.test(src.split("return {")[1] ?? ""), "getSessionPrepCard returns seeds");
  assert.ok(src.includes("hasSeeds,"), "getSessionPrepCard should return only a hasSeeds flag");
  const types = read("src/lib/types.ts");
  const card = types.split("export interface SessionPrepCardData")[1].split("}")[0];
  assert.ok(!/\bseeds\??:/.test(card), "SessionPrepCardData must not have a seeds field");
});

test("SessionPrepCard fetches seeds from the entitled lore route, not from props", () => {
  const src = read("src/components/SessionPrepCard.tsx");
  assert.ok(src.includes("fetch(`/api/lore/${encodeURIComponent(slug)}`"));
  assert.ok(src.includes("sessionPrep?.encounterSeeds"));
  assert.ok(!src.includes("card.seeds"));
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(page.includes("<SessionPrepCard slug={giant.slug} card={sessionPrepCard} />"));
});

test("the lore route returns sessionPrep only to a paid plan, never on freeEntry alone", () => {
  const src = read("src/app/api/lore/[slug]/route.ts");
  assert.ok(src.includes("const allowed = giant.freeEntry || canViewFullDescription(plan);"));
  assert.ok(src.includes("const sessionPrepAllowed = canViewFullDescription(plan);"));
  const allowedBranch = src.split("...(allowed")[1]?.split("...(sessionPrepAllowed")[0] ?? "";
  assert.ok(!allowedBranch.includes("lore.sessionPrep"), "sessionPrep must not ride on the freeEntry branch");
  assert.ok(src.includes("...(sessionPrepAllowed && lore.sessionPrep"));
  const occurrences = src.split("lore.sessionPrep").length - 1;
  assert.equal(occurrences, 2, "sessionPrep should appear only in the plan-gated branch");
});

test("members are entitled to seeds on a paid entry; free and anonymous readers are not", () => {
  for (const plan of ["monthly", "yearly", "lifetime"]) {
    assert.equal(canViewFullDescription(plan), true, plan);
    assert.equal(isPaidPlan(plan), true, plan);
  }
  for (const plan of ["free", null, undefined]) {
    assert.equal(canViewFullDescription(plan), false, String(plan));
  }
});
