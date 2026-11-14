/** Route Contract: seo-copy-freeze §0 and legal-route-contract.md + PRD §10.1 */

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
] as const;

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

export const ACCOUNT_PATHS = ["/login", "/register"] as const;

/** Stitch create-account used /signup on some legal frames; canonicalize to /register. */
export const ACCOUNT_ALIASES: Record<string, string> = {
  "/signup": "/register",
  "/sign-up": "/register",
  "/create-account": "/register",
  "/signin": "/login",
  "/sign-in": "/login",
  "/log-in": "/login",
};

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
] as const;

export const NOT_DO_PATHS_301 = [
  "/assignment",
  "/text-to-handwriting-assignment",
  "/chatgpt-to-assignment",
  "/exam",
  "/practical-file",
] as const;

export type SeoMeta = {
  path: string;
  title: string;
  description: string;
  h1: string;
  robots: "index, follow" | "noindex, nofollow";
  inSitemap: boolean;
};

export const SEO: Record<string, SeoMeta> = {
  "/": {
    path: "/",
    title: "Text to Handwriting Converter | Writey",
    description:
      "Convert typed English or Hindi text into handwriting-style pages. Preview in your browser, then download PDF or PNG. No account needed to start.",
    h1: "Text to Handwriting Converter",
    robots: "index, follow",
    inSitemap: true,
  },
  "/hindi": {
    path: "/hindi",
    title: "Convert Hindi Text to Handwriting | Writey",
    description:
      "Preview Hindi (Devanagari) text as handwriting-style pages, then export PDF or PNG. Use the same Writey editor for English. This is a language support page.",
    h1: "Convert Hindi text to handwriting",
    robots: "index, follow",
    inSitemap: true,
  },
  "/pricing": {
    path: "/pricing",
    title: "Pricing — Free and Pro Plans | Writey",
    description:
      "Compare Free and Pro plans for handwriting-style page export. USD prices are pending confirmation. Applicable taxes will be shown at checkout.",
    h1: "Pricing",
    robots: "index, follow",
    inSitemap: true,
  },
  "/faq": {
    path: "/faq",
    title: "Frequently Asked Questions | Writey",
    description:
      "Answers about Writey’s text to handwriting converter: accounts, English and Hindi, PDF and PNG export, plan limits, and acceptable use.",
    h1: "Frequently asked questions",
    robots: "index, follow",
    inSitemap: true,
  },
  "/acceptable-use": {
    path: "/acceptable-use",
    title: "Acceptable Use | Writey",
    description:
      "How you may use Writey’s text to handwriting tool, including allowed uses, academic integrity rules, and features we will not build.",
    h1: "Acceptable Use",
    robots: "index, follow",
    inSitemap: true,
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy Policy | Writey",
    description:
      "How Writey handles information for guest preview and export, optional accounts, and support. This draft is a product policy, not a legal certification.",
    h1: "Privacy Policy",
    robots: "index, follow",
    inSitemap: true,
  },
  "/terms": {
    path: "/terms",
    title: "Terms of Use | Writey",
    description:
      "Terms for using Writey, including guest use, plan limits, acceptable use, and accounts. This draft is not a lawyer’s opinion.",
    h1: "Terms of Use",
    robots: "index, follow",
    inSitemap: true,
  },
  "/cookie": {
    path: "/cookie",
    title: "Cookie Policy | Writey",
    description:
      "How Writey uses essential cookies for sessions and quota, and how analytics cookies would work only if enabled. Vendor names are not yet confirmed.",
    h1: "Cookie Policy",
    robots: "index, follow",
    inSitemap: true,
  },
  "/refund": {
    path: "/refund",
    title: "Refund & Cancellation Policy | Writey",
    description:
      "How Writey subscriptions may be cancelled and how refund requests are handled. The commercial refund window is still being confirmed.",
    h1: "Refund & Cancellation Policy",
    robots: "index, follow",
    inSitemap: true,
  },
  "/login": {
    path: "/login",
    title: "Log in | Writey",
    description:
      "Log in to keep your monthly quota or upgrade to Pro.",
    h1: "Log in",
    robots: "noindex, nofollow",
    inSitemap: false,
  },
  "/register": {
    path: "/register",
    title: "Create account | Writey",
    description:
      "Create an account to keep quota across days and upgrade to Pro. You can still preview and complete a useful Free export without signing in.",
    h1: "Create account",
    robots: "noindex, nofollow",
    inSitemap: false,
  },
  "/404": {
    path: "/404",
    title: "Page not found | Writey",
    description:
      "This page is not available. You can go back to the text to handwriting converter, or open Pricing, FAQ, or Acceptable Use.",
    h1: "Page not found",
    robots: "noindex, nofollow",
    inSitemap: false,
  },
};

export type NavLink = { label: string; href: string };

export const PRIMARY_NAV: NavLink[] = [
  { label: "Converter", href: "/#editor" },
  { label: "Hindi", href: "/hindi" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Acceptable Use", href: "/acceptable-use" },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie" },
  { label: "Refund & Cancellation", href: "/refund" },
  { label: "Acceptable Use", href: "/acceptable-use" },
];

export const FOOTER_OPTIONAL: NavLink[] = [
  { label: "Hindi support", href: "/hindi" },
  { label: "Open the editor", href: "/#editor" },
];

export const LEGAL_PATHS = [
  "/privacy",
  "/terms",
  "/cookie",
  "/refund",
  "/acceptable-use",
] as const;
