/**
 * Confirmed production origin rules, shared by the client, Worker, and prerender.
 * Never emit https://[DOMAIN], writey.app, preview hosts, or localhost as canonical.
 */

const PLACEHOLDER_RE = /\[DOMAIN\]/i;

export function normalizeOrigin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed || null;
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
 * Contact mailboxes such as support@[DOMAIN] are left unchanged.
 */
export function scrubPlaceholderHostUrls(html: string): string {
  return html.replace(/https:\/\/\[DOMAIN\]/g, "[DOMAIN]");
}
