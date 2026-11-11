/**
 * One-off / maintenance: stamps `updatedAt` (YYYY-MM-DD) on every entry in
 * src/data/giants.json from LOCAL git history, so the sitemap can publish a
 * real per-entry lastModified without reading git at build time (Vercel
 * clones shallowly, so build-time git dates are unreliable).
 *
 * For each entry: the date of the most recent commit on the given ref
 * (default origin/main) in which that entry's JSON changed (updatedAt itself
 * ignored). Entries changed by the working tree relative to that ref get
 * --today (default: today's local date). Existing updatedAt values are kept
 * unless --force.
 *
 * Run: node scripts/stamp-updated-at.mjs [--ref origin/main] [--today 2026-11-11] [--force]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = "src/data/giants.json";
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
const ref = arg("--ref", "origin/main");
const today = arg("--today", new Date().toLocaleDateString("sv-SE"));
const force = process.argv.includes("--force");
const git = (...a) =>
  execFileSync("git", a, { cwd: root, maxBuffer: 1 << 28 }).toString();

if (git("rev-parse", "--is-shallow-repository").trim() === "true") {
  throw new Error("Shallow clone: history is incomplete, refusing to stamp dates.");
}

const withoutDate = (e) => {
  const rest = { ...e };
  delete rest.updatedAt;
  return rest;
};
const key = (e) => JSON.stringify(withoutDate(e));

const commits = git("log", "--reverse", "--format=%H %cI", ref, "--", FILE)
  .trim()
  .split("\n")
  .map((l) => l.split(" "));
const last = new Map(); // slug -> { key, date }
for (const [sha, iso] of commits) {
  let list;
  try {
    list = JSON.parse(git("show", `${sha}:${FILE}`));
  } catch {
    continue;
  }
  if (!Array.isArray(list)) continue;
  const date = iso.slice(0, 10);
  for (const e of list) {
    if (!e?.slug) continue;
    const k = key(e);
    const prev = last.get(e.slug);
    if (!prev || prev.key !== k) last.set(e.slug, { key: k, date });
  }
}

const path = join(root, FILE);
const giants = JSON.parse(readFileSync(path, "utf8"));
let changed = 0;
const out = giants.map((e) => {
  if (e.updatedAt && !force) return e;
  const h = last.get(e.slug);
  const date = h && h.key === key(e) ? h.date : today;
  changed++;
  return { ...withoutDate(e), updatedAt: date };
});
writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
console.log(`stamp-updated-at: ${changed} entries stamped (ref ${ref}, today ${today})`);
