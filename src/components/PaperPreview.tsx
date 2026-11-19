import { HANDWRITING_STYLES, INK_COLORS, LATIN_FALLBACK_FONT, DEVANAGARI_FONT } from "@/content/handwriting";
import {
  pageCountFromLines,
  type LaidOutLine,
} from "@/lib/layout";
import type { EditorSettings } from "@/lib/layout";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  MM_TO_PX,
  PREVIEW_FONT_PX,
  fontRuns,
  layoutDocument,
} from "@/lib/typography";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Props = {
  text: string;
  settings: EditorSettings;
  watermark: boolean;
  loading?: boolean;
  error?: string | null;
  languageLabel: string;
};

const SAMPLE_EN =
  "Welcome to Writey — thanks for visiting. Type on the left, choose a handwriting style, and this preview is the page you can export as a PDF or PNG.";
const SAMPLE_HI =
  "Writey में आपका स्वागत है, आने के लिए धन्यवाद। बाईं ओर अपना पाठ लिखें, लिखावट शैली चुनें — यह पूर्वावलोकन वही पृष्ठ है जो PDF या PNG में मिलेगा।";

function LineView({ line, settings, fontSize }: { line: LaidOutLine; settings: EditorSettings; fontSize: number }) {
  const ink = INK_COLORS.find((c) => c.id === settings.ink)?.value ?? "#1a3a8a";
  const chunks = fontRuns(line.text, settings.styleId);
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

function BilingualSpecimen({
  ink,
  padTop,
  padLeft,
  styleId,
}: {
  ink: string;
  padTop: number;
  padLeft: number;
  styleId: string;
}) {
  const style = HANDWRITING_STYLES.find((item) => item.id === styleId);
  const script = style?.script ?? "latin";
  const styleName = style?.name ?? "Oxford Cursive";
  const usesLatin = script === "latin" || script === "both";
  const usesDevanagari = script === "devanagari" || script === "both";
  const latinFont = usesLatin ? (style?.fontFamily ?? LATIN_FALLBACK_FONT) : LATIN_FALLBACK_FONT;
  const devaFont = usesDevanagari ? (style?.fontFamily ?? DEVANAGARI_FONT) : DEVANAGARI_FONT;
  const latinLabel = usesLatin ? `English · ${styleName} Style` : "English · Oxford Cursive Style";
  const devaLabel = usesDevanagari ? `Hindi · ${styleName} Style` : "Hindi · Kavya Devanagari Style";

  return (
    <div
      className="sheet-specimen"
      style={{
        paddingTop: padTop + 24,
        paddingLeft: padLeft,
        paddingRight: 36,
        color: ink,
      }}
    >
      <p className="sheet-specimen__kicker">{latinLabel}</p>
      <p className="sheet-specimen__latin" style={{ fontFamily: latinFont, color: ink }}>
        {SAMPLE_EN}
      </p>
      <p className="sheet-specimen__kicker">{devaLabel}</p>
      <p className="sheet-specimen__deva" style={{ fontFamily: devaFont, color: ink }} lang="hi">
        {SAMPLE_HI}
      </p>
    </div>
  );
}

export function PaperPreview({ text, settings, watermark, loading, error, languageLabel }: Props) {
  const trimmed = text.trim();
  const [fontsReady, setFontsReady] = useState(
    typeof document !== "undefined" ? document.fonts.status === "loaded" : false,
  );
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ink = INK_COLORS.find((c) => c.id === settings.ink)?.value ?? "#1a3a8a";
  const styleName = HANDWRITING_STYLES.find((style) => style.id === settings.styleId)?.name ?? "Oxford Cursive";
  const sheetDate = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date());
  const languageName = languageLabel;

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setFontsReady(true);
    };
    if (typeof document === "undefined") return;
    if (document.fonts.status === "loaded") {
      markReady();
      return;
    }
    void document.fonts.ready.then(markReady);
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const el = scalerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0) return;
      const scaleW = width / A4_WIDTH_PX;
      const scaleH = height > 0 ? height / A4_HEIGHT_PX : scaleW;
      // Prefer filling the pane width when the full A4 page still fits in height.
      // Otherwise contain-fit so the first page is not clipped.
      setScale(scaleW * A4_HEIGHT_PX <= height || height <= 0 ? scaleW : Math.min(scaleW, scaleH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lines = useMemo(() => {
    void fontsReady;
    if (!trimmed) return [];
    return layoutDocument(text, settings);
  }, [text, trimmed, settings, fontsReady]);

  const pages = Math.max(1, pageCountFromLines(lines));
  const visiblePages = Math.min(pages, 3);
  const paperClass =
    settings.paper === "grid" ? "is-grid" : settings.paper === "lined" ? "is-lined" : "is-blank";
  const padTop = settings.marginTop * MM_TO_PX;
  const padLeft = settings.marginLeft * MM_TO_PX;

  return (
    <div className="preview-stack" data-language={languageLabel}>
      {Array.from({ length: visiblePages }, (_, page) => {
        const pageLines = lines.filter((l) => l.page === page);
        return (
          <div className={`sheet-frame${page === 0 ? " is-fill" : ""}`} key={page}>
            <div
              className={`sheet-stationery ${paperClass}`}
              style={
                {
                  "--line": `${settings.lineSpacing * (scale || 1)}px`,
                  "--pad-top": `${padTop * (scale || 1)}px`,
                  "--pad-left": `${padLeft * (scale || 1)}px`,
                } as CSSProperties
              }
            >
              {watermark ? <div className="sheet-watermark sheet-watermark--fill">WRITEY FREE</div> : null}
              <div className="sheet-date">
                {trimmed ? (
                  <span className="sheet-item-label">
                    {languageName} · {styleName} Style
                  </span>
                ) : (
                  <span />
                )}
                <span>{sheetDate}</span>
              </div>
              <div
                className={`sheet-scaler${page === 0 ? " is-fill" : ""}`}
                ref={page === 0 ? scalerRef : undefined}
              >
                <div className={`sheet-fill ${paperClass}`}>
                  <div
                    className={`sheet ${paperClass}`}
                    style={
                      {
                        width: A4_WIDTH_PX,
                        height: A4_HEIGHT_PX,
                        transform: `scale(${scale})`,
                        "--line": `${settings.lineSpacing}px`,
                        "--pad-top": `${padTop}px`,
                        "--pad-left": `${padLeft}px`,
                      } as CSSProperties
                    }
                  >
                    <div className="sheet-inner">
                      <div className="sheet-lines" />
                      {trimmed ? (
                        <div
                          className="hand-lines"
                          style={{
                            paddingTop: settings.marginTop * MM_TO_PX,
                            paddingRight: settings.marginRight * MM_TO_PX,
                            paddingBottom: settings.marginBottom * MM_TO_PX,
                            paddingLeft: settings.marginLeft * MM_TO_PX,
                          }}
                        >
                          {pageLines.map((line, i) => (
                            <LineView key={`${page}-${i}`} line={line} settings={settings} fontSize={PREVIEW_FONT_PX} />
                          ))}
                        </div>
                      ) : page === 0 ? (
                        <BilingualSpecimen ink={ink} padTop={padTop} padLeft={padLeft} styleId={settings.styleId} />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sheet-footer">
                <span>Writey</span>
                <span>
                  Page {page + 1} of {pages}
                </span>
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
