import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  IN_CONTENT_CHECKOUT_PLAN,
  PAYWALL_COPY,
  FOLKLORE_NO_CHECKOUT_SLUGS,
} from "../src/lib/paywall-copy.ts";
import { PLAN_PRICES } from "../src/lib/plans.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");


test("in-content primary is monthly, not yearly", () => {
  assert.equal(IN_CONTENT_CHECKOUT_PLAN, "monthly");
  assert.equal(PLAN_PRICES.monthly.price, "$4.99");
  assert.equal(PLAN_PRICES.yearly.price, "$49");
  assert.equal(PLAN_PRICES.lifetime.price, "$129");
  assert.ok(PAYWALL_COPY.entry.button.includes("/month") && PAYWALL_COPY.entry.button.startsWith("Unlock this entry"));
  assert.ok(PAYWALL_COPY.entry.button.includes(PLAN_PRICES.monthly.price));
  assert.ok(PAYWALL_COPY.compare.button.includes(PLAN_PRICES.monthly.price));
  assert.ok(PAYWALL_COPY.compare.button.includes("/month") && PAYWALL_COPY.compare.button.startsWith("Unlock this comparison"));
  assert.equal(PAYWALL_COPY.entry.headline, "Continue this account.");
  assert.equal(PAYWALL_COPY.compare.headline, "Unlock what they share.");
  for (const text of [PAYWALL_COPY.entry.button, PAYWALL_COPY.compare.button]) {
    assert.doesNotMatch(text, /Yearly/i);
    assert.doesNotMatch(text, /\$49/);
  }
});

test("secondary line lists yearly and lifetime, later locks have no prices", () => {
  assert.match(PAYWALL_COPY.secondary, /Yearly \$49/);
  assert.match(PAYWALL_COPY.secondary, /Lifetime \$129/);
  assert.match(PAYWALL_COPY.secondary, /14-day refund, no questions/);
  assert.doesNotMatch(PAYWALL_COPY.later, /\$/);
  assert.doesNotMatch(PAYWALL_COPY.later, /Yearly/i);
  assert.equal(
    PAYWALL_COPY.later,
    "Sources and scholarly notes come with the same membership."
  );
});

test("folklore slugs are kandahar and kunar", () => {
  assert.deepEqual([...FOLKLORE_NO_CHECKOUT_SLUGS], [
    "giant-of-kandahar",
    "giant-of-kunar",
  ]);
  assert.equal(
    PAYWALL_COPY.folkloreHeadline,
    "This is unverified folklore, not a membership gate."
  );
});

test("lock components do not keep Yearly as the in-content primary", () => {
  const files = [
    "src/lib/paywall-copy.ts",
    "src/components/LockedLore.tsx",
    "src/components/PremiumLock.tsx",
    "src/components/SourcesSection.tsx",
    "src/components/ScholarlyNotesSection.tsx",
    "src/components/CompareResults.tsx",
    "src/components/SizeComparison.tsx",
    "src/components/CheckoutButton.tsx",
  ];
  const offenders = [];
  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8");
    if (text.includes("buttonYearly") || text.includes("Unlock with Yearly")) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], "Yearly still the in-content primary");
});
