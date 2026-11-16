import type { AestheticVariation, PaperType } from "@/content/handwriting";

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
/** CSS px per mm at 96dpi. Preview and export share this layout scale. */
export const MM_TO_PX = 3.7795;
export const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
export const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;

/** Canonical preview/export layout size. Export paints this layout at a DPI scale. */
export const PREVIEW_FONT_PX = 26;

export type EditorSettings = {
  language: "en" | "hi";
  styleId: string;
  paper: PaperType;
  ink: "blue" | "black" | "navy";
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  lineSpacing: number;
  variation: AestheticVariation;
  variationEnabled: boolean;
};

export const DEFAULT_SETTINGS: EditorSettings = {
  language: "en",
  styleId: "oxford-cursive",
  paper: "lined",
  ink: "blue",
  marginTop: 18,
  marginRight: 16,
  marginBottom: 18,
  marginLeft: 20,
  lineSpacing: 34,
  variation: { tilt: 0.45, ink_pressure: 0.5, drift: 0.4 },
  variationEnabled: true,
};

const DEVANAGARI = /[\u0900-\u097F]/;

export function containsDevanagari(text: string): boolean {
  return DEVANAGARI.test(text);
}

export function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function unitNoise(seed: string): number {
  return (hash32(seed) % 1000) / 1000;
}

export type LaidOutLine = {
  page: number;
  text: string;
  tiltDeg: number;
  driftPx: number;
  pressure: number;
};

export function wrapAndPaginate(
  text: string,
  opts: {
    widthMm: number;
    heightMm: number;
    margin: { top: number; right: number; bottom: number; left: number };
    lineSpacingPx: number;
    fontSizePx: number;
    measure: (s: string) => number;
    variation: AestheticVariation;
    variationEnabled: boolean;
  },
): LaidOutLine[] {
  const innerHeightPx =
    (opts.heightMm - opts.margin.top - opts.margin.bottom) * MM_TO_PX;
  const innerWidthPx =
    (opts.widthMm - opts.margin.left - opts.margin.right) * MM_TO_PX;
  const linesPerPage = Math.max(1, Math.floor(innerHeightPx / opts.lineSpacingPx));
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const wrapped: string[] = [];
  for (const para of paragraphs) {
    if (para === "") {
      wrapped.push("");
      continue;
    }
    const words = para.split(/(\s+)/);
    let current = "";
    for (const word of words) {
      const trial = current + word;
      if (opts.measure(trial) <= innerWidthPx || current === "") {
        current = trial;
      } else {
        wrapped.push(current.trimEnd());
        current = word.trimStart();
      }
    }
    if (current !== "") wrapped.push(current.trimEnd());
  }
  const lines: LaidOutLine[] = [];
  wrapped.forEach((line, index) => {
    const page = Math.floor(index / linesPerPage);
    const seed = `${index}:${line}`;
    const tiltDeg = opts.variationEnabled
      ? (unitNoise(seed + "t") - 0.5) * opts.variation.tilt * 2.4
      : 0;
    const driftPx = opts.variationEnabled
      ? (unitNoise(seed + "d") - 0.5) * opts.variation.drift * 5
      : 0;
    const pressure = opts.variationEnabled
      ? 0.72 + opts.variation.ink_pressure * 0.28 * (0.55 + unitNoise(seed + "p") * 0.45)
      : 1;
    lines.push({ page, text: line, tiltDeg, driftPx, pressure });
  });
  return lines;
}

export function pageCountFromLines(lines: LaidOutLine[]): number {
  if (lines.length === 0) return 1;
  return Math.max(1, ...lines.map((l) => l.page + 1));
}
