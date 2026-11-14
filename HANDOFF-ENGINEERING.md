# writey 工程交接（07 frontend + preview-grade 08 backend）

- 项目：writey
- 日期：2026-11-14（Asia/Shanghai）
- 代码：`/workspace/writey`
- 分支：`main`（本地仓库，尚无 GitHub/Origin remote；未绑定自定义域名、未生产发布、未开通支付）
- 实现 Commit SHA：见文末（本文件与 SEO 返修同一次提交）
- 预览 URL：https://writey-preview.yanweijie2781.workers.dev （workers.dev 预览，不是生产域名；远程部署仍对应当前已上线的旧提交，本返修尚未远程发布）
- 状态给中控：本文件只记录工程配置，不要宣布 QA GO、SEO GO 或 Compliance GO；本提交未执行生产部署、未绑域、未开通支付、未提交 GSC、未推送 GitHub。

## 一句话结论

已按 Stitch Ink Desk 视觉稿与冻结文案/法律/路由/数据合同，在 `/workspace/writey` 落地 Vite + React + Cloudflare Worker/D1 站点：首页即编辑器，客户端 PDF/PNG 导出，支付始终 `payments_closed`。默认构建仍是预览/noindex；`[env.production]` 与 `npm run build:production` 使用已确认源 `https://text2handwriting.site` 和独立生产 D1。正式支付、分析厂商、法律主体仍为 `[待确认]`。手写字体按 SIL OFL 1.1 使用，不再标 Pending commercial licence。

## 构建了什么

- **前端**：Vite 6 + React 18 + TypeScript。Ink Desk token（海军蓝 `#173044` / `#001B2E`，纸色 `#FEF9EF` / `#F3EEE4` / `#FBF7EE`，铜色 `#845325` / `#8C5A2B`，圆角 4px）。UI 字体 Newsreader + IBM Plex Sans，自托管于 `public/fonts/`，运行时不请求 Google Fonts 或 Material Symbols。图标为 SVG。
- **页面**：`/`（H1 精确为 “Text to Handwriting Converter”，首屏 Hero+编辑器）、`/hindi`、`/pricing`、`/faq`、五张法律页（正文来自合规 markdown，含 Draft for review 横幅，无销售 CTA）、`/login`、`/register`、自定义 404（含 `/refund` 与全部法律链）。
- **编辑器**：免登录；中英/印地语切换与双语占位；横线/空白/方格纸；边距、行距、墨色；`aesthetic_variation` 仅 `tilt` / `ink_pressure` / `drift`；Live 预览；客户端导出 PDF，多页 PNG 为 ZIP；Free 斜向 WRITEY 水印不盖文字。预览/导出 loading 与失败、Free/Pro 额度用尽、Pro 锁定样式、支付尚未开放等状态按冻结 CTA 文案实现。
- **预览级后端**：`worker/index.ts`（Hono）处理 308/301、`/robots.txt`、`/sitemap.xml`、自定义 HTTP 404、session/quota/auth/waitlist，以及永远返回 `payments_closed` 的 `/api/payments/checkout`。D1 schema 见 `migrations/0001_init.sql`。无 D1 或未迁移时前端走 `local_fallback`，编辑器仍可用。
- **合同**：`contracts/data-contract.json`（schema、样例 payload、错误码、额度态、`payments_closed`、环境变量名）。
- **分析**：事件助手 `preview_generated`、`export_pdf`、`export_png`、`language_switched`、`quota_hit`、`acceptable_use_clicked`；从不携带 `source_text`。未设置 `VITE_ANALYTICS_MEASUREMENT_ID` 时为文档化 no-op，不伪造 GA4 ID。
- **QA 演示**：仅预览/开发构建设置 `VITE_ENABLE_QA=1`。此时只有在 `?qa=1` 或已有的 `qa_plan` / `qa_quota` / `qa_preview` / `qa_export` 下才显示 “Preview only — QA controls”。`build:production` 不设置该标志，生产包不挂载 QA 面板，查询参数也不会启用 plan/quota/error 覆盖。

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

**sitemap / canonical：** 预览 `wrangler.toml` 的 `SITE_URL` 保持空字符串。生产环境 `SITE_URL=https://text2handwriting.site` 时，canonical、og:url、JSON-LD URL、sitemap `<loc>` 和 robots 的 `Sitemap:` 行使用该正式源；营销/法律页预渲染为 `index, follow`。若请求 Host 不是 `text2handwriting.site` 或 `www.text2handwriting.site`（例如生产 Worker 的 `*.workers.dev`），即使 `SITE_URL` 已设置，仍输出 `noindex, nofollow`；canonical/sitemap/og 仍指向正式源。Worker 将 `www.text2handwriting.site` 301 到 `https://text2handwriting.site`（保留 path/query）；官方 Host 上的 HTTP 也会改到 HTTPS。不要把预览域写成生产主机。GSC 提交仍未做，不要宣布 SEO GO。

主导航（seo-copy-freeze §0.1）：Converter → `/#editor`，Hindi，Pricing，FAQ，Acceptable Use，Log in，Create account。页脚每张可索引页含 `/pricing` `/faq` `/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`。

