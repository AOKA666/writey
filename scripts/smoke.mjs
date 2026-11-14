/**
 * Route/redirect smoke test.
 * Usage (preview, empty SITE_URL):
 *   WRITEY_BASE=http://127.0.0.1:8787 npm run smoke
 * Usage (production mode, after `npm run build:production` and
 * `wrangler dev --env production --local`):
 *   WRITEY_BASE=http://127.0.0.1:8788 npm run smoke:production
 * If WRITEY_BASE is unset, only the static redirect map and QA unit checks run.
 *
 * Production mode is selected when WRITEY_SMOKE_MODE=production (or prod),
 * or when WRITEY_BASE itself is the confirmed official https origin.
 */
import http from "node:http";
import https from "node:https";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  isConfirmedProductionOrigin,
  OFFICIAL_PRODUCTION_ORIGIN,
  SUPPORT_EMAIL,
  PRIVACY_EMAIL,
} from "../shared/site-origin.ts";
import { isQaBuildEnabled, readQaState, shouldShowQaControls } from "../src/lib/qa.ts";

const BASE = process.env.WRITEY_BASE;
const OFFICIAL_ORIGIN = OFFICIAL_PRODUCTION_ORIGIN;
const OFFICIAL_HOST = "text2handwriting.site";
const WWW_HOST = "www.text2handwriting.site";
const WORKERS_DEV_HOST = "writey.example.workers.dev";

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

function smokeMode() {
  const explicit = String(process.env.WRITEY_SMOKE_MODE || "").toLowerCase();
  if (explicit === "production" || explicit === "prod") return "production";
  if (explicit === "preview") return "preview";
  if (BASE && isConfirmedProductionOrigin(BASE)) return "production";
  return "preview";
}

function previewModeFromBase(base) {
  return smokeMode() !== "production";
}

