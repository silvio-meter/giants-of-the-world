/**
 * Em dash guards over the source, as a companion to the rendered-HTML sweep
 * in verify-diacritics.test.mjs.
 *
 * The rendered sweep can only see what the server sends to a logged-out
 * visitor. It cannot see a branch that renders after hydration, or one that
 * only appears to a signed-in or paying reader. MyJourneyButton returns null
 * until the plan context is ready, so its copy never reaches the HTML these
 * checks fetch.
 *
 * The text still exists somewhere in the repository, which is what these two
 * assert against. Together the three checks cover both halves: the rendered
 * sweep catches copy whose origin is hard to predict, and these catch copy
 * whose rendering is.
 *
 * This found five real cases the rendered sweep had missed, all of them
 * behind a wall: the Compare table's missing-value placeholder, the Compare
 * no-shared-motif line, the My Codex seals caption, and the map's motif
 * connections label.
 *
 * Run: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EM_DASH = "—";

function filesUnder(dir, match, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) filesUnder(full, match, out);
    else if (match(name)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Every data file, paid content included.
// ---------------------------------------------------------------------------

test("no em dash in any data file, paywalled content included", () => {
  const files = filesUnder(join(root, "src/data"), () => true);
  assert.ok(files.length > 0, "found no data files, the path is probably wrong");

  const offenders = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (!text.includes(EM_DASH)) continue;
    const at = text.indexOf(EM_DASH);
    offenders.push(
      `${relative(root, file)}: ...${text.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, " ")}...`
    );
  }

  assert.deepEqual(
    offenders,
    [],
    `em dash in data, use a comma, colon or full stop:\n${offenders.join("\n")}`
  );
});

// ---------------------------------------------------------------------------
// 2. String literals and JSX text in the source. Comments do not count.
// ---------------------------------------------------------------------------

/**
 * Parsed with the TypeScript compiler rather than matched with a regex.
 *
 * A regex cannot reliably tell a string from a comment, and this codebase
 * has plenty of prose in comments that is allowed to use whatever
 * punctuation it likes. The AST gives the distinction for free: comments are
 * trivia and never appear as nodes.
 */
const COPY_NODES = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.JsxText,
]);

test("no em dash in a string literal or JSX text, comments excluded", () => {
  const files = [
    ...filesUnder(join(root, "src"), (n) => /\.tsx?$/.test(n)),
    ...filesUnder(join(root, "scripts"), (n) => /\.tsx?$/.test(n)),
  ];
  assert.ok(files.length > 0, "found no source files, the path is probably wrong");

  const offenders = [];
  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const visit = (node) => {
      if (COPY_NODES.has(node.kind) && String(node.text ?? "").includes(EM_DASH)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        offenders.push(
          `${relative(root, file)}:${line + 1}: ${String(node.text).trim().slice(0, 80)}`
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  assert.deepEqual(
    offenders,
    [],
    `em dash in user-facing copy, use a comma, colon or full stop:\n${offenders.join("\n")}`
  );
});

test("the AST guard reads comments as comments, not as copy", () => {
  // Guards this guard. If a future refactor started reporting comment text,
  // the check above would fail on this repository's own explanatory comments
  // and someone would weaken it to make CI pass.
  const probe = ts.createSourceFile(
    "probe.tsx",
    [
      `// a comment containing ${EM_DASH} an em dash`,
      `/* a block comment containing ${EM_DASH} an em dash */`,
      `const clean = "no dash here";`,
    ].join("\n"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const found = [];
  const visit = (node) => {
    if (COPY_NODES.has(node.kind) && String(node.text ?? "").includes(EM_DASH)) {
      found.push(String(node.text));
    }
    ts.forEachChild(node, visit);
  };
  visit(probe);

  assert.deepEqual(found, [], "comment text is being treated as copy");
});
