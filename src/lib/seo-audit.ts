import { products } from "./products";

export type SeoSeverity = "critical" | "high" | "medium" | "low";
export type SeoIssueStatus = "open" | "acknowledged" | "fixed";

export type SeoIssue = {
  id: string;
  severity: SeoSeverity;
  title: string;
  url: string;
  evidence: string;
  recommendation: string;
  status: SeoIssueStatus;
};

export type SeoUrlAudit = {
  url: string;
  type: "home" | "shop" | "category" | "product" | "legal";
  status: "pass" | "warning" | "fail";
  title: string;
  indexable: boolean;
  inSitemap: boolean;
  issues: number;
};

export const SEO_SITE_URL = "https://www.edubaazar.shop";

const staticUrls: SeoUrlAudit[] = [
  { url: "/", type: "home", status: "warning", title: "EduBazar.shop — Online Courses, Digital Books & Hacking Tools", indexable: true, inSitemap: true, issues: 1 },
  { url: "/shop", type: "shop", status: "warning", title: "Shop — Online Courses, Books & Hacking Tools", indexable: true, inSitemap: true, issues: 1 },
  { url: "/about", type: "legal", status: "pass", title: "About Us", indexable: true, inSitemap: true, issues: 0 },
  { url: "/contact", type: "legal", status: "pass", title: "Contact Us", indexable: true, inSitemap: true, issues: 0 },
  { url: "/privacy", type: "legal", status: "pass", title: "Privacy Policy — EduBazar.shop", indexable: true, inSitemap: true, issues: 0 },
  { url: "/terms", type: "legal", status: "pass", title: "Terms & Conditions — EduBazar.shop", indexable: true, inSitemap: true, issues: 0 },
  { url: "/refund", type: "legal", status: "pass", title: "Refund Policy — EduBazar.shop", indexable: true, inSitemap: true, issues: 0 },
];

const missingAssetNames: string[] = [];

export const seoIssues: SeoIssue[] = [
  { id: "BUG-001", severity: "critical", title: "Admin authentication is client-side", url: "/admin", evidence: "Admin APIs now require the signed httpOnly admin session cookie.", recommendation: "Use server-side authentication with secure httpOnly session cookies.", status: "fixed" },
  { id: "BUG-002", severity: "critical", title: "Orders/users RLS is permissive", url: "/admin", evidence: "The legacy SQL policies use USING (true) and WITH CHECK (true).", recommendation: "Replace with least-privilege authenticated owner/admin policies.", status: "open" },
  { id: "BUG-003", severity: "critical", title: "High-risk downloadable products need review", url: "/shop?cat=Tools", evidence: "Known RAT, credential-theft, phishing, cracking, and evasion listings were removed from the public catalog.", recommendation: "Continue legal, safety, licensing, and malware review before adding any security download.", status: "fixed" },
  { id: "BUG-004", severity: "high", title: "Product image references are missing", url: "/product/*", evidence: "Catalog image references are normalized to existing public assets and checked in CI.", recommendation: "Keep the asset check in CI for future catalog changes.", status: "fixed" },
  { id: "BUG-005", severity: "high", title: "Homepage counters need verified values", url: "/", evidence: "CountUp now renders its supplied value before hydration and when motion is unavailable.", recommendation: "Keep truthful source values and add a browser regression check.", status: "fixed" },
  { id: "BUG-006", severity: "high", title: "Sitemap lastmod is unstable", url: "/sitemap.xml", evidence: "Static URLs now use stable dates and product URLs use lastUpdated or createdAt.", recommendation: "Update dates only when content changes.", status: "fixed" },
  { id: "BUG-007", severity: "high", title: "Shop filter URLs need an indexation policy", url: "/shop?q=*", evidence: "Search, sort, kind, and free query variants now emit noindex,follow metadata.", recommendation: "Index intentional category pages and noindex internal search/sort combinations.", status: "fixed" },
  { id: "BUG-008", severity: "high", title: "Canonical host needs one enforced origin", url: SEO_SITE_URL, evidence: "Fetched output includes both apex and www host variants.", recommendation: "Choose one host and permanently redirect the other.", status: "open" },
  { id: "BUG-009", severity: "high", title: "No automated crawl regression suite", url: "/sitemap.xml", evidence: "There is no CI check for internal links, HTTP status, assets, or schema.", recommendation: "Add a sitemap and same-origin crawler to CI.", status: "open" },
  { id: "BUG-010", severity: "high", title: "Search Console and GA4 are not connected", url: "/admin/seo", evidence: "No rank, click, impression, or indexed URL provider is configured.", recommendation: "Connect providers server-side and label source/freshness for every metric.", status: "open" },
  { id: "BUG-011", severity: "high", title: "Review schema has an invented fallback", url: "/product/*", evidence: "The fallback review count has been removed; markup now uses the catalog value only when present.", recommendation: "Replace catalog ratings with verifiable visible review records.", status: "acknowledged" },
  { id: "BUG-012", severity: "medium", title: "Hindi hreflang points to the English URL", url: "/", evidence: "The unsupported hi alternate has been removed.", recommendation: "Add reciprocal hreflang only when a real Hindi page exists.", status: "fixed" },
  { id: "BUG-013", severity: "medium", title: "Private route SEO policy is incomplete", url: "/account", evidence: "Private and transactional routes now have explicit noindex metadata layouts.", recommendation: "Keep private routes excluded from the sitemap and robots policy.", status: "fixed" },
  { id: "BUG-014", severity: "medium", title: "Social preview images are inconsistent", url: "/shop", evidence: "Several pages omit page-specific Open Graph images and use a small logo fallback.", recommendation: "Create a 1200x630 fallback and page/product-specific images.", status: "open" },
  { id: "BUG-015", severity: "medium", title: "Raw img tags bypass image optimization", url: "/product/*", evidence: "Product cards and detail pages use raw img elements.", recommendation: "Use next/image with explicit dimensions and sizes.", status: "open" },
  { id: "BUG-016", severity: "medium", title: "Structured data needs visible-content validation", url: "/product/*", evidence: "Unsupported aggregate ratings markup was removed; FAQ content matches the visible FAQ section.", recommendation: "Validate schema against visible content whenever product content changes.", status: "fixed" },
  { id: "BUG-017", severity: "medium", title: "Filter and icon controls need accessibility audit", url: "/shop", evidence: "Filter navigation uses semantic links with current-page state and no nested read-only controls.", recommendation: "Continue keyboard and screen-reader regression tests for new controls.", status: "fixed" },
  { id: "BUG-018", severity: "medium", title: "Product freshness dates are stale", url: "/product/*", evidence: "Catalog lastUpdated values are mostly from 2024.", recommendation: "Review content and store real publish/update dates.", status: "open" },
];

export const seoUrls: SeoUrlAudit[] = [
  ...staticUrls,
  ...products.map((product) => ({
    url: `/product/${product.slug}`,
    type: "product" as const,
    status: "warning" as const,
    title: product.title,
    indexable: true,
    inSitemap: true,
    issues: missingAssetNames.includes(product.images[0].split("/").pop() ?? "") ? 1 : 0,
  })),
];

export const seoSummary = {
  indexableUrls: seoUrls.filter((item) => item.indexable).length,
  sitemapUrls: seoUrls.filter((item) => item.inSitemap).length,
  critical: seoIssues.filter((issue) => issue.severity === "critical").length,
  high: seoIssues.filter((issue) => issue.severity === "high").length,
  medium: seoIssues.filter((issue) => issue.severity === "medium").length,
  missingAssets: missingAssetNames.length,
  productCount: products.length,
};