function isLoopbackBase(base) {
  try {
    const host = new URL(base).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}

const PRODUCTION_PRERENDER_PAGES = [
  ["/", "index.html"],
  ["/hindi", "hindi/index.html"],
  ["/pricing", "pricing/index.html"],
  ["/faq", "faq/index.html"],
  ["/privacy", "privacy/index.html"],
  ["/terms", "terms/index.html"],
  ["/cookie", "cookie/index.html"],
  ["/refund", "refund/index.html"],
  ["/acceptable-use", "acceptable-use/index.html"],
];

function recordProductionPrerenderFiles(record) {
  const dist = process.env.WRITEY_DIST || "dist";
  if (!existsSync(join(dist, "index.html"))) {
    record(false, `production prerender files not found in ${dist}/ (run npm run build:production)`);
    return;
  }
  for (const [path, file] of PRODUCTION_PRERENDER_PAGES) {
    const text = readFileSync(join(dist, file), "utf8");
    const metaRobots = (text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
    const canon = `${OFFICIAL_ORIGIN}${path === "/" ? "/" : path}`;
    record(robotsIndexFollow(metaRobots), `dist ${file} meta robots is index, follow (got “${metaRobots}”)`);
    record(text.includes(`rel="canonical" href="${canon}"`), `dist ${file} canonical is ${canon}`);
    record(text.includes(`property="og:url" content="${canon}"`), `dist ${file} og:url is ${canon}`);
    record(text.includes(SUPPORT_EMAIL) && text.includes(PRIVACY_EMAIL), `dist ${file} includes official contact emails`);
    record(!text.includes("[DOMAIN]"), `dist ${file} has no [DOMAIN] placeholder`);
    record(!/Pending commercial licence/i.test(text), `dist ${file} has no Pending commercial licence label`);
    record(htmlOmitsQaPanel(text), `dist ${file} omits QA panel strings`);
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

function robotsIndexFollow(value) {
  return /index/i.test(value) && /follow/i.test(value) && !/noindex/i.test(value);
}

const QA_PANEL_STRINGS = ["Preview only — QA controls", "Reset quota", "Plan: pro"];

function htmlOmitsQaPanel(html) {
  return QA_PANEL_STRINGS.every((s) => !html.includes(s));
}

function fetchRaw(url, { method = "GET", headers = {}, body, host } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const reqHeaders = { "user-agent": "writey-smoke/1", ...headers };
    if (host) reqHeaders.host = host;
    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        method,
        headers: reqHeaders,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const headerBag = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (v == null) continue;
            headerBag.set(k, Array.isArray(v) ? v.join(", ") : String(v));
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 0,
              headers: headerBag,
            }),
          );
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function recordQaGateChecks(record, { productionBuild } = { productionBuild: false }) {
  if (productionBuild) {
    record(!isQaBuildEnabled(), "production smoke has QA build flag disabled");
    record(!shouldShowQaControls(readQaState("?qa=1", "")), "production build hides QA panel even when qa=1");
    record(!shouldShowQaControls(readQaState("?qa_plan=pro", "")), "production build ignores qa_plan");
    record(!shouldShowQaControls(readQaState("?qa_quota=exhausted", "")), "production build ignores qa_quota");
    return;
  }
  record(isQaBuildEnabled(), "preview smoke has QA build flag enabled");
  record(!shouldShowQaControls(readQaState("", "")), "QA panel is hidden with no query string");
  record(!shouldShowQaControls(readQaState("?utm_source=test", "")), "QA panel is hidden with an unrelated query");
  record(shouldShowQaControls(readQaState("?qa=1", "")), "QA panel is shown when qa=1");
  record(shouldShowQaControls(readQaState("?qa_plan=pro", "")), "QA panel is shown when qa_plan is set");
  record(shouldShowQaControls(readQaState("?qa_quota=exhausted", "")), "QA panel is shown when qa_quota is set");
  record(shouldShowQaControls(readQaState("?qa_preview=fail", "")), "QA panel is shown when qa_preview is set");
  record(shouldShowQaControls(readQaState("?qa_export=fail", "")), "QA panel is shown when qa_export is set");
  record(!shouldShowQaControls({ enabled: false }), "shouldShowQaControls is false when enabled is false");
}

function recordSharedHtmlChecks(record, path, text) {
  record(text.includes("<title>") && text.length > 200, `${path} HTML has title and a non-empty body (${text.length} bytes)`);
  record(!text.includes("writey.app"), `${path} HTML does not invent writey.app`);
  record(!text.includes("[DOMAIN]"), `${path} HTML does not emit the [DOMAIN] placeholder`);
  record(!/Pending commercial licence/i.test(text), `${path} HTML has no Pending commercial licence label`);
  record(text.length > 1500, `${path} initial HTML is substantial (${text.length} bytes), not an empty shell`);
  record(hasH1(text, pageH1[path]), `${path} initial HTML contains H1 “${pageH1[path]}”`);
  record(
    text.includes('id="writey-jsonld"') && text.includes("application/ld+json"),
    `${path} initial HTML includes JSON-LD`,
  );
  record(/property="og:title"/.test(text), `${path} initial HTML includes og:title`);
  record(
    text.includes('href="/privacy"') &&
      text.includes('href="/terms"') &&
      text.includes('href="/cookie"') &&
      text.includes('href="/refund"') &&
      text.includes('href="/acceptable-use"'),
    `${path} initial HTML includes footer legal links`,
  );
  record(text.includes(SUPPORT_EMAIL) && text.includes(PRIVACY_EMAIL), `${path} HTML includes official contact emails`);
  record(!text.includes("待确认"), `${path} prerendered HTML has no user-facing 待确认`);
  record(
    !/Export history for 30 days, then deleted/i.test(text) &&
      !/Pro export history is kept for 30 days/i.test(text),
    `${path} does not present 30-day export history as a shipped feature`,
  );
  if (path === "/terms" || path === "/privacy" || path === "/pricing" || path === "/faq" || path === "/") {
    record(
      /Saved export history is not currently provided|does not provide a stored export history|does not currently provide an in-account export history|not stored for later retrieval/i.test(text),
      `${path} states current export history is not provided`,
    );
  }
}

async function check() {
  const results = [];
  const record = (ok, msg) => {
    results.push({ ok, msg });
    console.log(ok ? "PASS" : "FAIL", msg);
  };

  const isPreview = previewModeFromBase(BASE);
  const productionBuild = !isPreview || process.env.VITE_ENABLE_QA === "0";

  if (!BASE) {
    record(Object.keys(redirects308).length === 16, "308 alias count is 16");
    record(redirects301.length === 11, "301 synonym + not-do + signup count");
    record(ok200.includes("/refund") && ok200.includes("/acceptable-use"), "indexable legal set includes /refund");
    recordQaGateChecks(record, { productionBuild: smokeMode() === "production" });
    console.log("No WRITEY_BASE set; skipped HTTP checks. Start wrangler dev and re-run.");
    const failed = results.filter((r) => !r.ok);
    process.exit(failed.length ? 1 : 0);
  }

  const base = BASE.replace(/\/$/, "");
  const localProduction = !isPreview && isLoopbackBase(base);
  recordQaGateChecks(record, { productionBuild: !isPreview });
  if (!isPreview) recordProductionPrerenderFiles(record);

  // Do not send the official Host to a loopback wrangler: it 301s to http://text2handwriting.site
  // before the Worker runs. Official-host index,follow is asserted from dist/ and would apply on the live apex.
  const pageHost = undefined;

  for (const path of ok200) {
    const res = await fetchRaw(base + path, { host: pageHost });
    record(res.status === 200, `${path} expected 200 got ${res.status}`);

    if (marketing.includes(path)) {
      const text = await res.clone().text();
      recordSharedHtmlChecks(record, path, text);
      const metaRobots = (text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
      const xrobots = res.headers.get("x-robots-tag") || "";
      const canon = `${OFFICIAL_ORIGIN}${path === "/" ? "/" : path}`;
      if (isPreview) {
        record(robotsNoindex(metaRobots), `${path} meta robots is noindex, nofollow (got “${metaRobots}”)`);
        record(robotsNoindex(xrobots), `${path} sends X-Robots-Tag noindex, nofollow (got “${xrobots}”)`);
        record(!/rel="canonical"/i.test(text) && !/property="og:url"/i.test(text), `${path} preview HTML omits canonical and og:url`);
      } else if (localProduction) {
        record(robotsNoindex(metaRobots), `${path} local prod Host is noindex, nofollow (host hardening; got “${metaRobots}”)`);
        record(robotsNoindex(xrobots), `${path} local prod sends X-Robots-Tag noindex, nofollow (got “${xrobots}”)`);
        record(text.includes(`rel="canonical" href="${canon}"`), `${path} canonical stays ${canon} on a non-official host`);
        record(text.includes(`property="og:url" content="${canon}"`), `${path} og:url stays ${canon} on a non-official host`);
      } else {
        record(robotsIndexFollow(metaRobots), `${path} meta robots is index, follow (got “${metaRobots}”)`);
        record(text.includes(`rel="canonical" href="${canon}"`), `${path} canonical is ${canon}`);
        record(text.includes(`property="og:url" content="${canon}"`), `${path} og:url is ${canon}`);
      }
      if (path === "/pricing" || path === "/") {
        const ld = (text.match(/<script type="application\/ld\+json" id="writey-jsonld">([\s\S]*?)<\/script>/) || [])[1] || "";
        record(!/\bAggregateOffer\b/.test(ld) && !/\bOffer\b/.test(ld), `${path} JSON-LD does not contain Offer or AggregateOffer`);
      }
      if (path === "/") {
        record(
          htmlOmitsQaPanel(text),
          "/ prerendered HTML omits QA controls panel (Preview only — QA controls, Reset quota, Plan: pro)",
        );
      }
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
      if (path === "/terms") {
        record(/SIL Open Font License/i.test(text) || /SIL OFL 1\.1/i.test(text), "/terms states SIL OFL 1.1 for shipped fonts");
        record(!/we do not claim an open-source licence/i.test(text), "/terms no longer denies an open-source font licence");
      }
    }

    if (path === "/sitemap.xml") {
      const text = await res.text();
      const type = res.headers.get("content-type") || "";
      record(/xml/i.test(type), "sitemap Content-Type is XML");
      record(!text.includes("writey.app"), "sitemap does not invent writey.app");
      record(!text.includes("[DOMAIN]"), "sitemap does not use the placeholder host");
      record(!text.includes("/login") && !text.includes("/register") && !text.includes("/404"), "sitemap excludes login, register, and 404");
      if (isPreview) {
        record(!/workers\.dev/i.test(text) && !/pages\.dev/i.test(text), "preview sitemap does not list a preview host");
        record(!/<loc>/i.test(text), "preview sitemap is an empty urlset with no loc");
        record(/<urlset\b/i.test(text), "preview sitemap is a valid empty urlset");
      } else {
        record(text.includes(`${OFFICIAL_ORIGIN}/refund`) && text.includes(`${OFFICIAL_ORIGIN}/`), "sitemap locs use the official origin");
        record(!/workers\.dev/i.test(text), "production sitemap does not list a workers.dev host");
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
        record(
          text.includes(`Sitemap: ${OFFICIAL_ORIGIN}/sitemap.xml`),
          `production robots has Sitemap: ${OFFICIAL_ORIGIN}/sitemap.xml`,
        );
      }
    }

    if (path === "/login" || path === "/register") {
      const robots = res.headers.get("x-robots-tag") || "";
      record(/noindex/i.test(robots), `${path} sends X-Robots-Tag noindex`);
      const text = await res.clone().text();
      const metaRobots = (text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
      record(robotsNoindex(metaRobots), `${path} meta robots is noindex, nofollow`);
      record(hasH1(text, pageH1[path]), `${path} initial HTML contains H1 “${pageH1[path]}”`);
      record(!text.includes("[DOMAIN]") && !text.includes("writey.app"), `${path} HTML has no placeholder or invented host`);
      record(
        text.includes('href="/privacy"') &&
          text.includes('href="/terms"') &&
          text.includes('href="/cookie"') &&
          text.includes('href="/refund"') &&
          text.includes('href="/acceptable-use"'),
        `${path} initial HTML includes footer legal links`,
      );
      record(!text.includes("待确认"), `${path} prerendered HTML has no user-facing 待确认`);
      if (path === "/login") {
        record(!/view history/i.test(text), "/login description has no “view history”");
        record(
          text.includes("Log in to keep your monthly quota or upgrade to Pro."),
          "/login uses the frozen login sentence",
        );
      }
    }
  }

  const missing = await fetchRaw(base + "/this-page-does-not-exist-writey", { host: pageHost });
  record(missing.status === 404, `unknown path expected 404 got ${missing.status}`);
  const missingRobots = missing.headers.get("x-robots-tag") || "";
  record(/noindex/i.test(missingRobots), `404 sends X-Robots-Tag noindex (got “${missingRobots}”)`);
  const missingHtml = await missing.text();
  const missingMeta = (missingHtml.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
  record(robotsNoindex(missingMeta), `404 meta robots is noindex, nofollow (got “${missingMeta}”)`);
  record(hasH1(missingHtml, "Page not found"), "404 initial HTML contains H1 “Page not found”");
  record(!/rel="canonical"/i.test(missingHtml), "404 HTML omits canonical");
  record(!missingHtml.includes("[DOMAIN]"), "404 HTML does not emit [DOMAIN]");
  record(
    missingHtml.includes('href="/privacy"') &&
      missingHtml.includes('href="/terms"') &&
      missingHtml.includes('href="/cookie"') &&
      missingHtml.includes('href="/refund"') &&
      missingHtml.includes('href="/acceptable-use"'),
    "404 initial HTML includes footer legal links",
  );

  for (const [from, to] of Object.entries(redirects308)) {
    const res = await fetchRaw(base + from, { host: pageHost });
    const loc = res.headers.get("location") || "";
    record(res.status === 308 && loc.endsWith(to), `${from} 308 -> ${to} (got ${res.status} ${loc})`);
  }
  for (const from of redirects301) {
    const res = await fetchRaw(base + from, { host: pageHost });
    const loc = res.headers.get("location") || "";
    const expected = from === "/signup" ? "/register" : "/";
    record(res.status === 301 && loc.endsWith(expected), `${from} 301 -> ${expected} (got ${res.status} ${loc})`);
  }

  const closed = await fetchRaw(base + "/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    host: pageHost,
  });
  let payload = {};
  try {
    payload = await closed.json();
  } catch {
    payload = {};
  }
  record(closed.status === 200 && payload.state === "payments_closed" && payload.payments_open !== true, "checkout returns payments_closed");
  if (typeof payload.message === "string") {
    record(payload.message.includes(SUPPORT_EMAIL), "checkout closed message uses the official support email");
    record(!payload.message.includes("[DOMAIN]"), "checkout closed message has no [DOMAIN] placeholder");
  }

  if (!isPreview) {
    const qaHome = await fetchRaw(base + "/?qa=1", { host: pageHost });
    record(qaHome.status === 200, "/?qa=1 expected 200 in production mode");
    const qaHtml = await qaHome.text();
    record(htmlOmitsQaPanel(qaHtml), "production /?qa=1 does not surface QA controls");

    const www = await fetchRaw(base + "/pricing?ref=smoke", { host: WWW_HOST });
    const wwwLoc = www.headers.get("location") || "";
    record(
      www.status === 301 && wwwLoc === `${OFFICIAL_ORIGIN}/pricing?ref=smoke`,
      `www host 301 -> ${OFFICIAL_ORIGIN}/pricing?ref=smoke (got ${www.status} ${wwwLoc})`,
    );

    const stray = await fetchRaw(base + "/", { host: WORKERS_DEV_HOST });
    record(stray.status === 200, "workers.dev Host still serves / with 200");
    const strayRobots = stray.headers.get("x-robots-tag") || "";
    record(robotsNoindex(strayRobots), `workers.dev Host sends X-Robots-Tag noindex, nofollow (got “${strayRobots}”)`);
    const strayHtml = await stray.text();
    const strayMeta = (strayHtml.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [])[1] || "";
    record(robotsNoindex(strayMeta), `workers.dev Host meta robots is noindex, nofollow (got “${strayMeta}”)`);
    record(
      strayHtml.includes(`rel="canonical" href="${OFFICIAL_ORIGIN}/"`),
      "workers.dev Host keeps the official canonical, not the request host",
    );
    record(htmlOmitsQaPanel(strayHtml), "workers.dev Host does not surface QA controls");
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
