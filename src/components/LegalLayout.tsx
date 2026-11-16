import { useMemo } from "react";
import { renderLegalHtml, type LegalDocId, LEGAL_DOCS } from "@/content/legal";

export function LegalLayout({ id }: { id: LegalDocId }) {
  const doc = LEGAL_DOCS[id];
  const { html, headings } = useMemo(() => renderLegalHtml(doc.markdown), [doc.markdown]);
  return (
    <>
      <div className="draft-banner">
        <strong>Draft for review — Draft v2026-11-13</strong>
        <p style={{ margin: 0 }}>
          This page is a product policy draft, not a legal opinion and not a certification of compliance with any law. The legal person that operates Writey, and the effective date of this policy, will be named once they are confirmed.
        </p>
      </div>
      <div className="legal-layout">
        <aside className="legal-toc" aria-label="On this page">
          <p className="label-sm">On this page</p>
          <nav>
            {headings.map((h) => (
              <a key={h.id} href={`#${h.id}`} style={{ paddingLeft: h.level === 3 ? "1rem" : undefined }}>
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
        <article className="legal-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}
