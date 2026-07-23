"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getClientPlan,
  setClientPlan,
  type UserPlan,
  isPaidPlan,
} from "@/lib/access";

interface PlanContextValue {
  plan: UserPlan;
  isPaid: boolean;
  setPlan: (plan: UserPlan) => void;
  ready: boolean;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "free",
  isPaid: false,
  setPlan: () => {},
  ready: false,
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<UserPlan>("free");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlanState(getClientPlan());
    setReady(true);
    const sync = () => setPlanState(getClientPlan());
    window.addEventListener("gotw-plan-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gotw-plan-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setPlan = useCallback((next: UserPlan) => {
    setClientPlan(next);
    setPlanState(next);
  }, []);

  return (
    <PlanContext.Provider
      value={{ plan, isPaid: isPaidPlan(plan), setPlan, ready }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
