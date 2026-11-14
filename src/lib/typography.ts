import { DEVANAGARI_FONT, HANDWRITING_STYLES } from "@/content/handwriting";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  MM_TO_PX,
  wrapAndPaginate,
  type EditorSettings,
  type LaidOutLine,
} from "@/lib/layout";

export { A4_HEIGHT_PX, A4_WIDTH_PX, MM_TO_PX } from "@/lib/layout";

/** Canonical preview/export layout size. Export paints this layout at a DPI scale. */
export const PREVIEW_FONT_PX = 22;

export type FontRun = { font: string; text: string };

export function fontFamilyForChar(ch: string, styleId: string): string {
  if (/[\u0900-\u097F]/.test(ch)) return DEVANAGARI_FONT;
  return HANDWRITING_STYLES.find((s) => s.id === styleId)?.fontFamily ?? "Caveat, cursive";
}

export function fontRuns(text: string, styleId: string): FontRun[] {
  const chunks: FontRun[] = [];
  for (const ch of text) {
    const font = fontFamilyForChar(ch, styleId);
    const last = chunks[chunks.length - 1];
    if (last && last.font === font) last.text += ch;
    else chunks.push({ font, text: ch });
  }
  return chunks;
}

type MeasureCtx = {
  font: string;
  measureText: (text: string) => { width: number };
};

export function measureRunWidths(
  text: string,
  styleId: string,
  fontSizePx: number,
  ctx: MeasureCtx | null,
): number {
  if (!ctx) return text.length * fontSizePx * 0.5;
  let width = 0;
  for (const run of fontRuns(text, styleId)) {
    ctx.font = `${fontSizePx}px ${run.font}`;
    width += ctx.measureText(run.text).width;
  }
  return width;
}

let measureCanvas: HTMLCanvasElement | undefined;

export function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  measureCanvas ??= document.createElement("canvas");
  return measureCanvas.getContext("2d");
}

export function createStyleMeasure(styleId: string, fontSizePx = PREVIEW_FONT_PX) {
  const ctx = getMeasureContext();
  return (s: string) => measureRunWidths(s, styleId, fontSizePx, ctx);
}

export function paintLineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  styleId: string,
  fontSizePx: number,
  x: number,
  y: number,
): void {
  let cx = x;
  ctx.textBaseline = "alphabetic";
  for (const run of fontRuns(text, styleId)) {
    ctx.font = `${fontSizePx}px ${run.font}`;
    ctx.fillText(run.text, cx, y);
    cx += ctx.measureText(run.text).width;
  }
}

export function layoutDocument(text: string, settings: EditorSettings): LaidOutLine[] {
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
    fontSizePx: PREVIEW_FONT_PX,
    measure: createStyleMeasure(settings.styleId, PREVIEW_FONT_PX),
    variation: settings.variation,
    variationEnabled: settings.variationEnabled,
  });
}

export function innerWidthPx(
  widthMm = A4_WIDTH_MM,
  marginLeftMm: number,
  marginRightMm: number,
): number {
  return (widthMm - marginLeftMm - marginRightMm) * MM_TO_PX;
}
