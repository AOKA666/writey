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
import { exportPdf, exportPng, layoutText } from "@/lib/export";
import { DEFAULT_SETTINGS, pageCountFromLines, type EditorSettings } from "@/lib/layout";
import { useSession } from "@/hooks/useSession";
import { PaperPreview } from "@/components/PaperPreview";
import { StateDialog } from "@/components/StateDialog";
import { IconLock } from "@/components/Icons";

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
    const lines = layoutText(
      {
        text,
        settings,
        watermark: entitlement.watermark,
        quality: "standard",
      },
      22,
    );
    return pageCountFromLines(lines);
  }, [text, settings, entitlement.watermark]);

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

  return (
    <div id="editor">
      <div className="editor-grid">
        <div className="desk-well">
          <div className="editor-top">
            <label className="field-label" htmlFor="editor-input">
              Your text
            </label>
            <div className="lang-toggle" role="group" aria-label="Language">
              <button type="button" aria-pressed={settings.language === "en"} onClick={() => setLang("en")}>
                English
              </button>
              <button type="button" aria-pressed={settings.language === "hi"} onClick={() => setLang("hi")}>
                Hindi
              </button>
            </div>
          </div>
          <textarea
            id="editor-input"
            className="editor-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            lang={settings.language === "hi" ? "hi" : "en"}
          />
          <div className="control-grid">
            <div>
              <div className="style-list-label" id="style-label">
                Handwriting style
              </div>
              <div role="listbox" aria-labelledby="style-label">
                {HANDWRITING_STYLES.map((style) => {
                  const locked = style.plan === "pro" && entitlement.plan_id !== "pro";
                  return (
                    <button
                      type="button"
                      key={style.id}
                      className={`style-option${locked ? " is-locked" : ""}`}
                      aria-pressed={settings.styleId === style.id}
                      onClick={() => pickStyle(style.id, style.plan)}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {locked ? <IconLock /> : <span className={`dot${settings.styleId === style.id ? " is-on" : ""}`} />}
                        {style.name}
                      </span>
                      <span className="licence-tag">[Pending commercial licence]</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="style-list-label" id="paper-label">
                Paper
              </div>
              <div className="seg" role="group" aria-labelledby="paper-label">
                {(["lined", "blank", "grid"] as PaperType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={settings.paper === p}
                    onClick={() => setSettings((s) => ({ ...s, paper: p }))}
                  >
                    {p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div className="style-list-label" style={{ marginTop: "0.85rem" }} id="ink-label">
                Ink colour
              </div>
              <div className="seg" role="group" aria-labelledby="ink-label">
                {INK_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={settings.ink === c.id}
                    onClick={() => setSettings((s) => ({ ...s, ink: c.id }))}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="range-row">
              <label htmlFor="margin">
                Margins <span className="muted">({settings.marginLeft} mm)</span>
              </label>
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
              <label htmlFor="spacing">
                Line spacing <span className="muted">({settings.lineSpacing} px)</span>
              </label>
              <input
                id="spacing"
                type="range"
                min={22}
                max={40}
                value={settings.lineSpacing}
                onChange={(e) => setSettings((s) => ({ ...s, lineSpacing: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label htmlFor="variation-toggle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id="variation-toggle"
                  type="checkbox"
                  checked={settings.variationEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, variationEnabled: e.target.checked }))}
                />
                Natural variation
              </label>
              <p className="hint">
                Adds slight tilt, ink pressure, and baseline drift so the page looks more natural. This is for appearance only. It is not a detection-avoidance tool.
              </p>
              {settings.variationEnabled ? (
                <>
                  <label htmlFor="tilt">
                    Tilt <span className="muted">({settings.variation.tilt.toFixed(2)})</span>
                  </label>
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
                  <label htmlFor="pressure">
                    Ink pressure <span className="muted">({settings.variation.ink_pressure.toFixed(2)})</span>
                  </label>
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
                  <label htmlFor="drift">
                    Drift <span className="muted">({settings.variation.drift.toFixed(2)})</span>
                  </label>
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
                </>
              ) : null}
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: "1.1rem" }}>
            <button type="button" className="btn btn-secondary" onClick={() => void handlePreview()}>
              Preview
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!text.trim() || busy !== null}
              onClick={() => void handleExport("pdf")}
            >
              Download PDF
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!text.trim() || busy !== null}
              onClick={() => void handleExport("png")}
            >
              Download PNG
            </button>
          </div>
          <p className="microcopy">
            <span aria-hidden="true">✦</span>
            <span>
              Use this tool for personal notes, revision, letters, journals, and classroom examples. Do not use it for academic dishonesty. Read{" "}
              <Link
                to="/acceptable-use"
                onClick={() => track("acceptable_use_clicked", { plan_id: entitlement.plan_id })}
              >
                Acceptable Use
              </Link>
              .
            </span>
          </p>
          {entitlement.watermark ? (
            <p className="watermark-note">Free exports include a visible brand watermark that does not cover your text.</p>
          ) : null}
          <p className="quota-line">
            {entitlement.pages_used} of {entitlement.pages_limit} export pages used this month. Limits depend on your plan.
            {" "}
            <span className="pending">[待确认]</span>
          </p>
        </div>
        <div>
          <PaperPreview
            text={text}
            settings={settings}
            watermark={entitlement.watermark}
            loading={previewLoading || qa.preview === "loading"}
            error={previewError}
            languageLabel={settings.language === "hi" ? "Hindi" : "English"}
          />
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
          Recommended price: {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. [待确认] {TAX_LINE}
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
          You’ve used this month’s Free export pages ({PRICES.freePagesPerMonth}). [待确认] You can keep editing. Upgrade to Pro for a higher monthly cap, or wait until your quota resets.
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
          You’ve used this month’s Pro export pages ({PRICES.proPagesPerMonth}). [待确认] You can keep editing and wait until your quota resets, or contact support. Pro is not unlimited.
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
          Free allows up to {PRICES.freeJobsPerDay} export jobs per day. Pro allows up to {PRICES.proJobsPerDay}. [待确认] Monthly page caps still apply. You can wait until tomorrow, or upgrade if you are on Free.
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
          You can keep editing your text, but new preview refreshes are paused until tomorrow. Pro has a higher daily preview cap; it is not unlimited. [待确认]
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
          Free exports can include up to {PRICES.freePagesPerPreview} pages at a time. Pro exports can include up to {PRICES.proPagesPerPreview} pages at a time. [待确认] Shorten the text, or split it into more than one export.
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
          Pro adds more licensed handwriting styles, higher export quality, and no watermark. Recommended price: {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. [待确认] {TAX_LINE}
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