## 如何开发 / 构建 / 部署

```bash
cd /workspace/writey
npm install
npm run lint
npm run typecheck
npm run build                 # 预览/noindex；VITE_ENABLE_QA=1；SITE_URL 为空
npm run db:migrate:local      # 首次预览 wrangler dev 前（writey-preview 本地 D1）
npx wrangler dev --port 8787 --local
WRITEY_BASE=http://127.0.0.1:8787 npm run smoke

npm run build:production      # SITE_URL 与 VITE_SITE_URL=https://text2handwriting.site；不设 VITE_ENABLE_QA
npm run db:migrate:local:production
npx wrangler dev --env production --local --port 8788 --persist-to .wrangler/state-production
WRITEY_BASE=http://127.0.0.1:8788 npm run smoke:production
```

远程命令（仅作记录，本提交未执行 deploy / 绑域）：

```bash
# preview
npm run build
npx wrangler deploy

# production
npm run build:production
npx wrangler deploy --env production
```

仅 UI：`npm run dev`（Vite 5173；`/api` 在 worker 起来时可代理到 8787）。

**远程 preview（已完成，2026-11-14 Asia/Shanghai）：**

- 预览 Worker 名：`writey-preview`（默认 wrangler 配置）。`SITE_URL=""`。预览 D1：`writey-preview` / `4c3a2341-993a-4ed5-9e4e-67c48d9c912f`。
- 预览 URL：https://writey-preview.yanweijie2781.workers.dev （本提交未重新部署预览站）。
- 生产 Worker 名：`writey`（`[env.production]`）。`SITE_URL=https://text2handwriting.site`。生产 D1：`writey` / `10ef8a67-714f-4e6a-8037-9193085be4c4`。不要把预览 D1 当生产库，也不要把生产域名绑到预览 Worker。
- 本提交只改仓库代码并做了本地烟测，没有 `wrangler deploy`、没有改 Cloudflare zone、没有开通支付。
- 即使有人把预览 `SITE_URL` 设成 workers.dev，代码也会把它视为未确认。生产包在非官方 Host 上仍 noindex。

## 环境变量（只写名称）

`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`、`D1_DATABASE_BINDING`、`D1_DATABASE_ID`、`R2_BUCKET`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`AUTH_SECRET`、`PAYMENT_PROVIDER`、`PAYMENT_SECRET_KEY`、`PAYMENT_WEBHOOK_SECRET`、`ANALYTICS_MEASUREMENT_ID`、`VITE_ANALYTICS_MEASUREMENT_ID`、`SITE_URL`、`VITE_SITE_URL`、`VITE_ENABLE_QA`。

支付相关名称仅占位，代码不收费。分析 ID 未设则为 no-op。

## 本地构建与测试证据（2026-11-14，Asia/Shanghai）

- `npm run lint`：通过
- `npm run typecheck`：通过（`tsconfig.json` + `tsconfig.worker.json`）
- `npm run test:layout`：通过
- `npm run build`：通过。预渲染为 preview-noindex（`SITE_URL` 未设）；含正式邮箱与 SIL OFL 1.1 标签；无 canonical、无 `[DOMAIN]`、无 Pending commercial licence、无 QA 面板字符串。
- `WRITEY_BASE=http://127.0.0.1:8789 npm run smoke`：**232/232 passed**（本地 `wrangler dev --port 8789 --local`，默认预览 Worker，2026-11-14 Asia/Shanghai）。预览断言包括：营销/法律页 noindex（meta 与 `X-Robots-Tag`）、无 canonical/og:url、无 `[DOMAIN]`、无 Pending commercial licence、页脚为 `support@text2handwriting.site` / `privacy@text2handwriting.site`；robots 无 `Sitemap:` 行；sitemap 为空 urlset；定价/首页 JSON-LD 无 Offer / AggregateOffer；`payments_closed`。
- `npm run build:production`：通过。营销页预渲染为 `index, follow`，canonical/og:url 为 `https://text2handwriting.site`；生产 JS 包不含 “Preview only — QA controls”。
- `WRITEY_BASE=http://127.0.0.1:18080 npm run smoke:production`：**305/305 passed**（本地 `wrangler dev --env production --local --persist-to .wrangler/state-production`，生产 D1 名 `writey`，`SITE_URL=https://text2handwriting.site`，2026-11-14 Asia/Shanghai）。断言包括：dist 营销页 `index, follow` + 正式 canonical；loopback Host 因 host hardening 为 noindex，但 canonical 仍指向正式源；sitemap/robots 使用正式 URL；`/?qa=1` 不出现 QA 控件；`www.text2handwriting.site` 301 到 `https://text2handwriting.site/...`；`*.workers.dev` Host 为 noindex 且保留正式 canonical；checkout 为 `payments_closed`。测完已关闭该本地进程。
- `GET /api/session` 在 `npm run db:migrate:local` 后 `backend: "d1"`；迁移前为 `local_fallback`。
- 自托管字体 200：`/fonts/fonts.css`、`newsreader-latin-400-normal.woff2`、`kalam-devanagari-400-normal.woff2`。

