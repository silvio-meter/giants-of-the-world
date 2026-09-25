/**
 * The seller and data controller is the sole-trader business, named exactly.
 * Terms, Privacy and the footer all read it from one constant in site.ts.
 * Bank details must never be published anywhere in the site source.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const IDENTITY =
  "LOGOSOM, obrt za informatičke usluge, vl. Silvio Meter, Sunčana 28, 31221 Josipovac, Croatia. MB 99368145, OIB 06729873793.";

test("site.ts carries the exact operator identity", () => {
  assert.ok(read("src/lib/site.ts").includes(`"${IDENTITY}"`));
  assert.ok(!/[\u2013\u2014]/.test(IDENTITY));
});

test("Terms, Privacy and the footer render the operator identity", () => {
  for (const p of [
    "src/app/terms/page.tsx",
    "src/app/privacy/page.tsx",
    "src/components/Footer.tsx",
  ]) {
    const src = read(p);
    assert.ok(src.includes("operatorIdentity"), `${p} should import operatorIdentity`);
    assert.ok(src.includes("{operatorIdentity}"), `${p} should render operatorIdentity`);
  }
  assert.ok(read("src/app/terms/page.tsx").includes("operated and sold by"));
  assert.ok(read("src/app/privacy/page.tsx").includes("The data controller is"));
  assert.ok(read("src/components/Footer.tsx").includes("Operated by {operatorIdentity}"));
});

const VAT =
  "LOGOSOM is not registered in the VAT system. VAT is not charged under Article 90(1) of the Croatian VAT Act.";
const CONTACT = "meter257@gmail.com";

test("site.ts keeps the seller contact and VAT note separate from the identity", () => {
  const site = read("src/lib/site.ts");
  assert.ok(site.includes(`export const operatorContactEmail = "${CONTACT}";`));
  assert.ok(site.includes(`"${VAT}"`));
  assert.ok(!IDENTITY.includes(CONTACT));
  assert.ok(site.includes('export const supportEmail = "hello@giantscodex.com";'));
  assert.ok(!/[\u2013\u2014]/.test(VAT));
});

test("/terms states the VAT line next to the identity and uses the seller contact", () => {
  const terms = read("src/app/terms/page.tsx");
  assert.ok(
    /\{operatorIdentity\}<\/span>\{" "\}\s*\{operatorVatNote\}/.test(terms),
    "VAT note should follow the identity in section 1"
  );
  assert.ok(terms.includes("mailto:${operatorContactEmail}?subject=Refund%20request"));
  assert.ok(terms.includes("mailto:${operatorContactEmail}`"));
  assert.ok(!terms.includes("supportEmail"), "terms should not use the general support address");
});

test("/privacy names the seller contact as the controller contact", () => {
  const privacy = read("src/app/privacy/page.tsx");
  const controller = privacy.split("The data controller is")[1]?.split("</p>")[0] ?? "";
  assert.ok(controller.includes("mailto:${operatorContactEmail}"));
  assert.ok(privacy.includes("mailto:${operatorContactEmail}?subject=Data%20request"));
  assert.ok(!privacy.includes("supportEmail"), "privacy should not use the general support address");
});

test("the footer does not show the seller contact email", () => {
  const footer = read("src/components/Footer.tsx");
  assert.ok(!footer.includes("operatorContactEmail"));
  assert.ok(!footer.includes(CONTACT));
});

test("/pricing refund link uses the seller contact", () => {
  const pricing = read("src/app/pricing/page.tsx");
  assert.ok(pricing.includes("mailto:${operatorContactEmail}?subject=Refund%20request"));
  assert.ok(pricing.includes("{operatorContactEmail}"));
  assert.ok(!pricing.includes("supportEmail"));
});

test("drip email 4 refund line uses the seller contact", () => {
  const drip = read("src/lib/one-seam/drip.ts");
  assert.ok(drip.includes(`export const REFUND_CONTACT_EMAIL = "${CONTACT}";`));
  const e4 = drip.split("const E4_BODY = `")[1]?.split("`;")[0] ?? "";
  assert.ok(
    e4.includes(
      "14-day refund on every plan, Lifetime included, via ${REFUND_CONTACT_EMAIL}."
    )
  );
  assert.ok(!e4.includes("hello@giantscodex.com"));
});

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const f = join(dir, n);
    return statSync(f).isDirectory() ? walk(f) : [f];
  });
}

test("no bank details anywhere in src", () => {
  const hits = walk(join(root, "src"))
    .filter((f) => /\.(tsx?|mjs|json|md)$/.test(f))
    .filter((f) => /\bIBAN\b|\bHR35\d*/.test(readFileSync(f, "utf8")))
    .map((f) => f.replace(root + "/", ""));
  assert.deepEqual(hits, []);
});

test("rendered drip email 4 names the seller contact for refunds (no send)", async () => {
  const { getDripStep, renderDripText, renderDripHtml } = await import(
    "../src/lib/one-seam/drip.ts"
  );
  const step = getDripStep(4);
  const line =
    "14-day refund on every plan, Lifetime included, via meter257@gmail.com.";
  assert.ok(renderDripText(step, "https://example.invalid/u").includes(line));
  assert.ok(renderDripHtml(step, "https://example.invalid/u").includes(line));
});
