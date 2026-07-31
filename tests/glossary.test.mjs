/**
 * Unit tests for the glossary term scanner — the logic that decides which
 * words in a free-text field get wrapped as interactive definitions.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { scanTextForTerms } from "../src/lib/glossary-scan.ts";

const sampleMap = {
  cubit: { term: "Cubit", aliases: ["cubit", "cubits"], definition: "..." },
  "frost giant": {
    term: "Frost giant",
    aliases: ["frost giant", "frost giants"],
    definition: "...",
  },
};

test("plain text with no matches comes back as one untagged segment", () => {
  const segments = scanTextForTerms("Cosmic", sampleMap);
  assert.deepEqual(segments, [{ text: "Cosmic", glossaryKey: null }]);
});

test("a single match splits into before/match/after", () => {
  const segments = scanTextForTerms("Six cubits and a span", sampleMap);
  assert.deepEqual(segments, [
    { text: "Six ", glossaryKey: null },
    { text: "cubits", glossaryKey: "cubit" },
    { text: " and a span", glossaryKey: null },
  ]);
});

test("matching preserves the source text's own casing", () => {
  const segments = scanTextForTerms("CUBITS", sampleMap);
  assert.equal(segments[0].text, "CUBITS");
  assert.equal(segments[0].glossaryKey, "cubit");
});

test("longer alias wins over a shorter one it contains", () => {
  const segments = scanTextForTerms("A frost giant of old", sampleMap);
  assert.deepEqual(
    segments.filter((s) => s.glossaryKey),
    [{ text: "frost giant", glossaryKey: "frost giant" }]
  );
});

test("word boundaries: 'cubits' doesn't false-match inside another word", () => {
  const segments = scanTextForTerms("recubits is not a word", sampleMap);
  assert.deepEqual(segments, [{ text: "recubits is not a word", glossaryKey: null }]);
});

test("an empty glossary map matches nothing", () => {
  const segments = scanTextForTerms("Six cubits", {});
  assert.deepEqual(segments, [{ text: "Six cubits", glossaryKey: null }]);
});

test("empty text returns a single empty segment, not an error", () => {
  const segments = scanTextForTerms("", sampleMap);
  assert.deepEqual(segments, [{ text: "", glossaryKey: null }]);
});
