import { useEffect } from "react";
import { canonicalUrl, CANONICAL_PLACEHOLDER, configuredSiteUrl } from "@/content/site";
import { SEO } from "@/content/routes";

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

export function Seo({ path, jsonLd }: Props) {
  const meta = SEO[path] ?? SEO["/404"];

  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = "en";
    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: meta.robots });
    const canon = canonicalUrl(path === "/404" ? "/" : path);
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: canon });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: meta.description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canon });
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
    if (!configuredSiteUrl()) {
      upsertMeta('meta[name="writey-canonical-status"]', {
        name: "writey-canonical-status",
        content: `Canonical host is ${CANONICAL_PLACEHOLDER} [待确认]`,
      });
    }
  }, [path, meta, jsonLd]);

  return null;
}
