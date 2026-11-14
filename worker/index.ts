import { Hono, type Context } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import {
  ACCOUNT_ALIASES_301,
  INDEXABLE_PATHS,
  LEGAL_ALIASES_308,
  NOT_DO_PATHS_301,
  PRODUCT_SYNONYMS_301,
  SPA_PATHS,
  normalizePath,
} from "./routes";

export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  SITE_URL?: string;
  AUTH_SECRET?: string;
  ANALYTICS_MEASUREMENT_ID?: string;
}

type Variables = { sessionId?: string };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const COOKIE = "writey_session";
const GUEST = "writey_guest";

function originFrom(env: Env, url: URL): string {
  const configured = env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured && !/writey\.app/i.test(configured)) return configured;
  return url.origin;
}

function canonicalPlaceholder(env: Env, url: URL, path: string): string {
  const origin = env.SITE_URL?.trim()
    ? originFrom(env, url)
    : "https://[DOMAIN]";
  return `${origin.replace(/\/$/, "")}${path === "/" ? "/" : path}`;
}

function jsonError(c: { json: (d: unknown, s?: number) => Response }, code: string, message: string, status = 400) {
  return c.json({ ok: false, error: { code, message } }, status);
}

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function resetAt(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString();
}

function limits(plan: string) {
  const pro = plan === "pro";
  return {
    pages_limit: pro ? 150 : 8,
    jobs_limit: pro ? 10 : 2,
    previews_limit: pro ? 50 : 10,
    pages_per_preview_limit: pro ? 20 : 8,
    watermark: !pro,
  };
}

function defaultEntitlement(partial: Record<string, unknown> = {}) {
  const plan = String(partial.plan_id ?? "guest_free");
  const period = monthKey();
  return {
    subject_id: partial.subject_id ?? "guest:anonymous",
    signed_in: Boolean(partial.signed_in),
    email: (partial.email as string | null) ?? null,
    plan_id: plan,
    period_yyyy_mm: period,
    pages_used: Number(partial.pages_used ?? 0),
    jobs_used_today: Number(partial.jobs_used_today ?? 0),
    previews_used_today: Number(partial.previews_used_today ?? 0),
    quota_reset_at: resetAt(period),
    payments_open: false as const,
    payments_state: "payments_closed" as const,
    ...limits(plan),
  };
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 },
    key,
    256,
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function loadEntitlement(env: Env, userId: string | null, guestId: string | null, email: string | null) {
  const subject = userId ?? (guestId ? `guest:${guestId}` : "guest:anonymous");
  const plan = userId ? "free" : "guest_free";
  const period = monthKey();
  const today = dayKey();
  if (!env.DB) {
    return { entitlement: defaultEntitlement({ subject_id: subject, signed_in: Boolean(userId), email, plan_id: plan }), backend: "local_fallback" as const };
  }
  try {
    let row = await env.DB.prepare(
      "SELECT * FROM entitlements WHERE subject_id = ?",
    )
      .bind(subject)
      .first<{
        plan_id: string;
        period_yyyy_mm: string;
        pages_used: number;
        jobs_used_today: number;
        previews_used_today: number;
        usage_day: string;
        quota_reset_at: string;
      }>();
    if (row && userId) {
      const user = await env.DB.prepare("SELECT plan_id, email FROM users WHERE user_id = ?").bind(userId).first<{ plan_id: string; email: string }>();
      if (user) {
        row = { ...row, plan_id: user.plan_id };
        email = user.email;
      }
    }
    if (!row) {
      const lim = limits(plan);
      await env.DB.prepare(
        `INSERT INTO entitlements (subject_id, plan_id, period_yyyy_mm, pages_used, jobs_used_today, previews_used_today, usage_day, quota_reset_at, updated_at)
         VALUES (?, ?, ?, 0, 0, 0, ?, ?, ?)`,
      )
        .bind(subject, plan, period, today, resetAt(period), new Date().toISOString())
        .run();
      return {
        entitlement: defaultEntitlement({ subject_id: subject, signed_in: Boolean(userId), email, plan_id: plan, ...lim }),
        backend: "d1" as const,
      };
    }
    if (row.period_yyyy_mm !== period) {
      row.period_yyyy_mm = period;
      row.pages_used = 0;
      row.quota_reset_at = resetAt(period);
    }
    if (row.usage_day !== today) {
      row.jobs_used_today = 0;
      row.previews_used_today = 0;
      row.usage_day = today;
    }
    return {
      entitlement: defaultEntitlement({
        subject_id: subject,
        signed_in: Boolean(userId),
        email,
        plan_id: userId ? row.plan_id : "guest_free",
        pages_used: row.pages_used,
        jobs_used_today: row.jobs_used_today,
        previews_used_today: row.previews_used_today,
        period_yyyy_mm: row.period_yyyy_mm,
        quota_reset_at: row.quota_reset_at,
      }),
      backend: "d1" as const,
    };
  } catch {
    return { entitlement: defaultEntitlement({ subject_id: subject, signed_in: Boolean(userId), email, plan_id: plan }), backend: "local_fallback" as const };
  }
}

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

