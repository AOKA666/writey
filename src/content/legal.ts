import { marked, type Tokens } from "marked";
import acceptableUseMd from "./legal/acceptable-use.md?raw";
import cookieMd from "./legal/cookie.md?raw";
import privacyMd from "./legal/privacy.md?raw";
import refundMd from "./legal/refund.md?raw";
import termsMd from "./legal/terms.md?raw";

export type LegalDocId =
  | "privacy"
  | "terms"
  | "cookie"
  | "refund"
  | "acceptable-use";

export type LegalHeading = { id: string; text: string; level: number };

export type LegalDoc = {
  id: LegalDocId;
  path: `/${LegalDocId}`;
  markdown: string;
  title: string;
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    id: "privacy",
    path: "/privacy",
    markdown: privacyMd,
    title: "Privacy Policy",
  },
  terms: {
    id: "terms",
    path: "/terms",
    markdown: termsMd,
    title: "Terms of Use",
  },
  cookie: {
    id: "cookie",
    path: "/cookie",
    markdown: cookieMd,
    title: "Cookie Policy",
  },
  refund: {
    id: "refund",
    path: "/refund",
    markdown: refundMd,
    title: "Refund & Cancellation Policy",
  },
  "acceptable-use": {
    id: "acceptable-use",
    path: "/acceptable-use",
    markdown: acceptableUseMd,
    title: "Acceptable Use",
  },
};

const SLUG_COUNTS = new Map<string, number>();

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/【.*?】/g, "")
    .replace(/\[[^\]]*]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "section";
  const n = SLUG_COUNTS.get(base) ?? 0;
  SLUG_COUNTS.set(base, n + 1);
  return n === 0 ? base : `${base}-${n + 1}`;
}

export function extractHeadings(markdown: string): LegalHeading[] {
  SLUG_COUNTS.clear();
  const headings: LegalHeading[] = [];
  for (const line of markdown.split("\n")) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/\s+#+\s*$/, "").trim();
    if (level === 1) continue; // page H1 is rendered separately from the first heading
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}

export function renderLegalHtml(markdown: string): { html: string; headings: LegalHeading[] } {
  SLUG_COUNTS.clear();
  const headings: LegalHeading[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth, text }: Tokens.Heading) => {
    const raw = tokens?.map((t) => ("text" in t ? String(t.text) : "")).join("") || text;
    const clean = raw.trim();
    if (depth === 1) {
      // The document H1 is shown by the page chrome; skip a duplicate.
      return "";
    }
    const id = slugify(clean);
    headings.push({ id, text: clean, level: depth });
    return `<h${depth} id="${id}">${clean}</h${depth}>`;
  };
  marked.setOptions({ gfm: true, breaks: false });
  const html = marked.parse(markdown, { renderer, async: false }) as string;
  return { html, headings };
}
