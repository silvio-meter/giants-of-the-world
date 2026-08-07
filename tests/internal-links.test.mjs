/**
 * Every internal link to an entry points at a slug that exists.
 *
 * Written after `goliath-of-gath` turned up in a draft post description. The
 * live slug is `goliath`, and the longer form 404s. It never reached the
 * repository, but nothing here would have noticed if it had.
 *
 * The `related` field and findings' `relatedGiantSlug` are already checked in
 * scripts/verify-data.test.mjs. This covers the surface that was not: links
 * written by hand into components, routes, scripts and documentation, where a
 * slug is a string in prose and nothing validates it.
 *
 * Run: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Routes under /giants/ that are not entry slugs. */
const NON_SLUG_ROUTES = new Set(["random"]);

const SCAN_DIRS = ["src", "scripts", "tests"];
const SCAN_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js", ".json", ".md"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);

function textFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...textFiles(full));
    else if (SCAN_EXTENSIONS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const files = [
  ...SCAN_DIRS.filter((d) => existsSync(join(root, d))).flatMap((d) => textFiles(join(root, d))),
  // Documentation at the repository root, where a wrong slug is most likely
  // to be copied into a post description.
  ...readdirSync(root).filter((f) => f.endsWith(".md")).map((f) => join(root, f)),
];

const slugs = new Set(
  JSON.parse(readFileSync(join(root, "src/data/giants.json"), "utf8")).map((g) => g.slug)
);

/**
 * Deliberately not matching /images/giants/<name>, which is an asset path and
 * happens to end in the same shape. An earlier version of this sweep counted
 * 58 of those as links.
 */
const LINK = /(?<!\/images)\/giants\/([a-z0-9-]+)/g;

const links = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(LINK)) {
    links.push({ file: relative(root, file), slug: m[1] });
  }
}

test("the sweep finds links at all, so a clean result means something", () => {
  assert.ok(
    links.length > 0,
    "no /giants/ links were found anywhere, which means this sweep is broken rather than the repository being clean"
  );
});

test("every internal link points at a slug that exists", () => {
  const dead = links
    .filter((l) => !slugs.has(l.slug) && !NON_SLUG_ROUTES.has(l.slug))
    .map((l) => `${l.file}: /giants/${l.slug}`);

  assert.deepEqual(
    [...new Set(dead)],
    [],
    `these links point at slugs that are not in giants.json, so they 404:\n  ${[...new Set(dead)].join("\n  ")}`
  );
});

test("no entry links to itself as though it were another entry", () => {
  // A self-link inside an entry's own prose reads as a cross-reference and
  // takes the reader nowhere.
  const master = JSON.parse(readFileSync(join(root, "src/data/giants.json"), "utf8"));
  const selfLinks = master
    .filter((g) => new RegExp(`(?<!/images)/giants/${g.slug}\\b`).test(JSON.stringify(g)))
    .map((g) => g.slug);
  assert.deepEqual(selfLinks, [], `these entries link to themselves: ${selfLinks.join(", ")}`);
});