async function resolveSession(c: AppContext) {
  const sessionId = getCookie(c, COOKIE);
  const guestExisting = getCookie(c, GUEST);
  if (!c.env.DB || !sessionId) {
    return { userId: null as string | null, guestId: guestExisting ?? null, email: null as string | null };
  }
  const row = await c.env.DB.prepare(
    "SELECT user_id, guest_id, expires_at FROM sessions WHERE session_id = ?",
  )
    .bind(sessionId)
    .first<{ user_id: string | null; guest_id: string | null; expires_at: string }>();
  if (!row || new Date(row.expires_at) < new Date()) {
    return { userId: null, guestId: guestExisting ?? row?.guest_id ?? null, email: null };
  }
  let email: string | null = null;
  if (row.user_id) {
    const user = await c.env.DB.prepare("SELECT email FROM users WHERE user_id = ?").bind(row.user_id).first<{ email: string }>();
    email = user?.email ?? null;
  }
  return { userId: row.user_id, guestId: row.guest_id ?? guestExisting ?? null, email };
}

function attachGuest(c: Parameters<typeof setCookie>[0], guestId: string) {
  setCookie(c, GUEST, guestId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

app.all("/api/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});

app.get("/api/session", async (c) => {
  let guestId = getCookie(c, GUEST);
  if (!guestId) {
    guestId = crypto.randomUUID();
    attachGuest(c, guestId);
  }
  const sess = await resolveSession(c);
  const { entitlement, backend } = await loadEntitlement(c.env, sess.userId, sess.guestId ?? guestId, sess.email);
  return c.json({ ok: true, entitlement, backend });
});

app.post("/api/auth/register", async (c) => {
  if (!c.env.DB) return jsonError(c, "backend_unavailable", "Account storage is not available in this preview. You can still use the editor as a guest.", 503);
  const body = (await c.req.json<{ email?: string; password?: string }>().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !email.includes("@")) return jsonError(c, "invalid_email", "Enter a valid email address.");
  if (password.length < 8) return jsonError(c, "weak_password", "Use at least 8 characters.");
  const existing = await c.env.DB.prepare("SELECT user_id FROM users WHERE email = ?").bind(email).first();
  if (existing) return jsonError(c, "email_taken", "An account with this email already exists. Try logging in.", 409);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    "INSERT INTO users (user_id, email, password_hash, password_salt, plan_id, created_at, updated_at) VALUES (?, ?, ?, ?, 'free', ?, ?)",
  )
    .bind(userId, email, hash, [...salt].map((b) => b.toString(16).padStart(2, "0")).join(""), now, now)
    .run();
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (session_id, user_id, guest_id, created_at, expires_at) VALUES (?, ?, NULL, ?, ?)",
  )
    .bind(sessionId, userId, now, expires)
    .run();
  setCookie(c, COOKIE, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  const { entitlement, backend } = await loadEntitlement(c.env, userId, null, email);
  return c.json({ ok: true, entitlement, backend });
});

app.post("/api/auth/login", async (c) => {
  if (!c.env.DB) return jsonError(c, "backend_unavailable", "Account storage is not available in this preview.", 503);
  const body = (await c.req.json<{ email?: string; password?: string }>().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const user = await c.env.DB.prepare(
    "SELECT user_id, email, password_hash, password_salt FROM users WHERE email = ?",
  )
    .bind(email ?? "")
    .first<{ user_id: string; email: string; password_hash: string; password_salt: string }>();
  if (!user) return jsonError(c, "invalid_credentials", "Email or password is incorrect.", 401);
  const hash = await pbkdf2(password, hexToBytes(user.password_salt));
  if (hash !== user.password_hash) return jsonError(c, "invalid_credentials", "Email or password is incorrect.", 401);
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (session_id, user_id, guest_id, created_at, expires_at) VALUES (?, ?, NULL, ?, ?)",
  )
    .bind(sessionId, user.user_id, now, expires)
    .run();
  setCookie(c, COOKIE, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  const { entitlement, backend } = await loadEntitlement(c.env, user.user_id, null, user.email);
  return c.json({ ok: true, entitlement, backend });
});

app.post("/api/auth/logout", async (c) => {
  const sessionId = getCookie(c, COOKIE);
  if (sessionId && c.env.DB) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE session_id = ?").bind(sessionId).run();
  }
  deleteCookie(c, COOKIE, { path: "/" });
  return c.json({ ok: true });
});

app.post("/api/quota/consume", async (c) => {
  const body = (await c.req.json<{ kind?: string; pages?: number }>().catch(() => ({}))) as {
    kind?: string;
    pages?: number;
  };
  const kind = body.kind;
  const pages = Math.max(0, Math.floor(Number(body.pages ?? 0)));
  // Never accept or store source_text.
  if (body && "source_text" in (body as Record<string, unknown>)) {
    return jsonError(c, "forbidden_field", "source_text is not accepted by this API.");
  }
  const sess = await resolveSession(c);
  const guestId = sess.guestId ?? getCookie(c, GUEST) ?? crypto.randomUUID();
  if (!getCookie(c, GUEST)) attachGuest(c, guestId);
  const loaded = await loadEntitlement(c.env, sess.userId, guestId, sess.email);
  const ent = { ...loaded.entitlement };
  if (kind === "pages") {
    ent.pages_used += pages;
    ent.jobs_used_today += 1;
  } else if (kind === "jobs") {
    ent.jobs_used_today += 1;
  } else if (kind === "previews") {
    ent.previews_used_today += 1;
  } else {
    return jsonError(c, "invalid_kind", "kind must be pages, jobs, or previews.");
  }
  if (c.env.DB && loaded.backend === "d1") {
    await c.env.DB.prepare(
      `UPDATE entitlements SET pages_used = ?, jobs_used_today = ?, previews_used_today = ?, usage_day = ?, period_yyyy_mm = ?, updated_at = ?
       WHERE subject_id = ?`,
    )
      .bind(
        ent.pages_used,
        ent.jobs_used_today,
        ent.previews_used_today,
        dayKey(),
        monthKey(),
        new Date().toISOString(),
        ent.subject_id,
      )
      .run();
  }
  return c.json({ ok: true, entitlement: ent, backend: loaded.backend });
});

app.post("/api/payments/checkout", async (c) => {
  return c.json({
    ok: true,
    state: "payments_closed",
    payments_open: false,
    message:
      "Payments are not open yet. We will not charge your account. You can keep using the Free plan or ask to be notified at support@[DOMAIN].",
  });
});

app.post("/api/waitlist", async (c) => {
  const body = (await c.req.json<{
    kind?: string;
    name?: string;
    email?: string;
    organisation?: string;
    message?: string;
  }>().catch(() => ({}))) as {
    kind?: string;
    name?: string;
    email?: string;
    organisation?: string;
    message?: string;
  };
  const email = body.email?.trim();
  if (!email || !email.includes("@")) return jsonError(c, "invalid_email", "Enter a valid email address.");
  const kind = body.kind === "payments_open" ? "payments_open" : "teams_education";
  if (c.env.DB) {
    await c.env.DB.prepare(
      "INSERT INTO waitlist (id, kind, name, email, organisation, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        crypto.randomUUID(),
        kind,
        body.name ?? null,
        email,
        body.organisation ?? null,
        body.message ?? null,
        new Date().toISOString(),
      )
      .run();
  }
  return c.json({ ok: true });
});

app.post("/api/analytics", async (c) => {
  const body = (await c.req.json<Record<string, unknown>>().catch(() => ({}))) as Record<string, unknown>;
  if (body.source_text || (body.payload && typeof body.payload === "object" && body.payload && "source_text" in (body.payload as object))) {
    return jsonError(c, "forbidden_field", "Events must never include source_text.");
  }
  // Provider [待确认]. Do not forward to a vendor. Do not log payload bodies.
  return c.json({ ok: true, accepted: Boolean(c.env.ANALYTICS_MEASUREMENT_ID), vendor: "noop_until_confirmed" });
});

app.get("/robots.txt", (c) => {
  const url = new URL(c.req.url);
  const sitemap = `${originFrom(c.env, url)}/sitemap.xml`;
  const body = `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /register\nSitemap: ${sitemap}\n`;
  return c.text(body, 200, { "Content-Type": "text/plain; charset=utf-8" });
});

app.get("/sitemap.xml", (c) => {
  const url = new URL(c.req.url);
  const urls = INDEXABLE_PATHS.map((path) => {
    const loc = canonicalPlaceholder(c.env, url, path);
    return `  <url><loc>${loc}</loc></url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return c.text(xml, 200, { "Content-Type": "application/xml; charset=utf-8" });
});

async function asset(c: { req: Request | { url: string; raw?: Request }; env: Env; header: (k: string, v: string) => void }, path: string, status = 200) {
  const raw = "raw" in c.req && c.req.raw ? c.req.raw : (c.req as Request);
  const url = new URL(raw.url);
  url.pathname = path;
  const res = await c.env.ASSETS.fetch(new Request(url.toString(), raw));
  const headers = new Headers(res.headers);
  if (status === 404) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
    headers.set("Cache-Control", "no-store");
  }
  return new Response(res.body, { status, headers });
}

app.all("*", async (c) => {
  const url = new URL(c.req.url);
  const path = normalizePath(url.pathname);

  if (LEGAL_ALIASES_308[path]) {
    return c.redirect(LEGAL_ALIASES_308[path], 308);
  }
  if (PRODUCT_SYNONYMS_301.includes(path) || NOT_DO_PATHS_301.includes(path)) {
    return c.redirect("/", 301);
  }
  if (ACCOUNT_ALIASES_301[path]) {
    return c.redirect(ACCOUNT_ALIASES_301[path], 301);
  }

  // Static files (assets, fonts, favicon, prerendered HTML)
  if (path.startsWith("/assets/") || path.startsWith("/fonts/") || path === "/favicon.svg" || path === "/favicon.ico") {
    return c.env.ASSETS.fetch(c.req.raw);
  }

  if (SPA_PATHS.has(path)) {
    const file = path === "/" ? "/index.html" : `${path}/index.html`;
    const res = await asset(c, file, 200);
    if (res.status === 404) return asset(c, "/index.html", 200);
    if (path === "/login" || path === "/register") {
      const headers = new Headers(res.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(res.body, { status: 200, headers });
    }
    return res;
  }

  return asset(c, "/404.html", 404);
});

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => app.fetch(request, env, ctx),
};
