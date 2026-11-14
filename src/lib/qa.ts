import type { PlanId } from "@/lib/quota";

/** Preview-only QA overrides. Not a product feature. Disabled in production builds. */

export type QaState = {
  enabled: boolean;
  plan?: PlanId;
  quota?: "ok" | "exhausted";
  preview?: "ok" | "fail" | "loading";
  export?: "ok" | "fail";
};

function viteQaFlag(): string | undefined {
  try {
    const env = import.meta.env;
    if (env && typeof env === "object" && "VITE_ENABLE_QA" in env) {
      const value = env.VITE_ENABLE_QA;
      return typeof value === "string" ? value : undefined;
    }
  } catch {
    // import.meta.env is absent when this module is loaded from Node smoke tests.
  }
  return undefined;
}

/**
 * QA helpers are compiled in only when VITE_ENABLE_QA=1 (preview / dev builds).
 * Production `build:production` leaves the flag unset, so this returns false
 * in the Vite client bundle. Node smoke tests honor process.env.VITE_ENABLE_QA
 * and default to enabled when the env var is unset (preview-path unit checks).
 */
export function isQaBuildEnabled(): boolean {
  const viteFlag = viteQaFlag();
  if (viteFlag !== undefined) return viteFlag === "1";
  const isViteBundle =
    typeof import.meta.env === "object" &&
    import.meta.env !== null &&
    "MODE" in import.meta.env;
  if (isViteBundle) return false;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (proc?.env && "VITE_ENABLE_QA" in proc.env) {
    return proc.env.VITE_ENABLE_QA === "1";
  }
  return true;
}

function param(search: string, key: string): string | null {
  const q = new URLSearchParams(search);
  return q.get(key);
}

export function readQaState(search = window.location.search, hash = window.location.hash): QaState {
  if (!isQaBuildEnabled()) {
    return { enabled: false };
  }
  const fromHash = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  const combined = `${search}${search && fromHash ? "&" : ""}${fromHash.replace(/^\?/, "")}`;
  const enabled =
    param(combined, "qa") === "1" ||
    param(combined, "qa_plan") !== null ||
    param(combined, "qa_quota") !== null ||
    param(combined, "qa_preview") !== null ||
    param(combined, "qa_export") !== null;
  const plan = param(combined, "qa_plan") as PlanId | null;
  const quota = param(combined, "qa_quota") as QaState["quota"];
  const preview = param(combined, "qa_preview") as QaState["preview"];
  const exp = param(combined, "qa_export") as QaState["export"];
  return {
    enabled,
    plan: plan === "free" || plan === "pro" || plan === "guest_free" ? plan : undefined,
    quota: quota === "ok" || quota === "exhausted" ? quota : undefined,
    preview: preview === "ok" || preview === "fail" || preview === "loading" ? preview : undefined,
    export: exp === "ok" || exp === "fail" ? exp : undefined,
  };
}

/** Render the preview-only QA panel only when the preview build flag and query flags enable it. */
export function shouldShowQaControls(qa: Pick<QaState, "enabled">): boolean {
  return isQaBuildEnabled() && qa.enabled === true;
}

export function qaSearch(next: Partial<QaState> & { enabled?: boolean }): string {
  if (!isQaBuildEnabled()) {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    ["qa", "qa_plan", "qa_quota", "qa_preview", "qa_export"].forEach((k) => params.delete(k));
    const s = params.toString();
    return s ? `?${s}` : "";
  }
  const params = new URLSearchParams(window.location.search);
  if (next.enabled === false) {
    ["qa", "qa_plan", "qa_quota", "qa_preview", "qa_export"].forEach((k) => params.delete(k));
    const s = params.toString();
    return s ? `?${s}` : "";
  }
  params.set("qa", "1");
  if (next.plan) params.set("qa_plan", next.plan);
  if (next.quota) params.set("qa_quota", next.quota);
  if (next.preview) params.set("qa_preview", next.preview);
  if (next.export) params.set("qa_export", next.export);
  return `?${params.toString()}`;
}
