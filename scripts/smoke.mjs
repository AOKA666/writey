/**
 * Route/redirect smoke test.
 * Usage:
 *   WRITEY_BASE=http://127.0.0.1:8787 node scripts/smoke.mjs
 * If WRITEY_BASE is unset, only the static redirect map is checked (no HTTP).
 */
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

  for (const path of ok200) {
    const res = await fetch(base + path, { redirect: "manual" });
    record(res.status === 200, `${path} expected 200 got ${res.status}`);
    if (["/", "/hindi", "/pricing", "/faq", "/privacy", "/terms", "/cookie", "/refund", "/acceptable-use"].includes(path)) {
      const text = await res.clone().text();
      record(text.includes("<title>") && text.length > 200, `${path} HTML has title and a non-empty body (${text.length} bytes)`);
      record(!text.includes("writey.app"), `${path} HTML does not invent writey.app`);
    }
    if (path === "/sitemap.xml") {
      const text = await res.text();
      record(text.includes("/refund") && !text.includes("/login"), "sitemap includes /refund and excludes /login");
      record(!text.includes("writey.app"), "sitemap does not invent writey.app");
    }
    if (path === "/robots.txt") {
      const text = await res.text();
      record(text.includes("Sitemap:") && text.includes("Disallow: /login"), "robots has sitemap and disallows login");
    }
    if (path === "/login" || path === "/register") {
      const robots = res.headers.get("x-robots-tag") || "";
      record(/noindex/i.test(robots), `${path} sends X-Robots-Tag noindex`);
    }
  }

  const missing = await fetch(base + "/this-page-does-not-exist-writey", { redirect: "manual" });
  record(missing.status === 404, `unknown path expected 404 got ${missing.status}`);

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
