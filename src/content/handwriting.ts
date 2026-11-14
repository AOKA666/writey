/** Handwriting specimen catalogue. Faces are licensed under SIL OFL 1.1. Dancing Script is shown as Studio Loop (Reserved Font Name). */

export type ScriptSupport = "latin" | "devanagari" | "both";

export type HandwritingStyle = {
  id: string;
  name: string;
  fontFamily: string;
  script: ScriptSupport;
  plan: "free" | "pro";
  licenceLabel: "SIL OFL 1.1";
};

export const HANDWRITING_STYLES: HandwritingStyle[] = [
  {
    id: "oxford-cursive",
    name: "Oxford Cursive",
    fontFamily: "Caveat, cursive",
    script: "latin",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "drafting-script",
    name: "Drafting Script",
    fontFamily: "Patrick Hand, cursive",
    script: "latin",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "kavya-devanagari",
    name: "Kavya Devanagari",
    fontFamily: "Kalam, cursive",
    script: "devanagari",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "studio-loop",
    name: "Studio Loop",
    fontFamily: "Dancing Script, cursive",
    script: "latin",
    plan: "pro",
    licenceLabel: "SIL OFL 1.1",
  },
];

export const DEVANAGARI_FONT = "Kalam, cursive";
export const LATIN_FALLBACK_FONT = "Caveat, cursive";

export type PaperType = "lined" | "blank" | "grid";
export type InkColorId = "blue" | "black" | "navy";

export const INK_COLORS: { id: InkColorId; label: string; value: string }[] = [
  { id: "blue", label: "Blue", value: "#1a3a8a" },
  { id: "black", label: "Black", value: "#1a1917" },
  { id: "navy", label: "Navy", value: "#173044" },
];

export type AestheticVariation = {
  tilt: number;
  ink_pressure: number;
  drift: number;
};

export const DEFAULT_VARIATION: AestheticVariation = {
  tilt: 0.45,
  ink_pressure: 0.5,
  drift: 0.4,
};

/** Fields that must never appear on aesthetic_variation or any API payload. */
export const FORBIDDEN_VARIATION_KEYS = [
  "error_rate",
  "anti_copy",
  "scan_shadow",
  "coffee_stain",
] as const;

export function styleForLanguage(
  language: "en" | "hi",
  preferredId?: string,
): HandwritingStyle {
  if (preferredId) {
    const found = HANDWRITING_STYLES.find((s) => s.id === preferredId);
    if (found) return found;
  }
  return language === "hi"
    ? HANDWRITING_STYLES.find((s) => s.id === "kavya-devanagari")!
    : HANDWRITING_STYLES.find((s) => s.id === "oxford-cursive")!;
}
