import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyPlanOverride,
  checkout,
  consumeQuota,
  fetchSession,
  login,
  logout,
  register,
} from "@/lib/api";
import {
  defaultEntitlement,
  evaluateExport,
  evaluatePreview,
  type Entitlement,
  type PlanId,
} from "@/lib/quota";
import { readQaState, type QaState } from "@/lib/qa";

type SessionCtx = {
  entitlement: Entitlement;
  backend: "d1" | "local_fallback" | "loading";
  qa: QaState;
  refresh: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  consume: (kind: "pages" | "jobs" | "previews", pages?: number) => Promise<Entitlement>;
  setPlanForQa: (plan: PlanId) => void;
  forceQuotaExhausted: (on: boolean) => void;
  requestCheckout: () => Promise<"payments_closed">;
  checkExport: (pageCount: number) => ReturnType<typeof evaluateExport>;
  checkPreview: () => ReturnType<typeof evaluatePreview>;
};

const Ctx = createContext<SessionCtx | null>(null);

function applyQa(ent: Entitlement, qa: QaState): Entitlement {
  let next = ent;
  if (qa.plan) {
    next = defaultEntitlement({ ...next, plan_id: qa.plan });
    next.pages_used = ent.pages_used;
    next.jobs_used_today = ent.jobs_used_today;
    next.previews_used_today = ent.previews_used_today;
  }
  if (qa.quota === "exhausted") {
    next = { ...next, pages_used: next.pages_limit };
  }
  if (qa.quota === "ok") {
    next = { ...next, pages_used: 0, jobs_used_today: 0, previews_used_today: 0 };
  }
  return next;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [entitlement, setEntitlement] = useState<Entitlement>(() => defaultEntitlement());
  const [backend, setBackend] = useState<SessionCtx["backend"]>("loading");
  const [qa, setQa] = useState<QaState>(() =>
    typeof window === "undefined" ? { enabled: false } : readQaState(),
  );

  const refresh = useCallback(async () => {
    const currentQa = readQaState();
    setQa(currentQa);
    const res = await fetchSession();
    setBackend(res.backend);
    setEntitlement(applyQa(res.entitlement, currentQa));
  }, []);

  useEffect(() => {
    void refresh();
    const onPop = () => void refresh();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [refresh]);

  const loginUser = useCallback(async (email: string, password: string) => {
    const res = await login(email, password);
    setBackend(res.backend);
    setEntitlement(applyQa(res.entitlement, readQaState()));
  }, []);

  const registerUser = useCallback(async (email: string, password: string) => {
    const res = await register(email, password);
    setBackend(res.backend);
    setEntitlement(applyQa(res.entitlement, readQaState()));
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    await refresh();
  }, [refresh]);

  const consume = useCallback(
    async (kind: "pages" | "jobs" | "previews", pages?: number) => {
      const res = await consumeQuota({ kind, pages });
      const next = applyQa(res.entitlement, readQaState());
      setEntitlement(next);
      return next;
    },
    [],
  );

  const setPlanForQa = useCallback((plan: PlanId) => {
    setEntitlement((cur) => applyPlanOverride(cur, plan));
    setQa((q) => ({ ...q, enabled: true, plan }));
  }, []);

  const forceQuotaExhausted = useCallback((on: boolean) => {
    setQa((q) => ({ ...q, enabled: true, quota: on ? "exhausted" : "ok" }));
    setEntitlement((cur) =>
      on ? { ...cur, pages_used: cur.pages_limit } : { ...cur, pages_used: 0 },
    );
  }, []);

  const requestCheckout = useCallback(async () => {
    await checkout();
    return "payments_closed" as const;
  }, []);

  const visible = useMemo(() => applyQa(entitlement, qa), [entitlement, qa]);

  const value = useMemo<SessionCtx>(
    () => ({
      entitlement: visible,
      backend,
      qa,
      refresh,
      loginUser,
      registerUser,
      logoutUser,
      consume,
      setPlanForQa,
      forceQuotaExhausted,
      requestCheckout,
      checkExport: (pageCount: number) => evaluateExport(visible, pageCount),
      checkPreview: () => evaluatePreview(visible),
    }),
    [
      visible,
      backend,
      qa,
      refresh,
      loginUser,
      registerUser,
      logoutUser,
      consume,
      setPlanForQa,
      forceQuotaExhausted,
      requestCheckout,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* Session hook lives next to the provider so consumers can import both from one module. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
