/**
 * One Seam confirm drip (emails 1-4). Source of truth for subjects and bodies.
 * No @/ imports so unit tests can load this file with plain Node.
 *
 * Existing confirmed rows stay out: drip_opt_in_at is set only on confirms
 * after subscribers_drip.sql ships. Paid members skip remaining mails.
 *
 * /motifs was HTTP 200 on 27 Aug 2026; Email 3 may name that URL.
 *
 * Open catalogue, membership sales closed (owner decision, 11 Nov 2026):
 * no email carries a price, a checkout link or /pricing. E3/E4 copy from
 * Monetization's draft of 11 Nov 2026; E1/E2 had only their price lines cut.
 * MONTHLY_CHECKOUT_CTA stays exported for when sales reopen; no body uses it.
 */

export const MONTHLY_CHECKOUT_CTA =
  "https://www.giantscodex.com/signup?next=%2Fgiants%2Fthrym%3Fcheckout%3Dmonthly";

export const MOTIFS_URL = "https://www.giantscodex.com/motifs";

/**
 * Contact named in drip email 4 ("Questions or corrections"). Mirrors supportEmail in src/lib/site.ts (not
 * imported, to keep this file free of app imports), the same address /pricing
 * and the bestiary FAQ give (owner decision, 11 Nov 2026). /terms and
 * /privacy keep operatorContactEmail as the legal operator contact.
 * tests/seller-identity.test.mjs fails if this drifts from supportEmail.
 */
export const REFUND_CONTACT_EMAIL = "hello@giantscodex.com";

export type DripStepId = 1 | 2 | 3 | 4;

export type DripStep = {
  id: DripStepId;
  /** Calendar days after confirm, Europe/Zagreb. */
  offsetDays: number;
  subject: string;
  body: string;
};

const E1_BODY = `You are on One Seam. A short welcome, then one seam a week.

Ymir is killed by his own descendants, and the flood of his blood drowns the frost-giants. One household gets out: Bergelmir. What he escaped in is not agreed. The Old Norse is á lúðr. It has been read as a chest, a hollowed trunk, a boat, a cradle, and a mill-box. Snorri writes the flood in Gylfaginning (c. 1220). Vafþrúðnismál has the survivor. Neither source settles the vessel, and the ark-rhyme some scholars hear depends on which reading you pick.

That split is the point of this list.

Ymir's full page is free, including that dispute:
https://www.giantscodex.com/giants/ymir

One seam a week after this.
Unsubscribe: {unsubscribeUrl}`;

const E2_BODY = `Ymir has an origin. Surtr does not. One is the body the world is made from. The other is already standing at the edge of Muspellheim, waiting to burn the nine worlds. The poems treat them as a pair: the first and the last.

Compare already shows culture, region, type, and height for free. The shared thread is membership.
https://www.giantscodex.com/compare?a=ymir&b=surtr

Unsubscribe: {unsubscribeUrl}`;

const E3_BODY = `"The people who came before" is the same shape in 22 cultures and 26 entries: Ymir, Nephilim, Jentilak, Quinametzin, Fomorians, Nemri, and the rest. Giants as an earlier race, used to explain ruins, large bones, or an older population. Recurrence is not evidence of contact. It is still the interesting part.

The whole thread is on one page:
${MOTIFS_URL}

Unsubscribe: {unsubscribeUrl}`;

const E4_BODY = `Three splits: Bergelmir's vessel, Ymir beside Surtr, the people-who-came-before thread.

The codex is open to read now. No membership, nothing to unlock:
https://www.giantscodex.com/giants

If you run tables, a bestiary is on its way: a free sample with Balor, Kumbhakarna and the Cailleach, then Vol. 1 as a PDF.
https://www.giantscodex.com/bestiary

Questions or corrections: ${REFUND_CONTACT_EMAIL}

The weekly seam continues.
Unsubscribe: {unsubscribeUrl}`;

export const DRIP_STEPS: readonly DripStep[] = [
  {
    id: 1,
    offsetDays: 0,
    subject: "The seam this week is Ymir's flood",
    body: E1_BODY,
  },
  {
    id: 2,
    offsetDays: 3,
    subject: "First and last: Ymir beside Surtr",
    body: E2_BODY,
  },
  {
    id: 3,
    offsetDays: 7,
    subject: "22 cultures, one shape",
    body: E3_BODY,
  },
  {
    id: 4,
    offsetDays: 12,
    subject: "Three splits, and what comes next",
    body: E4_BODY,
  },
];

export function getDripStep(id: DripStepId): DripStep {
  const step = DRIP_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown drip step ${id}`);
  return step;
}

/** Next mail after a given completed step (1 sent -> 2, ...). */
export function nextDripStep(completed: number): DripStepId | null {
  if (completed === 1) return 2;
  if (completed === 2) return 3;
  if (completed === 3) return 4;
  return null;
}

export function zagrebCalendarDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Whether drip mail `step` is due, counting calendar days from confirm
 * in Europe/Zagreb. One step at a time: caller only asks for completed+1.
 */
export function isDripDue(
  step: DripStepId,
  optInAt: Date,
  now: Date
): boolean {
  const spec = getDripStep(step);
  const dueOn = addCalendarDays(zagrebCalendarDate(optInAt), spec.offsetDays);
  return zagrebCalendarDate(now) >= dueOn;
}

export function isPaidPlanName(plan: string | null | undefined): boolean {
  return plan === "monthly" || plan === "yearly" || plan === "lifetime";
}

export function renderDripText(step: DripStep, unsubscribeUrl: string): string {
  return step.body.split("{unsubscribeUrl}").join(unsubscribeUrl);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderDripHtml(step: DripStep, unsubscribeUrl: string): string {
  const text = renderDripText(step, unsubscribeUrl);
  const paragraphs = text.split(/\n\n+/).map((block) => {
    const escaped = escapeHtml(block).replace(/\n/g, "<br/>\n");
    const linked = escaped.replace(
      /https:\/\/[^\s<]+/g,
      (url) => `<a href="${url}">${url}</a>`
    );
    return `<p>${linked}</p>`;
  });
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;">
${paragraphs.join("\n")}
</div>`;
}
