"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isPaidPlan, parsePlan, type UserPlan } from "@/lib/access";
import { isBrowserSupabaseReady, createClient } from "@/lib/supabase/client";

interface PlanContextValue {
  plan: UserPlan;
  isPaid: boolean;
  email: string | null;
  userId: string | null;
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
  ready: false,
  configured: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<UserPlan>("free");
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isBrowserSupabaseReady();

  const refresh = useCallback(async () => {
    if (!isBrowserSupabaseReady()) {
      setPlan("free");
      setEmail(null);
      setUserId(null);
      setReady(true);
      return;
    }
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setPlan("free");
        setEmail(null);
        setUserId(null);
        setReady(true);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      setPlan(parsePlan(data?.plan));
    } catch {
      setPlan("free");
      setEmail(null);
      setUserId(null);
    } finally {
      setReady(true);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isBrowserSupabaseReady()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setPlan("free");
    setEmail(null);
    setUserId(null);
  }, []);

  useEffect(() => {
    void refresh();
    if (!isBrowserSupabaseReady()) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  return (
    <PlanContext.Provider
      value={{
        plan,
        isPaid: isPaidPlan(plan),
        email,
        userId,
        ready,
        configured,
        refresh,
        signOut,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
