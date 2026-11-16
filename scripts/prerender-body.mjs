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
  "Recommended plan structure. Prices are shown in USD and are not a live offer until confirmed. Applicable taxes will be shown at checkout.";

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

const faqData = JSON.parse(readFileSync(join(root, "src/content/faq.json"), "utf8"));

const HINDI_FAQ = [
  {
    question: "Can I export Hindi pages without an account?",
    answer:
      "Yes. Guest users can preview and complete a useful Free export, including Hindi text, within plan limits.",
  },
  {
    question: "Is the whole website in Hindi?",
    answer: "No. The MVP interface is English. Hindi is supported for input, preview, and export.",
  },
  {
    question: "Is Hindi the main keyword for the whole site?",
    answer:
      "No. This page explains a supported language in the converter. The homepage keyword is text to handwriting.",
  },
];

const HOME_FAQ = [
  {
    question: "Do I need an account to convert text to handwriting?",
    answer:
      "No. You can paste text, preview a page, and complete a useful Free export without signing in. An account is needed to keep quota across days or subscribe to Pro. Saved export history is not currently provided. 【PENDING CONFIRMATION】",
  },
  {
    question: "Can I convert Hindi text as well as English?",
    answer:
      "Yes. The editor supports English and Hindi (Devanagari) for preview and PDF or PNG export.",
  },
  {
    question: "What file formats can I download?",
    answer:
      "You can download PDF or PNG. Both plans include these formats. Quality and watermark rules depend on your plan.",
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
          © ${year} Writey. Operator is 【PENDING CONFIRMATION】.
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
          <strong>Draft for review — Draft v2026-11-13 [pending confirmation]</strong>
          <p style="margin: 0">
            This page is a product policy draft, not a legal opinion and not a certification of compliance with any law. Operator entity, domain, and effective dates remain pending confirmation.
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
          <h1 class="display-md">Text to Handwriting Converter</h1>
          <p class="lede">
            Paste your text, choose a handwriting style and paper, preview the page, and export a PDF or PNG. English and Hindi are both supported.
          </p>
        </div>
        <section class="section desk-well">
          <h2>Preview before you download</h2>
                    <div class="desk-prose">
<p class="prose-muted">
            You do not have to guess how the page will look. Paste your text, choose a style and paper, and preview the handwriting-style page in your browser. English and Hindi both preview in the same editor. You can start without creating an account.
          </p>
          <p class="prose-muted">
            We do not publish user counts, star ratings, or testimonials in this MVP, because those facts are not in the upstream evidence.
          </p>
          </div>
        </section>
        <section class="section desk-well">
          <h2>Typed notes should not have to stay in a print font</h2>
                    <div class="desk-prose">
<p class="prose-muted">
            Typing is fast. Handwriting a full page is slow. A decorative font in a document is not the same as a page with lined, blank, or grid paper, margins, and a handwriting-style layout.
          </p>
          <p class="prose-muted">
            If you need a page for personal notes, revision, a letter, a journal, or a classroom example — in English or Hindi — you should be able to preview it and export PDF or PNG without setting up an account first.
          </p>
          </div>
        </section>
        <section class="section desk-well">
          <h2>A text to handwriting converter, in the browser</h2>
                    <div class="desk-prose">
<p class="prose-muted">
            Writey turns typed or pasted text into handwriting-style pages. Choose a style, a paper type, margins, line spacing, and ink colour. Add optional natural variation for appearance. Then preview and download.
          </p>
          <p class="prose-muted">
            The output is typographic. It is not a scan of anyone’s real handwriting, and the MVP does not clone your own handwriting. Writey is not an official school, board, or government service.
          </p>
          </div>
        </section>
        <section class="section">
          <h2 class="center">How it works</h2>
          <div class="how-grid">
            <article class="desk-well">
              <h3>1. Paste or type your text</h3>
              <p class="muted">Add English or Hindi text in the editor. You can switch language without leaving the page.</p>
            </article>
            <article class="desk-well">
              <h3>2. Choose a style and paper</h3>
              <p class="muted">Pick a handwriting style and lined, blank, or grid paper. Adjust margins, line spacing, and ink colour if you need to.</p>
            </article>
            <article class="desk-well">
              <h3>3. Preview and export</h3>
              <p class="muted">Check the page in the preview, then download PDF or PNG. The first useful export can be done without an account, within Free limits.</p>
            </article>
          </div>
        </section>
        <section class="section desk-well desk-split">
          <h2>Choose a handwriting style</h2>
          <p class="prose-muted">
            Free includes 8 handwriting styles: six Latin styles and two usable Devanagari handwriting styles. Pro unlocks all 11 licensed MVP styles. The MVP does not include cloning your own handwriting.
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>English and Hindi</h2>
          <p class="prose-muted">
            The interface is English in the MVP. The editor can preview and export both English and Hindi (Devanagari). Hindi is a first-class input and rendering capability, not a leftover print font. For a focused walkthrough, see the Hindi support page.
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>Download PDF or PNG</h2>
          <p class="prose-muted">
            Both Free and Pro can export PDF and PNG. Free uses standard export quality and a visible watermark. Pro removes the watermark and uses higher export quality. Exact DPI values are 【PENDING CONFIRMATION】. Multi-page PNG exports download as a ZIP of one image per page.
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>Appropriate uses</h2>
          <div>
            <p class="prose-muted">Writey is designed for:</p>
            <ul class="list-plain">
            <li>Personal notes and organisation</li>
            <li>Revision materials for your own learning</li>
            <li>Letters and journals</li>
            <li>Accessibility needs, when writing at length is difficult and you still want a handwritten look</li>
            <li>Teacher or classroom examples, where that is allowed</li>
          </ul>
          <p class="pending">These are the uses we show on the site. Read Acceptable Use before you export.</p>
          </div>
        </section>
        <section class="section desk-well desk-split">
          <h2>What Writey does not do</h2>
          <ul class="list-plain">
            <li>We do not build or sell features whose purpose is to evade teachers, OCR, or detection tools.</li>
            <li>We do not offer a Lifetime plan in this MVP.</li>
            <li>We do not promise unlimited pages or unlimited previews. Every plan has caps.</li>
            <li>Maths, tables, extra Indian languages beyond Hindi, and handwriting cloning are not in the MVP.</li>
          </ul>
        </section>
        <section class="section">
          <h2>Free and Pro plans</h2>
          <div class="desk-prose">
            <p class="prose-muted">
              Start with a useful Free allowance. Upgrade to Pro for more pages, more handwriting styles, higher export quality, and no watermark.
            </p>
            <p class="prose-muted">${esc(PRICE_STATUS_SENTENCE)}</p>
          </div>
          <div class="plan-cards">
            <article class="desk-well">
              <h3>Free</h3>
              <p class="plan-price">$0</p>
              <p class="muted">8 export pages per month, with a watermark. <span class="pending">【PENDING CONFIRMATION】</span></p>
            </article>
            <article class="desk-well">
              <h3>Pro</h3>
              <p class="plan-price">$3.99 / month or $39 / year</p>
              <p class="muted">150 export pages per month, no watermark. <span class="pending">【PENDING CONFIRMATION】</span></p>
            </article>
          </div>
        </section>
        <section class="section desk-well">
          <h2>Frequently asked questions</h2>
          ${faqBlock(HOME_FAQ)}
        </section>
        <section class="section desk-well cta-band">
          <h2>Convert your text now</h2>
          <p class="prose-muted">
            Open the editor, paste your text, and preview a handwriting-style page. You can start without an account.
          </p>
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
        </div>
        <section class="section desk-well">
          <p class="muted">
            This is a language support page, not a second homepage and not a verified primary keyword landing page.
          </p>
        </section>
        <section class="section desk-well">
          <h2>Devanagari support</h2>
                    <div class="desk-prose">
<p class="prose-muted">
            Writey can preview and export Hindi text written in Devanagari. The handwriting style should look handwritten, not like a plain print font dropped onto the page. English remains available in the same editor.
          </p>
          <p class="pending">
            Specimen fonts are licensed under SIL OFL 1.1. Devanagari quality is still a limitation of these specimens. Do not treat Hindi first-class commercial fonts as already delivered, and do not treat handwriting cloning as supported.
          </p>
          </div>
        </section>
        <section class="section desk-well desk-split">
          <h2>Preview Hindi pages</h2>
          <p class="prose-muted">
            Paste or type Hindi, choose a handwriting style and paper, and preview the page before you download. You can start without an account, within Free limits.
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>Export PDF or PNG</h2>
          <p class="prose-muted">
            When the preview looks right, download PDF or PNG. Free exports include a visible brand watermark. Pro removes the watermark and uses higher export quality. 【PENDING CONFIRMATION】
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>Use the same editor for English</h2>
          <p class="prose-muted">
            You do not need a separate product for English. Switch the language control in the editor to move between English and Hindi.
          </p>
        </section>
        <section class="section desk-well desk-split">
          <h2>Appropriate uses</h2>
          <p class="prose-muted">
            Use Hindi or English pages for personal notes, revision, letters, journals, accessibility needs, and classroom examples. Do not use exports for academic dishonesty. Read Acceptable Use.
          </p>
        </section>
        <section class="section desk-well">
          <h2>Hindi questions</h2>
          ${faqBlock(HINDI_FAQ)}
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
          <p class="pending">${esc(PRICE_STATUS_SENTENCE)}</p>
        </div>
        <section class="section desk-well">
          <h2>Who these plans are for</h2>
          <p class="prose-muted">
            Writey is for people who want to turn typed or pasted English or Hindi text into handwriting-style pages for personal notes, revision, letters, journals, accessibility needs, or classroom examples.
          </p>
        </section>
        <div class="plan-cards section">
          <article class="desk-well">
            <h2>Free plan</h2>
            <p class="plan-price">$0, USD</p>
            <ul class="list-plain">
              <li>8 export pages per calendar month <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>Visible brand watermark that does not cover your text</li>
              <li>Standard export quality <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>8 handwriting styles, including usable Devanagari support</li>
              <li>PDF and PNG export</li>
              <li>Up to 10 preview refreshes per day, and up to 8 pages per preview <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>Up to 2 export jobs per day, still limited by the monthly page cap <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>Saved export history is not currently provided. 【PENDING CONFIRMATION】</li>
              <li>Core path works without an account; sign in to keep quota across days</li>
            </ul>
          </article>
          <article class="desk-well">
            <h2>Pro plan</h2>
            <p class="plan-price">
              $3.99 / month or $39 / year, USD <span class="pending">【PENDING CONFIRMATION】</span>
            </p>
            <ul class="list-plain">
              <li>150 export pages per calendar month <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>No watermark</li>
              <li>Higher export quality <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>All 11 licensed MVP styles (does not include handwriting cloning)</li>
              <li>PDF and PNG export</li>
              <li>Up to 50 preview refreshes per day, and up to 20 pages per preview <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>Up to 10 export jobs per day, still limited by the monthly page cap <span class="pending">【PENDING CONFIRMATION】</span></li>
              <li>Saved export history is not currently provided. 【PENDING CONFIRMATION】</li>
              <li>Account required for billing and quota</li>
            </ul>
            <p class="prose-muted">
              Neither plan is unlimited. After you reach a cap, wait for the quota to reset or contact support.
            </p>
          </article>
        </div>
      </main>`;
}

function faqBody() {
  const sections = faqData.groups
    .map((group) => {
      return `<section class="section desk-well">
            <h2>${esc(group.heading)}</h2>
            ${faqBlock(group.items)}
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
  if (path === "/faq") return faqData.groups.flatMap((g) => g.items);
  if (path === "/hindi") return HINDI_FAQ;
  return undefined;
}
