/**
 * After Vite build, write a foldered HTML file for each route with title,
 * description, robots, OG, JSON-LD, and a prerendered body (H1 + key prose).
 *
 * Canonical / og:url / JSON-LD absolute URLs are emitted only when
 * SITE_URL / VITE_SITE_URL is a confirmed production origin.
 * Preview and unconfirmed builds are noindex and must not emit https://[DOMAIN]
 * or a preview host as canonical.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { confirmedProductionOrigin, scrubPlaceholderHostUrls } from "../shared/site-origin.ts";
import { buildHomeJsonLd, buildWebPageJsonLd } from "../shared/jsonld.ts";
import { faqItemsFor, pageBody } from "./prerender-body.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const indexPath = join(dist, "index.html");
if (!existsSync(indexPath)) {
  console.error("dist/index.html missing. Run vite build first.");
  process.exit(1);
}

const origin = confirmedProductionOrigin(process.env.VITE_SITE_URL || process.env.SITE_URL || "");
const confirmed = Boolean(origin);
const BRAND = "Writey";

const pages = [
  {
    path: "/",
    file: "index.html",
    title: "Text to Handwriting Converter | Writey",
    description:
      "Convert typed English or Hindi text into handwriting-style pages. Preview in your browser, then download PDF or PNG. No account needed to start.",
    indexable: true,
    crumbs: [{ name: "Home", path: "/" }],
    jsonLd: "home",
  },
  {
    path: "/hindi",
    file: "hindi/index.html",
    title: "Convert Hindi Text to Handwriting | Writey",
    description:
      "Preview Hindi (Devanagari) text as handwriting-style pages, then export PDF or PNG. Use the same Writey editor for English. This is a language support page.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Hindi", path: "/hindi" },
    ],
  },
  {
    path: "/pricing",
    file: "pricing/index.html",
    title: "Pricing — Free and Pro Plans | Writey",
    description:
      "Compare Free and Pro plans for handwriting-style page export. USD prices are pending confirmation. Applicable taxes will be shown at checkout.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ],
  },
  {
    path: "/faq",
    file: "faq/index.html",
    title: "Frequently Asked Questions | Writey",
    description:
      "Answers about Writey’s text to handwriting converter: accounts, English and Hindi, PDF and PNG export, plan limits, and acceptable use.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ],
  },
  {
    path: "/privacy",
    file: "privacy/index.html",
    title: "Privacy Policy | Writey",
    description:
      "How Writey handles information for guest preview and export, optional accounts, and support. This draft is a product policy, not a legal certification.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy" },
    ],
  },
  {
    path: "/terms",
    file: "terms/index.html",
    title: "Terms of Use | Writey",
    description:
      "Terms for using Writey, including guest use, plan limits, acceptable use, and accounts. This draft is not a lawyer’s opinion.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Terms of Use", path: "/terms" },
    ],
  },
  {
    path: "/cookie",
    file: "cookie/index.html",
    title: "Cookie Policy | Writey",
    description:
      "How Writey uses essential cookies for sessions and quota, and how analytics cookies would work only if enabled. Vendor names are not yet confirmed.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Cookie Policy", path: "/cookie" },
    ],
  },
  {
    path: "/refund",
    file: "refund/index.html",
    title: "Refund & Cancellation Policy | Writey",
    description:
      "How Writey subscriptions may be cancelled and how refund requests are handled. The commercial refund window is still being confirmed.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Refund & Cancellation", path: "/refund" },
    ],
  },
  {
    path: "/acceptable-use",
    file: "acceptable-use/index.html",
    title: "Acceptable Use | Writey",
    description:
      "How you may use Writey’s text to handwriting tool, including allowed uses, academic integrity rules, and features we will not build.",
    indexable: true,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Acceptable Use", path: "/acceptable-use" },
    ],
  },
  {
    path: "/login",
    file: "login/index.html",
    title: "Log in | Writey",
    description: "Log in to keep your monthly quota, view history, or upgrade to Pro.",
    indexable: false,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Log in", path: "/login" },
    ],
  },
  {
    path: "/register",
    file: "register/index.html",
    title: "Create account | Writey",
    description:
      "Create an account to keep quota across days and upgrade to Pro. You can still preview and complete a useful Free export without signing in.",
    indexable: false,
    crumbs: [
      { name: "Home", path: "/" },
      { name: "Create account", path: "/register" },
    ],
  },
  {
    path: "/404",
    file: "404.html",
    title: "Page not found | Writey",
    description:
      "This page is not available. You can go back to the text to handwriting converter, or open Pricing, FAQ, or Acceptable Use.",
    indexable: false,
    omitCanonical: true,
    crumbs: [{ name: "Home", path: "/" }],
  },
];

const source = readFileSync(indexPath, "utf8");

function set(html, tagRe, replacement, insertAfter = "</title>") {
  if (tagRe.test(html)) return html.replace(tagRe, replacement);
  return html.replace(insertAfter, `</title>\n    ${replacement}`);
}

function remove(html, tagRe) {
  return html.replace(tagRe, "");
}

function jsonLdFor(page) {
  if (page.jsonLd === "home") return buildHomeJsonLd({ brand: BRAND, origin });
  return buildWebPageJsonLd({
    brand: BRAND,
    origin,
    path: page.path,
    name: page.title,
    crumbs: page.crumbs,
    faq: faqItemsFor(page.path),
  });
}

for (const page of pages) {
  const robots = confirmed && page.indexable ? "index, follow" : "noindex, nofollow";
  const canon = !page.omitCanonical && origin
    ? `${origin}${page.path === "/" ? "/" : page.path}`
    : null;

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
    `<meta name="robots" content="${robots}" />`,
  );
  html = set(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${page.title.replace(/"/g, "&quot;")}" />`,
  );
  html = set(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${page.description.replace(/"/g, "&quot;")}" />`,
  );
  html = set(
    html,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="website" />`,
  );

  if (canon) {
    html = set(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canon}" />`);
    html = set(
      html,
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canon}" />`,
    );
  } else {
    html = remove(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/);
    html = remove(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>\s*/);
  }
  html = remove(html, /<meta\s+name="writey-canonical-status"\s+content="[^"]*"\s*\/?>\s*/);

  const jsonLd = JSON.stringify(jsonLdFor(page));
  const jsonLdTag = `<script type="application/ld+json" id="writey-jsonld">${jsonLd}</script>`;
  html = set(html, /<script type="application\/ld\+json" id="writey-jsonld">[\s\S]*?<\/script>/, jsonLdTag);

  const body = pageBody(page.path);
  if (!html.includes('<div id="root"></div>') && !html.includes('<div id="root">')) {
    console.error("Could not find #root in template for", page.path);
    process.exit(1);
  }
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">\n      ${body}\n    </div>`);

  html = scrubPlaceholderHostUrls(html);
  if (html.includes("https://[DOMAIN]") || /writey\.app/i.test(html)) {
    console.error("Prerender emitted a forbidden host for", page.path);
    process.exit(1);
  }

  const dest = join(dist, page.file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  console.log("prerender", page.path, "->", page.file, confirmed ? "production-origin" : "preview-noindex");
}

console.log("prerender complete; confirmed origin =", origin || "(none)");
