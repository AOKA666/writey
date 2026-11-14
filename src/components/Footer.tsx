import { Link } from "react-router-dom";
import { FOOTER_LINKS, FOOTER_OPTIONAL } from "@/content/routes";
import { SUPPORT_EMAIL, PRIVACY_EMAIL, footerYear, PENDING_MARK } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <p className="headline-md" style={{ margin: 0 }}>Writey</p>
            <p className="muted body-sm">text to handwriting converter</p>
          </div>
          <ul className="footer-links">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link to={l.href}>{l.label}</Link>
              </li>
            ))}
            {FOOTER_OPTIONAL.map((l) => (
              <li key={l.href}>
                <Link to={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="footer-meta">
          Contact: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          {" · "}
          Privacy: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
          <br />
          © {footerYear()} Writey. Operator and domain are {PENDING_MARK}.
        </p>
      </div>
    </footer>
  );
}
