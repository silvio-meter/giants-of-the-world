/**
 * Bundle guard. Runs against a real production build and fails if heavy
 * server-only material reaches the browser.
 *
 * This exists because the same regression has now happened twice by different
 * routes: a client component imported something that transitively pulled in
 * the catalog JSON. Reviewing imports by eye did not catch it either time.
 *
 * Skips itself when .next/static is absent, so `npm test` stays fast; CI runs
 * the build first.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chunkDir = join(root, ".next/static/chunks");

const built = existsSync(chunkDir);

// When invoked as `npm run test:bundle` — which is how CI runs it, after the
// build — a missing build is a failure, not a reason to skip. Skipping there
// is what made these guards silently useless the first time.
const requireBuild = process.env.REQUIRE_BUILD === "1";
if (requireBuild && !built) {
  throw new Error(
    "REQUIRE_BUILD=1 but .next/static is missing — run `npm run build` first"
  );
}

function allChunks(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return allChunks(full);
    return name.endsWith(".js") ? [full] : [];
  });
}

test(
  "the giant catalog never reaches the browser bundle",
  { skip: built ? false : "no production build present" },
  () => {
    // A distinctive string from giants.public.json that appears nowhere else.
    const needle = '"shortDescription"';
    const guilty = allChunks(chunkDir).filter((f) =>
      readFileSync(f, "utf8").includes(needle)
    );
    assert.deepEqual(
      guilty.map((f) => f.replace(root + "/", "")),
      [],
      "catalog JSON is in a client chunk — a client component is importing @/lib/giants (directly or through @/lib/motifs). Pass resolved data down as props instead."
    );
  }
);

test(
  "server-only lore never reaches the browser bundle",
  { skip: built ? false : "no production build present" },
  () => {
    const lore = JSON.parse(
      readFileSync(join(root, "src/data/giants.lore.json"), "utf8")
    );
    // Take a distinctive sentence fragment from a paid entry.
    const sample = lore["hrungnir"].sections.story.slice(0, 60);
    const guilty = allChunks(chunkDir).filter((f) =>
      readFileSync(f, "utf8").includes(sample)
    );
    assert.deepEqual(
      guilty.map((f) => f.replace(root + "/", "")),
      [],
      "paid lore is in a client chunk — the paywall would be bypassable by reading the JS"
    );
  }
);

// html2canvas (~200 KB) must only ever load from inside the Compare export
// button's click handler. Unlike the two guards above, this needs a live
// server: whether a chunk is "eager" or "lazy" is a fact about which pages
// reference it in their served <script> tags, not something visible from
// the files on disk alone.
const BASE = process.env.BASE;

test(
  "html2canvas never loads eagerly on any page",
  { skip: BASE ? false : "BASE not set — needs a running production server" },
  async () => {
    const chunkFiles = allChunks(chunkDir);
    const html2canvasChunk = chunkFiles.find((f) =>
      readFileSync(f, "utf8").includes("html2canvas")
    );
    assert.ok(html2canvasChunk, "expected exactly one chunk to contain html2canvas");
    const chunkName = html2canvasChunk.split("/").pop();

    for (const path of ["/", "/compare", "/giants/ymir"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      assert.ok(
        !html.includes(chunkName),
        `${path} references the html2canvas chunk eagerly — it must only load from the export button's click handler`
      );
    }
  }
);
