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
