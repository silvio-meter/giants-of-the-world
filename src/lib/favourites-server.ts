import { createClient } from "./supabase/server";

/** Server-side read of a user's favourite slugs, RLS-scoped to their own rows. */
export async function getFavouriteSlugs(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("favourites")
      .select("giant_slug")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => row.giant_slug as string);
  } catch (err) {
    console.error("get favourite slugs", err);
    return [];
  }
}
