"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isPaidPlan, parsePlan, type UserPlan } from "@/lib/access";
import { isBrowserSupabaseReady } from "@/lib/supabase/config";

interface Me {
  userId: string | null;
  email: string | null;
  plan: string;
  hasBilling: boolean;
}

const SIGNED_OUT: Me = {
  userId: null,
  email: null,
  plan: "free",
  hasBilling: false,
};

/** Never rejects — a failed lookup simply means "treat as signed out". */
async function fetchMe(): Promise<Me> {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) return SIGNED_OUT;
    return (await res.json()) as Me;
  } catch {
    return SIGNED_OUT;
  }
}

interface PlanContextValue {
  plan: UserPlan;
  isPaid: boolean;
  email: string | null;
  userId: string | null;
  /** A Stripe customer exists, so the billing portal can actually open. */
  hasBilling: boolean;
  ready: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "free",
  isPaid: false,
  email: null,
  userId: null,
  hasBilling: false,
  ready: false,
  configured: false,
  refresh: async () => {},
  signOut: async () => {},
});

/**
 * Session state via /api/me rather than the supabase browser client.
 *
 * The plan is resolved server-side (comped lifetime grants included), so this
 * provider is a thin cache. Keeping supabase-js out of it removes what was the
 * largest chunk on every page.
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [plan, setPlan] = useState<UserPlan>("free");
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasBilling, setHasBilling] = useState(false);
  const configured = isBrowserSupabaseReady();
  // Without auth configured there is nothing to wait for, so start ready.
  const [ready, setReady] = useState(!configured);

  const refresh = useCallback(async () => {
    if (!configured) return;
    const me = await fetchMe();
    setUserId(me.userId);
    setEmail(me.email);
    setPlan(parsePlan(me.plan));
    setHasBilling(me.hasBilling);
    setReady(true);
  }, [configured]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Clearing local state below is still the right move.
    }
    setUserId(null);
    setEmail(null);
    setPlan("free");
    setHasBilling(false);
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    // State is written from the promise callbacks rather than the effect body,
    // so this never triggers a synchronous cascading render.
    fetchMe()
      .then((me) => {
        if (cancelled) return;
        setUserId(me.userId);
        setEmail(me.email);
        setPlan(parsePlan(me.plan));
        setHasBilling(me.hasBilling);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  const value = useMemo(
    () => ({
      plan,
      isPaid: isPaidPlan(plan),
      email,
      userId,
      hasBilling,
      ready,
      configured,
      refresh,
      signOut,
    }),
    [plan, email, userId, hasBilling, ready, configured, refresh, signOut]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  return useContext(PlanContext);
}
