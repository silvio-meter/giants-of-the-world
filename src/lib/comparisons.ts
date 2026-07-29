import { createServiceRoleClient } from "./supabase/server";

/**
 * Comparisons-Made counter. Goes through the service-role client rather
 * than a user-editable RLS policy — same reasoning as profiles.plan: a
 * client-writable counter is trivially inflatable from devtools.
 */
export async function incrementComparisonsMade(userId: string): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc("increment_comparisons_made", { uid: userId });
    if (error) throw error;
  } catch (err) {
    console.error("increment comparisons_made", err);
  }
}

export async function getComparisonsMade(userId: string): Promise<number> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("comparisons_made")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.comparisons_made ?? 0;
  } catch (err) {
    console.error("get comparisons_made", err);
    return 0;
  }
}
