/**
 * Locks Issue 1 (Atlas) copy so a casual edit cannot drop Odyssey/Hesiod
 * or add a Lifetime pitch.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  ISSUE_01_ATLAS,
  ISSUE_02_HUMBABA,
  ISSUE_03_OG,
  CURRENT_ISSUE,
  FULL_SEND_CONFIRM,
  fullSendConfirmPhrase,
  issueMembershipUrl,
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

test("full send confirm phrase is the current issue", () => {
  assert.equal(CURRENT_ISSUE.id, "03");
  assert.equal(CURRENT_ISSUE, ISSUE_03_OG);
  assert.equal(FULL_SEND_CONFIRM, "SEND ISSUE 03 TO ALL");
  assert.equal(fullSendConfirmPhrase("01"), "SEND ISSUE 01 TO ALL");
  assert.equal(fullSendConfirmPhrase("02"), "SEND ISSUE 02 TO ALL");
  assert.equal(fullSendConfirmPhrase("03"), "SEND ISSUE 03 TO ALL");
});

test("Issue 2 subject and preheader match the brief", () => {
  assert.equal(ISSUE_02_HUMBABA.subject, "One Seam - Humbaba, not a hunt");
  assert.equal(
    ISSUE_02_HUMBABA.preheader,
    "He asked for mercy. The god who set him there was not pleased."
  );
  assert.equal(ISSUE_02_HUMBABA.entryPath, "/giants/humbaba");
});

test("Issue 2 plain text has the seam and one content link", () => {
  const text = renderIssueText(ISSUE_02_HUMBABA, UNUB);
  assert.match(text, /Cedar Forest/);
  assert.match(text, /asked for mercy/);
  assert.match(text, /park ranger/);
  assert.match(text, /giants\/humbaba/);
  assert.match(text, /Unsubscribe:/);
  assert.doesNotMatch(text, /Lifetime/i);
  assert.doesNotMatch(text, /upgrade/i);
  assert.doesNotMatch(text, /pricing/i);
  assert.doesNotMatch(text, /Tepegöz|Cailleach|Pangu|Surid/);
});

test("Issue 2 HTML is archive-style with preheader and no upsell", () => {
  const html = renderIssueHtml(ISSUE_02_HUMBABA, UNUB);
  assert.match(html, /He asked for mercy/);
  assert.match(html, /park ranger/);
  assert.match(html, /giants\/humbaba/);
  assert.match(html, /Unsubscribe/);
  assert.doesNotMatch(html, /Lifetime/i);
  assert.doesNotMatch(html, /pricing/i);
  assert.doesNotMatch(html, /Upgrade/i);
});

test("Issue 3 subject and preheader match the brief", () => {
  assert.equal(ISSUE_03_OG.subject, "One Seam - Og, the bed is a measure");
  assert.equal(
    ISSUE_03_OG.preheader,
    "Deuteronomy measures the bed. The height is someone else's sum."
  );
  assert.equal(ISSUE_03_OG.entryPath, "/giants/og-of-bashan");
});

test("Issue 3 plain text has the seam and monthly membership URL", () => {
  const text = renderIssueText(ISSUE_03_OG, UNUB);
  assert.match(text, /Nine cubits long/);
  assert.match(text, /iron bed/);
  assert.match(text, /nowhere states his height/);
  assert.match(text, /leaves the man unmeasured/);
  assert.match(text, /giants\/og-of-bashan/);
  assert.match(text, /\$4\.99 a month/);
  assert.match(text, /signup\?next=/);
  assert.match(text, /checkout%3Dmonthly|checkout=monthly/);
  assert.match(text, /Unsubscribe:/);
  assert.doesNotMatch(text, /Lifetime/i);
  assert.doesNotMatch(text, /upgrade/i);
  assert.doesNotMatch(text, /pricing/i);
  assert.doesNotMatch(text, /\u2014/);
});

test("Issue 3 HTML is archive-style with membership URL and no Lifetime", () => {
  const html = renderIssueHtml(ISSUE_03_OG, UNUB);
  assert.match(html, /Deuteronomy measures the bed/);
  assert.match(html, /leaves the man unmeasured/);
  assert.match(html, /giants\/og-of-bashan/);
  assert.match(html, /signup\?next=/);
  assert.match(html, /Unsubscribe/);
  assert.doesNotMatch(html, /Lifetime/i);
  assert.doesNotMatch(html, /pricing/i);
  assert.doesNotMatch(html, /Upgrade/i);
  assert.doesNotMatch(html, /\u2014/);
});

test("issueMembershipUrl follows PR 88 signup next checkout=monthly", () => {
  const url = issueMembershipUrl(ISSUE_03_OG, "https://www.giantscodex.com");
  assert.equal(
    url,
    "https://www.giantscodex.com/signup?next=" +
      encodeURIComponent("/giants/og-of-bashan?checkout=monthly")
  );
});
