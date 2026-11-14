# writey 工程交接（07 frontend + preview-grade 08 backend）

- 项目：writey
- 日期：2026-11-14（Asia/Shanghai）
- 代码：`/workspace/writey`
- 分支：`main`（本地仓库，尚无 GitHub/Origin remote；未绑定自定义域名、未生产发布、未开通支付）
- 实现 Commit SHA：见文末（本文件与 SEO 返修同一次提交）
- 预览 URL：https://writey-preview.yanweijie2781.workers.dev （workers.dev 预览，不是生产域名；远程部署仍对应当前已上线的旧提交，本返修尚未远程发布）
- 状态给中控：`[NEEDS_REVIEW]` — 已完成本地 SEO P0/P1 返修（预览 noindex、去掉占位 canonical、预渲染正文/JSON-LD/OG 与页脚法律链）；不要宣布 QA GO 或 SEO GO，不要绑定未确认域名，不要把 `SITE_URL` 设成 workers.dev。

## 一句话结论

已按 Stitch Ink Desk 视觉稿与冻结文案/法律/路由/数据合同，在 `/workspace/writey` 落地可部署的 Vite + React + Cloudflare Worker/D1 预览站：首页即编辑器，客户端 PDF/PNG 导出，支付始终 `payments_closed`。生产域名、正式支付、手写字体商用授权、分析厂商仍为 `[待确认]`。

## 构建了什么

- **前端**：Vite 6 + React 18 + TypeScript。Ink Desk token（海军蓝 `#173044` / `#001B2E`，纸色 `#FEF9EF` / `#F3EEE4` / `#FBF7EE`，铜色 `#845325` / `#8C5A2B`，圆角 4px）。UI 字体 Newsreader + IBM Plex Sans，自托管于 `public/fonts/`，运行时不请求 Google Fonts 或 Material Symbols。图标为 SVG。
- **页面**：`/`（H1 精确为 “Text to Handwriting Converter”，首屏 Hero+编辑器）、`/hindi`、`/pricing`、`/faq`、五张法律页（正文来自合规 markdown，含 Draft for review 横幅，无销售 CTA）、`/login`、`/register`、自定义 404（含 `/refund` 与全部法律链）。
- **编辑器**：免登录；中英/印地语切换与双语占位；横线/空白/方格纸；边距、行距、墨色；`aesthetic_variation` 仅 `tilt` / `ink_pressure` / `drift`；Live 预览；客户端导出 PDF，多页 PNG 为 ZIP；Free 斜向 WRITEY 水印不盖文字。预览/导出 loading 与失败、Free/Pro 额度用尽、Pro 锁定样式、支付尚未开放等状态按冻结 CTA 文案实现。
- **预览级后端**：`worker/index.ts`（Hono）处理 308/301、`/robots.txt`、`/sitemap.xml`、自定义 HTTP 404、session/quota/auth/waitlist，以及永远返回 `payments_closed` 的 `/api/payments/checkout`。D1 schema 见 `migrations/0001_init.sql`。无 D1 或未迁移时前端走 `local_fallback`，编辑器仍可用。
- **合同**：`contracts/data-contract.json`（schema、样例 payload、错误码、额度态、`payments_closed`、环境变量名）。
- **分析**：事件助手 `preview_generated`、`export_pdf`、`export_png`、`language_switched`、`quota_hit`、`acceptable_use_clicked`；从不携带 `source_text`。未设置 `VITE_ANALYTICS_MEASUREMENT_ID` 时为文档化 no-op，不伪造 GA4 ID。
- **QA 演示**：首页标明 “Preview only” 的控件，以及 `?qa=1&qa_plan=&qa_quota=&qa_preview=&qa_export=`。

未使用 `/workspace/writey-keyword-research/design/` 手写稿。未把 Stitch 大图拷进应用。Stitch HTML 中的 `#` 导航已改为 Route Contract 的 canonical 路径。`writey.app` 未作为域名出现在页面或 sitemap。

## 精确路由

**营销/法律路径（生产域名确认后才可 index）：** `/` `/hindi` `/pricing` `/faq` `/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`

**始终 noindex：** `/login` `/register` 与自定义 404（`meta robots` 与 `X-Robots-Tag: noindex, nofollow`，不进 sitemap）

**预览 / 未确认生产域名：** 上述全部 HTML 页均为 `noindex, nofollow`（含 meta 与 `X-Robots-Tag`）。不输出 `<link rel="canonical">` 或 `og:url`。JSON-LD 仍写入，但省略需要主机的 url / @id / item。`robots.txt` 保留 `User-agent: *`、`Allow: /`、`Disallow: /login`、`Disallow: /register`，**不含** `Sitemap:` 行。`sitemap.xml` 返回 200 的空 `<urlset>`（无 `<loc>`）。404 在任何模式下都不输出 canonical。

