import type { Metadata } from "next";
import Link from "next/link";
import { GiantCard } from "@/components/GiantCard";
import { canUseFavourites } from "@/lib/access";
import { getAllGiants } from "@/lib/giants";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

/** Private page: rendered per request, never indexed. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favourites",
  robots: { index: false, follow: false },
};

async function getFavouriteSlugs(userId: string): Promise<string[]> {
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
    console.error("favourites page", err);
    return [];
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
        Favourites
      </h1>
      {children}
    </div>
  );
}

export default async function FavouritesPage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <Shell>
        <p className="mt-4 text-sm text-text-muted">
          Sign in with a paid plan to save giants and return to them later.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/login?next=/favourites"
            className="text-accent-gold hover:underline"
          >
            Sign in
          </Link>
          <Link href="/pricing" className="text-accent-gold hover:underline">
            View pricing
          </Link>
        </div>
      </Shell>
    );
  }

  if (!canUseFavourites(profile.plan)) {
    return (
      <Shell>
        <p className="mt-4 text-sm text-text-muted">
          Favourites are included with Monthly, Yearly, or Lifetime access.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block text-sm text-accent-gold hover:underline"
        >
          Unlock favourites →
        </Link>
      </Shell>
    );
  }

  const slugs = new Set(await getFavouriteSlugs(profile.id));
  const ordered = getAllGiants()
    .filter((g) => slugs.has(g.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Your codex shelf
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Favourites
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Giants you have marked with a star.{" "}
          <span className="font-mono text-xs">{ordered.length} saved</span>
        </p>
      </header>

      {ordered.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <p className="text-text-muted">No stars yet in the fog.</p>
          <p className="mt-2 text-sm text-text-muted/70">
            Open any giant and tap ★ Add to favourites.
          </p>
          <Link
            href="/giants"
            className="mt-6 inline-block text-sm text-accent-gold hover:underline"
          >
            Browse catalogue →
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((giant, i) => (
            <GiantCard key={giant.id} giant={giant} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
