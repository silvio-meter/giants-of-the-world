import { createClient } from "./supabase/server";

/**
 * Records that a signed-in user has opened a giant's detail page. Called
 * from /api/discover, not from the detail page render itself — that page is
 * statically prerendered, so per-visit writes have to happen client-side
 * against a dynamic route instead of during render.
 */
export async function recordDiscovery(userId: string, slug: string): Promise<void> {
  const supabase = await createClient();
  // 23505 = unique violation, i.e. already discovered — not an error.
  const { error } = await supabase
    .from("discovered_giants")
    .insert({ user_id: userId, giant_slug: slug });
  if (error && error.code !== "23505") {
    throw error;
  }
}

export async function getDiscoveredSlugs(userId: string): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("discovered_giants")
      .select("giant_slug")
      .eq("user_id", userId);
    if (error) throw error;
    return new Set((data ?? []).map((row) => row.giant_slug as string));
  } catch (err) {
    console.error("get discovered slugs", err);
    return new Set();
  }
}
