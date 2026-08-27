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
  assert.ok(copy.includes("-day refund, no questions"));
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


test("map gold wall copy is monthly, pins stay free", () => {
  const copy = read("src/lib/paywall-copy.ts");
  const mapPage = read("src/app/map/page.tsx");
  const filters = read("src/components/MapFilters.tsx");
  assert.ok(copy.includes("Unlock the connections"));
  assert.ok(copy.includes("Unlock the map"));
  assert.ok(copy.includes("Pins stay free"));
  assert.ok(mapPage.includes('variant="map"'));
  assert.ok(!mapPage.includes("Connection lines and pin filters unlock with membership"));
  assert.ok(!mapPage.includes('href="/pricing"'));
  assert.ok(!filters.includes("View pricing"));
  assert.ok(mapPage.includes("isFolkloreNoCheckout"));
});

test("checkout button sends logged-out users to login with checkout=monthly", () => {
  const btn = read("src/components/CheckoutButton.tsx");
  const api = read("src/app/api/checkout/route.ts");
  const ret = read("src/components/CheckoutReturn.tsx");
  assert.ok(btn.includes("loginUrlForCheckout"));
  assert.ok(!btn.includes('|| "demo"'));
  assert.ok(btn.includes('publicPaymentsMode === "demo"'));
  assert.ok(api.includes("stripeReturnUrls"));
  assert.ok(!api.includes("/welcome?paid=1"));
  assert.ok(!api.includes("/pricing?canceled=1"));
  assert.ok(ret.includes('source: "in-content-resume"'));
  assert.ok(ret.includes('umamiEvent("purchase"'));
  assert.ok(ret.includes("sessionStorage"));
  assert.ok(ret.includes("isFolkloreCheckoutPath"));
});

test("welcome step 3 is Thrym; compare is ymir vs surtr", () => {
  const welcome = read("src/app/welcome/page.tsx");
  assert.ok(welcome.includes("/giants/ymir"));
  assert.ok(welcome.includes("/compare?a=ymir&b=surtr"));
  assert.ok(welcome.includes("/giants/thrym"));
  assert.ok(welcome.includes("Open a sealed page"));
  assert.ok(welcome.includes("Thrym's first paragraph is free"));
  assert.ok(!welcome.includes("Browse the catalogue"));
  assert.ok(!welcome.includes("Save one for later"));
  assert.ok(welcome.includes("justPaid ? paidSteps : unpaidSteps"));
});

test("footer and consent no longer claim no sequences", () => {
  const capture = read("src/components/EmailCapture.tsx");
  const news = read("src/lib/newsletter.ts");
  const privacy = read("src/app/privacy/page.tsx");
  assert.ok(capture.includes("A short welcome, then one seam a week. Unsubscribe anytime."));
  assert.ok(!capture.includes("No sequences"));
  assert.ok(news.includes("A short welcome, then one seam a week"));
  assert.ok(news.includes("a short welcome, then one seam a week"));
  assert.ok(privacy.includes("a short welcome, then one seam a week"));
});

test("account unpaid CTA is monthly CheckoutButton, not /pricing", () => {
  const account = read("src/app/account/page.tsx");
  assert.ok(account.includes("CheckoutButton"));
  assert.ok(account.includes('plan="monthly"'));
  assert.ok(!account.includes("Unlock the full codex →"));
});

test("social short links 307 to /welcome with bio UTM", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes("`/welcome?utm_source=${source}&utm_medium=bio`"));
  assert.ok(config.includes("permanent: false"));
  assert.ok(!config.includes("`/?utm_source=${source}&utm_medium=bio`"));
});

test("journey marks membership CTA is checkout=monthly on sealed entries", () => {
  const marks = read("src/components/JourneyMarks.tsx");
  const giant = read("src/app/giants/[slug]/page.tsx");
  assert.ok(marks.includes("checkout=monthly"));
  assert.ok(!marks.includes('href="/pricing"'));
  assert.ok(giant.includes("allowCheckout={!giant.freeEntry && !isFolkloreNoCheckout(giant.slug)}"));
});

test("checkout-path helpers keep session id raw and encode login next", () => {
  const path = read("src/lib/checkout-path.ts");
  assert.ok(path.includes("session_id={CHECKOUT_SESSION_ID}"));
  assert.ok(path.includes("encodeURIComponent(next)"));
  assert.ok(path.includes("CHECKOUT_QUERY"));
  assert.ok(path.includes("isFolkloreNoCheckout"));
  assert.ok(!path.includes("/welcome?paid=1"));
  assert.ok(!path.includes("/pricing?canceled=1"));
});
