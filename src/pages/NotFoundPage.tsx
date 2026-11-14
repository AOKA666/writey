import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { FOOTER_LINKS } from "@/content/routes";

export function NotFoundPage() {
  return (
    <>
      <Seo path="/404" />
      <Header />
      <main id="main" className="page-wrap">
        <div className="not-found">
          <h1 className="display-md">Page not found</h1>
          <p className="lede">
            This page is not available. You can go back to the text to handwriting converter, or open Pricing, FAQ, or Acceptable Use.
          </p>
          <div className="btn-row" style={{ margin: "1.25rem 0" }}>
            <Link className="btn btn-primary" to="/">Back to the converter</Link>
            <Link className="btn btn-secondary" to="/pricing">Pricing</Link>
            <Link className="btn btn-secondary" to="/faq">FAQ</Link>
            <Link className="btn btn-secondary" to="/acceptable-use">Acceptable Use</Link>
          </div>
          <p className="muted">Legal pages:</p>
          <ul className="footer-links">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link to={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
