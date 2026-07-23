"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canUseFavourites } from "@/lib/access";
import {
  addFavourite,
  fetchFavouriteSlugs,
  removeFavourite,
} from "@/lib/favourites";
import { usePlan } from "./PlanProvider";

interface FavouritesContextValue {
  slugs: Set<string>;
  ready: boolean;
  isFavourite: (slug: string) => boolean;
  toggle: (slug: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  count: number;
}

const FavouritesContext = createContext<FavouritesContextValue>({
  slugs: new Set(),
  ready: false,
  isFavourite: () => false,
  toggle: async () => ({ ok: false }),
  refresh: async () => {},
  count: 0,
});

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { userId, plan, isPaid, ready: planReady } = usePlan();
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !canUseFavourites(plan)) {
      setSlugs(new Set());
      setReady(true);
      return;
    }
    const list = await fetchFavouriteSlugs();
    setSlugs(new Set(list));
    setReady(true);
  }, [userId, plan]);

  useEffect(() => {
    if (!planReady) return;
    setReady(false);
    void refresh();
  }, [planReady, refresh]);

  const isFavourite = useCallback(
    (slug: string) => slugs.has(slug),
    [slugs]
  );

  const toggle = useCallback(
    async (slug: string) => {
      if (!isPaid || !userId) {
        return { ok: false, error: "paid_required" };
      }
      const was = slugs.has(slug);
      // Optimistic
      setSlugs((prev) => {
        const next = new Set(prev);
        if (was) next.delete(slug);
        else next.add(slug);
        return next;
      });

      const result = was
        ? await removeFavourite(slug)
        : await addFavourite(slug);

      if (!result.ok) {
        // Rollback
        setSlugs((prev) => {
          const next = new Set(prev);
          if (was) next.add(slug);
          else next.delete(slug);
          return next;
        });
      }
      return result;
    },
    [isPaid, userId, slugs]
  );

  const value = useMemo(
    () => ({
      slugs,
      ready,
      isFavourite,
      toggle,
      refresh,
      count: slugs.size,
    }),
    [slugs, ready, isFavourite, toggle, refresh]
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
