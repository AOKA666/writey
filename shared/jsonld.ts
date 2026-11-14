/**
 * JSON-LD builders shared by the client and prerender.
 * Omit absolute url / @id / item fields when no confirmed production origin is set.
 * Never emit Offer or AggregateOffer.
 */
import { absoluteUrl } from "./site-origin.ts";

export function organizationNode(brand: string, origin: string | null | undefined): Record<string, unknown> {
  const node: Record<string, unknown> = { "@type": "Organization", name: brand };
  if (origin) node.url = `${origin}/`;
  return node;
}

export function buildHomeJsonLd({
  brand,
  origin,
}: {
  brand: string;
  origin: string | null | undefined;
}): Record<string, unknown> {
  const url = absoluteUrl(origin ?? null, "/");
  const webApp: Record<string, unknown> = {
    "@type": "WebApplication",
    name: brand,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    inLanguage: ["en", "hi"],
    description:
      "Convert typed English or Hindi text into handwriting-style pages and export PDF or PNG.",
  };
  if (url) webApp.url = url;

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    name: "Text to Handwriting Converter | Writey",
    isPartOf: organizationNode(brand, origin),
  };
  if (url) webPage.url = url;

  const crumb: Record<string, unknown> = { "@type": "ListItem", position: 1, name: "Home" };
  if (url) crumb.item = url;

  return {
    "@context": "https://schema.org",
    "@graph": [
      webApp,
      webPage,
      { "@type": "BreadcrumbList", itemListElement: [crumb] },
      organizationNode(brand, origin),
    ],
  };
}

export function buildWebPageJsonLd({
  brand,
  origin,
  path,
  name,
  crumbs,
  faq,
}: {
  brand: string;
  origin: string | null | undefined;
  path: string;
  name: string;
  crumbs: { name: string; path: string }[];
  faq?: { question: string; answer: string }[];
}): Record<string, unknown> {
  const pageUrl = absoluteUrl(origin ?? null, path);
  const page: Record<string, unknown> = {
    "@type": "WebPage",
    name,
    isPartOf: organizationNode(brand, origin),
  };
  if (pageUrl) page.url = pageUrl;

  const itemListElement = crumbs.map((c, i) => {
    const item: Record<string, unknown> = { "@type": "ListItem", position: i + 1, name: c.name };
    const itemUrl = absoluteUrl(origin ?? null, c.path);
    if (itemUrl) item.item = itemUrl;
    return item;
  });

  const graph: Record<string, unknown>[] = [page, { "@type": "BreadcrumbList", itemListElement }];
  if (faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
