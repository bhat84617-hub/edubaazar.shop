import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json(); // action: "scan" | "fix"

    const botDir = path.join(process.cwd(), "..", "seo-bot");
    // Adjust path: from /src/app/api/admin/seo-bot/route.ts, bot is at project root / seo-bot
    const rootDir = path.resolve(process.cwd(), "..");
    const botPath = path.join(rootDir, "seo-bot");

    let output = "";

    if (action === "scan") {
      const scannerPath = path.join(botPath, "seo-scanner.js");
      if (!fs.existsSync(scannerPath)) {
        return NextResponse.json({ error: "seo-scanner.js not found at: " + scannerPath }, { status: 404 });
      }
      output = execSync(`node "${scannerPath}"`, { cwd: botPath, encoding: "utf8", maxBuffer: 1024 * 1024 });
      // Read the generated report
      const reportPath = path.join(botPath, "seo-report.json");
      const reportData = fs.readFileSync(reportPath, "utf8");
      const report = JSON.parse(reportData);
      return NextResponse.json({ success: true, output, score: report.score, action: "scan", report });
    }

    if (action === "fix") {
      const fixerPath = path.join(botPath, "seo-auto-fixer.js");
      if (!fs.existsSync(fixerPath)) {
        return NextResponse.json({ error: "seo-auto-fixer.js not found at: " + fixerPath }, { status: 404 });
      }
      output = execSync(`node "${fixerPath}"`, { cwd: botPath, encoding: "utf8", maxBuffer: 1024 * 1024 });
      return NextResponse.json({ success: true, output, action: "fix", message: "Auto-fix completed. Check fixes needed file." });
    }

    return NextResponse.json({ error: "Unknown action: " + action }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e), stderr: e.stderr || "" }, { status: 500 });
  }
}
