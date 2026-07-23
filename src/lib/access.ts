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
