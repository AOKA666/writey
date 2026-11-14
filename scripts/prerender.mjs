/**
 * After Vite build, write a foldered HTML file for each route
 * with the correct title, description, robots, canonical, and JSON-LD.
 * Canonical uses VITE_SITE_URL when set; otherwise https://[DOMAIN] ([待确认]).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
if (!existsSync(indexPath)) {
  console.error("dist/index.html missing. Run vite build first.");
  process.exit(1);
}

const SITE = (process.env.VITE_SITE_URL || process.env.SITE_URL || "").replace(/\/$/, "");
const origin = SITE && !/writey\.app/i.test(SITE) ? SITE : "https://[DOMAIN]";

const pages = [
  {
    path: "/",
    file: "index.html",
    title: "Text to Handwriting Converter | Writey",
    description:
      "Convert typed English or Hindi text into handwriting-style pages. Preview in your browser, then download PDF or PNG. No account needed to start.",
    robots: "index, follow",
  },
  {
    path: "/hindi",
    file: "hindi/index.html",
    title: "Convert Hindi Text to Handwriting | Writey",
    description:
      "Preview Hindi (Devanagari) text as handwriting-style pages, then export PDF or PNG. Use the same Writey editor for English. This is a language support page.",
    robots: "index, follow",
  },
  {
    path: "/pricing",
    file: "pricing/index.html",
    title: "Pricing — Free and Pro Plans | Writey",
    description:
      "Compare Free and Pro plans for handwriting-style page export. USD prices are pending confirmation. Applicable taxes will be shown at checkout.",
    robots: "index, follow",
  },
  {
    path: "/faq",
    file: "faq/index.html",
    title: "Frequently Asked Questions | Writey",
    description:
      "Answers about Writey’s text to handwriting converter: accounts, English and Hindi, PDF and PNG export, plan limits, and acceptable use.",
    robots: "index, follow",
  },
  {
    path: "/privacy",
    file: "privacy/index.html",
    title: "Privacy Policy | Writey",
    description:
      "How Writey handles information for guest preview and export, optional accounts, and support. This draft is a product policy, not a legal certification.",
    robots: "index, follow",
  },
  {
    path: "/terms",
    file: "terms/index.html",
    title: "Terms of Use | Writey",
    description:
      "Terms for using Writey, including guest use, plan limits, acceptable use, and accounts. This draft is not a lawyer’s opinion.",
    robots: "index, follow",
  },
  {
    path: "/cookie",
    file: "cookie/index.html",
    title: "Cookie Policy | Writey",
    description:
      "How Writey uses essential cookies for sessions and quota, and how analytics cookies would work only if enabled. Vendor names are not yet confirmed.",
    robots: "index, follow",
  },
  {
    path: "/refund",
    file: "refund/index.html",
    title: "Refund & Cancellation Policy | Writey",
    description:
      "How Writey subscriptions may be cancelled and how refund requests are handled. The commercial refund window is still being confirmed.",
    robots: "index, follow",
  },
  {
    path: "/acceptable-use",
    file: "acceptable-use/index.html",
    title: "Acceptable Use | Writey",
    description:
      "How you may use Writey’s text to handwriting tool, including allowed uses, academic integrity rules, and features we will not build.",
    robots: "index, follow",
  },
  {
    path: "/login",
    file: "login/index.html",
    title: "Log in | Writey",
    description: "Log in to keep your monthly quota, view history, or upgrade to Pro.",
    robots: "noindex, nofollow",
  },
  {
    path: "/register",
    file: "register/index.html",
    title: "Create account | Writey",
    description:
      "Create an account to keep quota across days and upgrade to Pro. You can still preview and complete a useful Free export without signing in.",
    robots: "noindex, nofollow",
  },
  {
    path: "/404",
    file: "404.html",
    title: "Page not found | Writey",
    description:
      "This page is not available. You can go back to the text to handwriting converter, or open Pricing, FAQ, or Acceptable Use.",
    robots: "noindex, nofollow",
  },
];

const source = readFileSync(indexPath, "utf8");

function set(html, tagRe, replacement, insertAfter = "</title>") {
  if (tagRe.test(html)) return html.replace(tagRe, replacement);
  return html.replace(insertAfter, `</title>\n    ${replacement}`);
}

for (const page of pages) {
  const canon = `${origin}${page.path === "/" ? "/" : page.path}`;
  let html = source;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`);
  html = set(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${page.description.replace(/"/g, "&quot;")}" />`,
  );
  html = set(
    html,
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${page.robots}" />`,
  );
  html = set(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canon}" />`,
  );
  if (!SITE) {
    html = set(
      html,
      /<meta\s+name="writey-canonical-status"\s+content="[^"]*"\s*\/?>/,
      `<meta name="writey-canonical-status" content="Canonical host is https://[DOMAIN] [待确认]" />`,
    );
  }
  const dest = join(dist, page.file);
  mkdirSync(dirname(dest), { recursive: true });
  if (dest !== indexPath) writeFileSync(dest, html);
  else writeFileSync(dest, html);
  console.log("prerender", page.path, "->", page.file);
}

console.log("prerender complete; origin =", origin);
