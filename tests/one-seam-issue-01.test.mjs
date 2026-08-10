/**
 * Locks Issue 1 (Atlas) copy so a casual edit cannot drop Odyssey/Hesiod
 * or add a Lifetime pitch.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ISSUE_01_ATLAS,
  FULL_SEND_CONFIRM,
  renderIssueText,
  renderIssueHtml,
} from "../src/lib/one-seam/issues.ts";

const UNUB = "https://www.giantscodex.com/subscribe/unsubscribe?token=test";

test("Issue 1 subject and preheader match the brief", () => {
  assert.equal(
    ISSUE_01_ATLAS.subject,
    "One Seam - Atlas, pillars not shoulders"
  );
  assert.equal(
    ISSUE_01_ATLAS.preheader,
    "Homer and Hesiod do not agree on what he holds."
  );
  assert.equal(ISSUE_01_ATLAS.entryPath, "/giants/atlas");
});

test("Issue 1 plain text has both quotations and one content link", () => {
  const text = renderIssueText(ISSUE_01_ATLAS, UNUB);
  assert.match(text, /pillars that keep earth and sky apart/);
  assert.match(text, /Odyssey 1/);
  assert.match(text, /holds the sky away from the earth/);
  assert.match(text, /Hesiod/);
  assert.match(text, /Pillars\. Not shoulders\./);
  assert.match(text, /giants\/atlas/);
  assert.match(text, /Unsubscribe:/);
  assert.doesNotMatch(text, /Lifetime/i);
  assert.doesNotMatch(text, /upgrade/i);
  assert.doesNotMatch(text, /pricing/i);
});

test("Issue 1 HTML is plain archive-style with preheader and no upsell", () => {
  const html = renderIssueHtml(ISSUE_01_ATLAS, UNUB);
  assert.match(html, /Homer and Hesiod do not agree/);
  assert.match(html, /blockquote/);
  assert.match(html, /giants\/atlas/);
  assert.match(html, /Unsubscribe/);
  assert.doesNotMatch(html, /Lifetime/i);
  assert.doesNotMatch(html, /pricing/i);
  assert.doesNotMatch(html, /Upgrade/i);
});

test("full send confirm phrase is deliberate", () => {
  assert.equal(FULL_SEND_CONFIRM, "SEND ISSUE 1 TO ALL");
});
