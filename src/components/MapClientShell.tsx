"use client";

import { useMemo } from "react";
import type { GiantCardData } from "@/lib/format";
import { GiantsMapLoader } from "./GiantsMapLoader";
import { useFavourites } from "./FavouritesProvider";

export function MapClientShell({
  giants,
  allCount,
  focusSlug,
  favOnly,
}: {
  giants: GiantCardData[];
  allCount: number;
  focusSlug: string | null;
  favOnly: boolean;
}) {
  const { slugs, ready } = useFavourites();

  const filtered = useMemo(() => {
    if (!favOnly) return giants;
    if (!ready) return giants;
    return giants.filter((g) => slugs.has(g.slug));
  }, [giants, favOnly, slugs, ready]);

  const pinCount = filtered.filter((g) => g.coordinates).length;

  return (
    <div>
      <p className="mb-3 font-mono text-xs text-text-muted">
        Showing {pinCount} pin{pinCount === 1 ? "" : "s"}
        {favOnly ? " (favourites)" : ""}
        {" · "}
        {allCount} located in codex
      </p>
      {favOnly && ready && pinCount === 0 ? (
        <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-10 text-center text-sm text-text-muted">
          No favourited giants match these filters — or you have no stars yet.
        </div>
      ) : null}
      <GiantsMapLoader giants={filtered} focusSlug={focusSlug} />
    </div>
  );
}
