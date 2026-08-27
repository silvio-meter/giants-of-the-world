import test from "node:test";
import assert from "node:assert/strict";

import {
  contentPathFrom,
  isFolkloreCheckoutPath,
  loginUrlForCheckout,
  safeRelativeNext,
  stripeReturnUrls,
  withSearchParam,
} from "../src/lib/checkout-path.ts";

test("login next encodes checkout=monthly onto the return path", () => {
  const login = loginUrlForCheckout("/giants/thrym");
  assert.equal(
    login,
    "/login?next=" + encodeURIComponent("/giants/thrym?checkout=monthly")
  );
  const compare = loginUrlForCheckout("/compare?a=ymir&b=surtr");
  assert.equal(
    compare,
    "/login?next=" +
      encodeURIComponent("/compare?a=ymir&b=surtr&checkout=monthly")
  );
  const decoded = decodeURIComponent(compare.slice("/login?next=".length));
  assert.equal(decoded, "/compare?a=ymir&b=surtr&checkout=monthly");
});

test("folklore paths are kandahar and kunar, including map focus", () => {
  assert.equal(isFolkloreCheckoutPath("/giants/giant-of-kandahar"), true);
  assert.equal(isFolkloreCheckoutPath("/giants/giant-of-kunar"), true);
  assert.equal(isFolkloreCheckoutPath("/map?focus=giant-of-kandahar"), true);
  assert.equal(isFolkloreCheckoutPath("/map?focus=giant-of-kunar"), true);
  assert.equal(isFolkloreCheckoutPath("/giants/thrym"), false);
  assert.equal(isFolkloreCheckoutPath("/map"), false);
  assert.equal(isFolkloreCheckoutPath("/compare?a=ymir&b=surtr"), false);
});

test("stripe return urls use next, paid=1, canceled=1, and raw session id", () => {
  const { success_url, cancel_url } = stripeReturnUrls(
    "https://www.giantscodex.com",
    "/giants/thrym",
    "monthly"
  );
  assert.equal(
    success_url,
    "https://www.giantscodex.com/giants/thrym?paid=1&plan=monthly&session_id={CHECKOUT_SESSION_ID}"
  );
  assert.equal(
    cancel_url,
    "https://www.giantscodex.com/giants/thrym?canceled=1"
  );
  assert.match(success_url, /\{CHECKOUT_SESSION_ID\}/);
  assert.doesNotMatch(success_url, /%7BCHECKOUT_SESSION_ID%7D/);
  assert.doesNotMatch(success_url, /\/welcome\?paid=1/);
  assert.doesNotMatch(cancel_url, /\/pricing\?canceled=1/);
});

test("compare query survives stripe return urls", () => {
  const { success_url, cancel_url } = stripeReturnUrls(
    "https://www.giantscodex.com",
    "/compare?a=ymir&b=surtr",
    "monthly"
  );
  assert.ok(success_url.includes("/compare?"));
  assert.ok(success_url.includes("a=ymir"));
  assert.ok(success_url.includes("b=surtr"));
  assert.ok(success_url.includes("paid=1"));
  assert.ok(cancel_url.includes("canceled=1"));
  assert.ok(cancel_url.includes("a=ymir"));
});

test("contentPathFrom drops flow params and keeps the pair", () => {
  assert.equal(
    contentPathFrom("/compare?a=ymir&b=surtr&checkout=monthly"),
    "/compare?a=ymir&b=surtr"
  );
  assert.equal(
    contentPathFrom("/giants/thrym?checkout=monthly&paid=1"),
    "/giants/thrym"
  );
});

test("safeRelativeNext rejects open redirects", () => {
  assert.equal(safeRelativeNext("https://evil.example/"), "/pricing");
  assert.equal(safeRelativeNext("//evil.example"), "/pricing");
  assert.equal(safeRelativeNext("/compare?a=ymir&b=surtr"), "/compare?a=ymir&b=surtr");
  assert.equal(withSearchParam("/map", "focus", "ymir"), "/map?focus=ymir");
});
