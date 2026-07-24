/**
 * Unit tests for the plan/entitlement logic — the code path where a mistake
 * means someone pays and gets nothing, or gets everything for free.
 *
 * Node strips the TypeScript types at load time; no build step involved.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  effectivePlan,
  isPaidPlan,
  canViewFullDescription,
  canUseFavourites,
  isLifetimeGrantEmail,
  parsePlan,
} from "../src/lib/access.ts";
import { getFreePreview, splitParagraphs, hasMoreContent } from "../src/lib/content.ts";

test("paid plans unlock, free does not", () => {
  for (const plan of ["monthly", "yearly", "lifetime"]) {
    assert.ok(isPaidPlan(plan), `${plan} should be paid`);
    assert.ok(canViewFullDescription(plan));
    assert.ok(canUseFavourites(plan));
  }
  assert.ok(!isPaidPlan("free"));
  assert.ok(!canViewFullDescription("free"));
  assert.ok(!isPaidPlan(null));
  assert.ok(!isPaidPlan(undefined));
});

test("unknown plan values fall back to free, never to paid", () => {
  for (const value of [
    "premium",
    "LIFETIME",
    "",
    null,
    undefined,
    0,
    1,
    true,
    {},
    [],
    "monthly ",
  ]) {
    const parsed = parsePlan(value);
    assert.ok(
      ["free", "monthly", "yearly", "lifetime"].includes(parsed),
      `parsePlan(${JSON.stringify(value)}) returned ${parsed}`
    );
    if (value !== "monthly") {
      assert.ok(
        !isPaidPlan(parsePlan(value)) || ["yearly", "lifetime"].includes(value),
        `parsePlan(${JSON.stringify(value)}) must not grant paid access`
      );
    }
  }
  assert.equal(parsePlan("monthly"), "monthly");
  assert.equal(parsePlan("garbage"), "free");
});

test("lifetime grant list is case- and whitespace-insensitive", () => {
  const previous = process.env.LIFETIME_GRANT_EMAILS;
  process.env.LIFETIME_GRANT_EMAILS = " Founder@Example.com ,second@example.com";
  try {
    assert.ok(isLifetimeGrantEmail("founder@example.com"));
    assert.ok(isLifetimeGrantEmail("  FOUNDER@EXAMPLE.COM  "));
    assert.ok(isLifetimeGrantEmail("second@example.com"));
    assert.ok(!isLifetimeGrantEmail("stranger@example.com"));
    assert.ok(!isLifetimeGrantEmail(null));
    assert.ok(!isLifetimeGrantEmail(""));
    assert.equal(effectivePlan("free", "founder@example.com"), "lifetime");
    assert.equal(effectivePlan("free", "stranger@example.com"), "free");
    assert.equal(effectivePlan("monthly", "stranger@example.com"), "monthly");
  } finally {
    if (previous === undefined) delete process.env.LIFETIME_GRANT_EMAILS;
    else process.env.LIFETIME_GRANT_EMAILS = previous;
  }
});

test("an empty grant list grants nothing", () => {
  const previous = process.env.LIFETIME_GRANT_EMAILS;
  process.env.LIFETIME_GRANT_EMAILS = "";
  try {
    assert.ok(!isLifetimeGrantEmail("anyone@example.com"));
    assert.equal(effectivePlan("free", "anyone@example.com"), "free");
  } finally {
    if (previous === undefined) delete process.env.LIFETIME_GRANT_EMAILS;
    else process.env.LIFETIME_GRANT_EMAILS = previous;
  }
});

test("free preview never exposes more than the opening", () => {
  const lore = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph.";
  const preview = getFreePreview(lore);

  assert.equal(preview, "First paragraph.");
  assert.ok(!preview.includes("Second"));
  assert.ok(!preview.includes("Third"));
  assert.ok(hasMoreContent(lore, ""));
});

test("single-paragraph lore still yields a preview", () => {
  const lore = "Only one sentence exists here.";
  assert.equal(getFreePreview(lore), lore);
  assert.equal(splitParagraphs(lore).length, 1);
  assert.ok(!hasMoreContent(lore, ""));
  assert.ok(hasMoreContent(lore, "but there is a mystery note"));
});
