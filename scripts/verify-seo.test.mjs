/**
 * SEO guards that need a running server, so they check the rendered output
 * rather than the source.
 *
 * Run with `npm run test:seo` against `npm start` on BASE (default :3000).
 * Skipped when nothing is listening, so `npm test` stays offline-safe.
 */

import test from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE ?? "http://localhost:3000";

const reachable = await fetch(`${BASE}/robots.txt`)
  .then((r) => r.ok)
  .catch(() => false);

const skip = reachable ? false : `nothing serving at ${BASE}`;

async function disallowedPaths() {
  const txt = await (await fetch(`${BASE}/robots.txt`)).text();
  return [...txt.matchAll(/Disallow:\s*(\S+)/g)].map((m) => m[1]);
}

test("noindex pages stay crawlable", { skip }, async () => {
  // A page that is both disallowed and noindex is the worst of both: Google
  // never fetches it, never reads the tag, and reports it as blocked instead
  // of dropping it from the index.
  const disallow = await disallowedPaths();
  const noindexPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/favourites",
  ];

  for (const path of noindexPages) {
    const html = await (await fetch(`${BASE}${path}`)).text();
    assert.ok(
      /content="noindex/.test(html),
      `${path} should carry noindex`
    );
    const blocked = disallow.some((d) => path.startsWith(d.replace(/\/$/, "")));
    assert.ok(
      !blocked,
      `${path} is noindex AND disallowed in robots.txt — Google cannot read the tag`
    );
  }
});

test("every sitemap URL is 200, indexable and self-canonical", { skip }, async () => {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.length > 50, `sitemap looks short: ${urls.length} urls`);

  for (const url of urls) {
    const path = new URL(url).pathname;
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    assert.equal(res.status, 200, `${path} in sitemap returns ${res.status}`);

    const html = await res.text();
    assert.ok(
      !/content="noindex/.test(html),
      `${path} is in the sitemap but marked noindex`
    );
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html);
    assert.ok(canonical, `${path} has no canonical`);
    assert.equal(
      new URL(canonical[1]).pathname,
      path,
      `${path} points its canonical elsewhere, so it will not be indexed under this URL`
    );
  }
});

test("the sitemap lists no page that robots.txt blocks", { skip }, async () => {
  const [xml, disallow] = await Promise.all([
    (await fetch(`${BASE}/sitemap.xml`)).text(),
    disallowedPaths(),
  ]);
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname
  );
  const conflicts = paths.filter((p) =>
    disallow.some((d) => p.startsWith(d.replace(/\/$/, "")))
  );
  assert.deepEqual(conflicts, [], "sitemap advertises pages robots.txt blocks");
});
