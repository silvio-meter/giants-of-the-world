/**
 * CSP must let MapLibre reach OpenFreeMap (style, pbf, glyphs, sprites)
 * and spawn blob workers. CARTO's raster CDN is gone.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = readFileSync(join(root, "next.config.ts"), "utf8");

test("CSP allows OpenFreeMap tiles on connect-src and img-src", () => {
  assert.match(
    config,
    /img-src[^`]*\$\{OPENFREEMAP_TILES\}/,
    "img-src must include OPENFREEMAP_TILES (sprites)"
  );
  assert.match(
    config,
    /connect-src[^`]*\$\{OPENFREEMAP_TILES\}/,
    "connect-src must include OPENFREEMAP_TILES (style.json, pbf, glyphs)"
  );
  assert.ok(
    config.includes('const OPENFREEMAP_TILES = "https://tiles.openfreemap.org"'),
    "OPENFREEMAP_TILES origin must be https://tiles.openfreemap.org"
  );
});

test("CSP allows MapLibre blob workers", () => {
  assert.ok(
    config.includes('"worker-src \'self\' blob:"'),
    "worker-src must allow 'self' and blob: for MapLibre web workers"
  );
});

test("CSP does not mention CARTO raster tiles", () => {
  assert.doesNotMatch(config, /basemaps\.cartocdn\.com/);
  assert.doesNotMatch(config, /CARTO_TILES/);
  assert.doesNotMatch(config, /CartoDB/);
});
