import { Link } from "react-router-dom";
import { Editor } from "@/components/Editor";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QaControls } from "@/components/QaControls";
import { Seo } from "@/components/Seo";
import { HOME_FAQ } from "@/content/faq";
import { FREE_STYLE_COUNT } from "@/content/handwriting";
import { PRICE_STATUS_SENTENCE, PRICES, TAX_LINE } from "@/content/site";
import { IconCheck } from "@/components/Icons";
import { homeJsonLd } from "@/lib/schema";

export function HomePage() {
  return (
    <>
      <Seo path="/" jsonLd={homeJsonLd()} />
      <Header />
      <main id="main" className="page-wrap">
        <div className="hero-block">
          <h1 className="display-md">Text to Handwriting Converter</h1>
          <p className="lede">
            Paste your text, choose a handwriting style and paper, preview the page, and export a PDF or PNG. English and Hindi are both supported.
          </p>
        </div>
        <Editor />
        {import.meta.env.VITE_ENABLE_QA === "1" ? <QaControls /> : null}

        <section className="section desk-well">
          <h2>Preview before you download</h2>
          <div className="desk-prose">
          <p className="prose-muted">
            You do not have to guess how the page will look. Paste your text, choose a style and paper, and preview the handwriting-style page in your browser. English and Hindi both preview in the same editor. You can start without creating an account.
          </p>
          <p className="prose-muted">
            We do not publish user counts, star ratings, or testimonials in this MVP, because those facts are not in the upstream evidence.
          </p>
          </div>
        </section>

        <section className="section desk-well">
          <h2>Typed notes should not have to stay in a print font</h2>
          <div className="desk-prose">
          <p className="prose-muted">
            Typing is fast. Handwriting a full page is slow. A decorative font in a document is not the same as a page with lined, blank, or grid paper, margins, and a handwriting-style layout.
          </p>
          <p className="prose-muted">
            If you need a page for personal notes, revision, a letter, a journal, or a classroom example — in English or Hindi — you should be able to preview it and export PDF or PNG without setting up an account first.
          </p>
          </div>
        </section>

        <section className="section desk-well">
          <h2>A text to handwriting converter, in the browser</h2>
          <div className="desk-prose">
          <p className="prose-muted">
            Writey turns typed or pasted text into handwriting-style pages. Choose a style, a paper type, margins, line spacing, and ink colour. Add optional natural variation for appearance. Then preview and download.
          </p>
          <p className="prose-muted">
            The output is typographic. It is not a scan of anyone’s real handwriting, and the MVP does not clone your own handwriting. Writey is not an official school, board, or government service.
          </p>
          </div>
        </section>

        <section className="section">
          <h2 className="center">How it works</h2>
          <div className="how-grid">
            <article className="desk-well">
              <h3>1. Paste or type your text</h3>
              <p className="muted">Add English or Hindi text in the editor. You can switch language without leaving the page.</p>
            </article>
            <article className="desk-well">
              <h3>2. Choose a style and paper</h3>
              <p className="muted">Pick a handwriting style and lined, blank, or grid paper. Adjust margins, line spacing, and ink colour if you need to.</p>
            </article>
            <article className="desk-well">
              <h3>3. Preview and export</h3>
              <p className="muted">Check the page in the preview, then download PDF or PNG. The first useful export can be done without an account, within Free limits.</p>
            </article>
          </div>
        </section>

        <section className="section desk-well desk-split">
          <h2>Choose a handwriting style</h2>
          <p className="prose-muted">
            Free includes 8 handwriting styles: six Latin styles and two usable Devanagari handwriting styles. Pro unlocks all 11 licensed MVP styles. The MVP does not include cloning your own handwriting.
          </p>
        </section>

        <section className="section desk-well desk-split" id="hindi-support">
          <h2>English and Hindi</h2>
          <p className="prose-muted">
            The interface is English in the MVP. The editor can preview and export both English and Hindi (Devanagari). Hindi is a first-class input and rendering capability, not a leftover print font. For a focused walkthrough, see the{" "}
            <Link to="/hindi">Hindi support page</Link>.
          </p>
        </section>

        <section className="section desk-well desk-split">
          <h2>Download PDF or PNG</h2>
          <p className="prose-muted">
            Both Free and Pro can export PDF and PNG. Free uses standard export quality and a visible watermark. Pro removes the watermark and uses higher export quality. Exact DPI values are 【PENDING CONFIRMATION】. Multi-page PNG exports download as a ZIP of one image per page.
          </p>
        </section>

        <section className="section desk-well desk-split">
          <h2>Appropriate uses</h2>
          <div>
            <p className="prose-muted">Writey is designed for:</p>
            <ul className="list-plain">
              <li>Personal notes and organisation</li>
              <li>Revision materials for your own learning</li>
              <li>Letters and journals</li>
              <li>Accessibility needs, when writing at length is difficult and you still want a handwritten look</li>
              <li>Teacher or classroom examples, where that is allowed</li>
            </ul>
            <p className="pending">These are the uses we show on the site. Read Acceptable Use before you export.</p>
          </div>
        </section>

        <section className="section desk-well desk-split">
          <h2>What Writey does not do</h2>
          <ul className="list-plain">
            <li>We do not build or sell features whose purpose is to evade teachers, OCR, or detection tools.</li>
            <li>We do not offer a Lifetime plan in this MVP.</li>
            <li>We do not promise unlimited pages or unlimited previews. Every plan has caps.</li>
            <li>Maths, tables, extra Indian languages beyond Hindi, and handwriting cloning are not in the MVP.</li>
          </ul>
        </section>

        <section className="section">
          <h2>Free and Pro plans</h2>
          <div className="desk-prose">
            <p className="prose-muted">
              Start with a useful Free allowance. Upgrade to Pro for more pages, more handwriting styles, higher export quality, and no watermark.
            </p>
            <p className="prose-muted">{PRICE_STATUS_SENTENCE}</p>
          </div>
          <div className="plan-cards">
            <article className="desk-well">
              <h3>Free</h3>
              <p className="plan-price">{PRICES.free}</p>
              <p className="muted">
                {PRICES.freePagesPerMonth} export pages per month, with a watermark. <span className="pending">【PENDING CONFIRMATION】</span>
              </p>
              <ul className="list-plain">
                <li><IconCheck /> Visible brand watermark</li>
                <li><IconCheck /> PDF and PNG</li>
                <li><IconCheck /> {FREE_STYLE_COUNT} handwriting styles, including Devanagari</li>
                <li><IconCheck /> Start without an account</li>
              </ul>
            </article>
            <article className="desk-well">
              <h3>Pro</h3>
              <p className="plan-price">
                {PRICES.proMonthly} / month or {PRICES.proYearly} / year
              </p>
              <p className="muted">
                {PRICES.proPagesPerMonth} export pages per month, no watermark. <span className="pending">【PENDING CONFIRMATION】</span>
              </p>
              <ul className="list-plain">
                <li><IconCheck /> No watermark</li>
                <li><IconCheck /> Higher export quality <span className="pending">【PENDING CONFIRMATION】</span></li>
                <li><IconCheck /> All licensed MVP styles</li>
                <li><IconCheck /> Higher daily caps — still not unlimited</li>
              </ul>
            </article>
          </div>
          <p className="prose-muted">
            Neither plan is unlimited. {TAX_LINE}
          </p>
          <div className="btn-row">
            <a className="btn btn-primary" href="/#editor">Start free</a>
            <Link className="btn btn-secondary" to="/pricing">See pricing</Link>
          </div>
        </section>

        <section className="section desk-well">
          <h2>Frequently asked questions</h2>
          {HOME_FAQ.map((item) => (
            <div className="faq-item" key={item.id}>
              <h3 className="q">{item.question}</h3>
              <p className="muted">{item.answer}</p>
            </div>
          ))}
          <p>
            More answers are on the <Link to="/faq">FAQ page</Link>.
          </p>
        </section>

        <section className="section desk-well cta-band">
          <h2>Convert your text now</h2>
          <p className="prose-muted">
            Open the editor, paste your text, and preview a handwriting-style page. You can start without an account.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary" href="/#editor">Start converting</a>
            <Link className="btn btn-secondary" to="/pricing">See pricing</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
