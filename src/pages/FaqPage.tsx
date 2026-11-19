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
          <section className="section copy-card-section" key={group.heading}>
            <h2>{group.heading}</h2>
            <div className="home-faq-list">
              {group.items.map((item) => (
                <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-6 faq-item" key={item.id}>
                  <h3 className="q">{item.question}</h3>
                  <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="section copy-card-section">
          <div className="copy-card copy-card--sheet copy-card--inset cta-inset">
            <div className="btn-row">
              <Link className="btn btn-primary" to="/#editor">Open the converter</Link>
              <Link className="btn btn-secondary" to="/acceptable-use">Read acceptable use</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
