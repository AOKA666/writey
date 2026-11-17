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

function HandwritingSheet() {
  return (
    <article className="compare-sheet is-lined">
      <span className="compare-sheet-label">English</span>
      <div className="compare-hand-latin">{SAMPLE_LINES}</div>
      <div className="compare-watermark" aria-hidden="true">
        Writey
      </div>
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
        <div className="compare-row">
          <figure className="compare-panel">
            <figcaption className="compare-label">On-screen preview</figcaption>
            <div className="compare-stage">
              <HandwritingSheet />
            </div>
          </figure>
          <figure className="compare-panel">
            <figcaption className="compare-label">Exported PDF page</figcaption>
            <div className="compare-stage">
              <div className="export-frame">
                <div className="export-bar">PDF</div>
                <HandwritingSheet />
              </div>
            </div>
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
        <p className="compare-caption">
          The same text, set first in a print font and then as a handwriting-style page with paper, margins, and a handwriting font.
        </p>
        <div className="compare-row">
          <figure className="compare-panel">
            <figcaption className="compare-label">Print-font page</figcaption>
            <div className="compare-stage">
              <article className="compare-sheet is-lined">
                <span className="compare-sheet-label">Print font</span>
                <div className="compare-print-latin">{SAMPLE_LINES}</div>
              </article>
            </div>
          </figure>
          <figure className="compare-panel">
            <figcaption className="compare-label">Handwriting-style page</figcaption>
            <div className="compare-stage">
              <HandwritingSheet />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