本地可用 `npx wrangler dev --port 8787` 复现。远程预览：https://writey-preview.yanweijie2781.workers.dev 。对无自定义 UA 的部分客户端（例如默认 Python urllib）可能被 Cloudflare 边缘拦截为 403；带常规 UA 或本仓库 `npm run smoke` 为 200。

## 已知缺口

- **无 Git 远程仓库**：代码只在本机 `/workspace/writey`。Cursor 不能代建 GitHub 仓库；需要学员/中控建空仓库并给 URL 后再 push。当前预览部署来自该本地 `main` 实现提交。
- **预渲染正文已补（本次 SEO 返修）**：各路由初始 HTML 含 title/description、有效 robots、OG、`#writey-jsonld`，以及 `#root` 内的 H1、导语、关键 H2/短文、FAQ 短答、法律页全文（含 Draft for review 横幅）和页脚法律链（`/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`）。`src/main.tsx` 仍用 `createRoot`，hydration 会替换静态 `#root`，这是预期行为。不是完整 SSR。
- **Cookie 清单**：已将合规真源 `cookie-policy.md` 原样同步到 `src/content/legal/cookie.md`。预渲染 `/cookie` 含 `writey_guest`（180 天，Max-Age=15552000，HttpOnly; Secure; SameSite=Lax; Path=/，Essential）与 `writey_session`（退出时删除，30 天，Max-Age=2592000，同样安全属性，Essential）。分析、支付回跳、验证码等行仍为【PENDING CONFIRMATION】。Worker 现有 cookie 属性与清单一致，未改实现。不要宣布 Compliance GO。
- **手写字体**：Newsreader、IBM Plex Sans、Caveat、Patrick Hand、Kalam、Dancing Script 均为 SIL OFL 1.1，许可证文件保留在 `public/fonts/licenses/`。UI 标注 `SIL OFL 1.1`。Dancing Script 有 Reserved Font Name，产品展示名仍为 Studio Loop。不得宣称 Hindi 一等商用字体已交付，也不得宣称支持手写克隆。Devanagari 品质限制仍写在 Hindi 页。
- **分析/支付/法律主体/GST/退款窗口** 仍 `[待确认]`。生产域名已确认为 `text2handwriting.site`；联系邮箱为 `privacy@text2handwriting.site` 与 `support@text2handwriting.site`（本交接不声称邮箱路由已能收信）。
- `/faq` 与 `/refund` 已单独做窄屏 CSS（390px 无横向滚动意图）；未做真实设备截图（本任务在共享 box 上实现，无要求打开用户桌面）。
- 账户为邮箱+密码的预览实现（PBKDF2 + D1），无 Google OAuth。登录失败在无 D1 时返回 503，访客路径不受阻。
- 技术栈 Cloudflare-first 仍标 `[待确认]`。

## `[待确认]` 清单

最终售价、退款窗口、GST/税务、支付服务商、法律主体、品牌展示名/Logo、分析厂商、导出 DPI、Pro 样式套数。

## 自检清单

- [x] 可索引页 200（本地 wrangler）
- [x] 法律别名 308、产品近义与禁建路径 301
- [x] 导航/页脚为 canonical 路径，无残留 `#` 导航（真页内锚点仅 `/#editor`）
- [x] `/faq` `/refund` 及其他可索引页提供 390px 布局（CSS；无横滚规则与触控最小高度）
- [x] 支付关闭态（UI + `/api/payments/checkout`）
- [x] 额度状态（默认 Free/guest；仅预览构建的 QA 开关可切 Pro / 用尽，生产构建不可用）
- [x] 字体自托管，无 Google Fonts 运行时请求，无 Inter
- [x] 无生产 Offer / AggregateOffer schema
- [x] 未发明 `writey.app` 或其他未确认主机名
- [x] 页脚含 `/privacy` `/terms` `/cookie` `/refund` `/acceptable-use`
- [x] 联系方式为 `privacy@text2handwriting.site` / `support@text2handwriting.site`，用户可见文案不再使用 `[DOMAIN]` 占位
- [x] 无 Anti-Copy / Auto Mistake / 扫描伪装字段或卖点
- [x] lint / typecheck / production build 通过
- [x] 远程 preview URL：https://writey-preview.yanweijie2781.workers.dev （2026-11-14 Asia/Shanghai，`WRITEY_BASE` 烟测 65/65；`/api/session` 为 `backend: "d1"`；checkout 为 `payments_closed`）
- [ ] QA GO（不得由工程方宣布）

## 给下游的最小必要信息

- 下一阶段：中控安排 preview deploy 后，再并行 PM / SEO / 合规复核，然后才是 QA。不要跳过这些门槛。
- 必须读取：本文件、`README.md`、`contracts/data-contract.json`、`wrangler.toml`
- 不能假设：已有生产域名、已开通支付、已完成远程部署、已提交 GSC、或 QA / SEO 已 GO

## Commit

- 分支：`main`。本提交不要 force-push，也不要在本任务中 `wrangler deploy`。
- 基线 SHA：`14330492395b1d78fd839c71b7972502bbaccd44`
- 本变更 SHA：以提交后 `git rev-parse HEAD` 为准（见工程回报）
