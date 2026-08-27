/**
 * Locks the One Seam confirm drip: subjects, offsets, Old Norse spellings,
 * Thrym monthly CTA, List-Unsubscribe path, and "new confirms only".
 * Reads .ts as text so Node does not have to resolve TypeScript modules.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const drip = read("src/lib/one-seam/drip.ts");
const CTA =
  "https://www.giantscodex.com/signup?next=%2Fgiants%2Fthrym%3Fcheckout%3Dmonthly";

test("this test file does not import TypeScript modules", () => {
  const self = readFileSync(fileURLToPath(import.meta.url), "utf8");
  assert.doesNotMatch(self, /from ["'][^"']+\.ts["']/);
});

test("subjects and Zagreb offsets match the brief", () => {
  assert.ok(drip.includes('subject: "The seam this week is Ymir\'s flood"'));
  assert.ok(drip.includes("offsetDays: 0"));
  assert.ok(drip.includes('subject: "First and last: Ymir beside Surtr"'));
  assert.ok(drip.includes("offsetDays: 3"));
  assert.ok(drip.includes('subject: "22 cultures, one shape"'));
  assert.ok(drip.includes("offsetDays: 7"));
  assert.ok(drip.includes('subject: "If the seams were the point"'));
  assert.ok(drip.includes("offsetDays: 12"));
  assert.ok(drip.includes('timeZone: "Europe/Zagreb"'));
  assert.ok(drip.includes("if (completed === 1) return 2"));
  assert.ok(drip.includes("if (completed === 2) return 3"));
  assert.ok(drip.includes("if (completed === 3) return 4"));
});

test("Email 1 body uses á lúðr and Vafþrúðnismál", () => {
  assert.ok(drip.includes("á lúðr"));
  assert.ok(drip.includes("Vafþrúðnismál"));
  assert.ok(drip.includes("Bergelmir"));
  assert.ok(drip.includes("Gylfaginning"));
  assert.ok(drip.includes("https://www.giantscodex.com/giants/ymir"));
  assert.ok(drip.includes(CTA));
  assert.ok(drip.includes("Unsubscribe: {unsubscribeUrl}"));
});

test("emails 2-4 keep Thrym monthly as the paid button", () => {
  assert.ok(drip.includes("export const MONTHLY_CHECKOUT_CTA"));
  assert.ok(drip.includes(CTA));
  assert.equal(drip.split("${MONTHLY_CHECKOUT_CTA}").length - 1, 4);
  assert.ok(drip.includes("https://www.giantscodex.com/compare?a=ymir&b=surtr"));
  assert.ok(drip.includes("https://www.giantscodex.com/motifs"));
  assert.ok(drip.includes("Secondary only: https://www.giantscodex.com/pricing"));
  assert.ok(drip.includes("$4.99"));
  assert.ok(drip.includes("$49"));
  assert.ok(drip.includes("$129"));
});

test("HTML renderer linkifies https URLs", () => {
  assert.ok(drip.includes("export function renderDripHtml"));
  assert.ok(drip.includes("/https:\\\\/\\\\/[^\\\\s<]+/g") || drip.includes("/https:\\/\\/[^\\s<]+/g"));
  assert.ok(drip.includes("<a href="));
});

test("Europe/Zagreb calendar due-date helpers", () => {
  assert.ok(drip.includes("export function zagrebCalendarDate"));
  assert.ok(drip.includes("export function addCalendarDays"));
  assert.ok(drip.includes("export function isDripDue"));
  assert.ok(drip.includes("zagrebCalendarDate(now) >= dueOn"));
});

test("paid members skip remaining drip mails", () => {
  assert.ok(drip.includes('plan === "monthly"'));
  assert.ok(drip.includes('plan === "yearly"'));
  assert.ok(drip.includes('plan === "lifetime"'));
  const cron = read("src/app/api/cron/drip/route.ts");
  assert.ok(cron.includes("isLifetimeGrantEmail"));
  assert.ok(cron.includes("drip_step: 4"));
  assert.ok(cron.includes("skippedPaid"));
});

test("confirm sets drip_opt_in_at; SQL does not backfill", () => {
  const confirm = read("src/app/subscribe/confirm/page.tsx");
  const sql = read("supabase/subscribers_drip.sql");
  const welcome = read("src/lib/resend.ts");
  assert.ok(confirm.includes("drip_opt_in_at: now"));
  assert.ok(confirm.includes("drip_step: 1"));
  assert.ok(confirm.includes("sendWelcomeEmail"));
  assert.ok(welcome.includes("sendDripEmail(email, unsubscribeToken, 1)"));
  assert.ok(sql.includes("add column if not exists drip_step"));
  assert.ok(sql.includes("add column if not exists drip_opt_in_at"));
  assert.ok(!sql.toLowerCase().includes("update public.subscribers"));
  assert.ok(sql.includes("Do not backfill"));
});

test("cron is daily, Bearer CRON_SECRET, emails 2-4", () => {
  const cron = read("src/app/api/cron/drip/route.ts");
  const vercel = read("vercel.json");
  assert.ok(cron.includes("CRON_SECRET"));
  assert.ok(cron.includes("Bearer "));
  assert.ok(cron.includes("timingSafeEqual"));
  assert.ok(cron.includes("nextDripStep"));
  assert.ok(vercel.includes("/api/cron/drip"));
  assert.ok(vercel.includes("0 7 * * *"));
});

test("drip mail uses List-Unsubscribe and Reply-To hello@", () => {
  const resend = read("src/lib/resend.ts");
  assert.ok(resend.includes("List-Unsubscribe"));
  assert.ok(resend.includes("reply_to: supportEmail"));
  assert.ok(read("src/lib/site.ts").includes("hello@giantscodex.com"));
});

test("privacy names welcome plus three follow-ups, new confirms only", () => {
  const privacy = read("src/app/privacy/page.tsx");
  assert.ok(
    privacy.includes(
      "One Seam confirmation, welcome, and three follow-ups for new confirms only"
    )
  );
  assert.ok(privacy.includes("a short welcome, then one seam a week"));
});

test("checkout resume keeps resumeStarted true after a successful start", () => {
  const ret = read("src/components/CheckoutReturn.tsx");
  assert.ok(ret.includes("resumeStarted.current = true"));
  assert.equal(
    ret.split("resumeStarted.current = false").length - 1,
    2,
    "reset the flag only on real failure"
  );
  assert.ok(!ret.includes("controller.abort()"));
});