**308：**  
`/privacy-policy` `/privacy_policy` → `/privacy`  
`/terms-of-use` `/terms-of-service` `/tos` `/legal` → `/terms`  
`/cookies` `/cookie-policy` `/cookie_policy` → `/cookie`  
`/refunds` `/refund-policy` `/refund_policy` `/cancellation-refund` → `/refund`  
`/acceptable-use-policy` `/aup` `/acceptable_use` → `/acceptable-use`

**301 → `/`：** `/converter` `/text-to-handwriting` `/text-to-handwriting-converter` `/convert-text-to-handwriting` `/convert`  
以及误请求的 `/assignment` `/text-to-handwriting-assignment` `/chatgpt-to-assignment` `/exam` `/practical-file`

**301 → `/register`：** `/signup` `/sign-up` `/create-account`（与 Stitch 部分稿的 `/signup` 对齐）

**404 noindex：** 未定义路径，自定义页，含返回转换器与 `/refund` 等法律链

**sitemap / canonical：** 仅当 `SITE_URL` / `VITE_SITE_URL` 是已确认的生产 `https://` 源（不是占位 `[DOMAIN]`、不是 `writey.app`、不是 `*.workers.dev` / `*.pages.dev`、不是 localhost）时，才用同一主机填写 canonical、og:url、JSON-LD URL、sitemap `<loc>` 和 robots 的 `Sitemap:` 行；营销/法律页此时才可为 `index, follow`。不要把预览域写成生产主机。生产域名、GSC、生产 HTTP→HTTPS 仍为 `[待确认]`。

主导航（seo-copy-freeze §0.1）：Converter → `/#editor`，Hindi，Pricing，FAQ，Acceptable Use，Log in，Create account。页脚每张可索引页含 `/pricing` `/faq` `/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`。

## 如何开发 / 构建 / 部署

```bash
cd /workspace/writey
npm install
npm run lint
npm run typecheck
npm run build                 # tsc + vite build + scripts/prerender.mjs
npm run db:migrate:local      # 首次 wrangler dev 前
npx wrangler dev --port 8787  # 或 npm run dev:worker
WRITEY_BASE=http://127.0.0.1:8787 npm run smoke
```

仅 UI：`npm run dev`（Vite 5173；`/api` 在 worker 起来时可代理到 8787）。

**远程 preview（已完成，2026-11-14 Asia/Shanghai）：**

- Worker 名：`writey-preview`
- URL：https://writey-preview.yanweijie2781.workers.dev
- D1：`writey-preview`（`D1_DATABASE_ID` 已写入 `wrangler.toml`；迁移 `0001_init.sql` 已应用到远程）
- 已部署的远程预览仍是返修前的版本，直到中控/父代理重新发布本提交。`wrangler.toml` 的 `SITE_URL` 保持空字符串。即使有人把 `SITE_URL` 设成 workers.dev 预览域，代码也会把它视为未确认，继续 noindex、不写 canonical、不在 sitemap 列出预览 URL。
- 未绑定自定义域名，未做生产 DNS，未开通真实支付，未提交 GSC。

## 环境变量（只写名称）

`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`、`D1_DATABASE_BINDING`、`D1_DATABASE_ID`、`R2_BUCKET`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`AUTH_SECRET`、`PAYMENT_PROVIDER`、`PAYMENT_SECRET_KEY`、`PAYMENT_WEBHOOK_SECRET`、`ANALYTICS_MEASUREMENT_ID`、`VITE_ANALYTICS_MEASUREMENT_ID`、`SITE_URL`、`VITE_SITE_URL`。

支付相关名称仅占位，代码不收费。分析 ID 未设则为 no-op。

## 本地构建与测试证据（2026-11-14，Asia/Shanghai）

- `npm run lint`：通过
- `npm run typecheck`：通过（`tsconfig.json` + `tsconfig.worker.json`）
- `npm run build`：通过。主包约 339 kB gzip ~105 kB；`pdf-lib` 动态拆包。预渲染为 preview-noindex（无确认生产 origin）。
- `wrangler.toml` 设置 `html_handling = "none"` 后，`GET /` 返回完整 prerender HTML（此前默认 auto-trailing-slash 把 `/index.html` 重定向回 `/`，会出现空 200）。
- `WRITEY_BASE=http://127.0.0.1:8788 npm run smoke`：**164/164 passed**（本地 `wrangler dev --port 8788`，2026-11-14 Asia/Shanghai）。预览/本地断言包括：营销/法律页初始 HTML 含 H1 与正文、JSON-LD、og:title、页脚法律链；`noindex, nofollow`（meta 与 `X-Robots-Tag`）；无 `writey.app`、无 `https://[DOMAIN]`；robots 无 `Sitemap:` 行；sitemap 为空 urlset；定价/首页 JSON-LD 无 Offer / AggregateOffer；`/cookie` 含 `writey_guest` / `writey_session` 清单行；既有 308/301 与 `payments_closed` 仍在。
- `GET /api/session` 在 `npm run db:migrate:local` 后 `backend: "d1"`；迁移前为 `local_fallback`。
- 自托管字体 200：`/fonts/fonts.css`、`newsreader-latin-400-normal.woff2`、`kalam-devanagari-400-normal.woff2`。

