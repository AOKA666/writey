import { useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { StateDialog } from "@/components/StateDialog";
import { PRICING_FAQ } from "@/content/faq";
import { PRICE_STATUS_SENTENCE, PRICES, SUPPORT_EMAIL, TAX_LINE } from "@/content/site";
import { joinWaitlist } from "@/lib/api";
import { pricingJsonLd } from "@/lib/schema";
import { useSession } from "@/hooks/useSession";

export function PricingPage() {
  const { requestCheckout } = useSession();
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistOk, setWaitlistOk] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", organisation: "", message: "" });

  return (
    <>
      <Seo path="/pricing" jsonLd={pricingJsonLd()} />
      <Header />
      <main id="main" className="page-wrap">
        <div className="hero-block">
          <h1 className="display-md">Pricing</h1>
          <p className="lede">
            Start with a useful Free allowance. Upgrade to Pro for more pages, more handwriting styles, higher export quality, and no watermark.
          </p>
          <p className="prose-muted">{PRICE_STATUS_SENTENCE} {TAX_LINE}</p>
        </div>

        <section className="section copy-card-section">
          <div className="copy-stack-block">
            <h2>Who these plans are for</h2>
            <p className="prose-muted">
              Writey is for people who want to turn typed or pasted English or Hindi text into handwriting-style pages for personal notes, revision, letters, journals, accessibility needs, or classroom examples.
            </p>
          </div>
          <div className="plan-cards">
            <article className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h2>Free plan</h2>
              <p className="plan-price">{PRICES.free}, USD</p>
              <ul className="list-plain">
                <li>{PRICES.freePagesPerMonth} export pages per calendar month</li>
                <li>Visible brand watermark that does not cover your text</li>
                <li>Standard export quality</li>
                <li>11 basic styles, including usable Latin and Devanagari handwriting styles</li>
                <li>PDF and PNG export</li>
                <li>Up to {PRICES.freePreviewPerDay} preview refreshes per day, and up to {PRICES.freePagesPerPreview} pages per preview</li>
                <li>Up to {PRICES.freeJobsPerDay} export jobs per day, still limited by the monthly page cap</li>
                <li>Saved export history is not currently provided.</li>
                <li>Core path works without an account; sign in to keep quota across days</li>
              </ul>
              <Link className="btn btn-primary" to="/#editor" style={{ marginTop: "1rem" }}>
                Start free
              </Link>
            </article>
            <article className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
              <h2>Pro plan</h2>
              <p className="plan-price">
                {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD
              </p>
              <ul className="list-plain">
                <li>{PRICES.proPagesPerMonth} export pages per calendar month</li>
                <li>No watermark</li>
                <li>Higher export quality</li>
                <li>All 15 licensed styles (the 11 Free styles plus 4 Pro styles; does not include handwriting cloning)</li>
                <li>PDF and PNG export</li>
                <li>Up to {PRICES.proPreviewPerDay} preview refreshes per day, and up to {PRICES.proPagesPerPreview} pages per preview</li>
                <li>Up to {PRICES.proJobsPerDay} export jobs per day, still limited by the monthly page cap</li>
                <li>Saved export history is not currently provided.</li>
                <li>Account required for billing and quota</li>
              </ul>
              <p className="prose-muted">
                Neither plan is unlimited. After you reach a cap, wait for the quota to reset or contact support.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={async () => {
                  await requestCheckout();
                  setPaymentsOpen(true);
                }}
              >
                Upgrade to Pro
              </button>
            </article>
          </div>
        </section>

        <section className="section copy-card-section">
          <h2>Plan comparison</h2>
          <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Free</th>
                    <th>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Display price</td>
                    <td>{PRICES.free}</td>
                    <td>{PRICES.proMonthly} / month or {PRICES.proYearly} / year</td>
                  </tr>
                  <tr>
                    <td>Currency</td>
                    <td>USD</td>
                    <td>USD</td>
                  </tr>
                  <tr>
                    <td>Export pages / month</td>
                    <td>{PRICES.freePagesPerMonth}</td>
                    <td>{PRICES.proPagesPerMonth}</td>
                  </tr>
                  <tr>
                    <td>Watermark</td>
                    <td>Visible brand watermark that does not cover your text</td>
                    <td>No watermark</td>
                  </tr>
                  <tr>
                    <td>Export formats</td>
                    <td>PDF, PNG</td>
                    <td>PDF, PNG</td>
                  </tr>
                  <tr>
                    <td>Export quality</td>
                    <td>Standard</td>
                    <td>Higher export quality</td>
                  </tr>
                  <tr>
                    <td>Styles</td>
                    <td>11 basic styles, including usable Latin and Devanagari handwriting styles</td>
                    <td>All 15 licensed styles (the 11 Free styles plus 4 Pro styles; does not include handwriting cloning)</td>
                  </tr>
                  <tr>
                    <td>Preview</td>
                    <td>Up to {PRICES.freePreviewPerDay} refreshes / day; up to {PRICES.freePagesPerPreview} pages per preview</td>
                    <td>Up to {PRICES.proPreviewPerDay} refreshes / day; up to {PRICES.proPagesPerPreview} pages per preview</td>
                  </tr>
                  <tr>
                    <td>Daily export jobs</td>
                    <td>Up to {PRICES.freeJobsPerDay}, still limited by the monthly page cap</td>
                    <td>Up to {PRICES.proJobsPerDay}, still limited by the monthly page cap</td>
                  </tr>
                  <tr>
                    <td>History</td>
                    <td>Saved export history is not currently provided.</td>
                    <td>Saved export history is not currently provided.</td>
                  </tr>
                  <tr>
                    <td>Login</td>
                    <td>Core path works without an account; sign in to keep quota across days</td>
                    <td>Account required for billing and quota</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section copy-card-section">
          <h2>What is not included</h2>
          <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <ul className="list-plain">
              <li>No Lifetime plan</li>
              <li>No immediate purchase of Business, Teams, or Education</li>
              <li>No detection-avoidance features</li>
              <li>No handwriting cloning, high-quality maths or tables, or languages beyond Hindi</li>
              <li>No unlimited preview or unlimited export promise</li>
            </ul>
            <p className="prose-muted">We do not sell detection-avoidance features, exam-season passes, or a Lifetime plan.</p>
          </div>
        </section>

        <section className="section copy-card-section">
          <h2>Taxes, refunds, and payments</h2>
          <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <p className="prose-muted">{TAX_LINE}</p>
            <p className="prose-muted">
              Payments will be processed by a third-party provider, to be confirmed. We do not name a payment vendor as if it were already contracted.
            </p>
            <p className="prose-muted">
              Refund requests are handled under our Refund Policy. The commercial window is still being confirmed. This draft does not take away rights that applicable law says you cannot give up.
            </p>
            <p className="prose-muted">
              See <Link to="/terms">Terms of Use</Link> and <Link to="/refund">Refund &amp; Cancellation Policy</Link>. Also read{" "}
              <Link to="/acceptable-use">Acceptable Use</Link>.
            </p>
          </div>
        </section>

        <section className="section copy-card-section">
          <h2>Teams and Education</h2>
          <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-8">
            <p className="prose-muted">
              If you need Teams or Education access, join the waitlist or contact us. This is not a paid plan and has no public price.
            </p>
            <button type="button" className="btn btn-secondary" onClick={() => { setWaitlistOk(false); setWaitlistOpen(true); }}>
              Join the waitlist
            </button>
          </div>
        </section>

        <section className="section copy-card-section">
          <h2>Pricing questions</h2>
          <div className="home-faq-list">
            {PRICING_FAQ.map((item) => (
              <div className="copy-card copy-card--sheet copy-card--inset copy-card--pad-6 faq-item" key={item.id}>
                <h3 className="q">{item.question}</h3>
                <p className="muted">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <Link className="btn btn-primary" to="/#editor">Start free</Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                await requestCheckout();
                setPaymentsOpen(true);
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        </section>
      </main>
      <Footer />

      <StateDialog
        open={paymentsOpen}
        title="Payments are not open yet"
        onClose={() => setPaymentsOpen(false)}
        actions={
          <>
            <Link className="btn btn-primary" to="/#editor">Back to the editor</Link>
            <a className="btn btn-secondary" href={`mailto:${SUPPORT_EMAIL}`}>Contact support</a>
          </>
        }
      >
        <p>
          Payments are not open yet. We will not charge your account. You can keep using the Free plan or ask to be notified at {SUPPORT_EMAIL}.
        </p>
        <p>Pro is {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. Payments are not open yet. {TAX_LINE}</p>
        <p>
          See <Link to="/terms">Terms of Use</Link>, <Link to="/refund">Refund &amp; Cancellation</Link>, and{" "}
          <Link to="/acceptable-use">Acceptable Use</Link>.
        </p>
      </StateDialog>

      <StateDialog
        open={waitlistOpen}
        title="Join the waitlist"
        onClose={() => setWaitlistOpen(false)}
      >
        {waitlistOk ? (
          <p>Thanks. We received your request and will contact you. This is not a purchase, and no plan was started.</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await joinWaitlist({
                kind: "teams_education",
                name: form.name,
                email: form.email,
                organisation: form.organisation,
                message: form.message,
              });
              setWaitlistOk(true);
            }}
          >
            <p className="muted">
              Teams and Education access is not a paid plan and has no public price. Join the waitlist and we will contact you.
            </p>
            <div className="field">
              <label htmlFor="wl-name">Name</label>
              <input id="wl-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="wl-email">Email</label>
              <input id="wl-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="wl-org">Organisation (optional)</label>
              <input id="wl-org" value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="wl-msg">Message</label>
              <textarea id="wl-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Join the waitlist</button>
          </form>
        )}
      </StateDialog>
    </>
  );
}
