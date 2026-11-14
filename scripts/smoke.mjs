/**
 * Route/redirect smoke test.
 * Usage:
 *   WRITEY_BASE=http://127.0.0.1:8787 node scripts/smoke.mjs
 * If WRITEY_BASE is unset, only the static redirect map is checked (no HTTP).
 */
import { isConfirmedProductionOrigin } from "../shared/site-origin.ts";

const BASE = process.env.WRITEY_BASE;

const redirects308 = {
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

const redirects301 = [
  "/converter",
  "/text-to-handwriting",
  "/text-to-handwriting-converter",
  "/convert-text-to-handwriting",
  "/convert",
  "/assignment",
  "/text-to-handwriting-assignment",
  "/chatgpt-to-assignment",
  "/exam",
  "/practical-file",
  "/signup",
];

const ok200 = [
  "/",
  "/hindi",
  "/pricing",
  "/faq",
  "/privacy",
  "/terms",
  "/cookie",
  "/refund",
  "/acceptable-use",
  "/login",
  "/register",
  "/robots.txt",
  "/sitemap.xml",
];

const marketing = [
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

const pageH1 = {
  "/": "Text to Handwriting Converter",
  "/hindi": "Convert Hindi text to handwriting",
  "/pricing": "Pricing",
  "/faq": "Frequently asked questions",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Use",
  "/cookie": "Cookie Policy",
  "/refund": "Refund & Cancellation Policy",
  "/acceptable-use": "Acceptable Use",
  "/login": "Log in",
  "/register": "Create account",
};

function previewMode(base) {
  if (!base) return true;
  try {
    const url = new URL(base);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") return true;
    if (host.endsWith(".workers.dev") || host.endsWith(".pages.dev")) return true;
    return !isConfirmedProductionOrigin(base);
  } catch {
    return true;
  }
}

function hasH1(html, text) {
  const escaped = text
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/&/g, "(?:&|&amp;)");
  const re = new RegExp("<h1\\b[^>]*>\\s*" + escaped + "\\s*</h1>", "i");
  return re.test(html);
}

function robotsNoindex(value) {
  return /noindex/i.test(value) && /nofollow/i.test(value);
}

async function check() {
  const results = [];
  const record = (ok, msg) => {
    results.push({ ok, msg });
    console.log(ok ? "PASS" : "FAIL", msg);
  };

  if (!BASE) {
    record(Object.keys(redirects308).length === 16, "308 alias count is 16");
    record(redirects301.length === 11, "301 synonym + not-do + signup count");
    record(ok200.includes("/refund") && ok200.includes("/acceptable-use"), "indexable legal set includes /refund");
    console.log("No WRITEY_BASE set; skipped HTTP checks. Start wrangler dev and re-run.");
    const failed = results.filter((r) => !r.ok);
    process.exit(failed.length ? 1 : 0);
  }

  const base = BASE.replace(/\/$/, "");
  const isPreview = previewMode(base);

  for (const path of ok200) {
    const res = await fetch(base + path, { redirect: "manual" });
    record(res.status === 200, `${path} expected 200 got ${res.status}`);

    if (marketing.includes(path)) {
      const text = await res.clone().text();
      record(text.includes("<title>") && text.length > 200, `${path} HTML has title and a non-empty body (${text.length} bytes)`);
      record(!text.includes("writey.app"), `${path} HTML does not invent writey.app`);
      record(!text.includes("https://[DOMAIN]"), `${path} HTML does not emit https://[DOMAIN]`);
      record(text.length > 1500, `${path} initial HTML is substantial (${text.length} bytes), not an empty shell`);
      record(hasH1(text, pageH1[path]), `${path} initial HTML contains H1 “${pageH1[path]}”`);
      record(
        text.includes('id="writey-jsonld"') && text.includes("application/ld+json"),
        `${path} initial HTML includes JSON-LD`,
      );
      record(/property="og:title"/.test(text), `${path} initial HTML includes og:title`);
      const metaRobots = (text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
      if (isPreview) {
        record(robotsNoindex(metaRobots), `${path} meta robots is noindex, nofollow (got “${metaRobots}”)`);
        const xrobots = res.headers.get("x-robots-tag") || "";
        record(robotsNoindex(xrobots), `${path} sends X-Robots-Tag noindex, nofollow (got “${xrobots}”)`);
      }
      if (path === "/pricing" || path === "/") {
        const ld = (text.match(/<script type="application\/ld\+json" id="writey-jsonld">([\s\S]*?)<\/script>/) || [])[1] || "";
        record(!/\bAggregateOffer\b/.test(ld) && !/\bOffer\b/.test(ld), `${path} JSON-LD does not contain Offer or AggregateOffer`);
      }
      record(
        text.includes('href="/privacy"') &&
          text.includes('href="/terms"') &&
          text.includes('href="/cookie"') &&
          text.includes('href="/refund"') &&
          text.includes('href="/acceptable-use"'),
        `${path} initial HTML includes footer legal links`,
      );
      if (path === "/cookie") {
        record(
          text.includes("writey_guest") && text.includes("Max-Age=15552000") && text.includes("HttpOnly"),
          "/cookie initial HTML names writey_guest (180 days / Max-Age=15552000, HttpOnly)",
        );
        record(
          text.includes("writey_session") && text.includes("Max-Age=2592000"),
          "/cookie initial HTML names writey_session (30 days / Max-Age=2592000)",
        );
        record(/PENDING CONFIRMATION/.test(text), "/cookie keeps pending rows for analytics/payment/security vendors");
      }
    }

    if (path === "/sitemap.xml") {
      const text = await res.text();
      const type = res.headers.get("content-type") || "";
      record(/xml/i.test(type), "sitemap Content-Type is XML");
      record(!text.includes("writey.app"), "sitemap does not invent writey.app");
      record(!text.includes("[DOMAIN]"), "sitemap does not use the placeholder host");
      record(!text.includes("/login"), "sitemap excludes /login");
      if (isPreview) {
        record(!/workers\.dev/i.test(text) && !/pages\.dev/i.test(text), "preview sitemap does not list a preview host");
        record(!/<loc>/i.test(text), "preview sitemap is an empty urlset with no loc");
        record(/<urlset\b/i.test(text), "preview sitemap is a valid empty urlset");
      } else {
        record(text.includes("/refund") && !text.includes("/login"), "sitemap includes /refund and excludes /login");
      }
    }

    if (path === "/robots.txt") {
      const text = await res.text();
      record(text.includes("Disallow: /login") && text.includes("Disallow: /register"), "robots disallows login and register");
      record(/User-agent:\s*\*/i.test(text) && /Allow:\s*\//i.test(text), "robots has User-agent: * and Allow: /");
      if (isPreview) {
        record(!/^Sitemap:/m.test(text) && !/Sitemap:\s+/i.test(text), "preview robots.txt has no Sitemap line");
        record(!text.includes("[DOMAIN]"), "preview robots.txt does not mention [DOMAIN]");
      } else {
        record(text.includes("Sitemap:"), "production robots has a Sitemap line");
      }
    }

    if (path === "/login" || path === "/register") {
      const robots = res.headers.get("x-robots-tag") || "";
      record(/noindex/i.test(robots), `${path} sends X-Robots-Tag noindex`);
      const text = await res.clone().text();
      const metaRobots = (text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
      record(robotsNoindex(metaRobots), `${path} meta robots is noindex, nofollow`);
      record(hasH1(text, pageH1[path]), `${path} initial HTML contains H1 “${pageH1[path]}”`);
      record(!text.includes("https://[DOMAIN]") && !text.includes("writey.app"), `${path} HTML has no placeholder or invented host`);
      record(
        text.includes('href="/privacy"') &&
          text.includes('href="/terms"') &&
          text.includes('href="/cookie"') &&
          text.includes('href="/refund"') &&
          text.includes('href="/acceptable-use"'),
        `${path} initial HTML includes footer legal links`,
      );
    }
  }

  const missing = await fetch(base + "/this-page-does-not-exist-writey", { redirect: "manual" });
  record(missing.status === 404, `unknown path expected 404 got ${missing.status}`);
  const missingRobots = missing.headers.get("x-robots-tag") || "";
  record(/noindex/i.test(missingRobots), `404 sends X-Robots-Tag noindex (got “${missingRobots}”)`);
  const missingHtml = await missing.text();
  const missingMeta = (missingHtml.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
  record(robotsNoindex(missingMeta), `404 meta robots is noindex, nofollow (got “${missingMeta}”)`);
  record(hasH1(missingHtml, "Page not found"), "404 initial HTML contains H1 “Page not found”");
  record(!/rel="canonical"/i.test(missingHtml), "404 HTML omits canonical");
  record(!missingHtml.includes("https://[DOMAIN]"), "404 HTML does not emit https://[DOMAIN]");
  record(
    missingHtml.includes('href="/privacy"') &&
      missingHtml.includes('href="/terms"') &&
      missingHtml.includes('href="/cookie"') &&
      missingHtml.includes('href="/refund"') &&
      missingHtml.includes('href="/acceptable-use"'),
    "404 initial HTML includes footer legal links",
  );

  for (const [from, to] of Object.entries(redirects308)) {
    const res = await fetch(base + from, { redirect: "manual" });
    const loc = res.headers.get("location") || "";
    record(res.status === 308 && loc.endsWith(to), `${from} 308 -> ${to} (got ${res.status} ${loc})`);
  }
  for (const from of redirects301) {
    const res = await fetch(base + from, { redirect: "manual" });
    const loc = res.headers.get("location") || "";
    const expected = from === "/signup" ? "/register" : "/";
    record(res.status === 301 && loc.endsWith(expected), `${from} 301 -> ${expected} (got ${res.status} ${loc})`);
  }

  const closed = await fetch(base + "/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  const payload = await closed.json();
  record(payload.state === "payments_closed" && payload.payments_open !== true, "checkout returns payments_closed");

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
