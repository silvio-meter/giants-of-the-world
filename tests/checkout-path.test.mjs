import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Read checkout-path.ts as text. Importing it pulls paywall-copy without an
 * extension Node can resolve (ERR_MODULE_NOT_FOUND). Next still bundles the
 * extensionless import.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src/lib/checkout-path.ts"), "utf8");

test("login next encodes checkout=monthly onto the return path", () => {
  assert.ok(src.includes("export function loginUrlForCheckout"));
  assert.ok(src.includes("withSearchParam(safeRelativeNext(returnTo), CHECKOUT_QUERY, plan)"));
  assert.ok(src.includes("return `/login?next=${encodeURIComponent(next)}`"));
  assert.ok(src.includes('export const CHECKOUT_MONTHLY = "monthly"'));
  assert.ok(src.includes('export const CHECKOUT_QUERY = "checkout"'));
});

test("folklore paths are kandahar and kunar, including map focus", () => {
  assert.ok(src.includes("export function isFolkloreCheckoutPath"));
  assert.ok(src.includes("isFolkloreNoCheckout(match[1])"));
  assert.ok(src.includes('url.searchParams.get("focus")'));
  assert.ok(src.includes("isFolkloreNoCheckout(focus)"));
  const copy = readFileSync(join(root, "src/lib/paywall-copy.ts"), "utf8");
  assert.ok(copy.includes("giant-of-kandahar"));
  assert.ok(copy.includes("giant-of-kunar"));
});

test("stripe return urls use next, paid=1, canceled=1, and raw session id", () => {
  assert.ok(src.includes("export function stripeReturnUrls"));
  assert.ok(src.includes('withSearchParam(withSearchParam(content, "paid", "1"), "plan", plan)'));
  assert.ok(src.includes('withSearchParam(content, "canceled", "1")'));
  assert.ok(src.includes("session_id={CHECKOUT_SESSION_ID}"));
  assert.ok(!src.includes("%7BCHECKOUT_SESSION_ID%7D"));
  assert.ok(!src.includes("/welcome?paid=1"));
  assert.ok(!src.includes("/pricing?canceled=1"));
});

test("compare query survives stripe return urls via contentPathFrom", () => {
  assert.ok(src.includes("export function contentPathFrom"));
  assert.ok(src.includes("withoutSearchParams(path, ["));
  assert.ok(src.includes("CHECKOUT_QUERY"));
  assert.ok(src.includes('"paid"'));
  assert.ok(src.includes('"canceled"'));
  assert.ok(src.includes('"session_id"'));
  assert.ok(src.includes('"plan"'));
  assert.ok(src.includes("url.pathname"));
  assert.ok(src.includes("url.search"));
});

test("safeRelativeNext rejects open redirects", () => {
  assert.ok(src.includes("export function safeRelativeNext"));
  assert.ok(src.includes('return "/pricing"'));
  assert.ok(src.includes('value.startsWith("//")'));
  assert.ok(src.includes('value.includes("://")'));
  assert.ok(src.includes("export function withSearchParam"));
  assert.ok(src.includes("url.searchParams.set(key, value)"));
});

test("this test file does not import TypeScript modules", () => {
  const self = readFileSync(fileURLToPath(import.meta.url), "utf8");
  assert.doesNotMatch(self, /from ["'][^"']+\.ts["']/);
});
