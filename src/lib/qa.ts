import type { PlanId } from "@/lib/quota";

/** Preview-only QA overrides. Not a product feature. */
export type QaState = {
  enabled: boolean;
  plan?: PlanId;
  quota?: "ok" | "exhausted";
  preview?: "ok" | "fail" | "loading";
  export?: "ok" | "fail";
};

function param(search: string, key: string): string | null {
  const q = new URLSearchParams(search);
  return q.get(key);
}

export function readQaState(search = window.location.search, hash = window.location.hash): QaState {
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

/** Render the preview-only QA panel only when query flags enable it. */
export function shouldShowQaControls(qa: Pick<QaState, "enabled">): boolean {
  return qa.enabled === true;
}

export function qaSearch(next: Partial<QaState> & { enabled?: boolean }): string {
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
