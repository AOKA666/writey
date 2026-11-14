import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LegalLayout } from "@/components/LegalLayout";
import { Seo } from "@/components/Seo";
import type { LegalDocId } from "@/content/legal";
import { SEO } from "@/content/routes";
import { webPageJsonLd } from "@/lib/schema";

const CRUMBS: Record<LegalDocId, { name: string; path: string }[]> = {
  privacy: [
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ],
  terms: [
    { name: "Home", path: "/" },
    { name: "Terms of Use", path: "/terms" },
  ],
  cookie: [
    { name: "Home", path: "/" },
    { name: "Cookie Policy", path: "/cookie" },
  ],
  refund: [
    { name: "Home", path: "/" },
    { name: "Refund & Cancellation", path: "/refund" },
  ],
  "acceptable-use": [
    { name: "Home", path: "/" },
    { name: "Acceptable Use", path: "/acceptable-use" },
  ],
};

export function LegalPage({ id }: { id: LegalDocId }) {
  const path = `/${id}`;
  const meta = SEO[path];
  return (
    <>
      <Seo
        path={path}
        jsonLd={webPageJsonLd(path, meta.title, CRUMBS[id])}
      />
      <Header />
      <main id="main" className="page-wrap">
        <div className="hero-block">
          <h1 className="display-md">{meta.h1}</h1>
        </div>
        <LegalLayout id={id} />
      </main>
      <Footer />
    </>
  );
}
