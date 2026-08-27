# EduBazar SEO and Website Bug Register

**Audit date:** 2026-08-23  
**Scope:** `edu` Next.js app, `src`, `public`, `legacy`, and live `https://edubaazar.shop` checks.  
**Status meaning:** `Open` means observed and needs remediation; `Needs verification` means the code signal is real but production impact needs confirmation.

## Summary

| Severity | Count | Meaning |
|---|---:|---|
| Critical | 3 | Security, data exposure, or indexability risk requiring immediate attention |
| High | 8 | Can block crawling, damage trust, break conversions, or materially reduce SEO quality |
| Medium | 7 | Quality, consistency, accessibility, or maintainability issue |
| Needs verification | 3 | Requires provider, browser, or production confirmation |

The counts above are triage counts, not a ranking count. No ranking total can be established from repository inspection alone; connect Search Console or a compliant rank provider.

## Critical

### BUG-001: Hardcoded admin password and client-only admin auth
- **Location:** `src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`
- **Evidence:** Login accepts the literal password `admin123`; successful auth is stored as `edubazar_admin=true` in localStorage. The admin page trusts that browser value.
- **Impact:** Anyone who sees the source or sets the localStorage value can access the admin UI. This can expose orders and enable status changes.
- **Fix:** Move authentication to Supabase Auth or another server-side identity provider. Protect `/admin` and all admin APIs with server authorization and secure, httpOnly session cookies. Remove the password hint and client trust model.
- **Status:** Open

### BUG-002: Database RLS policies allow all users to read/write users and orders
- **Location:** `legacy/setup-tables.sql`
- **Evidence:** Policies named `Allow all on users` and `Allow all on orders` use `USING (true)` and `WITH CHECK (true)`.
- **Impact:** Public clients may read or modify customer/order data depending on deployed schema. This is a severe privacy and integrity risk.
- **Fix:** Replace permissive policies with least-privilege policies; keep service-role operations server-only; use authenticated owner/admin checks; rotate exposed credentials if they were used in production; audit existing rows and logs.
- **Status:** Open

### BUG-003: Product/download data and dangerous tooling claims are publicly crawlable without policy review
- **Location:** `src/lib/products.ts`, product pages, live homepage
- **Evidence:** Public product catalog includes RAT/keylogger/phishing/antivirus-evasion/cracking content and downloadable external archive URLs.
- **Impact:** Legal, trust, malware-distribution, provider-policy, and search-quality risk. Search engines may classify or demote the site; users may download unsafe files.
- **Fix:** Perform a legal and security review of every product and asset. Remove unauthorized or harmful tooling, malware-test downloads, and unsupported claims. Add provenance, licensing, malware scanning, safe-lab wording, and a clear abuse policy where appropriate.
- **Status:** Open

## High

### BUG-004: Multiple referenced product images do not exist locally
- **Location:** `src/lib/products.ts`, `public/images`
- **Evidence:** The asset scan found missing references including `888rat-tool.jpeg`, `ahmyth-rat.jpeg`, `androrat-tool.jpeg`, `antivirus-evasion.jpeg`, `cerberus-rat.jpeg`, `crypto-trading.jpeg`, `dedsec-social-hacking.jpeg`, `digital-marketing.jpeg`, `digital-marketing-video.jpeg`, `droidjack-rat.jpeg`, `forex-trading.jpeg`, `java-course.jpeg`, `nanocore-rat.jpeg`, `phishing-course.jpeg`, `react-nextjs.jpeg`, `stock-market.jpeg`, `stock-market-advanced.jpeg`, `uiux-design-fundamentals.jpeg`, and `woocommerce-wordpress.jpeg`.
- **Impact:** Broken images, poor UX, weak image SEO, layout shifts, and potentially broken social previews/product schema images.
- **Fix:** Add optimized licensed assets with stable dimensions and descriptive alt text, or remove/update references. Add a CI check that fails on missing public assets.
- **Status:** Open

### BUG-005: Homepage live counters render `0+`
- **Location:** `src/app/page.tsx`, `src/components/CountUp.tsx`; confirmed on live homepage.
- **Evidence:** Live rendered text shows `0+ HAPPY STUDENTS`, `0+ COURSES DELIVERED`, `0+ DOWNLOADS`, and `0+ EXPERT COURSES`.
- **Impact:** Damages trust, creates misleading/low-quality visible content, and may reduce conversion and search quality signals.
- **Fix:** Ensure CountUp initializes from the supplied value during SSR/client hydration, or render truthful static values first. Test with JS disabled and after hydration.
- **Status:** Open

