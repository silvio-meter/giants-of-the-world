import { createClient } from "@/lib/supabase/client";
import { isBrowserSupabaseReady } from "@/lib/supabase/client";

export async function fetchFavouriteSlugs(): Promise<string[]> {
  if (!isBrowserSupabaseReady()) return [];
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favourites")
    .select("giant_slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchFavouriteSlugs", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.giant_slug as string);
}

export async function addFavourite(slug: string): Promise<{ ok: boolean; error?: string }> {
  if (!isBrowserSupabaseReady()) return { ok: false, error: "Not configured" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required" };

  const { error } = await supabase.from("favourites").insert({
    user_id: user.id,
    giant_slug: slug,
  });
  if (error) {
    // unique violation = already favourited
    if (error.code === "23505") return { ok: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function removeFavourite(
  slug: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isBrowserSupabaseReady()) return { ok: false, error: "Not configured" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required" };

  const { error } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", user.id)
    .eq("giant_slug", slug);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
