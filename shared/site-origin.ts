/**
 * Confirmed production origin rules, shared by the client, Worker, and prerender.
 * Never emit https://[DOMAIN], writey.app, preview hosts, or localhost as canonical.
 */

const PLACEHOLDER_RE = /\[DOMAIN\]/i;

export const OFFICIAL_PRODUCTION_ORIGIN = "https://text2handwriting.site";
export const OFFICIAL_APEX_HOST = "text2handwriting.site";
export const OFFICIAL_WWW_HOST = "www.text2handwriting.site";
export const SUPPORT_EMAIL = "support@text2handwriting.site";
export const PRIVACY_EMAIL = "privacy@text2handwriting.site";

export function normalizeOrigin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed || null;
}

/** Lowercase hostname without a trailing dot or :port (IPv6 literals kept intact). */
export function hostnameOf(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "";
  let host = trimmed;
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    if (end !== -1) host = host.slice(0, end + 1);
  } else {
    host = host.split(":")[0] ?? host;
  }
  return host.replace(/\.$/, "");
}

/** Apex or www of the confirmed official domain only — not workers.dev or any other host. */
export function isOfficialPublicHost(raw: unknown): boolean {
  const host = hostnameOf(raw);
  return host === OFFICIAL_APEX_HOST || host === OFFICIAL_WWW_HOST;
}

export function hostnameFromRequest(request: Request): string {
  const header = request.headers.get("host") ?? "";
  if (header) return hostnameOf(header);
  try {
    return hostnameOf(new URL(request.url).hostname);
  } catch {
    return "";
  }
}

/**
 * A confirmed production origin is a non-empty https:// origin whose host is not
 * a placeholder, writey.app, *.workers.dev, *.pages.dev, or a loopback host.
 */
export function isConfirmedProductionOrigin(raw: unknown): boolean {
  const origin = normalizeOrigin(raw);
  if (!origin) return false;
  if (PLACEHOLDER_RE.test(origin)) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (url.pathname && url.pathname !== "/") return false;
  if (url.search || url.hash) return false;

  const host = url.hostname.toLowerCase();
  if (!host) return false;
  if (host === "writey.app" || host.endsWith(".writey.app")) return false;
  if (host === "workers.dev" || host.endsWith(".workers.dev")) return false;
  if (host === "pages.dev" || host.endsWith(".pages.dev")) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") return false;
  if (host.startsWith("[") && host.endsWith("]")) {
    const inner = host.slice(1, -1);
    if (inner === "::1") return false;
  }
  return true;
}

export function confirmedProductionOrigin(raw: unknown): string | null {
  if (!isConfirmedProductionOrigin(raw)) return null;
  const origin = normalizeOrigin(raw);
  if (!origin) return null;
  return new URL(origin).origin;
}

/** Build an absolute URL only when a confirmed origin is supplied. */
export function absoluteUrl(origin: string | null | undefined, pathname: string): string | null {
  if (!origin) return null;
  const base = String(origin).replace(/\/+$/, "");
  if (!base) return null;
  const path = !pathname || pathname === "/" ? "/" : String(pathname).replace(/\/+$/, "") || "/";
  return `${base}${path}`;
}

/**
 * Replace literal https://[DOMAIN] so rendered HTML never emits a placeholder host URL.
 * Contact mailboxes should use the official domain, not the placeholder.
 */
export function scrubPlaceholderHostUrls(html: string): string {
  return html.replace(/https:\/\/\[DOMAIN\]/g, "[DOMAIN]");
}
