import { useSession } from "@/hooks/useSession";
import { isQaBuildEnabled, qaSearch, readQaState, shouldShowQaControls } from "@/lib/qa";
import type { PlanId } from "@/lib/quota";
import { useNavigate, useLocation } from "react-router-dom";

/** Clearly labeled preview-only controls for QA. Not a product feature. */
export function QaControls() {
  const { setPlanForQa, forceQuotaExhausted } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const qaFromUrl = readQaState(location.search, location.hash);

  if (!isQaBuildEnabled() || !shouldShowQaControls(qaFromUrl)) return null;

  function go(partial: Parameters<typeof qaSearch>[0]) {
    const search = qaSearch({ enabled: true, ...partial });
    navigate({ pathname: location.pathname, search, hash: location.hash });
  }

  return (
    <details className="qa-panel" open={qaFromUrl.enabled}>
      <summary>Preview only — QA controls (not a product feature)</summary>
      <p className="hint">
        Use these to demonstrate quota, payments-closed, and error states. Query flags:{" "}
        <code>?qa=1</code>, <code>qa_plan=free|pro|guest_free</code>, <code>qa_quota=exhausted</code>,{" "}
        <code>qa_preview=fail|loading</code>, <code>qa_export=fail</code>.
      </p>
      <div className="qa-controls">
        {(["guest_free", "free", "pro"] as PlanId[]).map((plan) => (
          <button
            key={plan}
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setPlanForQa(plan);
              go({ plan });
            }}
          >
            Plan: {plan}
          </button>
        ))}
        <button type="button" className="btn btn-secondary" onClick={() => { forceQuotaExhausted(true); go({ quota: "exhausted" }); }}>
          Exhaust quota
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => { forceQuotaExhausted(false); go({ quota: "ok" }); }}>
          Reset quota
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go({ preview: "fail" })}>
          Fail next preview
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go({ preview: "loading" })}>
          Preview loading
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go({ export: "fail" })}>
          Fail next export
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate({ pathname: location.pathname, search: qaSearch({ enabled: false }), hash: location.hash })}
        >
          Clear QA flags
        </button>
      </div>
    </details>
  );
}
