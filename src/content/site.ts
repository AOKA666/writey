/** Site origin and placeholders. Never invent a real hostname. */

export const BRAND_NAME = "Writey";
export const BRAND_PENDING_NOTE = "Writey (brand display name is [待确认])";
export const DOMAIN_PLACEHOLDER = "[DOMAIN]";
export const CANONICAL_PLACEHOLDER = "https://[DOMAIN]";
export const PENDING_MARK = "[待确认]";

export const SUPPORT_EMAIL = "support@[DOMAIN]";
export const PRIVACY_EMAIL = "privacy@[DOMAIN]";

export const TAX_LINE = "Applicable taxes will be shown at checkout.";

export const PRICES = {
  currency: "USD" as const,
  free: "$0",
  proMonthly: "$3.99",
  proYearly: "$39",
  pending: true,
  freePagesPerMonth: 8,
  proPagesPerMonth: 150,
  freePreviewPerDay: 10,
  proPreviewPerDay: 50,
  freePagesPerPreview: 8,
  proPagesPerPreview: 20,
  freeJobsPerDay: 2,
  proJobsPerDay: 10,
};

export const PRICE_STATUS_SENTENCE =
  "Recommended plan structure. Prices are shown in USD and are not a live offer until confirmed. Applicable taxes will be shown at checkout.";

/** Build-time public origin. Empty or placeholder if SITE_URL is not confirmed. */
export function configuredSiteUrl(): string | null {
  const raw = import.meta.env.VITE_SITE_URL?.trim();
  if (!raw) return null;
  if (/writey\.app/i.test(raw)) {
    // Discard unconfirmed invented hostnames if they appear in env by mistake.
    return null;
  }
  return raw.replace(/\/$/, "");
}

export function canonicalOrigin(): string {
  return configuredSiteUrl() ?? CANONICAL_PLACEHOLDER;
}

export function canonicalUrl(pathname: string): string {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "") || "/";
  return `${canonicalOrigin()}${path}`;
}

export function footerYear(): number {
  return new Date().getFullYear();
}

export const ANALYTICS_MEASUREMENT_ID =
  import.meta.env.VITE_ANALYTICS_MEASUREMENT_ID?.trim() || "";
