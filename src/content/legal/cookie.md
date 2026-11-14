# Cookie Policy

**Draft for review. This page is a product policy draft, not a legal opinion.**

- Service: Writey
- Website: `https://text2handwriting.site`
- Related policy: [Privacy Policy](/privacy)
- Last updated: 14 November 2026 (draft; first-party essential cookie inventory updated)
- Effective date: 【PENDING CONFIRMATION】

## 1. What this policy covers

This page explains how Writey uses cookies and similar technologies (such as local storage or a signed session token) on `https://text2handwriting.site`. It should be read with the Privacy Policy.

The first-party essential cookies named in section 3 (`writey_guest` and `writey_session`) match the current implementation. Names, lifetimes, and vendors for any additional cookies — including analytics, payment-return, and CAPTCHA or other security cookies, if any — remain 【PENDING CONFIRMATION】 because the final stack and vendors are not all chosen. Do not describe analytics, payment, or third-party security cookies as already in use until a provider is confirmed.

## 2. How we use cookies

### 2.1 Essential cookies (required)

These are necessary for the site to work and to provide the service you asked for. We use them to:

- Keep a session or signed-in state (`AUTH_SECRET` is a server secret name only; it is not a cookie value published here).
- Remember guest Free-quota usage, on a best-effort basis, so limits cannot be reset just by refreshing the page.
- Support security features (for example, a CSRF token, or a short-lived challenge if abuse protection is enabled).
- Complete a payment return or show the correct plan after checkout, once a payment provider is connected.
- Store basic editor preferences on the device if we do that locally (language or last style), where needed for the tool to function.

You can block cookies in your browser, but essential cookies may be required for preview, export, quota, or login to work.

### 2.2 Analytics cookies (non-essential, only if enabled)

We may use a product-analytics tool to record the following events: `preview_generated`, `export_pdf`, `export_png`, `language_switched`, `quota_hit`, `acceptable_use_clicked`. Those events must not include your full source text.

The provider (for example a GA4-equivalent measurement ID such as `ANALYTICS_MEASUREMENT_ID`) is 【PENDING CONFIRMATION】. Until a provider is enabled, we do not claim that analytics cookies are already in use, and we do not invent a vendor name as if it were live.

If analytics is enabled:

- These cookies are not essential.
- We will provide a clear choice (for example a banner or an equivalent control) before setting non-essential analytics cookies, unless a confirmed legal review says a different approach is required 【PENDING CONFIRMATION】.
- You will be able to refuse or later withdraw that choice, and we will honour a reasonable browser-based opt-out where technically feasible.

### 2.3 What we do not currently plan to use

We do not currently plan advertising, retargeting, or social-pixel cookies for the MVP. If that changes, this Policy and the Privacy Policy will be updated first. We will not silently add a marketing pixel.

## 3. Cookie inventory

The rows for `writey_guest` and `writey_session` describe first-party essential cookies in the current implementation. Other rows remain 【PENDING CONFIRMATION】 until the relevant vendor or cookie is actually used.

| Category | Name | Provider | Purpose | Duration | Essential? |
|---|---|---|---|---|---|
| Guest quota / guest session | `writey_guest` | Writey (first-party) | Identify a guest visitor and enforce Free preview and export limits on a best-effort basis | 180 days (Max-Age=15552000). HttpOnly; Secure; SameSite=Lax; Path=/ | Yes |
| Session / auth | `writey_session` | Writey (first-party) | Keep you signed in or restore a signed-in session after login or registration; removed on logout | 30 days (Max-Age=2592000). HttpOnly; Secure; SameSite=Lax; Path=/ | Yes |
| Security | 【PENDING CONFIRMATION】 | Writey and, if used, a CAPTCHA provider 【PENDING CONFIRMATION】 | Abuse and request integrity | Session or short-lived | Yes |
| Payment return | 【PENDING CONFIRMATION】 | Payment provider 【PENDING CONFIRMATION】 | Complete checkout | Short-lived | Yes, when paying |
| Analytics | 【PENDING CONFIRMATION】 | Analytics provider 【PENDING CONFIRMATION】 | Product measurement | 【PENDING CONFIRMATION】 | No |

Third-party vendors may set their own cookies on their checkout, authentication, or challenge pages. Those cookies are governed by the vendor’s policy.

## 4. Your choices

- Browser settings: you can delete or block cookies. Blocking essential cookies may break login, quota, or export.
- Analytics choice: once analytics is enabled, use the on-site control described above, if shown, or the provider’s own opt-out where available.
- “Do Not Track” and similar signals: how we honour them is 【PENDING CONFIRMATION】 pending the final analytics setup.
- For other privacy requests, see the Privacy Policy or write to `privacy@text2handwriting.site`.

## 5. Changes

We will update this page when cookie names, vendors, or purposes change. The “Last updated” date will be revised.

## 6. Contact

- Privacy: `privacy@text2handwriting.site`
- Operator: `[LEGAL_ENTITY]` 【PENDING CONFIRMATION】
