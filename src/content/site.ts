/** Site origin and placeholders. Never invent a real hostname. */

import {
  absoluteUrl,
  confirmedProductionOrigin,
  PRIVACY_EMAIL as OFFICIAL_PRIVACY_EMAIL,
  SUPPORT_EMAIL as OFFICIAL_SUPPORT_EMAIL,
} from "../../shared/site-origin.ts";

export const BRAND_NAME = "Writey";
export const SUPPORT_EMAIL = OFFICIAL_SUPPORT_EMAIL;
export const PRIVACY_EMAIL = OFFICIAL_PRIVACY_EMAIL;

export const TAX_LINE = "Applicable taxes will be shown at checkout.";

export const PRICES = {
  currency: "USD" as const,
  free: "$0",
  proMonthly: "$3.99",
  proYearly: "$39",
  pending: false,
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
  "Prices are shown in USD. Payments are not open yet.";

/**
 * Build-time public origin. Only a confirmed production https origin is used.
 * Empty values, placeholders, writey.app, *.workers.dev, *.pages.dev, and localhost are rejected.
 */
export function configuredSiteUrl(): string | null {
  return confirmedProductionOrigin(import.meta.env.VITE_SITE_URL);
}

export function canonicalOrigin(): string | null {
  return configuredSiteUrl();
}

export function canonicalUrl(pathname: string): string | null {
  return absoluteUrl(canonicalOrigin(), pathname);
}

export function footerYear(): number {
  return new Date().getFullYear();
}

export const ANALYTICS_MEASUREMENT_ID =
  import.meta.env.VITE_ANALYTICS_MEASUREMENT_ID?.trim() || "";
