# EduBazar SEO Dashboard PRD

**Project:** EduBazar.shop (`edu` Next.js app)  
**Folder:** `edu/seo`  
**Status:** Draft for implementation  
**Audit date:** 2026-08-23  
**Primary goal:** Give the owner one reliable place to see organic visibility, indexed URLs, technical SEO health, content quality, keyword rankings, and the exact actions needed next.

## 1. Current Site Baseline

- Stack: Next.js 16 App Router, React 19, static product catalog, Supabase, Vercel.
- Public crawl surface: homepage, shop, about, contact, legal pages, and product detail pages. The production build reports 55 generated routes, including 38 product paths.
- Existing SEO: root metadata, page metadata on several routes, canonical URLs, Open Graph/Twitter fields, JSON-LD, `robots.txt`, and `sitemap.xml`.
- Current sitemap and robots are live at `https://edubaazar.shop/sitemap.xml` and `https://edubaazar.shop/robots.txt`.
- Current gaps: no Search Console/GA4 data connection, no rank history, no crawl-error history, no keyword database, no issue workflow, no page-level audit UI, and no alerting.
- Important data-quality signals: the live homepage renders the stats counters as `0+`; product `lastUpdated` values are mostly from 2024; several source image references do not exist in `public/images`.

The dashboard must distinguish **measured data** from **estimated or manually entered data**. It must never invent ranking counts.

## 2. Users and Outcomes

### Owner/Admin
Needs a fast answer to:

1. How many clicks, impressions, CTR, and average position did organic search generate?
2. Which URLs and keywords are gaining or losing visibility?
3. How many URLs are indexed, excluded, errored, or blocked?
4. Which SEO problems are urgent, and what file/page should be changed?
5. Did a release, content update, or technical fix improve performance?

### Desired outcomes

- Reduce time from discovering an SEO problem to assigning a fix.
- Make indexability and ranking trends visible without opening several tools.
- Prevent stale metadata, broken assets, broken links, and accidental noindex/robots mistakes.
- Create a verifiable history of audits and fixes.

## 3. MVP Scope

### A. Overview dashboard
Show selectable date ranges: 7, 28, 90 days, and custom.

- Organic clicks, impressions, CTR, and average position from Google Search Console.
- GA4 organic sessions, engaged sessions, conversions, revenue, and landing pages when GA4 is connected.
- Indexed URLs, discovered URLs, excluded URLs, and URL inspection failures.
- Technical health score and counts by severity: critical, high, medium, low.
- Click/impression/position trend charts with previous-period comparison.
- Last successful sync, data freshness, and connection status.

### B. URL audit
Maintain one row per canonical URL:

- URL, route type, HTTP status, canonical target, indexability, robots result, sitemap membership.
- Title length/content, meta description length/content, H1 count, word count.
- Image count, missing image count, missing/empty alt count, internal link count.
- JSON-LD types and validation result.
- Core Web Vitals from CrUX/PageSpeed API when available.
- Last crawled, last changed, last audit, issue count, owner, status.

Audit public indexable routes first. Exclude `/admin`, `/login`, `/register`, `/account`, `/checkout`, and `/api` from SEO scoring unless a security audit explicitly checks them.

### C. Keyword and rank tracking
- User-managed keyword list grouped by category: Hacking, Programming, Trading, Books, Tools, Design, Marketing.
- Target URL, country India, language, device, search intent, priority, and notes.
- Daily or weekly rank snapshots from a compliant rank-data provider or Search Console query data.
- Position, impressions, clicks, CTR, change, SERP feature, and cannibalization warning.
- Separate `ranking keywords` from `tracked keywords`; do not report a total ranking count without defining the source and date range.

### D. Issues and recommendations
Every issue needs:

- Stable issue code, title, severity, affected URL(s), first seen, last seen.
- Evidence, source (crawler, Search Console, PageSpeed, code scan, manual), recommended fix.
- Status: open, acknowledged, in progress, fixed, ignored.
- Assignment, due date, release/commit reference, and recheck result.

Initial rules:

- Missing title or H1: high.
- Duplicate title/canonical conflict: high.
- HTTP error on an internal link or sitemap URL: critical/high.
- Noindex on an intended landing/product page: critical.
- Missing product image or broken asset: high.
- Missing/weak description or alt text: medium.
- Stale `lastModified`/content date: medium.
- Missing structured-data required property: medium.
- Poor LCP/INP/CLS: high when field data or lab data confirms it.
- Security/authentication finding: critical and visible in a separate security section, not mixed into the SEO score.

### E. Content and metadata editor view
Read-only in MVP. Display current route metadata and suggested improvements:

- Title and description preview for Google and social cards.
- Primary topic, search intent, entity/category, internal-link suggestions.
- Product schema preview and validation.
- Duplicate/near-duplicate content groups.

