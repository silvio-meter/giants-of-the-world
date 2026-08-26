import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("in-content primary is monthly, not yearly", () => {
  const copy = read("src/lib/paywall-copy.ts");
  const plans = read("src/lib/plans.ts");
  assert.match(copy, /IN_CONTENT_CHECKOUT_PLAN[\s\S]*?= "monthly"/);
  assert.ok(plans.includes('price: "$4.99"'));
  assert.ok(plans.includes('price: "$49"'));
  assert.ok(plans.includes('price: "$129"'));
  assert.ok(copy.includes("Unlock this entry"));
  assert.ok(copy.includes("Unlock this comparison"));
  assert.ok(copy.includes("Continue this account."));
  assert.ok(copy.includes("Unlock what they share."));
  assert.ok(!copy.includes("buttonYearly"));
  assert.ok(!copy.includes("Unlock with Yearly"));
});

test("secondary line and later locks", () => {
  const copy = read("src/lib/paywall-copy.ts");
  assert.ok(copy.includes("Yearly ${yearly}"));
  assert.ok(copy.includes("Lifetime ${lifetime}"));
  assert.ok(copy.includes("14-day refund, no questions"));
  assert.ok(copy.includes("Sources and scholarly notes come with the same membership."));
});

test("folklore slugs are kandahar and kunar", () => {
  const copy = read("src/lib/paywall-copy.ts");
  assert.ok(copy.includes("giant-of-kandahar"));
  assert.ok(copy.includes("giant-of-kunar"));
  assert.ok(copy.includes("This is unverified folklore, not a membership gate."));
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
    const text = read(file);
    if (text.includes("buttonYearly") || text.includes("Unlock with Yearly")) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, [], "Yearly still the in-content primary");
});
