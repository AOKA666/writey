import { ALL_FAQ_ITEMS, HINDI_FAQ } from "@/content/faq";
import { canonicalOrigin, canonicalUrl, BRAND_NAME } from "@/content/site";

function org() {
  return {
    "@type": "Organization",
    name: BRAND_NAME,
    url: `${canonicalOrigin()}/`,
  };
}

export function homeJsonLd() {
  const url = canonicalUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: BRAND_NAME,
        url,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: ["en", "hi"],
        description:
          "Convert typed English or Hindi text into handwriting-style pages and export PDF or PNG.",
      },
      {
        "@type": "WebPage",
        name: "Text to Handwriting Converter | Writey",
        url,
        isPartOf: org(),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: url },
        ],
      },
      org(),
    ],
  };
}

export function webPageJsonLd(
  path: string,
  name: string,
  crumbs: { name: string; path: string }[],
  faq?: { question: string; answer: string }[],
) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      name,
      url: canonicalUrl(path),
      isPartOf: org(),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: canonicalUrl(c.path),
      })),
    },
  ];
  if (faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function faqPageJsonLd() {
  return webPageJsonLd(
    "/faq",
    "Frequently Asked Questions | Writey",
    [
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ],
    ALL_FAQ_ITEMS,
  );
}

export function hindiPageJsonLd() {
  return webPageJsonLd(
    "/hindi",
    "Convert Hindi Text to Handwriting | Writey",
    [
      { name: "Home", path: "/" },
      { name: "Hindi", path: "/hindi" },
    ],
    HINDI_FAQ,
  );
}

/** Pricing must not emit Offer / AggregateOffer until prices and payments are confirmed. */
export function pricingJsonLd() {
  return webPageJsonLd(
    "/pricing",
    "Pricing — Free and Pro Plans | Writey",
    [
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ],
  );
}
