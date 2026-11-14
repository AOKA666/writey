
import {
  DEVANAGARI_FONT,
  HANDWRITING_STYLES,
  INK_COLORS,
  type PaperType,
} from "@/content/handwriting";
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  wrapAndPaginate,
  type LaidOutLine,
} from "@/lib/layout";
import type { EditorSettings } from "@/lib/layout";

const MM_TO_PX_EXPORT = 150 / 25.4; // ~150 dpi for Free / standard quality [待确认]
const MM_TO_PX_PRO = 200 / 25.4;

export type RenderInput = {
  text: string;
  settings: EditorSettings;
  watermark: boolean;
  quality: "standard" | "high";
};

function fontForChunk(ch: string, styleId: string): string {
  const isDeva = /[\u0900-\u097F]/.test(ch);
  if (isDeva) return DEVANAGARI_FONT;
  const style = HANDWRITING_STYLES.find((s) => s.id === styleId);
  return style?.fontFamily ?? "Caveat, cursive";
}

function measureFactory(settings: EditorSettings, fontSizePx: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  return (s: string) => {
    if (!ctx) return s.length * fontSizePx * 0.5;
    let width = 0;
    for (const ch of s) {
      ctx.font = `${fontSizePx}px ${fontForChunk(ch, settings.styleId)}`;
      width += ctx.measureText(ch).width;
    }
    return width;
  };
}

export function layoutText(input: RenderInput, fontSizePx: number): LaidOutLine[] {
  const measure = measureFactory(input.settings, fontSizePx);
  return wrapAndPaginate(input.text, {
    widthMm: A4_WIDTH_MM,
    heightMm: A4_HEIGHT_MM,
    margin: {
      top: input.settings.marginTop,
      right: input.settings.marginRight,
      bottom: input.settings.marginBottom,
      left: input.settings.marginLeft,
    },
    lineSpacingPx: input.settings.lineSpacing * (fontSizePx / 22),
    fontSizePx,
    measure,
    variation: input.settings.variation,
    variationEnabled: input.settings.variationEnabled,
  });
}

function paintPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  paper: PaperType,
  marginLeftPx: number,
  lineSpacingPx: number,
  marginTopPx: number,
) {
  ctx.fillStyle = "#FBF7EE";
  ctx.fillRect(0, 0, width, height);
  if (paper === "blank") return;
  if (paper === "lined" || paper === "grid") {
    ctx.strokeStyle = "#e5dfd5";
    ctx.lineWidth = 1;
    const start = marginTopPx;
    for (let y = start; y < height - 8; y += lineSpacingPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  if (paper === "grid") {
    ctx.strokeStyle = "#ebe6dc";
    for (let x = marginLeftPx % lineSpacingPx; x < width; x += lineSpacingPx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }
  // Margin rule (aesthetic paper, not a scan disguise)
  ctx.strokeStyle = "#d4a39b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginLeftPx - 10, 0);
  ctx.lineTo(marginLeftPx - 10, height);
  ctx.stroke();
}

function paintWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-35 * Math.PI) / 180);
  ctx.font = "700 96px Newsreader, serif";
  ctx.fillStyle = "rgba(0, 27, 46, 0.08)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.15em";
  ctx.fillText("WRITEY", 0, 0);
  ctx.restore();
}

async function waitFonts(): Promise<void> {
  try {
    await document.fonts.ready;
  } catch {
    // continue with fallbacks
  }
}

export async function renderPagesToCanvases(input: RenderInput): Promise<HTMLCanvasElement[]> {
  await waitFonts();
  const scale = input.quality === "high" ? MM_TO_PX_PRO : MM_TO_PX_EXPORT;
  const width = Math.round(A4_WIDTH_MM * scale);
  const height = Math.round(A4_HEIGHT_MM * scale);
  const fontSizePx = Math.round(11 * (scale / (96 / 25.4))); // ~11pt
  const lineSpacingPx = input.settings.lineSpacing * (scale / (96 / 25.4));
  const margin = {
    top: input.settings.marginTop * scale,
    right: input.settings.marginRight * scale,
    bottom: input.settings.marginBottom * scale,
    left: input.settings.marginLeft * scale,
  };
  const lines = layoutText(input, fontSizePx);
  const pageCount = lines.length === 0 ? 1 : Math.max(...lines.map((l) => l.page + 1));
  const ink = INK_COLORS.find((c) => c.id === input.settings.ink)?.value ?? "#1a3a8a";
  const canvases: HTMLCanvasElement[] = [];

  for (let p = 0; p < pageCount; p += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    paintPaper(ctx, width, height, input.settings.paper, margin.left, lineSpacingPx, margin.top);
    if (input.watermark) paintWatermark(ctx, width, height);
    const pageLines = lines.filter((l) => l.page === p);
    pageLines.forEach((line, i) => {
      const x = margin.left;
      const y = margin.top + i * lineSpacingPx;
      ctx.save();
      ctx.translate(line.driftPx * (scale / 3.78), 0);
      ctx.translate(x, y);
      ctx.rotate((line.tiltDeg * Math.PI) / 180);
      ctx.globalAlpha = line.pressure;
      ctx.fillStyle = ink;
      let cx = 0;
      for (const ch of line.text) {
        const font = fontForChunk(ch, input.settings.styleId);
        ctx.font = `${fontSizePx}px ${font}`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(ch, cx, 0);
        cx += ctx.measureText(ch).width;
      }
      ctx.restore();
    });
    canvases.push(canvas);
  }
  return canvases;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode the image."));
    }, type);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportPng(input: RenderInput, basename = "writey-page"): Promise<number> {
  const canvases = await renderPagesToCanvases(input);
  if (canvases.length === 1) {
    const blob = await canvasToBlob(canvases[0]);
    downloadBlob(blob, `${basename}.png`);
    return 1;
  }
  const { zipSync, strToU8 } = await import("fflate");
  const files: Record<string, Uint8Array> = {
    "README.txt": strToU8(
      "Writey PNG export. One image per page. Multi-page exports are zipped. This is not a scan of anyone’s handwriting.\n",
    ),
  };
  for (let i = 0; i < canvases.length; i += 1) {
    const blob = await canvasToBlob(canvases[i]);
    const buf = new Uint8Array(await blob.arrayBuffer());
    files[`${basename}-page-${i + 1}.png`] = buf;
  }
  const zipped = zipSync(files);
  downloadBlob(new Blob([zipped], { type: "application/zip" }), `${basename}-pages.zip`);
  return canvases.length;
}

export async function exportPdf(input: RenderInput, basename = "writey-page"): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const canvases = await renderPagesToCanvases(input);
  const pdf = await PDFDocument.create();
  const pageWidth = A4_WIDTH_MM * 2.83465;
  const pageHeight = A4_HEIGHT_MM * 2.83465;
  for (const canvas of canvases) {
    const blob = await canvasToBlob(canvas);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const img = await pdf.embedPng(bytes);
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(img, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }
  const bytes = await pdf.save();
  // Copy into a standalone ArrayBuffer — pdf-lib may return a SharedArrayBuffer.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  downloadBlob(new Blob([copy], { type: "application/pdf" }), `${basename}.pdf`);
  return canvases.length;
}
