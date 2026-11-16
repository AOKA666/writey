import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { HINDI_FAQ } from "@/content/faq";
import { hindiPageJsonLd } from "@/lib/schema";

export function HindiPage() {
  return (
    <>
      <Seo path="/hindi" jsonLd={hindiPageJsonLd()} />
      <Header />
      <main id="main" className="page-wrap">
        <div className="hero-block">
          <h1 className="display-md">Convert Hindi text to handwriting</h1>
          <p className="lede">
            Type or paste Hindi in Devanagari, preview a handwriting-style page, and export PDF or PNG. This page explains Hindi support in the same Writey editor.
          </p>
          <div className="btn-row" style={{ marginTop: "1rem" }}>
            <Link className="btn btn-primary" to="/#editor?lang=hi">
              Open the editor in Hindi
            </Link>
            <Link className="btn btn-secondary" to="/#editor?lang=hi">
              Download PDF
            </Link>
            <Link className="btn btn-secondary" to="/#editor?lang=hi">
              Download PNG
            </Link>
          </div>
        </div>

        <section className="section desk-well">
          <p className="muted">
            This is a language support page, not a second homepage and not a verified primary keyword landing page.
          </p>
        </section>

        <section className="section desk-well">
          <h2>Devanagari support</h2>
          <div className="desk-prose">
            <p className="prose-muted">
              Writey can preview and export Hindi text written in Devanagari. The handwriting style should look handwritten, not like a plain print font dropped onto the page. English remains available in the same editor.
            </p>
            <p className="pending">
              Specimen fonts are licensed under SIL OFL 1.1. Devanagari quality is still a limitation of these specimens. Do not treat Hindi first-class commercial fonts as already delivered, and do not treat handwriting cloning as supported.
            </p>
          </div>
        </section>

        <section className="section desk-well desk-split">
          <h2>Preview Hindi pages</h2>
          <p className="prose-muted">
            Paste or type Hindi, choose a handwriting style and paper, and preview the page before you download. You can start without an account, within Free limits.
          </p>
        </section>

        <section className="section desk-well desk-split">
          <h2>Export PDF or PNG</h2>
          <p className="prose-muted">
            When the preview looks right, download PDF or PNG. Free exports include a visible brand watermark. Pro removes the watermark and uses higher export quality. 【PENDING CONFIRMATION】
          </p>
        </section>

        <section className="section desk-well desk-split">
          <h2>Use the same editor for English</h2>
          <p className="prose-muted">
            You do not need a separate product for English. Switch the language control in the editor to move between English and Hindi.
          </p>
        </section>

        <section className="section desk-well desk-split">
          <h2>Appropriate uses</h2>
          <p className="prose-muted">
            Use Hindi or English pages for personal notes, revision, letters, journals, accessibility needs, and classroom examples. Do not use exports for academic dishonesty. Read{" "}
            <Link to="/acceptable-use">Acceptable Use</Link>.
          </p>
        </section>

        <section className="section desk-well">
          <h2>Hindi questions</h2>
          {HINDI_FAQ.map((item) => (
            <div className="faq-item" key={item.id}>
              <h3 className="q">{item.question}</h3>
              <p className="muted">{item.answer}</p>
            </div>
          ))}
          <div className="btn-row">
            <Link className="btn btn-primary" to="/#editor?lang=hi">
              Open the editor in Hindi
            </Link>
            <Link className="btn btn-secondary" to="/pricing">
              See pricing
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
