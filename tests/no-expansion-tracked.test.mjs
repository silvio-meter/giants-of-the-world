/**
 * docs/expansion/ is never committed to this repository.
 *
 * Those files carry the full paid text of thirty unpublished entries. Git
 * history is permanent: if the repository is ever forked, opened, or shared
 * with one more person, that text sits in the history forever, and rewriting
 * history to remove it is both unreliable and always too late.
 *
 * .gitignore states the intention. This test is the thing that stops it.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const tracked = (...args) =>
  execFileSync("git", ["ls-files", "-z", ...args], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter(Boolean);

test("no file under docs/expansion is tracked", () => {
  const found = tracked("docs/expansion");
  assert.deepEqual(
    found,
    [],
    `expansion source material is tracked by git:\n  ${found.join("\n  ")}\n` +
      `Remove it from the index before this reaches a remote. Once pushed, the history is public forever.`
  );
});

test("docs is not tracked as a file or symlink", () => {
  // Working on this material normally means symlinking the real docs
  // directory into a worktree. A symlink at docs/ is a single index entry, so
  // the check above would not see it while it still resolves to the content.
  const found = tracked("docs").filter((p) => p === "docs");
  assert.deepEqual(found, [], "docs is tracked as a single entry, which is almost certainly a symlink to the real one");
});

test("nothing tracked anywhere has expansion in its path", () => {
  const found = tracked().filter((p) => /(^|\/)expansion(\/|$)/.test(p));
  assert.deepEqual(found, [], `tracked paths under an expansion directory:\n  ${found.join("\n  ")}`);
});
