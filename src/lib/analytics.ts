import { ANALYTICS_MEASUREMENT_ID } from "@/content/site";

/**
 * Analytics provider is [待确认].
 * If VITE_ANALYTICS_MEASUREMENT_ID / ANALYTICS_MEASUREMENT_ID is unset,
 * events stay in a no-op fallback (console.debug in dev only).
 * Events must never include full source_text.
 */
export const ANALYTICS_EVENTS = [
  "preview_generated",
  "export_pdf",
  "export_png",
  "language_switched",
  "quota_hit",
  "acceptable_use_clicked",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPayload = {
  language?: "en" | "hi";
  output_format?: "pdf" | "png";
  page_count?: number;
  plan_id?: string;
  quota_kind?: "pages" | "jobs" | "previews";
  style_id?: string;
  paper_type?: string;
};

const FORBIDDEN_KEYS = ["source_text", "text", "content", "body", "password"];

function isSafe(payload: AnalyticsPayload): boolean {
  return !Object.keys(payload).some((k) => FORBIDDEN_KEYS.includes(k));
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (!isSafe(payload)) return;
  if (!ANALYTICS_MEASUREMENT_ID) {
    if (import.meta.env.DEV) {
      console.debug("[analytics:noop]", event, payload);
    }
    return;
  }
  // Provider is not confirmed. When an ID is present we still only send
  // a beacon-shaped no-PII payload to a future endpoint; we do not load GA4
  // (or any named vendor) until the provider is confirmed.
  const body = JSON.stringify({ event, payload, ts: new Date().toISOString() });
  try {
    void navigator.sendBeacon?.("/api/analytics", new Blob([body], { type: "application/json" }));
  } catch {
    // no-op
  }
}
