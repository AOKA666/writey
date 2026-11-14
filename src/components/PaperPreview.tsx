import { INK_COLORS } from "@/content/handwriting";
import {
  containsDevanagari,
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

export function PaperPreview({ text, settings, watermark, loading, error, languageLabel }: Props) {
  const trimmed = text.trim();
  const [fontsReady, setFontsReady] = useState(
    typeof document !== "undefined" ? document.fonts.status === "loaded" : false,
  );
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

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
      if (width > 0) setScale(width / A4_WIDTH_PX);
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
              className="sheet-scaler"
              ref={page === 0 ? scalerRef : undefined}
            >
              <div
                className={`sheet ${paperClass}`}
                style={
                  {
                    width: A4_WIDTH_PX,
                    height: A4_HEIGHT_PX,
                    transform: `scale(${scale})`,
                    "--line": `${settings.lineSpacing}px`,
                    "--pad-top": `${settings.marginTop * MM_TO_PX}px`,
                    "--pad-left": `${settings.marginLeft * MM_TO_PX}px`,
                  } as CSSProperties
                }
              >
                <div className="sheet-inner">
                  <div className="sheet-lines" />
                  <div
                    className="margin-rule"
                    style={{ left: `${settings.marginLeft * MM_TO_PX}px` }}
                  />
                  {watermark ? <div className="sheet-watermark">WRITEY</div> : null}
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
