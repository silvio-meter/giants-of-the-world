import { NextResponse } from "next/server";
import { canUseFavourites } from "@/lib/access";
import { getGiantBySlug } from "@/lib/giants";
import { isSupabaseConfigured } from "@/lib/plans";
import { getProfile } from "@/lib/profile";
import { getFavouriteSlugs } from "@/lib/favourites-server";

/**
 * A slim, map-ready projection of a signed-in user's saved giants, for the
 * "My Journey" export. Same "resolve on the server, ship only what's needed"
 * reasoning as getComparePickerOptions — the client export button never
 * imports @/lib/giants itself.
 */
export const dynamic = "force-dynamic";

export interface JourneyStop {
  slug: string;
  name: string;
  culture: string;
  coordinates: [number, number];
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!canUseFavourites(profile.plan)) {
    return NextResponse.json({ error: "Paid plan required." }, { status: 403 });
  }

  const slugs = await getFavouriteSlugs(profile.id);
  const stops: JourneyStop[] = slugs.flatMap((slug) => {
    const giant = getGiantBySlug(slug);
    if (!giant || !giant.coordinates) return [];
    return [
      {
        slug: giant.slug,
        name: giant.name,
        culture: giant.culture,
        coordinates: giant.coordinates,
      },
    ];
  });

  return NextResponse.json(
    { stops },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
