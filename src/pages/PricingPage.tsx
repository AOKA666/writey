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
          <p className="pending">{PRICE_STATUS_SENTENCE}</p>
        </div>

        <section className="section desk-well">
          <h2>Who these plans are for</h2>
          <p className="prose-muted">
            Writey is for people who want to turn typed or pasted English or Hindi text into handwriting-style pages for personal notes, revision, letters, journals, accessibility needs, or classroom examples.
          </p>
        </section>

        <div className="plan-cards section">
          <article className="desk-well">
            <h2>Free plan</h2>
            <p className="plan-price">{PRICES.free}, USD</p>
            <ul className="list-plain">
              <li>{PRICES.freePagesPerMonth} export pages per calendar month <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>Visible brand watermark that does not cover your text</li>
              <li>Standard export quality <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>[FREE_STYLE_COUNT] basic styles, including usable Latin and Devanagari handwriting styles. 【PENDING CONFIRMATION】</li>
              <li>PDF and PNG export</li>
              <li>Up to {PRICES.freePreviewPerDay} preview refreshes per day, and up to {PRICES.freePagesPerPreview} pages per preview <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>Up to {PRICES.freeJobsPerDay} export jobs per day, still limited by the monthly page cap <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>Saved export history is not currently provided. 【PENDING CONFIRMATION】</li>
              <li>Core path works without an account; sign in to keep quota across days</li>
            </ul>
            <Link className="btn btn-primary" to="/#editor" style={{ marginTop: "1rem" }}>
              Start free
            </Link>
          </article>
          <article className="desk-well">
            <h2>Pro plan</h2>
            <p className="plan-price">
              {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD <span className="pending">【PENDING CONFIRMATION】</span>
            </p>
            <ul className="list-plain">
              <li>{PRICES.proPagesPerMonth} export pages per calendar month <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>No watermark</li>
              <li>Higher export quality <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>All licensed MVP styles (total count 【PENDING CONFIRMATION】; does not include handwriting cloning)</li>
              <li>PDF and PNG export</li>
              <li>Up to {PRICES.proPreviewPerDay} preview refreshes per day, and up to {PRICES.proPagesPerPreview} pages per preview <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>Up to {PRICES.proJobsPerDay} export jobs per day, still limited by the monthly page cap <span className="pending">【PENDING CONFIRMATION】</span></li>
              <li>Saved export history is not currently provided. 【PENDING CONFIRMATION】</li>
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

        <section className="section desk-well">
          <h2>Plan comparison</h2>
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
                  <td>{PRICES.proMonthly} / month or {PRICES.proYearly} / year <span className="pending">【PENDING CONFIRMATION】</span></td>
                </tr>
                <tr>
                  <td>Currency</td>
                  <td>USD</td>
                  <td>USD; payment rail <span className="pending">【PENDING CONFIRMATION】</span></td>
                </tr>
                <tr>
                  <td>Export pages / month</td>
                  <td>{PRICES.freePagesPerMonth} <span className="pending">【PENDING CONFIRMATION】</span></td>
                  <td>{PRICES.proPagesPerMonth} <span className="pending">【PENDING CONFIRMATION】</span></td>
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
                  <td>Standard <span className="pending">【PENDING CONFIRMATION】</span></td>
                  <td>Higher export quality <span className="pending">【PENDING CONFIRMATION】</span></td>
                </tr>
                <tr>
                  <td>Styles</td>
                  <td>[FREE_STYLE_COUNT] basic styles, including usable Latin and Devanagari handwriting styles. 【PENDING CONFIRMATION】</td>
                  <td>All licensed MVP styles (total count 【PENDING CONFIRMATION】; does not include handwriting cloning)</td>
                </tr>
                <tr>
                  <td>Preview</td>
                  <td>Up to {PRICES.freePreviewPerDay} refreshes / day; up to {PRICES.freePagesPerPreview} pages per preview <span className="pending">【PENDING CONFIRMATION】</span></td>
                  <td>Up to {PRICES.proPreviewPerDay} refreshes / day; up to {PRICES.proPagesPerPreview} pages per preview <span className="pending">【PENDING CONFIRMATION】</span></td>
                </tr>
                <tr>
                  <td>Daily export jobs</td>
                  <td>Up to {PRICES.freeJobsPerDay}, still limited by the monthly page cap <span className="pending">【PENDING CONFIRMATION】</span></td>
                  <td>Up to {PRICES.proJobsPerDay}, still limited by the monthly page cap <span className="pending">【PENDING CONFIRMATION】</span></td>
                </tr>
                <tr>
                  <td>History</td>
                  <td>Saved export history is not currently provided. 【PENDING CONFIRMATION】</td>
                  <td>Saved export history is not currently provided. 【PENDING CONFIRMATION】</td>
                </tr>
                <tr>
                  <td>Login</td>
                  <td>Core path works without an account; sign in to keep quota across days</td>
                  <td>Account required for billing and quota</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section desk-well">
          <h2>What is not included</h2>
          <ul className="list-plain">
            <li>No Lifetime plan in this MVP</li>
            <li>No immediate purchase of Business, Teams, or Education</li>
            <li>No detection-avoidance features</li>
            <li>No handwriting cloning, high-quality maths or tables, or extra Indian languages beyond Hindi in the MVP</li>
            <li>No unlimited preview or unlimited export promise</li>
          </ul>
          <p className="prose-muted">We do not sell detection-avoidance features, exam-season passes, or a Lifetime plan.</p>
        </section>

        <section className="section desk-well">
          <h2>Taxes, refunds, and payments</h2>
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
        </section>

        <section className="section desk-well">
          <h2>Teams and Education</h2>
          <p className="prose-muted">
            If you need Teams or Education access, join the waitlist or contact us. This is not a paid plan in the MVP and has no public price.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => { setWaitlistOk(false); setWaitlistOpen(true); }}>
            Join the waitlist
          </button>
        </section>

        <section className="section desk-well">
          <h2>Pricing questions</h2>
          {PRICING_FAQ.map((item) => (
            <div className="faq-item" key={item.id}>
              <h3 className="q">{item.question}</h3>
              <p className="muted">{item.answer}</p>
            </div>
          ))}
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
        <p>Recommended price: {PRICES.proMonthly} / month or {PRICES.proYearly} / year, USD. 【PENDING CONFIRMATION】 {TAX_LINE}</p>
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
              Teams and Education access is not a paid plan in this MVP and has no public price. Join the waitlist and we will contact you.
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
