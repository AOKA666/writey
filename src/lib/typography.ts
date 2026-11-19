import { DEVANAGARI_FONT, HANDWRITING_STYLES } from "@/content/handwriting";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  MM_TO_PX,
  PREVIEW_FONT_PX,
  wrapAndPaginate,
  type EditorSettings,
  type LaidOutLine,
} from "@/lib/layout";

export { A4_HEIGHT_PX, A4_WIDTH_PX, MM_TO_PX, PREVIEW_FONT_PX } from "@/lib/layout";

export type FontRun = { font: string; text: string };

export function fontFamilyForChar(ch: string, styleId: string): string {
  const style = HANDWRITING_STYLES.find((s) => s.id === styleId);
  if (/[\u0900-\u097F]/.test(ch)) {
    if (style && (style.script === "devanagari" || style.script === "both")) return style.fontFamily;
    return DEVANAGARI_FONT;
  }
  return style?.fontFamily ?? "Caveat, cursive";
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

/** Mobile on-screen preview typography only. Export and layoutDocument stay on PREVIEW_FONT_PX / A4. */
export const MOBILE_PREVIEW_MAX_WIDTH_PX = 959;
export const MOBILE_PREVIEW_FONT_PX = 22;
export const MOBILE_PREVIEW_LINE_HEIGHT_PX = 30;
export const MOBILE_PREVIEW_RULING_PX = 32;

export function layoutMobilePreviewDocument(
  text: string,
  settings: EditorSettings,
  contentWidthPx: number,
  contentHeightPx: number,
): LaidOutLine[] {
  if (contentWidthPx <= 0 || contentHeightPx <= 0) return [];
  return wrapAndPaginate(text, {
    widthMm: contentWidthPx / MM_TO_PX,
    heightMm: contentHeightPx / MM_TO_PX,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    lineSpacingPx: MOBILE_PREVIEW_RULING_PX,
    fontSizePx: MOBILE_PREVIEW_FONT_PX,
    measure: createStyleMeasure(settings.styleId, MOBILE_PREVIEW_FONT_PX),
    variation: settings.variation,
    variationEnabled: settings.variationEnabled,
  });
}
