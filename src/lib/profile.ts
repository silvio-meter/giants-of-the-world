import { parsePlan, type UserPlan } from "./access";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./plans";

export interface Profile {
  id: string;
  email: string | null;
  plan: UserPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, plan, stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      // Profile may not exist yet — treat as free member
      return {
        id: user.id,
        email: user.email ?? null,
        plan: "free",
        stripe_customer_id: null,
        stripe_subscription_id: null,
      };
    }

    return {
      id: data.id,
      email: data.email,
      plan: parsePlan(data.plan),
      stripe_customer_id: data.stripe_customer_id,
      stripe_subscription_id: data.stripe_subscription_id,
    };
  } catch {
    return null;
  }
}

export async function getUserPlan(): Promise<UserPlan> {
  const profile = await getProfile();
  return profile?.plan ?? "free";
}
