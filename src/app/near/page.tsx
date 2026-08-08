import type { Metadata } from "next";
import Link from "next/link";
import { NearClient } from "@/components/NearClient";
import { getAllGiants } from "@/lib/giants";
import { canUseProximityList } from "@/lib/access";
import { getUserPlan } from "@/lib/profile";
import { MyJourneyButton } from "@/components/MyJourneyButton";
import type { NearPoint } from "@/lib/near";

export const metadata: Metadata = {
  title: "Giants Near You",
  description:
    "Sort the catalogue by distance from a point you choose. Your position stays on your device.",
  alternates: { canonical: "/near" },
};

export default async function NearPage() {
  /**
   * The catalogue is read here and handed over as a prop, the same way /map
   * does it. src/lib/giants.ts warns that importing it into a client component
   * pulls the whole JSON into that bundle, and verify-bundle.test.mjs enforces
   * it against a real build.
   *
   * Only the five fields the feature needs travel, plus one derived flag, so
   * the payload is a fraction of GiantCardData.
   */
  const points: NearPoint[] = getAllGiants()
    .filter((g) => g.coordinates)
    .map((g) => ({
      slug: g.slug,
      name: g.name,
      culture: g.culture,
      coordinates: g.coordinates as [number, number],
      freeEntry: g.freeEntry,
      realSite: (g.motifs ?? []).includes("real-site-attached"),
    }));

  /**
   * Decided here, from the plan, and never from a query string: the ordered
   * list cannot be reached by typing an address by hand, which is the same
   * reason /map resolves its filters server-side.
   */
  const plan = await getUserPlan();
  const unlocked = canUseProximityList(plan);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-6">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Geography of the large
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Giants Near You
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Pick a point and the catalogue sorts itself around it. Distances are
          measured in your browser: your position is not sent to us, not put in
          the address bar, and not recorded.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Pins mark where a tradition is placed, not where anything was dug up.{" "}
          <Link href="/map" className="text-accent-gold hover:underline">
            The full map
          </Link>{" "}
          shows all of them at once.
        </p>
      </header>

      <NearClient points={points} unlocked={unlocked} />

      <div className="mt-8 flex justify-center">
        <MyJourneyButton />
      </div>
    </div>
  );
}
