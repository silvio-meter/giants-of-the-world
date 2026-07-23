/**
 * Access control for freemium content.
 *
 * Free: shortDescription + opening paragraph always visible.
 * Paid (monthly | yearly | lifetime): full description + mystery notes + premium tools.
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

export function canUseFavourites(plan: UserPlan | null | undefined): boolean {
  return isPaidPlan(plan);
}

export function canUseMapFilters(plan: UserPlan | null | undefined): boolean {
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
