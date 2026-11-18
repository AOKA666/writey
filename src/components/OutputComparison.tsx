const SAMPLE_LINES = (
  <>
    Personal notes — 13 November
    <br />
    <br />
    - Pack a letter to Asha
    <br />
    - Revision points on light and shade
    <br />- A short journal after the evening walk
  </>
);

function HandwritingSheet({ footer }: { footer?: string }) {
  return (
    <article className="compare-sheet is-lined">
      <div className="compare-hand-latin">{SAMPLE_LINES}</div>
      {footer ? <div className="compare-sheet-footer">{footer}</div> : null}
    </article>
  );
}

function PrintSheet() {
  return (
    <article className="compare-sheet is-print">
      <div className="compare-print-latin">{SAMPLE_LINES}</div>
    </article>
  );
}

export function OutputComparison() {
  return (
    <section className="section output-comparison" id="output-comparison">
      <h2>The preview is what you export</h2>
      <p className="compare-caption">
        These panels use the same typographic layout. The exported PDF or PNG follows the preview you see. This is a handwriting-style page, not a photograph of someone’s handwriting.
      </p>

      <div
        className="compare-pair"
        role="img"
        aria-label="Side-by-side typographic mock: the on-screen preview and the exported PDF page use the same handwriting-style layout."
      >
        <span className="sr-only">
          Side-by-side typographic mock: the on-screen preview and the exported PDF page use the same handwriting-style layout.
        </span>
        <p className="compare-eyebrow">Comparison 01: Preview Fidelity</p>
        <div className="compare-row">
          <figure className="compare-card">
            <figcaption className="compare-label">On-screen preview</figcaption>
            <HandwritingSheet footer="Writey Preview Mode" />
          </figure>
          <figure className="compare-card">
            <figcaption className="compare-label">Exported PDF page</figcaption>
            <HandwritingSheet footer="Writey Page 1 (Exported PDF)" />
          </figure>
        </div>
      </div>

      <div
        className="compare-pair"
        role="img"
        aria-label="Side-by-side typographic mock: the same note in a print font and as a handwriting-style page."
      >
        <span className="sr-only">
          Side-by-side typographic mock: the same note in a print font and as a handwriting-style page.
        </span>
        <p className="compare-eyebrow">Comparison 02: Layout vs Generic Fonts</p>
        <div className="compare-row">
          <figure className="compare-card">
            <figcaption className="compare-label">Print-font page</figcaption>
            <PrintSheet />
          </figure>
          <figure className="compare-card">
            <figcaption className="compare-label">Handwriting-style page</figcaption>
            <HandwritingSheet />
          </figure>
        </div>
        <p className="compare-caption compare-caption--after">
          The same text, set first in a print font and then as a handwriting-style page with paper, margins, and a handwriting font.
        </p>
      </div>
    </section>
  );
}
