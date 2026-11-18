import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HANDWRITING_STYLES,
  INK_COLORS,
  styleForLanguage,
  type PaperType,
} from "@/content/handwriting";
import { PRICES, SUPPORT_EMAIL, TAX_LINE } from "@/content/site";
import { track } from "@/lib/analytics";
import { exportPdf, exportPng } from "@/lib/export";
import { layoutDocument } from "@/lib/typography";
import { DEFAULT_SETTINGS, pageCountFromLines, type EditorSettings } from "@/lib/layout";
import { useSession } from "@/hooks/useSession";
import { PaperPreview } from "@/components/PaperPreview";
import { StateDialog } from "@/components/StateDialog";
import {
  IconBlank,
  IconDraw,
  IconEditNote,
  IconGrid,
  IconImage,
  IconLanguage,
  IconLined,
  IconPdf,
  IconShield,
  IconSync,
  IconTranslate,
} from "@/components/Icons";

const PLACEHOLDER_EN = "Paste or type your text here.";
const PLACEHOLDER_HI = "यहाँ हिंदी (देवनागरी) में लिखें या चिपकाएँ। Paste or type your text here.";

type DialogKind =
  | "payments"
  | "quota-free"
  | "quota-pro"
  | "quota-jobs"
  | "quota-preview"
  | "quota-pages-per-export"
  | "pro-lock"
  | "preview-error"
  | "export-error"
  | "export-preparing"
  | null;

function parseLangFromLocation(search: string, hash: string): "en" | "hi" | null {
  const fromSearch = new URLSearchParams(search).get("lang");
  const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
  const fromHash = new URLSearchParams(hashQuery).get("lang");
  const v = fromHash || fromSearch;
  if (v === "hi" || v === "en") return v;
  return null;
}

