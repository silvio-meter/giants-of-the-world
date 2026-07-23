/**
 * Access control for freemium content.
 *
 * Free: shortDescription (and catalogue cards) always visible.
 * Paid (monthly | yearly | lifetime): fullDescription + mystery notes + future premium features.
 *
 * Stripe auth is not wired yet — plan is resolved client-side for UI development.
 * When payments land, replace getClientPlan() with session/DB lookup.
 */

export type UserPlan = "free" | "monthly" | "yearly" | "lifetime";

export const PLAN_STORAGE_KEY = "gotw_plan";

export function isPaidPlan(plan: UserPlan): boolean {
  return plan === "monthly" || plan === "yearly" || plan === "lifetime";
}

export function canViewFullDescription(plan: UserPlan): boolean {
  return isPaidPlan(plan);
}

export function canViewMysteryNote(plan: UserPlan): boolean {
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

/** Client-only plan read (localStorage). Defaults to free. */
export function getClientPlan(): UserPlan {
  if (typeof window === "undefined") return "free";
  const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
  if (raw === "monthly" || raw === "yearly" || raw === "lifetime" || raw === "free") {
    return raw;
  }
  return "free";
}

export function setClientPlan(plan: UserPlan): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAN_STORAGE_KEY, plan);
  window.dispatchEvent(new Event("gotw-plan-change"));
}
