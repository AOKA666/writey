import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PRIMARY_NAV } from "@/content/routes";
import { PRICES } from "@/content/site";
import { IconMenu, IconClose, IconPen } from "@/components/Icons";
import { useSession } from "@/hooks/useSession";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { entitlement, logoutUser } = useSession();

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-header__inner">
        <Link className="brand" to="/" onClick={close}>
          <IconPen />
          <span>Writey</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary">
          {PRIMARY_NAV.map((item) =>
            item.href.startsWith("/#") ? (
              <Link
                key={item.href}
                to={item.href}
                className={location.pathname === "/" && location.hash.startsWith("#editor") ? "is-active" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="header-actions">
          {entitlement.signed_in ? (
            <>
              <span className="header-quiet">{entitlement.email}</span>
              <button type="button" className="header-quiet-action" onClick={() => void logoutUser()}>
                Log out
              </button>
            </>
          ) : (
            <p className="header-quiet">Accounts are not open yet.</p>
          )}
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
            <span className="visually-hidden">Menu</span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" className="mobile-nav" hidden={!open} aria-label="Mobile">
        {PRIMARY_NAV.map((item) => (
          <Link key={item.href} to={item.href} onClick={close}>
            {item.label}
          </Link>
        ))}
        {entitlement.signed_in ? (
          <button type="button" className="linkish" onClick={() => { close(); void logoutUser(); }}>
            Log out
          </button>
        ) : (
          <p className="header-quiet header-quiet--mobile">Accounts are not open yet. Payments are not open yet.</p>
        )}
      </nav>
      <div className="site-header__notice">
        <p>
          Accounts are not open yet — full preview and {PRICES.freePagesPerMonth} Free export pages available immediately without signing in. Payments are not open yet.
        </p>
      </div>
    </header>
  );
}
