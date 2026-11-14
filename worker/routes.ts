export const LEGAL_ALIASES_308: Record<string, string> = {
  "/privacy-policy": "/privacy",
  "/privacy_policy": "/privacy",
  "/terms-of-use": "/terms",
  "/terms-of-service": "/terms",
  "/tos": "/terms",
  "/legal": "/terms",
  "/cookies": "/cookie",
  "/cookie-policy": "/cookie",
  "/cookie_policy": "/cookie",
  "/refunds": "/refund",
  "/refund-policy": "/refund",
  "/refund_policy": "/refund",
  "/cancellation-refund": "/refund",
  "/acceptable-use-policy": "/acceptable-use",
  "/aup": "/acceptable-use",
  "/acceptable_use": "/acceptable-use",
};

export const PRODUCT_SYNONYMS_301 = [
  "/converter",
  "/text-to-handwriting",
  "/text-to-handwriting-converter",
  "/convert-text-to-handwriting",
  "/convert",
];

export const NOT_DO_PATHS_301 = [
  "/assignment",
  "/text-to-handwriting-assignment",
  "/chatgpt-to-assignment",
  "/exam",
  "/practical-file",
];

export const ACCOUNT_ALIASES_301: Record<string, string> = {
  "/signup": "/register",
  "/sign-up": "/register",
  "/create-account": "/register",
  "/signin": "/login",
  "/sign-in": "/login",
  "/log-in": "/login",
};

export const INDEXABLE_PATHS = [
  "/",
  "/hindi",
  "/pricing",
  "/faq",
  "/privacy",
  "/terms",
  "/cookie",
  "/refund",
  "/acceptable-use",
];

export const SPA_PATHS = new Set([
  ...INDEXABLE_PATHS,
  "/login",
  "/register",
]);

export function normalizePath(pathname: string): string {
  if (pathname === "/") return "/";
  const noSlash = pathname.replace(/\/+$/, "");
  return noSlash || "/";
}
