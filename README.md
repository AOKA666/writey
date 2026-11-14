# Writey

India-facing text to handwriting converter (MVP preview). Paste English or Hindi (Devanagari) text, preview a handwriting-style page, and export PDF or PNG.

This repository is the stage 07 frontend plus a preview-grade stage 08 backend. The visual source is the Stitch **Ink Desk** design. Marketing sentences come from the frozen copy pack. Legal page bodies are the compliance markdown drafts.

The Cloudflare-first stack (Pages/Workers + D1) is implemented but still **[待确认]**. There is no custom domain, no live payment provider, and no invented hostname such as `writey.app`.

## What’s in the box

- Indexable routes: `/`, `/hindi`, `/pricing`, `/faq`, `/privacy`, `/terms`, `/cookie`, `/refund`, `/acceptable-use`
- Account routes (noindex): `/login`, `/register`
- Edge 308 legal aliases, 301 product synonyms, and 301 for accidental assignment/exam paths
- Custom 404 that links home and `/refund`
- `/robots.txt` and `/sitemap.xml` (production sitemap and canonicals only when `SITE_URL` is a confirmed production origin; preview is noindex and the sitemap is an empty urlset)
- Client-side preview and PDF/PNG export (Free watermark; source text is not stored)
- Preview-grade session/quota API on a Worker + D1, with a frontend fallback if D1 is absent
- Payments endpoints always return `payments_closed`

## Develop

```bash
npm install
npm run dev          # Vite at http://127.0.0.1:5173 (UI only; /api proxies to 8787 if the worker is up)
npm run build        # typecheck + production build + HTML prerender
npm run preview      # vite preview of dist/
npm run lint
npm run typecheck
```

Full local preview (redirects, sitemap, API, HTTP 404):

```bash
npm run build
npm run db:migrate:local
npx wrangler dev --port 8787
# or: npm run dev:worker
# in another shell
WRITEY_BASE=http://127.0.0.1:8787 npm run smoke
```

`db:migrate:local` applies the D1 schema once. Until it has run, `/api/session` falls back to `local_fallback` (the editor still works).

Preview-only QA flags (not a product feature): `?qa=1`, `qa_plan=free|pro|guest_free`, `qa_quota=exhausted`, `qa_preview=fail|loading`, `qa_export=fail`. A labeled homepage panel appears only when these flags are present.

## Environment variable names only

Do not put real secrets in the repo. Use `.dev.vars` (gitignored) for local wrangler or Cloudflare Secrets for a remote preview.

| Name | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Deploy account |
| `CLOUDFLARE_API_TOKEN` | Deploy token |
| `D1_DATABASE_BINDING` | Binding name (`DB` in `wrangler.toml`) |
| `D1_DATABASE_ID` | Replace the placeholder UUID in `wrangler.toml` before a remote deploy |
| `R2_BUCKET` (and optional `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`) | Unused in this client-side export preview |
| `AUTH_SECRET` | Optional cookie signing; random session IDs in D1 work without it |
| `PAYMENT_PROVIDER`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` | Reserved names. Do not connect a live provider. |
| `ANALYTICS_MEASUREMENT_ID`, `VITE_ANALYTICS_MEASUREMENT_ID` | Analytics is [待确认]. Unset → documented no-op. Do not invent a GA4 ID. |
| `SITE_URL`, `VITE_SITE_URL` | Confirmed production origin only. Unset, placeholder, `writey.app`, `*.workers.dev`, `*.pages.dev`, and localhost are unconfirmed: pages are `noindex, nofollow`, canonical/og:url/JSON-LD URLs are omitted, `robots.txt` has no `Sitemap:` line, and `sitemap.xml` is an empty urlset. Do not set these to a preview host. GSC, custom domain, and production HTTP→HTTPS remain [待确认]. |

## Deploy a preview (parent / operator)

1. Create a D1 database and put its id in `wrangler.toml` (`D1_DATABASE_ID`).
2. `npx wrangler d1 migrations apply writey-preview --remote` (or let the first deploy apply them).
3. `npm run build`
4. `npx wrangler deploy` to the `writey-preview` Worker (workers.dev). Do **not** attach a custom domain or production DNS until the owner confirms.
5. Leave `SITE_URL` empty on preview. Do **not** set `SITE_URL` or `VITE_SITE_URL` to a workers.dev or pages.dev host to invent canonicals. Only a confirmed production https origin switches marketing pages to `index, follow` and fills canonical, og:url, JSON-LD URLs, sitemap locs, and the robots Sitemap line.
6. Do not announce QA GO or SEO GO. Do not enable live payments. Do not bind a custom domain until the owner confirms it.

Machine-readable data contract: `contracts/data-contract.json`.

## Fonts

UI/display fonts (Newsreader, IBM Plex Sans) are self-hosted OFL files under `public/fonts/`. Handwriting specimen fonts (Caveat, Patrick Hand, Kalam, Dancing Script) are also self-hosted and must stay labeled **Pending commercial licence**. The app does not request Google Fonts or Material Symbols at runtime.

## Not in this MVP

Anti-Copy, Auto Mistake, scan disguise, undetectable claims, assignment/exam landing pages, Exam Season Pass, worksheets, production Offer schema, parallel INR prices, or live checkout.
