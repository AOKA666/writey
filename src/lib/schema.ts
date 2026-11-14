import { ALL_FAQ_ITEMS, HINDI_FAQ } from "@/content/faq";
import { canonicalOrigin, BRAND_NAME } from "@/content/site";
import { buildHomeJsonLd, buildWebPageJsonLd } from "../../shared/jsonld.ts";

export function homeJsonLd() {
  return buildHomeJsonLd({ brand: BRAND_NAME, origin: canonicalOrigin() });
}

export function webPageJsonLd(
  path: string,
  name: string,
  crumbs: { name: string; path: string }[],
  faq?: { question: string; answer: string }[],
) {
  return buildWebPageJsonLd({
    brand: BRAND_NAME,
    origin: canonicalOrigin(),
    path,
    name,
    crumbs,
    faq,
  });
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
