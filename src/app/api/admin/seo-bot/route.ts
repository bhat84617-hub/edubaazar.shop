import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSession } from "@/lib/admin-session";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase-config";

function getDb() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function scanSite(): Promise<{ score: number; issues: string[]; pages: { url: string; status: string; issues: string[] }[] }> {
  const issues: string[] = [];
  const pages: { url: string; status: string; issues: string[] }[] = [];

  const publicPages = [
    { url: "/", name: "Home" },
    { url: "/shop", name: "Shop" },
    { url: "/about", name: "About" },
    { url: "/contact", name: "Contact" },
    { url: "/cart", name: "Cart" },
    { url: "/checkout", name: "Checkout" },
    { url: "/login", name: "Login" },
    { url: "/register", name: "Register" },
    { url: "/privacy", name: "Privacy" },
    { url: "/terms", name: "Terms" },
    { url: "/refund", name: "Refund" },
  ];

  let score = 100;

  for (const page of publicPages) {
    const pageIssues: string[] = [];

    if (page.url === "/") {
      pageIssues.push("Homepage - verify meta tags are set");
    }
    if (page.url === "/shop") {
      pageIssues.push("Shop page - verify product listing SEO");
    }

    pages.push({ url: `https://edubaazar.shop${page.url}`, status: "ok", issues: pageIssues });
  }

  try {
    const db = getDb();
    const { data: products } = await db.from("products").select("id, title, slug").limit(50);
    if (products) {
      for (const p of products) {
        if (!p.slug) {
          issues.push(`Product "${p.title}" is missing slug`);
          score -= 2;
        }
      }
    }
  } catch {
    issues.push("Could not check products in database");
    score -= 5;
  }

  const siteUrl = "https://edubaazar.shop";
  issues.push("Check: meta descriptions on all pages");
  issues.push("Check: Open Graph tags for social sharing");
  issues.push("Check: robots.txt allows crawling");
  issues.push("Check: sitemap.xml is up to date");
  issues.push("Check: images have alt text");
  issues.push("Check: HTTPS redirect configured");
  issues.push("Check: page load speed < 3 seconds");
  issues.push("Check: mobile responsive design");

  score = Math.max(0, score);

  return { score, issues, pages };
}

function generateFixSuggestions(scanResult: { score: number; issues: string[]; pages: { url: string; status: string; issues: string[] }[] }): string[] {
  const fixes: string[] = [];

  fixes.push("1. Add meta descriptions to all pages (150-160 chars each)");
  fixes.push("2. Add Open Graph tags for social media sharing");
  fixes.push("3. Optimize images - add alt text, compress files");
  fixes.push("4. Add structured data (JSON-LD) for products");
  fixes.push("5. Ensure all internal links work");
  fixes.push("6. Add breadcrumb navigation");
  fixes.push("7. Optimize page titles with keywords");
  fixes.push("8. Add canonical URLs to prevent duplicate content");

  for (const issue of scanResult.issues) {
    if (issue.includes("missing slug")) {
      fixes.push(`FIX: ${issue} - Add SEO-friendly slug in product settings`);
    }
  }

  return fixes;
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("edubazar_admin_session")?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json() as { action: string };

    if (action === "scan") {
      const result = await scanSite();
      return NextResponse.json({
        success: true,
        score: result.score,
        totalIssues: result.issues.length,
        pages: result.pages.length,
        issues: result.issues,
      });
    }

    if (action === "fix") {
      const scanResult = await scanSite();
      const fixes = generateFixSuggestions(scanResult);
      return NextResponse.json({
        success: true,
        message: "SEO analysis complete. See suggestions below.",
        score: scanResult.score,
        fixes,
        issues: scanResult.issues,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
