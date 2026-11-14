# Writey

India-facing text to handwriting converter (MVP preview). Paste English or Hindi (Devanagari) text, preview a handwriting-style page, and export PDF or PNG.

This repository is the stage 07 frontend plus a preview-grade stage 08 backend. The visual source is the Stitch **Ink Desk** design. Marketing sentences come from the frozen copy pack. Legal page bodies are the compliance markdown drafts.

The Cloudflare-first stack (Workers + D1) is implemented but still **[待确认]**. The confirmed production origin is `https://text2handwriting.site`. There is no live payment provider, and no invented hostname such as `writey.app`. This README does not claim a production deploy, GSC submission, or any QA/SEO/Compliance GO.

## What’s in the box

- Indexable routes: `/`, `/hindi`, `/pricing`, `/faq`, `/privacy`, `/terms`, `/cookie`, `/refund`, `/acceptable-use`
- Account routes (noindex): `/login`, `/register`
- Edge 308 legal aliases, 301 product synonyms, and 301 for accidental assignment/exam paths
- Custom 404 that links home and `/refund`
- `/robots.txt` and `/sitemap.xml` (production sitemap and canonicals when `SITE_URL` is the confirmed origin `https://text2handwriting.site`; preview builds leave `SITE_URL` empty, stay noindex, and use an empty urlset). A production Worker still serves `noindex, nofollow` when the request Host is not `text2handwriting.site` or `www.text2handwriting.site`.
- Client-side preview and PDF/PNG export (Free watermark; source text is not stored)
- Preview-grade session/quota API on a Worker + D1, with a frontend fallback if D1 is absent
- Payments endpoints always return `payments_closed`

## Develop

```bash
npm install
npm run dev          # Vite at http://127.0.0.1:5173 (UI only; /api proxies to 8787 if the worker is up)
npm run build        # preview/noindex build (VITE_ENABLE_QA=1, SITE_URL unset)
npm run build:production  # prerender with SITE_URL and VITE_SITE_URL=https://text2handwriting.site; QA flag unset
npm run preview      # vite preview of dist/
npm run lint
npm run typecheck
```

Full local preview (redirects, sitemap, API, HTTP 404):

```bash
npm run build
npm run db:migrate:local
npx wrangler dev --port 8787 --local
# or: npm run dev:worker
# in another shell
WRITEY_BASE=http://127.0.0.1:8787 npm run smoke

# Production-config local smoke (separate Worker env + local D1, does not deploy):
npm run build:production
npm run db:migrate:local:production
npx wrangler dev --env production --local --port 8788 --persist-to .wrangler/state-production
WRITEY_BASE=http://127.0.0.1:8788 npm run smoke:production
```

`db:migrate:local` applies the D1 schema once. Until it has run, `/api/session` falls back to `local_fallback` (the editor still works).

Preview-only QA flags (not a product feature): `?qa=1`, `qa_plan=free|pro|guest_free`, `qa_quota=exhausted`, `qa_preview=fail|loading`, `qa_export=fail`. They work only when `VITE_ENABLE_QA=1` (default `npm run build` / `npm run dev`). Production `build:production` leaves that flag unset, so `QaControls` is not mounted and the `qa_*` overrides do not activate.

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
| `SITE_URL`, `VITE_SITE_URL` | Confirmed production origin only. Preview `wrangler.toml` leaves them empty. `npm run build:production` and `[env.production]` set `https://text2handwriting.site`. Unset, placeholder, `writey.app`, `*.workers.dev`, `*.pages.dev`, and localhost are unconfirmed: pages are `noindex, nofollow`, canonical/og:url/JSON-LD URLs are omitted, `robots.txt` has no `Sitemap:` line, and `sitemap.xml` is an empty urlset. Do not set these to a preview host. |

## Deploy commands (do not treat this as a completed production deploy)

Preview Worker `writey-preview`, empty `SITE_URL`, preview D1 `writey-preview` / `4c3a2341-993a-4ed5-9e4e-67c48d9c912f`:

```bash
npm run build
npx wrangler d1 migrations apply writey-preview --remote
npx wrangler deploy
```

Production Worker `writey`, `SITE_URL=https://text2handwriting.site`, production D1 `writey` / `10ef8a67-714f-4e6a-8037-9193085be4c4`:

```bash
npm run build:production
npx wrangler d1 migrations apply writey --remote --env production
npx wrangler deploy --env production
```

Leave preview `SITE_URL` empty. Do **not** set `SITE_URL` or `VITE_SITE_URL` to a workers.dev or pages.dev host, and do not point the preview Worker at the production D1 or production domain. Do not announce QA GO, SEO GO, or Compliance GO. Do not enable live payments. Domain binding and a production deploy are operator actions, not implied by these commands.

Machine-readable data contract: `contracts/data-contract.json`.

## Fonts

UI/display fonts (Newsreader, IBM Plex Sans) and handwriting specimen fonts (Caveat, Patrick Hand, Kalam, Dancing Script) are self-hosted under `public/fonts/` and licensed under SIL OFL 1.1 (licence files in `public/fonts/licenses/`). The product UI labels them **SIL OFL 1.1**. Dancing Script has a Reserved Font Name and is displayed as **Studio Loop**. Do not claim Hindi first-class commercial fonts are delivered, and do not claim handwriting cloning is supported. The app does not request Google Fonts or Material Symbols at runtime.

## Not in this MVP

Anti-Copy, Auto Mistake, scan disguise, undetectable claims, assignment/exam landing pages, Exam Season Pass, worksheets, production Offer schema, parallel INR prices, or live checkout.
