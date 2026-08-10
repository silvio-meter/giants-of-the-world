/**
 * Access control for freemium content.
 *
 * Free (logged out or free account), on non-showcase entries:
 *   name, subtitle, hero, opening account (first short block), motif names only,
 *   one-line disputed teaser, first source title, CTA.
 * Showcase freeEntry entries: full account text stays open (marketed exception).
 *
 * Paid (monthly | yearly | lifetime): full layers + synced My Journey marks,
 * favourites, compare depth, motif graph, size tool, chain rungs, scholarly.
 */

export type UserPlan = "free" | "monthly" | "yearly" | "lifetime";

export type PaidPlan = Exclude<UserPlan, "free">;

export function isPaidPlan(plan: UserPlan | null | undefined): boolean {
  return plan === "monthly" || plan === "yearly" || plan === "lifetime";
}

export function canViewFullDescription(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

export function canViewMysteryNote(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

/**
 * Gates Scholarly Notes independently of an entry's own freeEntry flag — a
 * second premium layer that stays locked even on entries whose main account
 * text is open, unlike canViewFullDescription/canViewMysteryNote which a
 * free entry bypasses entirely.
 */
export function canViewScholarlyNotes(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

export function canUseFavourites(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

export function canUseMapFilters(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

/**
 * The ordered list on /near, with distances, real-site marks and export.
 *
 * The count and the nearest one stay free: the count is what earns the click.
 * Resolved on the server so the list cannot be reached by hand-writing a URL,
 * the same way canUseMapFilters guards /map.
 */
export function canUseProximityList(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

/**
 * The rungs and the floor of a chain of custody.
 *
 * Gated independently of freeEntry, like canViewScholarlyNotes: the claim and
 * the verdict are free on every entry, and the ladder of witnesses is not. The
 * free half is a completed thought that opens the question; the paid half is
 * the answer.
 */
export function canViewChain(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

/** Full sources list, deep sections, motif graph links, mystery notes. */
export function canViewFullEntry(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

/**
 * My Journey mark sync + export. Free users may still toggle marks in the
 * browser session; they do not leave the device until a paid plan is active.
 */
export function canSyncJourneyMarks(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

export function formatPlanLabel(plan: UserPlan): string {
  switch (plan) {
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    case "lifetime":
      return "Lifetime";
    default:
      return "Free";
  }
}

export function parsePlan(value: unknown): UserPlan {
  if (
    value === "free" ||
    value === "monthly" ||
    value === "yearly" ||
    value === "lifetime"
  ) {
    return value;
  }
  return "free";
}

/** Comped lifetime emails (comma-separated), e.g. founder accounts. */
export function isLifetimeGrantEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.LIFETIME_GRANT_EMAILS ?? "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export function effectivePlan(
  plan: UserPlan,
  email: string | null | undefined
): UserPlan {
  if (isLifetimeGrantEmail(email)) return "lifetime";
  return plan;
}