export function Editor({ initialLanguage }: { initialLanguage?: "en" | "hi" }) {
  const location = useLocation();
  const { entitlement, consume, checkExport, checkPreview, requestCheckout, qa } = useSession();
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<EditorSettings>({
    ...DEFAULT_SETTINGS,
    language: initialLanguage ?? "en",
    styleId: styleForLanguage(initialLanguage ?? "en").id,
  });
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const lang = parseLangFromLocation(location.search, location.hash) ?? initialLanguage;
    if (lang) {
      setSettings((s) => ({
        ...s,
        language: lang,
        styleId: s.styleId === "oxford-cursive" || s.styleId === "kavya-devanagari" ? styleForLanguage(lang).id : s.styleId,
      }));
    }
  }, [location.search, location.hash, initialLanguage]);

  const pageEstimate = useMemo(() => {
    if (!text.trim()) return 1;
    return pageCountFromLines(layoutDocument(text, settings));
  }, [text, settings]);

  function setLang(language: "en" | "hi") {
    setSettings((s) => ({ ...s, language, styleId: styleForLanguage(language, s.styleId).id }));
    track("language_switched", { language });
  }

  function pickStyle(id: string, plan: "free" | "pro") {
    if (plan === "pro" && entitlement.plan_id !== "pro") {
      setDialog("pro-lock");
      return;
    }
    setSettings((s) => ({ ...s, styleId: id }));
  }

  async function handlePreview() {
    if (qa.preview === "fail") {
      setPreviewError("We could not refresh the preview. Check your connection and try again. Your text is still in the editor.");
      setDialog("preview-error");
      return;
    }
    if (qa.preview === "loading") {
      setPreviewLoading(true);
      return;
    }
    const decision = checkPreview();
    if (!decision.ok) {
      setDialog("quota-preview");
      track("quota_hit", { quota_kind: "previews", plan_id: entitlement.plan_id });
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      await new Promise((r) => setTimeout(r, 250));
      await consume("previews");
      track("preview_generated", { language: settings.language, page_count: pageEstimate, style_id: settings.styleId, paper_type: settings.paper });
      setMobileTab("preview");
    } catch {
      setPreviewError("We could not refresh the preview. Check your connection and try again. Your text is still in the editor.");
      setDialog("preview-error");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExport(kind: "pdf" | "png") {
    if (!text.trim()) return;
    if (qa.export === "fail") {
      setDialog("export-error");
      return;
    }
    const decision = checkExport(pageEstimate);
    if (!decision.ok) {
      if (decision.code === "quota_pages_pro") setDialog("quota-pro");
      else if (decision.code === "quota_pages_free") setDialog("quota-free");
      else if (decision.code === "quota_jobs") setDialog("quota-jobs");
      else setDialog("quota-pages-per-export");
      track("quota_hit", { quota_kind: decision.kind === "pages_per_export" ? "pages" : decision.kind, plan_id: entitlement.plan_id, page_count: pageEstimate });
      return;
    }
    setBusy(kind);
    setDialog("export-preparing");
    try {
      const input = {
        text,
        settings,
        watermark: entitlement.watermark,
        quality: entitlement.plan_id === "pro" ? ("high" as const) : ("standard" as const),
      };
      if (kind === "pdf") await exportPdf(input);
      else await exportPng(input);
      await consume("pages", pageEstimate);
      track(kind === "pdf" ? "export_pdf" : "export_png", {
        language: settings.language,
        output_format: kind,
        page_count: pageEstimate,
        plan_id: entitlement.plan_id,
        style_id: settings.styleId,
        paper_type: settings.paper,
      });
      setDialog(null);
    } catch {
      setDialog("export-error");
    } finally {
      setBusy(null);
    }
  }

  async function onUpgrade() {
    await requestCheckout();
    setDialog("payments");
  }

  const placeholder = settings.language === "hi" ? PLACEHOLDER_HI : PLACEHOLDER_EN;
  const selectedStyle = HANDWRITING_STYLES.find((style) => style.id === settings.styleId);
  const freeStyleCount = HANDWRITING_STYLES.filter((style) => style.plan === "free").length;
  const totalStyleCount = HANDWRITING_STYLES.length;
  const paperCaption =
    settings.paper === "lined" ? "Lined Paper" : settings.paper === "grid" ? "Grid Paper" : "Blank Paper";
  const inkLabel = INK_COLORS.find((c) => c.id === settings.ink)?.label ?? "Ink";
  const availableCaption =
    entitlement.plan_id === "pro"
      ? `${totalStyleCount} of ${totalStyleCount} styles available`
      : `${freeStyleCount} of ${totalStyleCount} styles available`;

  function onStyleSelect(id: string) {
    const style = HANDWRITING_STYLES.find((item) => item.id === id);
    if (!style) return;
    pickStyle(style.id, style.plan);
  }

  return (
    <div id="editor">
      <div className="workbench" id="workbench">
        <div className="workbench-tabs" role="tablist" aria-label="Editor views">
          <button
            type="button"
            role="tab"
            id="tab-edit"
            aria-controls="panel-edit"
            aria-selected={mobileTab === "edit"}
            className={mobileTab === "edit" ? "is-active" : undefined}
            onClick={() => setMobileTab("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            role="tab"
            id="tab-preview"
            aria-controls="panel-preview"
            aria-selected={mobileTab === "preview"}
            className={mobileTab === "preview" ? "is-active" : undefined}
            onClick={() => setMobileTab("preview")}
          >
            Preview
          </button>
        </div>

        <div className="workbench-panes">
          <section
            className={`editor-pane${mobileTab === "edit" ? " is-active" : ""}`}
            id="panel-edit"
            role="tabpanel"
            aria-labelledby="tab-edit"
          >
            <div className="pane-toolbar">
              <div className="pane-toolbar__title">
                <IconEditNote />
                <span>Edit</span>
              </div>
              <span className="live-badge">Live Rendering</span>
            </div>

            <div className="editor-body">
              <div className="field-block">
                <div className="field-row">
                  <span className="field-label" id="language-label">
                    Language
                  </span>
                </div>
                <div className="lang-toggle" role="group" aria-labelledby="language-label">
                  <button type="button" aria-pressed={settings.language === "en"} onClick={() => setLang("en")}>
                    <IconTranslate />
                    <span>English (Latin)</span>
                  </button>
                  <button type="button" aria-pressed={settings.language === "hi"} onClick={() => setLang("hi")}>
                    <IconLanguage />
                    <span>Hindi (हिन्दी)</span>
                  </button>
                </div>
              </div>

              <div className="field-block">
                <div className="field-row">
                  <label className="field-label" htmlFor="editor-input">
                    Your text
                  </label>
                  <span className="char-count">{text.length} chars</span>
                </div>
                <textarea
                  id="editor-input"
                  className="editor-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={placeholder}
                  lang={settings.language === "hi" ? "hi" : "en"}
                  rows={4}
                />
              </div>

              <div className="field-block">
                <div className="field-row">
                  <label className="field-label" htmlFor="style-select">
                    Handwriting style
                  </label>
                  <span className="style-availability">{availableCaption}</span>
                </div>
                <select
                  id="style-select"
                  className="style-select"
                  value={settings.styleId}
                  onChange={(e) => onStyleSelect(e.target.value)}
                >
                  {HANDWRITING_STYLES.map((style) => {
                    const locked = style.plan === "pro" && entitlement.plan_id !== "pro";
                    return (
                      <option key={style.id} value={style.id}>
                        {style.name} ({style.plan === "pro" ? "Pro" : "Free"}
                        {locked ? " — included with Pro" : ""})
                      </option>
                    );
                  })}
                </select>
                {selectedStyle ? (
                  <p className="licence-note">{selectedStyle.licenceLabel}</p>
                ) : null}
              </div>

              <div className="field-block">
                <div className="field-label" id="paper-label">
                  Paper
                </div>
                <div className="paper-cards" role="group" aria-labelledby="paper-label">
                  {([
                    { id: "lined" as PaperType, label: "Lined", Icon: IconLined },
                    { id: "blank" as PaperType, label: "Blank", Icon: IconBlank },
                    { id: "grid" as PaperType, label: "Grid", Icon: IconGrid },
                  ]).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className="paper-card"
                      aria-pressed={settings.paper === id}
                      onClick={() => setSettings((s) => ({ ...s, paper: id }))}
                    >
                      <Icon />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="slider-grid">
                <div className="range-row">
                  <div className="range-row__header">
                    <label htmlFor="margin">Left margin</label>
                    <span className="range-row__value">{settings.marginLeft} mm</span>
                  </div>
                  <input
                    id="margin"
                    type="range"
                    min={10}
                    max={32}
                    value={settings.marginLeft}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSettings((s) => ({
                        ...s,
                        marginLeft: v,
                        marginRight: Math.max(10, v - 4),
                        marginTop: Math.max(12, v - 2),
                        marginBottom: Math.max(12, v - 2),
                      }));
                    }}
                  />
                </div>
                <div className="range-row">
                  <div className="range-row__header">
                    <label htmlFor="spacing">Line spacing</label>
                    <span className="range-row__value">{settings.lineSpacing} px</span>
                  </div>
                  <input
                    id="spacing"
                    type="range"
                    min={26}
                    max={48}
                    value={settings.lineSpacing}
                    onChange={(e) => setSettings((s) => ({ ...s, lineSpacing: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="field-block">
                <div className="field-row">
                  <div className="field-label" id="ink-label">
                    Ink colour
                  </div>
                  <span className="ink-current">{inkLabel}</span>
                </div>
                <div className="ink-swatches" role="group" aria-labelledby="ink-label">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="ink-swatch"
                      style={{ background: c.value }}
                      aria-pressed={settings.ink === c.id}
                      aria-label={c.label}
                      title={c.label}
                      onClick={() => setSettings((s) => ({ ...s, ink: c.id }))}
                    />
                  ))}
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="variation-toggle" className="variation-toggle">
                  <input
                    id="variation-toggle"
                    type="checkbox"
                    checked={settings.variationEnabled}
                    onChange={(e) => setSettings((s) => ({ ...s, variationEnabled: e.target.checked }))}
                  />
                  <span>
                    <span className="field-label">Natural variation</span>
                    <span className="hint">
                      Adds slight tilt, ink pressure, and baseline drift so the page looks more natural. This is for appearance only. It is not a detection-avoidance tool.
                    </span>
                  </span>
                </label>
                {settings.variationEnabled ? (
                  <details className="variation-details">
                  <summary>Adjust tilt, pressure, and drift</summary>
                  <div className="variation-sliders">
                    <div className="range-row__header">
                    <label htmlFor="tilt">Tilt</label>
                    <span className="range-row__value">{settings.variation.tilt.toFixed(2)}</span>
                    </div>
                    <input
                      id="tilt"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.variation.tilt}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          variation: { ...s.variation, tilt: Number(e.target.value) },
                        }))
                      }
                    />
                    <div className="range-row__header">
                    <label htmlFor="pressure">Ink pressure</label>
                    <span className="range-row__value">{settings.variation.ink_pressure.toFixed(2)}</span>
                    </div>
                    <input
                      id="pressure"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.variation.ink_pressure}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          variation: { ...s.variation, ink_pressure: Number(e.target.value) },
                        }))
                      }
                    />
                    <div className="range-row__header">
                    <label htmlFor="drift">Drift</label>
                    <span className="range-row__value">{settings.variation.drift.toFixed(2)}</span>
                    </div>
                    <input
                      id="drift"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.variation.drift}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          variation: { ...s.variation, drift: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  </details>
                ) : null}
              </div>

              <div className="usage-card">
                <p className="usage-card__title">
                  <IconShield />
                  <span>Acceptable usage guidance</span>
                </p>
                <p>
                  Use this tool for personal notes, revision, letters, journals, and classroom examples. Do not use it for academic dishonesty. Read{" "}
                  <Link
                    to="/acceptable-use"
                    onClick={() => track("acceptable_use_clicked", { plan_id: entitlement.plan_id })}
                  >
                    Acceptable Use
                  </Link>
                  .
                </p>
              </div>

              <div className="quota-line">
                <span>{entitlement.pages_used} of {entitlement.pages_limit} export pages used this month.</span>
                <span className="quota-plan">{entitlement.plan_id === "pro" ? "Pro Plan" : "Free Plan"}</span>
              </div>
              <p className="quota-line-extra">
                {Math.max(0, entitlement.previews_limit - entitlement.previews_used_today)} of {entitlement.previews_limit} preview refreshes left today.
                {" "}
                {Math.max(0, entitlement.jobs_limit - entitlement.jobs_used_today)} of {entitlement.jobs_limit} export jobs left today.
              </p>
            </div>

            <div className="editor-actions">
              <button type="button" className="btn btn-primary" onClick={() => void handlePreview()}>
                <IconDraw />
                Live Preview
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!text.trim() || busy !== null}
                onClick={() => void handleExport("pdf")}
              >
                <IconPdf />
                Download PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!text.trim() || busy !== null}
                onClick={() => void handleExport("png")}
              >
                <IconImage />
                Download PNG
              </button>
            </div>
          </section>

          <section
            className={`preview-pane${mobileTab === "preview" ? " is-active" : ""}`}
            id="panel-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
          >
            <div className="pane-toolbar preview-toolbar">
              <div className="pane-toolbar__title">
                <span className="preview-kicker">Preview</span>
                <span className="toolbar-dot" aria-hidden="true">
                  ·
                </span>
                <span id="preview-paper-indicator">{paperCaption}</span>
                <span className="toolbar-dot" aria-hidden="true">
                  ·
                </span>
                <span>A4 (210 × 297 mm)</span>
              </div>
              <div className="preview-toolbar__tools">
                <span className="zoom-pill">100% Zoom</span>
                <button
                  type="button"
                  className="preview-sync"
                  onClick={() => void handlePreview()}
                  title="Refresh preview"
                >
                  <IconSync />
                  <span className="visually-hidden">Refresh preview</span>
                </button>
              </div>
            </div>
            <div className="preview-sheet-wrap" id="preview-sheet-wrap">
              <PaperPreview
                text={text}
                settings={settings}
                watermark={entitlement.watermark}
                loading={previewLoading || qa.preview === "loading"}
                error={previewError}
                languageLabel={settings.language === "hi" ? "Hindi" : "English"}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="workbench-notes">
        {entitlement.watermark ? (
          <p className="watermark-note">Free exports include a visible brand watermark that does not cover your text.</p>
        ) : null}
        <div className="diff-card">
          <p className="diff-statement">
            Preview and export without an account. The preview is what you get — your PDF or PNG follows this page. This is handwriting fonts and typographic layout, not a handwriting clone, and not a generative model that writes like a real person.
          </p>
        </div>
      </div>

      <StateDialog
        open={dialog === "payments"}
        title="Payments are not open yet"
        onClose={() => setDialog(null)}
        actions={
          <a className="btn btn-secondary" href={`mailto:${SUPPORT_EMAIL}`}>
            Contact support
          </a>
        }
      >
        <p>
          Payments are not open yet. We will not charge your account. You can keep using the Free plan or ask to be notified at {SUPPORT_EMAIL}.
        </p>
        <p>
          Pro is {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. Payments are not open yet. {TAX_LINE}
        </p>
        <p>
          See <Link to="/terms">Terms of Use</Link>, <Link to="/refund">Refund &amp; Cancellation</Link>, and{" "}
          <Link to="/acceptable-use">Acceptable Use</Link>.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "quota-free"}
        title="You’ve reached this month’s export limit"
        onClose={() => setDialog(null)}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => void onUpgrade()}>
            Upgrade to Pro
          </button>
        }
      >
        <p>
          You’ve used this month’s Free export pages ({PRICES.freePagesPerMonth}). You can keep editing. Upgrade to Pro for a higher monthly cap, or wait until your quota resets.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "quota-pro"}
        title="You’ve reached this month’s export limit"
        onClose={() => setDialog(null)}
        actions={
          <a className="btn btn-secondary" href={`mailto:${SUPPORT_EMAIL}`}>
            Contact support
          </a>
        }
      >
        <p>
          You’ve used this month’s Pro export pages ({PRICES.proPagesPerMonth}). You can keep editing and wait until your quota resets, or contact support. Pro is not unlimited.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "quota-jobs"}
        title="You’ve reached today’s export-job limit"
        onClose={() => setDialog(null)}
        actions={
          entitlement.plan_id !== "pro" ? (
            <button type="button" className="btn btn-primary" onClick={() => void onUpgrade()}>
              Upgrade to Pro
            </button>
          ) : undefined
        }
      >
        <p>
          Free allows up to {PRICES.freeJobsPerDay} export jobs per day. Pro allows up to {PRICES.proJobsPerDay}. Monthly page caps still apply. You can wait until tomorrow, or upgrade if you are on Free.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "quota-preview"}
        title="You’ve reached today’s preview limit"
        onClose={() => setDialog(null)}
        actions={
          entitlement.plan_id !== "pro" ? (
            <button type="button" className="btn btn-primary" onClick={() => void onUpgrade()}>
              Upgrade to Pro
            </button>
          ) : undefined
        }
      >
        <p>
          You can keep editing your text, but new preview refreshes are paused until tomorrow. Pro has a higher daily preview cap; it is not unlimited.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "quota-pages-per-export"}
        title="This document is over the per-export page limit"
        onClose={() => setDialog(null)}
        actions={
          <Link className="btn btn-secondary" to="/pricing">
            See pricing
          </Link>
        }
      >
        <p>
          Free exports can include up to {PRICES.freePagesPerPreview} pages at a time. Pro exports can include up to {PRICES.proPagesPerPreview} pages at a time. Shorten the text, or split it into more than one export.
        </p>
      </StateDialog>

      <StateDialog
        open={dialog === "pro-lock"}
        title="This option is included with Pro"
        onClose={() => setDialog(null)}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => void onUpgrade()}>
            Upgrade to Pro
          </button>
        }
      >
        <p>
          Pro adds more licensed handwriting styles, higher export quality, and no watermark. Pro is {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. Payments are not open yet. {TAX_LINE}
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => setDialog(null)}>
          Keep Free settings
        </button>
      </StateDialog>

      <StateDialog
        open={dialog === "preview-error"}
        title="Preview failed"
        onClose={() => setDialog(null)}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => { setDialog(null); void handlePreview(); }}>
            Try again
          </button>
        }
      >
        <p>We could not refresh the preview. Check your connection and try again. Your text is still in the editor.</p>
      </StateDialog>

      <StateDialog
        open={dialog === "export-error"}
        title="Export failed"
        onClose={() => setDialog(null)}
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => void handleExport("pdf")}>
              Download PDF
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void handleExport("png")}>
              Download PNG
            </button>
          </>
        }
      >
        <p>We could not create this file. No page was counted against your monthly cap for a failed job. Try again.</p>
      </StateDialog>

      <StateDialog
        open={dialog === "export-preparing"}
        title="Preparing your file…"
        onClose={() => setDialog(null)}
      >
        <p>Export queued. Preparing your file… This stays in your browser. Your source text is not uploaded for long-term storage.</p>
      </StateDialog>
    </div>
  );
}