本地可用 `npx wrangler dev --port 8787` 复现。远程预览：https://writey-preview.yanweijie2781.workers.dev 。对无自定义 UA 的部分客户端（例如默认 Python urllib）可能被 Cloudflare 边缘拦截为 403；带常规 UA 或本仓库 `npm run smoke` 为 200。

## 已知缺口

- **无 Git 远程仓库**：代码只在本机 `/workspace/writey`。Cursor 不能代建 GitHub 仓库；需要学员/中控建空仓库并给 URL 后再 push。当前预览部署来自该本地 `main` 实现提交。
- **预渲染正文已补（本次 SEO 返修）**：各路由初始 HTML 含 title/description、有效 robots、OG、`#writey-jsonld`，以及 `#root` 内的 H1、导语、关键 H2/短文、FAQ 短答、法律页全文（含 Draft for review 横幅）和页脚法律链（`/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`）。`src/main.tsx` 仍用 `createRoot`，hydration 会替换静态 `#root`，这是预期行为。不是完整 SSR。
- **Cookie 清单**：已将合规真源 `cookie-policy.md` 原样同步到 `src/content/legal/cookie.md`。预渲染 `/cookie` 含 `writey_guest`（180 天，Max-Age=15552000，HttpOnly; Secure; SameSite=Lax; Path=/，Essential）与 `writey_session`（退出时删除，30 天，Max-Age=2592000，同样安全属性，Essential）。分析、支付回跳、验证码等行仍为【PENDING CONFIRMATION】。Worker 现有 cookie 属性与清单一致，未改实现。不要宣布 Compliance GO。
- **手写字体**：Caveat / Patrick Hand / Kalam / Dancing Script 仅作标本，UI 一律标注 Pending commercial licence。不得宣称 Hindi 一等商用字体已交付。
- **分析/支付/域名/主体/GST/退款窗口** 仍 `[待确认]`。
- `/faq` 与 `/refund` 已单独做窄屏 CSS（390px 无横向滚动意图）；未做真实设备截图（本任务在共享 box 上实现，无要求打开用户桌面）。
- 账户为邮箱+密码的预览实现（PBKDF2 + D1），无 Google OAuth。登录失败在无 D1 时返回 503，访客路径不受阻。
- 技术栈 Cloudflare-first 仍标 `[待确认]`。

## `[待确认]` 清单

最终售价、退款窗口、GST/税务、支付服务商、法律主体、域名、品牌展示名/Logo、手写字体商用授权、分析厂商、`SITE_URL`、D1 远程 ID、www/apex 方向、导出 DPI、Pro 样式套数。

## 自检清单

- [x] 可索引页 200（本地 wrangler）
- [x] 法律别名 308、产品近义与禁建路径 301
- [x] 导航/页脚为 canonical 路径，无残留 `#` 导航（真页内锚点仅 `/#editor`）
- [x] `/faq` `/refund` 及其他可索引页提供 390px 布局（CSS；无横滚规则与触控最小高度）
- [x] 支付关闭态（UI + `/api/payments/checkout`）
- [x] 额度状态（默认 Free/guest；QA 可切 Pro / 用尽）
- [x] 字体自托管，无 Google Fonts 运行时请求，无 Inter
- [x] 无生产 Offer / AggregateOffer schema
- [x] 未发明 `writey.app` 或其他未确认主机名
- [x] 页脚含 `/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`
- [x] 联系方式仅为 `privacy@[DOMAIN]` / `support@[DOMAIN]`
- [x] 无 Anti-Copy / Auto Mistake / 扫描伪装字段或卖点
- [x] lint / typecheck / production build 通过
- [x] 远程 preview URL：https://writey-preview.yanweijie2781.workers.dev （2026-11-14 Asia/Shanghai，`WRITEY_BASE` 烟测 65/65；`/api/session` 为 `backend: "d1"`；checkout 为 `payments_closed`）
- [ ] QA GO（不得由工程方宣布）

## 给下游的最小必要信息

- 下一阶段：中控安排 preview deploy 后，再并行 PM / SEO / 合规复核，然后才是 QA。不要跳过这些门槛。
- 必须读取：本文件、`README.md`、`contracts/data-contract.json`、`wrangler.toml`
- 不能假设：已有生产域名、已开通支付、已完成远程部署、已提交 GSC、或 QA / SEO 已 GO

## Commit

- 分支：`main`（无 remote；本返修不要 push、不要 `wrangler deploy`）
- SEO 返修 SHA：本分支这次 `fix:` 提交（完整 SHA 见交接回报，以 `git rev-parse HEAD` 为准）
- 先前实现 SHA：`01623106848104c3ac1dd550b7f275e55ea4539d`（当前远程预览仍可能对应此提交，直到重新部署）
