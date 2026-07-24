/**
 * Favourites client. Talks to /api/favourites so the browser bundle does not
 * need supabase-js; the paid check and RLS both run on the server.
 */

export async function fetchFavouriteSlugs(): Promise<string[]> {
  try {
    const res = await fetch("/api/favourites", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { slugs?: string[] };
    return data.slugs ?? [];
  } catch {
    return [];
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function addFavourite(
  slug: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/favourites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) return { ok: false, error: await readError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export async function removeFavourite(
  slug: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/favourites?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (!res.ok) return { ok: false, error: await readError(res) };
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}