### BUG-006: Sitemap timestamps are regenerated on every request/build
- **Location:** `src/app/sitemap.ts`
- **Evidence:** `lastModified` is set to `new Date().toISOString()` for every static and product URL. Live sitemap shows the audit date for all URLs.
- **Impact:** Signals that every page changed whenever the sitemap regenerates; wastes crawl budget and makes change history unreliable.
- **Fix:** Use real page/product `lastUpdated` values, stable dates for static pages, and only update when content changes. Add sitemap tests for stable output.
- **Status:** Open

### BUG-007: Filter/search query variants are not controlled for indexation
- **Location:** `src/app/shop/page.tsx`, `src/app/sitemap.ts`
- **Evidence:** Shop supports `cat`, `q`, `sort`, `kind`, and `free` query variants, but no query-specific canonical/noindex strategy is visible. Collection JSON-LD URL only partially represents filters.
- **Impact:** Duplicate/thin URLs and crawl waste; search pages may be indexed without useful landing-page content.
- **Fix:** Canonicalize approved category landing pages; apply `noindex,follow` to internal search/sort/filter combinations that should not rank; keep only intentional category URLs in the sitemap; test metadata for every query class.
- **Status:** Open

### BUG-008: Live URL host consistency is not formally enforced
- **Location:** `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, product metadata; live links use both `edubaazar.shop` and `www.edubaazar.shop` in fetched output.
- **Impact:** Duplicate host signals, split link equity, inconsistent canonical/share URLs, and possible cookie/session confusion.
- **Fix:** Pick one canonical host, add a permanent redirect for the other, use one shared `SITE_URL` environment/config value everywhere, and add a host consistency test.
- **Status:** Needs verification

### BUG-009: No automated broken-link, canonical, or structured-data regression checks
- **Location:** project tooling; no SEO test suite found.
- **Impact:** Broken URLs/assets and metadata regress silently after content changes.
- **Fix:** Add a CI crawler/static scanner covering sitemap URLs, internal links, status codes, canonical targets, metadata, image references, JSON-LD, and robots rules.
- **Status:** Open

### BUG-010: No Search Console/GA4/rank data integration
- **Location:** current app; no SEO data model or sync job found.
- **Impact:** The requested ranking/indexing details cannot be measured. Any dashboard number would be fabricated or incomplete.
- **Fix:** Implement server-side integrations, snapshots, source/date labels, quotas, consent/privacy handling, and clear `data unavailable` states.
- **Status:** Open

### BUG-011: Product structured data uses fallback review counts and unverified ratings
- **Location:** `src/app/product/[slug]/page.tsx`
- **Evidence:** `reviewCount` falls back to `10` when parsing fails, and ratings/review values are catalog constants.
- **Impact:** Rich-result eligibility and trust risk if visible reviews do not substantiate schema values; fallback can create inaccurate markup.
- **Fix:** Emit aggregate ratings only from verifiable review records that match visible page content. Omit the property when unavailable; never use a made-up fallback.
- **Status:** Open

## Medium

### BUG-012: Root metadata declares Hindi alternate without a Hindi page
- **Location:** `src/app/layout.tsx`
- **Evidence:** `alternates.languages` maps both `en` and `hi` to the same URL.
- **Impact:** Misleading hreflang signal; language targeting is not meaningful.
- **Fix:** Remove `hi` until a real Hindi URL exists, or create translated pages with self-referencing and reciprocal hreflang.
- **Status:** Open

### BUG-013: Metadata coverage is incomplete/inconsistent across routes
- **Location:** `src/app` route tree
- **Evidence:** Explicit metadata was found for layout, about, contact, privacy, product, refund, shop, and terms. Account, admin, cart, checkout, compare, login, register, wishlist, and not-found pages need an explicit indexability/social policy review.
- **Impact:** Inconsistent titles, descriptions, canonical behavior, and accidental indexing of private/low-value pages.
- **Fix:** Add route-level metadata or shared policies. Mark private/transactional routes `noindex,follow`; verify admin/login/checkout remain blocked and not exposed in sitemap.
- **Status:** Open

### BUG-014: Open Graph image is a small logo rather than page/product imagery
- **Location:** `src/app/layout.tsx` and several page metadata objects
- **Evidence:** Root social image is `/logo/edulogo.jpeg` at 512x512; many page Open Graph objects omit image fields.
- **Impact:** Weak social previews and lower share click-through; product pages may present inconsistent previews.
- **Fix:** Create a consistent 1200x630 branded fallback and page/product-specific images with valid dimensions and alt text.
- **Status:** Open

### BUG-015: Product image rendering bypasses Next image optimization
- **Location:** `src/app/product/[slug]/page.tsx`, components using raw `<img>` tags
- **Impact:** Larger payloads, weaker LCP, no automatic responsive sizing, and avoidable layout/performance cost.
- **Fix:** Use `next/image` with explicit sizes/fill strategy, verified dimensions, lazy loading below the fold, and an intentional priority image for the hero product image.
- **Status:** Open

### BUG-016: JSON-LD has potentially misleading type/content combinations
- **Location:** `src/app/layout.tsx`, `src/app/shop/page.tsx`, product page
- **Evidence:** Product pages emit `FAQPage` questions generated from template text; shop emits CollectionPage with descriptions saying premium courses even when filters include books/tools.
- **Impact:** Structured-data quality and eligibility risk when markup does not precisely match visible content.
- **Fix:** Keep schema properties truthful and page-specific. Validate with Schema Markup Validator and Google Rich Results Test; omit unsupported FAQ markup.
- **Status:** Needs verification

### BUG-017: Accessibility issues can reduce UX and audit quality
- **Location:** `src/app/page.tsx`, components, product/shop pages
- **Evidence:** Homepage uses a visually-hidden H1 after interactive content; raw images and icon controls require a full alt/name audit; filter controls use links containing read-only checkboxes.
- **Impact:** Screen-reader confusion, poor interaction semantics, and weaker usability signals.
- **Fix:** Use a visible, meaningful H1 in the page heading hierarchy, semantic buttons/links, accessible names, accurate alt text, focus states, and keyboard tests.
- **Status:** Needs verification

### BUG-018: Stale content dates and inconsistent commercial claims
- **Location:** `src/lib/products.ts`, `src/app/about/page.tsx`, homepage; product updates mostly 2024 while site footer is 2026.
- **Impact:** Users and crawlers may see stale course freshness; claims such as counts, discounts, instant access, and certificates need source validation.
- **Fix:** Establish content ownership and a review cadence. Store real publish/update dates, expire promotions, and show only verifiable metrics.
- **Status:** Open

## Legacy/maintenance findings

### BUG-019: Legacy HTML app remains in the repository with a separate auth/data implementation
- **Location:** `legacy/*.html`, `legacy/script.js`, `legacy/supabase-config.js`
- **Evidence:** Legacy code uses sessionStorage and a separate Supabase browser client; the current Next app uses localStorage and another flow.
- **Impact:** Confusion about production source, duplicate behavior, accidental deployment, and security drift.
- **Fix:** Declare one production source of truth. Archive or remove legacy code from deployment inputs after preserving required migration history; scan CI only against the active app.
- **Status:** Open

### BUG-020: Legacy Supabase anon configuration is committed in browser code
- **Location:** `legacy/supabase-config.js`
- **Evidence:** Supabase URL and anon key are present in a tracked legacy file.
- **Impact:** An anon key is not a secret by itself, but it becomes dangerous with permissive RLS and makes the public attack surface explicit.
- **Fix:** Apply strict RLS, review key exposure, rotate keys if misuse is suspected, and remove unused legacy configuration. Never commit service-role keys.
- **Status:** Open

## Verification checklist

- [ ] Confirm canonical host and HTTP redirects for apex and `www`.
- [ ] Run a production crawler against every sitemap URL and all internal links.
- [ ] Inspect Search Console indexing report, sitemap status, manual actions, and security issues.
- [ ] Run PageSpeed Insights/CrUX for homepage, shop, category, and representative product pages on mobile and desktop.
- [ ] Validate every JSON-LD block against visible page content.
- [ ] Check all public image URLs return `200` and have correct content type.
- [ ] Confirm private routes are not indexed and cannot be accessed by unauthorized admin users.
- [ ] Re-test CountUp after hydration and with JavaScript disabled.
- [ ] Review product rights, safety, malware scanning, and download provenance.