Editing from the dashboard is Phase 2 and must use authenticated server actions with audit logs.

### F. Reports and alerts
- Export CSV/JSON/PDF summary.
- Weekly email summary: wins, losses, new critical issues, stale pages, and sync failures.
- Optional webhook/Slack notification for critical indexability or availability failures.

## 4. Non-Goals for MVP

- Do not promise guaranteed Google rankings.
- Do not scrape Google result pages directly or violate provider terms.
- Do not automatically publish metadata or content.
- Do not expose Supabase service-role keys, Resend keys, or Search Console credentials in browser code.
- Do not include private account, checkout, admin, or API pages in public ranking totals.

## 5. Recommended Architecture

### Dashboard route
Create a protected route such as `/admin/seo` inside the existing admin area. Enforce authorization on the server, not only with client-side localStorage.

### Data sources

1. Google Search Console API: search analytics, sitemap status, URL inspection where quota/access allows.
2. GA4 Data API: organic sessions and conversion data.
3. PageSpeed Insights/CrUX: performance and Core Web Vitals.
4. Internal crawler: fetch sitemap URLs and follow same-origin internal links with rate limits.
5. Static/code scanner: inspect Next metadata, route files, image references, links, schema, and robots/sitemap output.

### Server-side sync jobs
Use a protected scheduled endpoint or Vercel Cron. Store raw responses and normalized snapshots. Every sync must be idempotent and record status, duration, provider, quota errors, and timestamp.

### Suggested tables

- `seo_connections`: provider, property, encrypted credential reference, status, last sync.
- `seo_urls`: canonical URL, route type, status, indexability, metadata fields, crawl timestamps.
- `seo_url_checks`: URL audit result, check name, value, evidence, run ID.
- `seo_keywords`: keyword, target URL, locale, device, intent, priority, active.
- `seo_rank_snapshots`: keyword, date, position, clicks, impressions, CTR, source.
- `seo_issues`: issue code, severity, URL, evidence, status, assignment, timestamps.
- `seo_sync_runs`: provider, started/finished, status, records, error summary.
- `seo_content_changes`: URL, title/description/hash, published date, deployment reference.

Use RLS and server-only privileged access. Admin activity and credential access must be logged.

## 6. Scoring Model

Keep scores explainable. Start with weighted categories:

- Indexability and crawlability: 30%
- Metadata and content: 25%
- Links and sitemap integrity: 15%
- Structured data: 10%
- Performance and mobile UX: 15%
- Image/accessibility hygiene: 5%

A score is a diagnostic indicator, not a Google ranking prediction. Display the numerator, denominator, failed checks, and data freshness beside it.

## 7. Acceptance Criteria

- Admin can connect or verify Search Console and see a clear success/error state.
- Overview shows clicks, impressions, CTR, position, indexed URLs, and issue totals with date range and source labels.
- URL audit can inspect every sitemap URL and show HTTP, canonical, robots, title, description, H1, image, schema, and performance checks.
- Dashboard reports ranking totals only with source, scope, country/device, and date range.
- A broken image, missing title, duplicate canonical, sitemap mismatch, and accidental noindex produce reproducible issues.
- Issues can be filtered, assigned, acknowledged, marked fixed, and rechecked.
- Private routes and credentials never appear in public SEO data.
- Dashboard is responsive, keyboard accessible, and does not expose secrets to client bundles.
- Unit tests cover rule evaluation; integration tests cover sync failure, stale data, pagination, and auth denial.
- `npm run lint` and `npm run build` pass after implementation.

## 8. Delivery Plan

### Phase 0: Fix blockers
- Remove hardcoded admin credential and client-only authorization.
- Lock down Supabase RLS and remove public read/write access to orders/users.
- Fix broken/missing assets and the live `0+` counter issue.
- Confirm canonical host (`edubaazar.shop` vs `www.edubaazar.shop`) and redirect policy.

### Phase 1: Technical SEO MVP
- Protected `/admin/seo` shell.
- Static route scanner, sitemap/robots checker, metadata/image/link checks.
- Issue store, severity/status workflow, URL audit table, export.

### Phase 2: Search data
- Search Console connection and historical snapshots.
- GA4 and PageSpeed integrations.
- Keyword groups, rank trends, landing-page performance, weekly reports.

### Phase 3: Optimization workflow
- Content briefs and internal-link recommendations.
- Change tracking, release comparisons, alerts, and controlled metadata editing.

## 9. Measurement Plan

Track dashboard reliability as well as SEO:

- Sync success rate and median sync duration.
- Percentage of sitemap URLs audited in the last 24 hours.
- Open critical/high issue count and mean time to resolution.
- Indexed URL change, organic clicks, impressions, CTR, average position.
- Top landing pages, losing pages, new ranking keywords, and conversion rate.

All reports must show source, timezone, property, filters, and last refresh time.
