import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { FAQ_GROUPS } from "@/content/faq";
import { faqPageJsonLd } from "@/lib/schema";

export function FaqPage() {
  return (
    <>
      <Seo path="/faq" jsonLd={faqPageJsonLd()} />
      <Header />
      <main id="main" className="page-wrap">
        <div className="hero-block">
          <h1 className="display-md">Frequently asked questions</h1>
          <p className="lede">
            Short answers about using the converter, export limits, languages, and acceptable use.
          </p>
        </div>
        {FAQ_GROUPS.map((group) => (
          <section className="section desk-well" key={group.heading}>
            <h2>{group.heading}</h2>
            {group.items.map((item) => (
              <div className="faq-item" key={item.id}>
                <h3 className="q">{item.question}</h3>
                <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{item.answer}</p>
              </div>
            ))}
          </section>
        ))}
        <section className="section desk-well cta-band">
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary" to="/#editor">Open the converter</Link>
            <Link className="btn btn-secondary" to="/acceptable-use">Read acceptable use</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
