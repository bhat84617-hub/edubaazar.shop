import fs from "node:fs";
import path from "node:path";
import { products, SENSITIVE_SLUGS, isSensitiveProduct } from "../src/lib/products.ts";

const root = process.cwd();
const errors = [];
const warnings = [];

const staticRoutes = new Set([
  "/",
  "/shop",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/account",
  "/wishlist",
  "/compare",
  "/search",
  "/blog",
  "/admin",
  "/admin/login",
  "/admin/seo",
  "/sitemap.xml",
  "/robots.txt",
]);

const productSlugs = new Set(products.map((p) => p.slug));

// ── 1. Internal href/src references ──
const rawRefs = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      for (const m of content.matchAll(/(?:href|src)=\{?["'`](\/[^"'`#?]+)["'`]/g)) {
        rawRefs.push({ p: m[1], file: path.relative(root, full) });
      }
    }
  }
}
walk(path.join(root, "src"));

for (const { p, file } of rawRefs) {
  // skip template-literal dynamic paths like /product/${slug}
  if (p.includes("${")) continue;
  if (
    p.startsWith("/images/") ||
    p.startsWith("/logo/") ||
    p.startsWith("/api/") ||
    p.startsWith("/_next") ||
    p.startsWith("/product/") ||
    p.startsWith("/blog/") ||
    p.startsWith("/llms")
  ) {
    if (p.startsWith("/product/")) {
      const slug = decodeURIComponent(p.slice("/product/".length));
      if (slug && !productSlugs.has(slug)) errors.push(`Broken product link ${p} in ${file}`);
    }
    continue;
  }
  if (staticRoutes.has(p) || p.startsWith("/shop?") || p === "/shop") continue;
  warnings.push(`Unrecognized internal path ${p} in ${file}`);
}

// ── 2. Product image assets ──
let missingAssets = 0;
for (const p of products) {
  for (const img of p.images || []) {
    const abs = path.join(root, "public", img.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      errors.push(`Missing asset ${img} (product ${p.id})`);
      missingAssets++;
    }
  }
}

// ── 3. Sensitive products must not remain in public catalog ──
for (const p of products) {
  if (SENSITIVE_SLUGS.has(p.slug) || isSensitiveProduct(p.slug)) {
    errors.push(`Sensitive product still public: ${p.slug}`);
  }
}

// ── 4. Canonical host: www preferred in source ──
function walkHost(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHost(full);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name) && !full.includes("next.config.ts")) {
      const content = fs.readFileSync(full, "utf8");
      const matches = content.match(/https:\/\/edubaazar\.shop(?!\.)/g);
      if (matches) {
        warnings.push(`Apex host reference (prefer www): ${path.relative(root, full)}: ${matches.length}×`);
      }
    }
  }
}
walkHost(path.join(root, "src"));

// ── 5. Product JSON-LD sanity ──
const productPage = fs.readFileSync(path.join(root, "src/app/product/[slug]/page.tsx"), "utf8");
if (!productPage.includes('"@type": "Product"')) errors.push("Product page missing Product JSON-LD");
if (productPage.includes("|| 100") || productPage.includes('reviewCount || "10"')) {
  errors.push("Product page still has fake reviewCount fallback");
}

// ── 6. robots disallows private paths ──
const robotsSrc = fs.readFileSync(path.join(root, "src/app/robots.ts"), "utf8");
for (const must of ["/admin/", "/account/", "/checkout/", "/cart", "/search"]) {
  if (!robotsSrc.includes(must)) errors.push(`robots.ts missing disallow ${must}`);
}

// ── 7. Sitemap excludes sensitive ──
const sitemapSrc = fs.readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
if (!sitemapSrc.includes("isSensitiveProduct")) {
  errors.push("sitemap.ts does not filter sensitive products");
}

// ── 8. OG image exists ──
if (!fs.existsSync(path.join(root, "public/images/og-cover.png"))) {
  errors.push("Missing public/images/og-cover.png");
}

// ── Report ──
console.log(`Internal refs checked: ${rawRefs.length}`);
console.log(`Public products: ${products.length}`);
console.log(`Missing assets: ${missingAssets}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log("  - " + w);
  if (warnings.length > 40) console.log(`  … +${warnings.length - 40} more`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const e of errors) console.error("  x " + e);
  process.exit(1);
}
console.log("\ncheck:crawl passed");
