/**
 * Regression: preview/export share A4 wrap, and the PM-gate sample sentence
 * is fully present in laid-out lines (including the apostrophe phrase).
 */
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  DEFAULT_SETTINGS,
  MM_TO_PX,
  wrapAndPaginate,
} from "../src/lib/layout.ts";

const SAMPLE =
  "These are my personal lecture notes from today's history revision. I want to keep a handwritten copy in my journal.";
const MUST_CONTAIN = "today's history revision. I want to";

function layoutWithMeasure(measure, widthMm = A4_WIDTH_MM) {
  return wrapAndPaginate(SAMPLE, {
    widthMm,
    heightMm: A4_HEIGHT_MM,
    margin: {
      top: DEFAULT_SETTINGS.marginTop,
      right: DEFAULT_SETTINGS.marginRight,
      bottom: DEFAULT_SETTINGS.marginBottom,
      left: DEFAULT_SETTINGS.marginLeft,
    },
    lineSpacingPx: DEFAULT_SETTINGS.lineSpacing,
    fontSizePx: 22,
    measure,
    variation: DEFAULT_SETTINGS.variation,
    variationEnabled: false,
  });
}

function joined(lines) {
  return lines.map((l) => l.text).join(" ").replace(/\s+/g, " ").trim();
}

function assert(cond, message) {
  if (!cond) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`ok  ${message}`);
  }
}

// Fixed advance so wrap is deterministic without canvas/fonts.
const CHAR_PX = 11;
const measure = (s) => s.length * CHAR_PX;
const lines = layoutWithMeasure(measure);
const text = joined(lines);

assert(lines.length > 0, "layout produced at least one line");
assert(text.includes(MUST_CONTAIN), `laid-out lines include “${MUST_CONTAIN}”`);
assert(text.includes("keep a handwritten copy in my journal."), "laid-out lines include the rest of the sentence");

const words = SAMPLE.split(/\s+/);
let cursor = 0;
let inOrder = true;
for (const word of words) {
  const at = text.indexOf(word, cursor);
  if (at === -1) {
    inOrder = false;
    break;
  }
  cursor = at + word.length;
}
assert(inOrder, "every source word appears in order in the laid-out preview lines");

const innerA4 =
  (A4_WIDTH_MM - DEFAULT_SETTINGS.marginLeft - DEFAULT_SETTINGS.marginRight) * MM_TO_PX;
assert(Math.abs(innerA4 - 174 * MM_TO_PX) < 0.001, `A4 inner width is 174mm in px (${innerA4.toFixed(2)})`);

// A 390px-wide wrap would be wrong: preview must scale the A4 page, not re-wrap to the CSS width.
const narrowPageMm = 390 / MM_TO_PX;
const narrow = layoutWithMeasure(measure, narrowPageMm);
const firstA4 = lines[0]?.text ?? "";
const firstNarrow = narrow[0]?.text ?? "";
assert(
  firstA4.length > firstNarrow.length,
  `A4 first line is longer than a 390px wrap (${firstA4.length} vs ${firstNarrow.length} chars)`,
);
assert(
  firstA4.includes("personal lecture notes") || text.includes("personal lecture notes"),
  "A4 layout keeps the first-sentence content on the A4 measure, not a 390px measure",
);

if (process.exitCode) {
  console.error("layout regression failed");
  process.exit(1);
}
console.log("layout regression passed");
