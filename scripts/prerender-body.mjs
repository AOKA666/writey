/**
 * Frozen-copy HTML bodies for prerender. Do not rewrite marketing or legal text.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { scrubPlaceholderHostUrls } from "../shared/site-origin.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PRICE_STATUS_SENTENCE =
  "Prices are shown in USD. Payments are not open yet.";
const TAX_LINE = "Applicable taxes will be shown at checkout.";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function faqBlock(items) {
  return items
    .map(
      (item) => `<div class="faq-item">
              <h3 class="q">${esc(item.question)}</h3>
              <p class="muted">${esc(item.answer)}</p>
            </div>`,
    )
    .join("\n            ");
}

function homeFaqBlock(items) {
  return items
    .map(
      (item) => `<div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-6 faq-item">
              <h3 class="q">${esc(item.question)}</h3>
              <p class="muted">${esc(item.answer)}</p>
            </div>`,
    )
    .join("\n            ");
}


function faqCardBlock(items, preWrap = false) {
  const style = preWrap ? ' style="white-space: pre-wrap"' : "";
  return items
    .map(
      (item) => `<div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-6 faq-item">
              <h3 class="q">${esc(item.question)}</h3>
              <p class="muted"${style}>${esc(item.answer)}</p>
            </div>`,
    )
    .join("\n            ");
}

const PRICING_FAQ = [
  {
    question: "Is Pro unlimited?",
    answer:
      "No. Pro allows up to 150 export pages per month, and previews have daily caps.",
  },
  {
    question: "Do I need to pay to try Writey?",
    answer:
      "No. The Free plan is $0 and can complete a useful preview and export, with a watermark and monthly limits.",
  },
  {
    question: "Can I buy a Lifetime plan?",
    answer: "No. We do not sell a Lifetime plan.",
  },
];

const faqData = JSON.parse(readFileSync(join(root, "src/content/faq.json"), "utf8"));

const HINDI_FAQ = [
  {
    question: "Can I export Hindi pages without an account?",
    answer:
      "Yes. Guest users can preview and complete a useful Free export online, including Hindi text, and download PDF or PNG within plan limits.",
  },
  {
    question: "Is the whole website in Hindi?",
    answer: "No. The interface is in English. Hindi is supported for input, preview, and export.",
  },
  {
    question: "Is Hindi the main keyword for the whole site?",
    answer:
      "No. This page explains a supported language in the converter. The homepage keyword is text to handwriting ai.",
  },
];

const HOME_FAQ = [
  {
    question: "Do I need an account to convert text to handwriting?",
    answer:
      "No. You can paste text in this free online editor, preview a page, and download a PDF or PNG without signing in. An account is needed to keep quota across days or subscribe to Pro. Saved export history is not currently provided.",
  },
  {
    question: "Is Writey a text to handwriting ai model that writes like a person?",
    answer:
      "No. Writey is a typography tool: you type or paste text, choose a handwriting-style font and paper, preview the page in this free online editor, and export PDF or PNG. People often search for text to handwriting ai for this job. Writey does not clone a person’s handwriting and does not use a generative model that writes like a human.",
  },
  {
    question: "Can I convert Hindi text as well as English?",
    answer:
      "Yes. The editor supports English and Hindi (Devanagari) for preview and PDF or PNG export.",
  },
  {
    question: "What file formats can I download?",
    answer:
      "You can download PDF or PNG. This free online tool includes both formats on Free and Pro. Quality and watermark rules depend on your plan.",
  },
  {
    question: "Is it okay to submit these pages as handwritten school work?",
    answer:
      "No, not if that would break your school or college rules. Writey is for personal notes, revision, letters, journals, accessibility needs, and teacher or classroom examples. See Acceptable Use.",
  },
];


function siteFooter() {
  const links = [
    ["Pricing", "/pricing"],
    ["FAQ", "/faq"],
    ["Privacy Policy", "/privacy"],
    ["Terms of Use", "/terms"],
    ["Cookie Policy", "/cookie"],
    ["Refund & Cancellation", "/refund"],
    ["Acceptable Use", "/acceptable-use"],
    ["Hindi support", "/hindi"],
    ["Open the editor", "/#editor"],
  ]
    .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
    .join("\n              ");
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__grid">
          <div>
            <p class="headline-md" style="margin: 0">Writey</p>
            <p class="muted body-sm">text to handwriting converter</p>
          </div>
          <ul class="footer-links">
              ${links}
          </ul>
        </div>
        <p class="footer-meta">
          Contact: <a href="mailto:support@text2handwriting.site">support@text2handwriting.site</a>
          ·
          Privacy: <a href="mailto:privacy@text2handwriting.site">privacy@text2handwriting.site</a>
          <br />
          © ${year} Writey.
        </p>
      </div>
    </footer>`;
}

function wrapPage(inner) {
  return `${inner}
      ${siteFooter()}`;
}

function slugifyFactory() {
  const counts = new Map();
  return (text) => {
    const base =
      text
        .toLowerCase()
        .replace(/[`*_]/g, "")
        .replace(/【.*?】/g, "")
        .replace(/\[[^\]]*]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "section";
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };
}

function renderLegal(id, h1) {
  const markdown = readFileSync(join(root, "src/content/legal", `${id}.md`), "utf8");
  const slugify = slugifyFactory();
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth, text }) => {
    const raw = tokens?.map((t) => ("text" in t ? String(t.text) : "")).join("") || text;
    const clean = raw.trim();
    if (depth === 1) return "";
    const hid = slugify(clean);
    return `<h${depth} id="${hid}">${esc(clean)}</h${depth}>`;
  };
  marked.setOptions({ gfm: true, breaks: false });
  const body = scrubPlaceholderHostUrls(marked.parse(markdown, { renderer, async: false }));
  return `<main id="main" class="page-wrap">
        <div class="hero-block">
          <h1 class="display-md">${esc(h1)}</h1>
        </div>
        <div class="draft-banner">
          <strong>Draft for review — Draft v2026-11-13</strong>
          <p style="margin: 0">
            This page is a product policy draft, not a legal opinion and not a certification of compliance with any law. The legal person that operates Writey, and the effective date of this policy, will be named once they are confirmed.
          </p>
        </div>
        <div class="legal-layout">
          <article class="legal-body">${body}</article>
        </div>
      </main>`;
}

function homeBody() {
  return `<main id="main" class="page-wrap">
        <div class="hero-block">
          <p class="hero-eyebrow">Bilingual English &amp; Hindi</p>
          <h1 class="display-md">Text to Handwriting AI Converter</h1>
          <p class="lede">
            This text to handwriting ai tool turns typed or pasted text into handwriting-style pages. Choose a style and paper, preview the page, and export a PDF or PNG. English and Hindi are both supported.
          </p>
        </div>
        <section class="section output-comparison" id="output-comparison">
          <h2>The preview is what you export</h2>
          <p class="compare-caption">These panels use the same typographic layout. The exported PDF or PNG follows the preview you see. This is a handwriting-style page, not a photograph of someone’s handwriting.</p>
          <div class="compare-pair" role="img" aria-label="Side-by-side typographic mock: the on-screen preview and the exported PDF page use the same handwriting-style layout.">
            <span class="sr-only">Side-by-side typographic mock: the on-screen preview and the exported PDF page use the same handwriting-style layout.</span>
            <p class="compare-eyebrow">Comparison 01: Preview Fidelity</p>
            <div class="compare-row">
              <figure class="compare-card">
                <figcaption class="compare-label">On-screen preview</figcaption>
                <article class="compare-sheet is-lined">
                  <div class="compare-hand-latin">Personal notes — 13 November<br><br>- Pack a letter to Asha<br>- Revision points on light and shade<br>- A short journal after the evening walk</div>
                  <div class="compare-sheet-footer">Writey Preview Mode</div>
                </article>
              </figure>
              <figure class="compare-card">
                <figcaption class="compare-label">Exported PDF page</figcaption>
                <article class="compare-sheet is-lined">
                  <div class="compare-hand-latin">Personal notes — 13 November<br><br>- Pack a letter to Asha<br>- Revision points on light and shade<br>- A short journal after the evening walk</div>
                  <div class="compare-sheet-footer">Writey Page 1 (Exported PDF)</div>
                </article>
              </figure>
            </div>
          </div>
          <div class="compare-pair" role="img" aria-label="Side-by-side typographic mock: the same note in a print font and as a handwriting-style page.">
            <span class="sr-only">Side-by-side typographic mock: the same note in a print font and as a handwriting-style page.</span>
            <p class="compare-eyebrow">Comparison 02: Layout vs Generic Fonts</p>
            <div class="compare-row">
              <figure class="compare-card">
                <figcaption class="compare-label">Print-font page</figcaption>
                <article class="compare-sheet is-print">
                  <div class="compare-print-latin">Personal notes — 13 November<br><br>- Pack a letter to Asha<br>- Revision points on light and shade<br>- A short journal after the evening walk</div>
                </article>
              </figure>
              <figure class="compare-card">
                <figcaption class="compare-label">Handwriting-style page</figcaption>
                <article class="compare-sheet is-lined">
                  <div class="compare-hand-latin">Personal notes — 13 November<br><br>- Pack a letter to Asha<br>- Revision points on light and shade<br>- A short journal after the evening walk</div>
                </article>
              </figure>
            </div>
            <p class="compare-caption compare-caption--after">The same text, set first in a print font and then as a handwriting-style page with paper, margins, and a handwriting font.</p>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Preview before you download</h2>
          <div class="copy-cards">
            <div class="copy-card copy-card--sheet">
              <p class="prose-muted">
                You do not have to guess how the page will look. Paste your text, choose a style and paper, and preview the handwriting-style page in your browser. English and Hindi both preview in the same editor. You can start without creating an account.
              </p>
            </div>
            <div class="copy-card copy-card--sheet">
              <p class="prose-muted">
                The preview shows your chosen handwriting style, paper, margins, line spacing, and ink colour before you download. When the page looks right, export a PDF or PNG. Free exports include a visible brand watermark that does not cover your text.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Typed notes should not have to stay in a print font</h2>
          <div class="copy-cards">
            <div class="copy-card copy-card--paper">
              <p class="prose-muted">
                Typing is fast. Handwriting a full page is slow. A decorative font in a document is not the same as a page with lined, blank, or grid paper, margins, and a handwriting-style layout.
              </p>
            </div>
            <div class="copy-card copy-card--paper">
              <p class="prose-muted">
                If you need a page for personal notes, revision, a letter, a journal, or a classroom example — in English or Hindi — you should be able to preview it and export PDF or PNG without setting up an account first.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>What text to handwriting ai means on Writey</h2>
          <div class="copy-cards">
            <div class="copy-card copy-card--sheet">
              <p class="prose-muted">
                People search for text to handwriting ai when they want to convert typed text into a handwritten look. Writey does that job with typography: you type or paste text, choose a handwriting-style font and paper, preview the page, and export PDF or PNG.
              </p>
            </div>
            <div class="copy-card copy-card--sheet">
              <p class="prose-muted">
                The output is typographic, not a scan of anyone’s real handwriting, and not a generative model that writes like a real person. Writey does not clone your own handwriting, and you do not upload a handwriting sample. Writey is not an official school, board, or government service.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>How it works</h2>
          <div class="how-grid">
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-6">
              <h3>1. Paste or type your text</h3>
              <p class="muted">Add English or Hindi text in the editor. You can switch language without leaving the page.</p>
            </article>
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-6">
              <h3>2. Choose a style and paper</h3>
              <p class="muted">Pick a handwriting style and lined, blank, or grid paper. Adjust margins, line spacing, and ink colour if you need to.</p>
            </article>
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-6">
              <h3>3. Preview and export</h3>
              <p class="muted">Check the page in the preview, then download PDF or PNG from this online editor. The first useful export can be done without an account, within Free limits.</p>
            </article>
          </div>
        </section>
        <section class="section copy-card-section">
          <div class="copy-stack-grid">
            <div>
              <h2>Choose a handwriting style</h2>
              <p class="prose-muted">
                Free includes 11 basic styles, including usable Latin and Devanagari handwriting styles. Pro unlocks all 15 licensed styles (the 11 Free styles plus 4 Pro styles). Writey does not clone your own handwriting.
              </p>
            </div>
            <div id="hindi-support">
              <h2>English and Hindi</h2>
              <p class="prose-muted">
                The interface is in English. The editor can preview and export both English and Hindi (Devanagari). Hindi is a first-class input and rendering capability, not a leftover print font. For a focused walkthrough, see the <a href="/hindi">Hindi support page</a>.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <div class="copy-stack-block">
            <h2>Download PDF or PNG</h2>
            <p class="prose-muted">
              Both Free and Pro can export PDF and PNG from this online editor. Start on the Free plan, preview the page, then download a PDF or PNG. Free uses standard export quality and a visible watermark. Pro removes the watermark and uses higher export quality.
            </p>
          </div>
          <div class="uses-grid">
            <div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h2>Appropriate uses</h2>
              <p class="prose-muted">Writey is designed for:</p>
              <ul class="list-plain">
                <li>Personal notes and organisation</li>
                <li>Revision materials for your own learning</li>
                <li>Letters and journals</li>
                <li>Accessibility needs, when writing at length is difficult and you still want a handwritten look</li>
                <li>Teacher or classroom examples, where that is allowed</li>
              </ul>
              <p class="prose-muted">These are the uses we show on the site. Read Acceptable Use before you export.</p>
            </div>
            <div class="copy-card copy-card--paper copy-card--inset copy-card--pad-8">
              <h2>What Writey does not do</h2>
              <ul class="list-plain">
                <li>We do not build or sell features whose purpose is to evade teachers, OCR, or detection tools.</li>
                <li>We do not offer a Lifetime plan.</li>
                <li>We do not promise unlimited pages or unlimited previews. Every plan has caps.</li>
                <li>Maths, tables, and languages beyond Hindi are not included. Writey does not clone your handwriting.</li>
              </ul>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <div class="plan-intro">
            <h2>Free and Pro plans</h2>
            <p class="prose-muted">
              Start with a useful Free allowance. Upgrade to Pro for more pages, more handwriting styles, higher export quality, and no watermark.
            </p>
            <p class="prose-muted">${esc(PRICE_STATUS_SENTENCE)}</p>
          </div>
          <div class="plan-cards">
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h3>Free</h3>
              <p class="plan-price">$0</p>
              <p class="muted">8 export pages per month, with a watermark.</p>
              <ul class="list-plain">
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> Visible brand watermark</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> PDF and PNG</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> 11 basic styles, including usable Latin and Devanagari handwriting styles</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> Start without an account</li>
              </ul>
            </article>
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h3>Pro</h3>
              <p class="plan-price">$3.99 / month or $39 / year</p>
              <p class="muted">150 export pages per month, no watermark.</p>
              <ul class="list-plain">
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> No watermark</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> Higher export quality</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> All 15 licensed styles (the 11 Free styles plus 4 Pro styles; does not include handwriting cloning)</li>
                <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l5 5 9-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> Higher daily caps — still not unlimited</li>
              </ul>
            </article>
          </div>
          <p class="prose-muted">Neither plan is unlimited. ${esc(TAX_LINE)}</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="/#editor">Start free</a>
            <a class="btn btn-secondary" href="/pricing">See pricing</a>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Frequently asked questions</h2>
          <div class="home-faq-list">
            ${homeFaqBlock(HOME_FAQ)}
          </div>
          <p>
            More answers are on the <a href="/faq">FAQ page</a>.
          </p>
        </section>
        <section class="section copy-card-section">
          <div class="copy-card copy-card--sheet copy-card--inset cta-inset">
            <h2>Convert your text now</h2>
            <p class="prose-muted">
              Open this text to handwriting ai converter, paste your text, and preview a handwriting-style page. You can start without an account.
            </p>
            <div class="btn-row">
              <a class="btn btn-primary" href="/#editor">Start converting</a>
              <a class="btn btn-secondary" href="/pricing">See pricing</a>
            </div>
          </div>
        </section>
      </main>`;
}

function hindiBody() {
  return `<main id="main" class="page-wrap">
        <div class="hero-block">
          <h1 class="display-md">Convert Hindi text to handwriting</h1>
          <p class="lede">
            Type or paste Hindi in Devanagari, preview a handwriting-style page, and export PDF or PNG. This page explains Hindi support in the same Writey editor.
          </p>
          <div class="btn-row" style="margin-top: 1rem">
            <a class="btn btn-primary" href="/#editor?lang=hi">Open the editor in Hindi</a>
            <a class="btn btn-secondary" href="/#editor?lang=hi">Download PDF</a>
            <a class="btn btn-secondary" href="/#editor?lang=hi">Download PNG</a>
          </div>
          <p class="muted hero-note">
            This is a language support page, not a second homepage and not a verified primary keyword landing page.
          </p>
        </div>
        <section class="section copy-card-section">
          <div class="copy-stack-block">
            <h2>Devanagari support</h2>
            <p class="prose-muted">
              Writey can preview and export Hindi text written in Devanagari. The handwriting style should look handwritten, not like a plain print font dropped onto the page. English remains available in the same editor.
            </p>
            <p class="prose-muted">
              Specimen fonts are licensed under SIL OFL 1.1. Devanagari quality is still a limitation of these specimens. Do not treat Hindi first-class commercial fonts as already delivered, and do not treat handwriting cloning as supported.
            </p>
          </div>
          <div class="copy-stack-grid">
            <div>
              <h2>Preview Hindi pages</h2>
              <p class="prose-muted">
                Paste or type Hindi in this online editor, choose a handwriting style and paper, and preview the page before you download a PDF or PNG. You can start without an account, within Free limits.
              </p>
            </div>
            <div>
              <h2>Export PDF or PNG</h2>
              <p class="prose-muted">
                When the preview looks right, download PDF or PNG from this online editor. Free exports include a visible brand watermark. Pro removes the watermark and uses higher export quality.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <div class="copy-stack-grid">
            <div>
              <h2>Use the same editor for English</h2>
              <p class="prose-muted">
                You do not need a separate product for English. Switch the language control in the editor to move between English and Hindi.
              </p>
            </div>
            <div>
              <h2>Appropriate uses</h2>
              <p class="prose-muted">
                Use Hindi or English pages for personal notes, revision, letters, journals, accessibility needs, and classroom examples. Do not use exports for academic dishonesty. Read <a href="/acceptable-use">Acceptable Use</a>.
              </p>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Hindi questions</h2>
          <div class="home-faq-list">
            ${faqCardBlock(HINDI_FAQ)}
          </div>
          <div class="btn-row">
            <a class="btn btn-primary" href="/#editor?lang=hi">Open the editor in Hindi</a>
            <a class="btn btn-secondary" href="/pricing">See pricing</a>
          </div>
        </section>
      </main>`;
}

function pricingBody() {
  return `<main id="main" class="page-wrap">
        <div class="hero-block">
          <h1 class="display-md">Pricing</h1>
          <p class="lede">
            Start with a useful Free allowance. Upgrade to Pro for more pages, more handwriting styles, higher export quality, and no watermark.
          </p>
          <p class="prose-muted">${esc(PRICE_STATUS_SENTENCE)} ${esc(TAX_LINE)}</p>
        </div>
        <section class="section copy-card-section">
          <div class="copy-stack-block">
            <h2>Who these plans are for</h2>
            <p class="prose-muted">
              Writey is for people who want to turn typed or pasted English or Hindi text into handwriting-style pages for personal notes, revision, letters, journals, accessibility needs, or classroom examples.
            </p>
          </div>
          <div class="plan-cards">
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h2>Free plan</h2>
              <p class="plan-price">$0, USD</p>
              <ul class="list-plain">
                <li>8 export pages per calendar month</li>
                <li>Visible brand watermark that does not cover your text</li>
                <li>Standard export quality</li>
                <li>11 basic styles, including usable Latin and Devanagari handwriting styles</li>
                <li>PDF and PNG export</li>
                <li>Up to 10 preview refreshes per day, and up to 8 pages per preview</li>
                <li>Up to 2 export jobs per day, still limited by the monthly page cap</li>
                <li>Saved export history is not currently provided.</li>
                <li>Core path works without an account; sign in to keep quota across days</li>
              </ul>
              <a class="btn btn-primary" href="/#editor" style="margin-top: 1rem">Start free</a>
            </article>
            <article class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h2>Pro plan</h2>
              <p class="plan-price">
                $3.99 / month or $39 / year, USD
              </p>
              <ul class="list-plain">
                <li>150 export pages per calendar month</li>
                <li>No watermark</li>
                <li>Higher export quality</li>
                <li>All 15 licensed styles (the 11 Free styles plus 4 Pro styles; does not include handwriting cloning)</li>
                <li>PDF and PNG export</li>
                <li>Up to 50 preview refreshes per day, and up to 20 pages per preview</li>
                <li>Up to 10 export jobs per day, still limited by the monthly page cap</li>
                <li>Saved export history is not currently provided.</li>
                <li>Account required for billing and quota</li>
              </ul>
              <p class="prose-muted">
                Neither plan is unlimited. After you reach a cap, wait for the quota to reset or contact support.
              </p>
              <button type="button" class="btn btn-primary" style="margin-top: 1rem">Upgrade to Pro</button>
            </article>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Plan comparison</h2>
          <div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <div class="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Free</th>
                    <th>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Display price</td>
                    <td>$0</td>
                    <td>$3.99 / month or $39 / year</td>
                  </tr>
                  <tr>
                    <td>Currency</td>
                    <td>USD</td>
                    <td>USD</td>
                  </tr>
                  <tr>
                    <td>Export pages / month</td>
                    <td>8</td>
                    <td>150</td>
                  </tr>
                  <tr>
                    <td>Watermark</td>
                    <td>Visible brand watermark that does not cover your text</td>
                    <td>No watermark</td>
                  </tr>
                  <tr>
                    <td>Export formats</td>
                    <td>PDF, PNG</td>
                    <td>PDF, PNG</td>
                  </tr>
                  <tr>
                    <td>Export quality</td>
                    <td>Standard</td>
                    <td>Higher export quality</td>
                  </tr>
                  <tr>
                    <td>Styles</td>
                    <td>11 basic styles, including usable Latin and Devanagari handwriting styles</td>
                    <td>All 15 licensed styles (the 11 Free styles plus 4 Pro styles; does not include handwriting cloning)</td>
                  </tr>
                  <tr>
                    <td>Preview</td>
                    <td>Up to 10 refreshes / day; up to 8 pages per preview</td>
                    <td>Up to 50 refreshes / day; up to 20 pages per preview</td>
                  </tr>
                  <tr>
                    <td>Daily export jobs</td>
                    <td>Up to 2, still limited by the monthly page cap</td>
                    <td>Up to 10, still limited by the monthly page cap</td>
                  </tr>
                  <tr>
                    <td>History</td>
                    <td>Saved export history is not currently provided.</td>
                    <td>Saved export history is not currently provided.</td>
                  </tr>
                  <tr>
                    <td>Login</td>
                    <td>Core path works without an account; sign in to keep quota across days</td>
                    <td>Account required for billing and quota</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>What is not included</h2>
          <div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <ul class="list-plain">
              <li>No Lifetime plan</li>
              <li>No immediate purchase of Business, Teams, or Education</li>
              <li>No detection-avoidance features</li>
              <li>No handwriting cloning, high-quality maths or tables, or languages beyond Hindi</li>
              <li>No unlimited preview or unlimited export promise</li>
            </ul>
            <p class="prose-muted">We do not sell detection-avoidance features, exam-season passes, or a Lifetime plan.</p>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Taxes, refunds, and payments</h2>
          <div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <p class="prose-muted">${esc(TAX_LINE)}</p>
            <p class="prose-muted">
              Payments will be processed by a third-party provider, to be confirmed. We do not name a payment vendor as if it were already contracted.
            </p>
            <p class="prose-muted">
              Refund requests are handled under our Refund Policy. The commercial window is still being confirmed. This draft does not take away rights that applicable law says you cannot give up.
            </p>
            <p class="prose-muted">
              See <a href="/terms">Terms of Use</a> and <a href="/refund">Refund &amp; Cancellation Policy</a>. Also read <a href="/acceptable-use">Acceptable Use</a>.
            </p>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Teams and Education</h2>
          <div class="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <p class="prose-muted">
              If you need Teams or Education access, join the waitlist or contact us. This is not a paid plan and has no public price.
            </p>
            <button type="button" class="btn btn-secondary">Join the waitlist</button>
          </div>
        </section>
        <section class="section copy-card-section">
          <h2>Pricing questions</h2>
          <div class="home-faq-list">
            ${faqCardBlock(PRICING_FAQ)}
          </div>
          <div class="btn-row">
            <a class="btn btn-primary" href="/#editor">Start free</a>
            <button type="button" class="btn btn-secondary">Upgrade to Pro</button>
          </div>
        </section>
      </main>`;
}

function faqBody() {
  const sections = faqData.groups
    .map((group) => {
      return `<section class="section copy-card-section">
            <h2>${esc(group.heading)}</h2>
            <div class="home-faq-list">
            ${faqCardBlock(group.items, true)}
            </div>
          </section>`;
    })
    .join("\n        ");
  return `<main id="main" class="page-wrap">
        <div class="hero-block">
          <h1 class="display-md">Frequently asked questions</h1>
          <p class="lede">
            Short answers about using the converter, export limits, languages, and acceptable use.
          </p>
        </div>
        ${sections}
        <section class="section copy-card-section">
          <div class="copy-card copy-card--sheet copy-card--inset cta-inset">
            <div class="btn-row">
              <a class="btn btn-primary" href="/#editor">Open the converter</a>
              <a class="btn btn-secondary" href="/acceptable-use">Read acceptable use</a>
            </div>
          </div>
        </section>
      </main>`;
}

export function pageBody(path) {
  switch (path) {
    case "/":
      return wrapPage(homeBody());
    case "/hindi":
      return wrapPage(hindiBody());
    case "/pricing":
      return wrapPage(pricingBody());
    case "/faq":
      return wrapPage(faqBody());
    case "/privacy":
      return wrapPage(renderLegal("privacy", "Privacy Policy"));
    case "/terms":
      return wrapPage(renderLegal("terms", "Terms of Use"));
    case "/cookie":
      return wrapPage(renderLegal("cookie", "Cookie Policy"));
    case "/refund":
      return wrapPage(renderLegal("refund", "Refund & Cancellation Policy"));
    case "/acceptable-use":
      return wrapPage(renderLegal("acceptable-use", "Acceptable Use"));
    case "/login":
      return wrapPage(`<main id="main" class="page-wrap">
        <div class="desk-well auth-card">
          <h1 class="display-md">Log in</h1>
          <p class="muted">
            Log in to keep your monthly quota or upgrade to Pro.
          </p>
        </div>
      </main>`);
    case "/register":
      return wrapPage(`<main id="main" class="page-wrap">
        <div class="desk-well auth-card">
          <h1 class="display-md">Create account</h1>
          <p class="muted">
            Create an account to keep quota across days and upgrade to Pro. You can still preview and complete a useful Free export without signing in.
          </p>
        </div>
      </main>`);
    case "/404":
      return wrapPage(`<main id="main" class="page-wrap">
        <div class="not-found">
          <h1 class="display-md">Page not found</h1>
          <p class="lede">
            This page is not available. You can go back to the text to handwriting converter, or open Pricing, FAQ, or Acceptable Use.
          </p>
        </div>
      </main>`);
    default:
      return "";
  }
}

export function faqItemsFor(path) {
  if (path === "/") return HOME_FAQ;
  if (path === "/faq") return faqData.groups.flatMap((g) => g.items);
  if (path === "/hindi") return HINDI_FAQ;
  return undefined;
}
