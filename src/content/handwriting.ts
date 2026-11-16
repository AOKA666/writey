/** Handwriting specimen catalogue. Faces are SIL OFL 1.1 unless noted. Dancing Script is shown as Studio Loop (Reserved Font Name). Homemade Apple is Apache License 2.0 and is shown as Orchard Script. */

export type ScriptSupport = "latin" | "devanagari" | "both";

export type LicenceLabel = "SIL OFL 1.1" | "Apache License 2.0";

export type HandwritingStyle = {
  id: string;
  name: string;
  fontFamily: string;
  script: ScriptSupport;
  plan: "free" | "pro";
  licenceLabel: LicenceLabel;
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
    id: "margin-flower",
    name: "Margin Flower",
    fontFamily: "Indie Flower, cursive",
    script: "latin",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "window-light",
    name: "Window Light",
    fontFamily: "Shadows Into Light, cursive",
    script: "latin",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "sketch-notes",
    name: "Sketch Notes",
    fontFamily: "Architects Daughter, cursive",
    script: "latin",
    plan: "free",
    licenceLabel: "SIL OFL 1.1",
  },
  {
    id: "grace-ink",
    name: "Grace Ink",
    fontFamily: "Covered By Your Grace, cursive",
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
    id: "patra-devanagari",
    name: "Patra Devanagari",
    fontFamily: "Dekko, cursive",
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
  {
    id: "orchard-script",
    name: "Orchard Script",
    fontFamily: "Homemade Apple, cursive",
    script: "latin",
    plan: "pro",
    licenceLabel: "Apache License 2.0",
  },
  {
    id: "mela-script",
    name: "Mela Script",
    fontFamily: "Amita, cursive",
    script: "devanagari",
    plan: "pro",
    licenceLabel: "SIL OFL 1.1",
  },
];

export const FREE_STYLE_COUNT = HANDWRITING_STYLES.filter((s) => s.plan === "free").length;
export const TOTAL_STYLE_COUNT = HANDWRITING_STYLES.length;
export const FREE_LATIN_COUNT = HANDWRITING_STYLES.filter((s) => s.plan === "free" && s.script === "latin").length;
export const FREE_DEVANAGARI_COUNT = HANDWRITING_STYLES.filter((s) => s.plan === "free" && s.script === "devanagari").length;

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
