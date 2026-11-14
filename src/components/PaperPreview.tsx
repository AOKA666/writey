import { INK_COLORS, DEVANAGARI_FONT, HANDWRITING_STYLES } from "@/content/handwriting";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  containsDevanagari,
  pageCountFromLines,
  wrapAndPaginate,
  type LaidOutLine,
} from "@/lib/layout";
import type { EditorSettings } from "@/lib/layout";
import { useMemo, type CSSProperties } from "react";

type Props = {
  text: string;
  settings: EditorSettings;
  watermark: boolean;
  loading?: boolean;
  error?: string | null;
  languageLabel: string;
};

const PREVIEW_FONT = 22;

function measure(text: string, styleId: string, fontSize = PREVIEW_FONT): number {
  if (typeof document === "undefined") return text.length * fontSize * 0.5;
  const canvas = measure.canvas || (measure.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * fontSize * 0.5;
  let w = 0;
  for (const ch of text) {
    const font = /[\u0900-\u097F]/.test(ch)
      ? DEVANAGARI_FONT
      : (HANDWRITING_STYLES.find((s) => s.id === styleId)?.fontFamily ?? "Caveat, cursive");
    ctx.font = `${fontSize}px ${font}`;
    w += ctx.measureText(ch).width;
  }
  return w;
}
measure.canvas = undefined as HTMLCanvasElement | undefined;

function fontFor(ch: string, styleId: string): string {
  if (/[\u0900-\u097F]/.test(ch)) return DEVANAGARI_FONT;
  return HANDWRITING_STYLES.find((s) => s.id === styleId)?.fontFamily ?? "Caveat, cursive";
}

function LineView({ line, settings, fontSize }: { line: LaidOutLine; settings: EditorSettings; fontSize: number }) {
  const ink = INK_COLORS.find((c) => c.id === settings.ink)?.value ?? "#1a3a8a";
  const chunks: { font: string; text: string }[] = [];
  for (const ch of line.text) {
    const font = fontFor(ch, settings.styleId);
    const last = chunks[chunks.length - 1];
    if (last && last.font === font) last.text += ch;
    else chunks.push({ font, text: ch });
  }
  return (
    <div
      className="hand-line"
      style={{
        height: settings.lineSpacing,
        lineHeight: `${settings.lineSpacing}px`,
        fontSize,
        color: ink,
        opacity: line.pressure,
        transform: `translate(${line.driftPx}px, 0) rotate(${line.tiltDeg}deg)`,
      }}
    >
      {chunks.map((c, i) => (
        <span key={i} style={{ fontFamily: c.font }}>
          {c.text}
        </span>
      ))}
    </div>
  );
}

export function PaperPreview({ text, settings, watermark, loading, error, languageLabel }: Props) {
  const trimmed = text.trim();
  const lines = useMemo(() => {
    if (!trimmed) return [];
    return wrapAndPaginate(text, {
      widthMm: A4_WIDTH_MM,
      heightMm: A4_HEIGHT_MM,
      margin: {
        top: settings.marginTop,
        right: settings.marginRight,
        bottom: settings.marginBottom,
        left: settings.marginLeft,
      },
      lineSpacingPx: settings.lineSpacing,
      fontSizePx: PREVIEW_FONT,
      measure: (s) => measure(s, settings.styleId),
      variation: settings.variation,
      variationEnabled: settings.variationEnabled,
    });
  }, [text, trimmed, settings]);

  const pages = Math.max(1, pageCountFromLines(lines));
  const visiblePages = Math.min(pages, 3);
  const paperClass =
    settings.paper === "grid" ? "is-grid" : settings.paper === "lined" ? "is-lined" : "is-blank";

  const emptyHintEn = "Paste or type your text to preview a handwriting-style page.";
  const emptyHintHi = "देवनागरी में एक छोटा वाक्य लिखें — Try a short Hindi sentence in Devanagari to see the handwriting style.";

  return (
    <div className="preview-stack">
      {Array.from({ length: visiblePages }, (_, page) => {
        const pageLines = lines.filter((l) => l.page === page);
        return (
          <div className="sheet-frame" key={page}>
            <div className="sheet-label">
              Sheet {page + 1}
              {pages > 1 ? ` of ${pages}` : ""} ({languageLabel}
              {trimmed && containsDevanagari(text) ? " · देवनागरी" : ""})
            </div>
            <div
              className={`sheet ${paperClass}`}
              style={
                {
                  "--line": `${settings.lineSpacing}px`,
                  "--pad-top": `${settings.marginTop * 3.78}px`,
                  "--pad-left": `${settings.marginLeft * 3.78}px`,
                } as CSSProperties
              }
            >
              <div className="sheet-inner">
                <div className="sheet-lines" />
                <div
                  className="margin-rule"
                  style={{ left: `${settings.marginLeft * 3.78}px` }}
                />
                {watermark ? <div className="sheet-watermark">WRITEY</div> : null}
                {trimmed ? (
                  <div
                    className="hand-lines"
                    style={{
                      paddingTop: settings.marginTop * 3.78,
                      paddingRight: settings.marginRight * 3.78,
                      paddingBottom: settings.marginBottom * 3.78,
                      paddingLeft: settings.marginLeft * 3.78,
                    }}
                  >
                    {pageLines.map((line, i) => (
                      <LineView key={`${page}-${i}`} line={line} settings={settings} fontSize={PREVIEW_FONT} />
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="sheet-empty-hint">{emptyHintEn}</p>
                    <p className="sheet-empty-hint hi" style={{ top: "38%" }}>
                      {emptyHintHi}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {pages > 3 ? (
        <p className="preview-status">
          Showing the first 3 of {pages} pages. The full document is included when you export.
        </p>
      ) : null}
      {loading ? <p className="preview-status">Updating preview…</p> : null}
      {error ? <p className="preview-status" role="alert">{error}</p> : null}
    </div>
  );
}
