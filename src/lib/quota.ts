import { PRICES } from "@/content/site";

export type PlanId = "guest_free" | "free" | "pro";

export type Entitlement = {
  subject_id: string;
  signed_in: boolean;
  email: string | null;
  plan_id: PlanId;
  period_yyyy_mm: string;
  pages_used: number;
  pages_limit: number;
  jobs_used_today: number;
  jobs_limit: number;
  previews_used_today: number;
  previews_limit: number;
  pages_per_preview_limit: number;
  quota_reset_at: string;
  watermark: boolean;
  payments_open: false;
  payments_state: "payments_closed";
};

export type QuotaKind = "pages" | "jobs" | "previews" | "pages_per_export";

export type QuotaDecision =
  | { ok: true }
  | { ok: false; kind: QuotaKind; code: string; title: string; body: string };

export function monthKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function resetAtIso(period = monthKey()): string {
  const [y, m] = period.split("-").map(Number);
  const next = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return next.toISOString();
}

export function limitsFor(plan: PlanId) {
  const paid = plan === "pro";
  return {
    pages_limit: paid ? PRICES.proPagesPerMonth : PRICES.freePagesPerMonth,
    jobs_limit: paid ? PRICES.proJobsPerDay : PRICES.freeJobsPerDay,
    previews_limit: paid ? PRICES.proPreviewPerDay : PRICES.freePreviewPerDay,
    pages_per_preview_limit: paid
      ? PRICES.proPagesPerPreview
      : PRICES.freePagesPerPreview,
    watermark: !paid,
  };
}

export function defaultEntitlement(partial?: Partial<Entitlement>): Entitlement {
  const plan = partial?.plan_id ?? "guest_free";
  const limits = limitsFor(plan);
  const period = monthKey();
  return {
    subject_id: partial?.subject_id ?? "guest:local",
    signed_in: partial?.signed_in ?? false,
    email: partial?.email ?? null,
    period_yyyy_mm: period,
    pages_used: 0,
    jobs_used_today: 0,
    previews_used_today: 0,
    quota_reset_at: resetAtIso(period),
    ...limits,
    ...partial,
    plan_id: plan,
    watermark: plan !== "pro",
    payments_open: false,
    payments_state: "payments_closed",
  };
}

export function evaluateExport(
  ent: Entitlement,
  pageCount: number,
): QuotaDecision {
  const remaining = ent.pages_limit - ent.pages_used;
  if (pageCount > ent.pages_per_preview_limit) {
    return {
      ok: false,
      kind: "pages_per_export",
      code: "export_page_limit",
      title: "This document is over the per-export page limit",
      body: `Free exports can include up to ${PRICES.freePagesPerPreview} pages at a time. Pro exports can include up to ${PRICES.proPagesPerPreview} pages at a time. [待确认] Shorten the text, or split it into more than one export.`,
    };
  }
  if (ent.pages_used >= ent.pages_limit || pageCount > remaining) {
    if (ent.plan_id === "pro") {
      return {
        ok: false,
        kind: "pages",
        code: "quota_pages_pro",
        title: "You’ve reached this month’s export limit",
        body: `You’ve used this month’s Pro export pages (${PRICES.proPagesPerMonth}). [待确认] You can keep editing and wait until your quota resets, or contact support. Pro is not unlimited.`,
      };
    }
    return {
      ok: false,
      kind: "pages",
      code: "quota_pages_free",
      title: "You’ve reached this month’s export limit",
      body: `You’ve used this month’s Free export pages (${PRICES.freePagesPerMonth}). [待确认] You can keep editing. Upgrade to Pro for a higher monthly cap, or wait until your quota resets.`,
    };
  }
  if (ent.jobs_used_today >= ent.jobs_limit) {
    return {
      ok: false,
      kind: "jobs",
      code: "quota_jobs",
      title: "You’ve reached today’s export-job limit",
      body: `Free allows up to ${PRICES.freeJobsPerDay} export jobs per day. Pro allows up to ${PRICES.proJobsPerDay}. [待确认] Monthly page caps still apply. You can wait until tomorrow, or upgrade if you are on Free.`,
    };
  }
  return { ok: true };
}

export function evaluatePreview(ent: Entitlement): QuotaDecision {
  if (ent.previews_used_today >= ent.previews_limit) {
    return {
      ok: false,
      kind: "previews",
      code: "quota_previews",
      title: "You’ve reached today’s preview limit",
      body: "You can keep editing your text, but new preview refreshes are paused until tomorrow. Pro has a higher daily preview cap; it is not unlimited. [待确认]",
    };
  }
  return { ok: true };
}

const STORAGE_KEY = "writey.entitlement.v1";

export function loadLocalEntitlement(): Entitlement | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entitlement & { usage_day?: string };
    if (parsed.period_yyyy_mm !== monthKey()) {
      parsed.period_yyyy_mm = monthKey();
      parsed.pages_used = 0;
      parsed.quota_reset_at = resetAtIso();
    }
    if (parsed.usage_day && parsed.usage_day !== dayKey()) {
      parsed.jobs_used_today = 0;
      parsed.previews_used_today = 0;
    }
    return defaultEntitlement(parsed);
  } catch {
    return null;
  }
}

export function saveLocalEntitlement(ent: Entitlement): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...ent, usage_day: dayKey() }),
    );
  } catch {
    // ignore quota / private mode
  }
}
