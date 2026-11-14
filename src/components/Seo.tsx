import { useEffect } from "react";
import { canonicalUrl, configuredSiteUrl } from "@/content/site";
import { SEO } from "@/content/routes";
import { isOfficialPublicHost } from "../../shared/site-origin.ts";

type Props = {
  path: string;
  jsonLd?: unknown;
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  const isLink = "rel" in attrs && attrs.rel === "canonical";
  if (!el) {
    el = document.createElement(isLink ? "link" : "meta") as HTMLMetaElement;
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el?.setAttribute(k, v));
}

function removeHead(selector: string) {
  document.head.querySelector(selector)?.remove();
}

function requestHostIsOfficial(): boolean {
  if (typeof window === "undefined") return false;
  return isOfficialPublicHost(window.location.hostname);
}

function effectiveRobots(path: string, declared: string, originConfirmed: boolean): string {
  if (path === "/404" || path === "/login" || path === "/register") return "noindex, nofollow";
  if (!originConfirmed) return "noindex, nofollow";
  // Production workers.dev (or any non-official host) must stay noindex even when SITE_URL is set.
  if (!requestHostIsOfficial()) return "noindex, nofollow";
  return declared;
}

export function Seo({ path, jsonLd }: Props) {
  const meta = SEO[path] ?? SEO["/404"];

  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = "en";
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });

    const confirmed = Boolean(configuredSiteUrl());
    const robots = effectiveRobots(path, meta.robots, confirmed);
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: meta.description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });

    const canon = path === "/404" ? null : canonicalUrl(path);
    if (canon) {
      upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canon });
      upsertMeta('meta[property="og:url"]', { property: "og:url", content: canon });
    } else {
      removeHead('link[rel="canonical"]');
      removeHead('meta[property="og:url"]');
    }
    removeHead('meta[name="writey-canonical-status"]');

    const id = "writey-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [path, meta, jsonLd]);

  return null;
}
