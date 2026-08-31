"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, ExternalLink, Gauge, Globe2, Search, ShieldAlert, Play, Wrench } from "lucide-react";

type SeoSeverity = "critical" | "high" | "medium" | "low";

interface ScanResult {
  score: number;
  totalIssues: number;
  pages: number;
  issues: string[];
}

interface FixResult {
  score: number;
  fixes: string[];
  issues: string[];
}

export default function SeoDashboardPage() {
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [query, setQuery] = useState("");

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/seo-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scan" }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
      } else {
        alert(data.error || "Scan failed");
      }
    } catch (e: unknown) {
      alert("Scan error: " + (e instanceof Error ? e.message : String(e)));
    }
    setScanning(false);
  };

  const runFix = async () => {
    setFixing(true);
    try {
      const res = await fetch("/api/admin/seo-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fix" }),
      });
      const data = await res.json();
      if (data.success) {
        setFixResult(data);
      } else {
        alert(data.error || "Fix failed");
      }
    } catch (e: unknown) {
      alert("Fix error: " + (e instanceof Error ? e.message : String(e)));
    }
    setFixing(false);
  };

  const downloadReport = () => {
    if (!scanResult) return;
    const csv = "Issue,Category\n" + scanResult.issues.map(i => `"${i.replace(/"/g, '""')}","SEO"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edubazar-seo-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score: number) => score >= 80 ? "#2e7d32" : score >= 50 ? "#f57c00" : "#c62828";
  const scoreLabel = (score: number) => score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Critical";

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7f6", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style jsx>{`
        .seo-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
        .seo-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .seo-top h1 { font-size: 28px; font-weight: 700; margin: 0; color: #181d27; }
        .seo-top p { color: #666; margin: 4px 0 0; font-size: 14px; }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: #687975; font-size: 13px; font-weight: 600; text-decoration: none; margin-bottom: 12px; }
        .back-link:hover { text-decoration: underline; }
        .btn-primary { padding: 10px 20px; background: #1a1a2e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary:hover { background: #2a2a4e; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-outline { padding: 10px 20px; background: white; color: #181d27; border: 1.5px solid #d5d7da; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .btn-outline:hover { background: #f5f5f5; }
        .actions-bar { display: flex; gap: 10px; flex-wrap: wrap; }
        .score-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .score-circle { width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 6px solid; flex-shrink: 0; }
        .score-circle h2 { font-size: 32px; font-weight: 800; margin: 0; line-height: 1; }
        .score-circle small { font-size: 11px; color: #666; margin-top: 2px; }
        .score-info h3 { font-size: 18px; margin: 0 0 4px; color: #181d27; }
        .score-info p { font-size: 13px; color: #666; margin: 0; }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-box { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); text-align: center; }
        .stat-box h4 { font-size: 28px; font-weight: 700; margin: 0; color: #181d27; }
        .stat-box p { font-size: 12px; color: #666; margin: 4px 0 0; }
        .issues-panel { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; overflow: hidden; }
        .issues-head { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .issues-head h3 { margin: 0; font-size: 16px; }
        .issue-item { padding: 14px 24px; border-bottom: 1px solid #f8f8f8; display: flex; align-items: center; gap: 12px; font-size: 13px; }
        .issue-item:last-child { border-bottom: none; }
        .issue-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .fixes-panel { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 24px; }
        .fixes-head { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
        .fixes-head h3 { margin: 0; font-size: 16px; }
        .fix-item { padding: 12px 24px; border-bottom: 1px solid #f8f8f8; font-size: 13px; color: #333; }
        .fix-item:last-child { border-bottom: none; }
        .empty-state { text-align: center; padding: 60px 24px; color: #888; }
        .empty-state h3 { margin: 0 0 8px; color: #181d27; font-size: 18px; }
        .empty-state p { font-size: 14px; margin: 0; }
        .loading { display: flex; align-items: center; justify-content: center; padding: 40px; gap: 10px; color: #666; }
        @media (max-width: 700px) { .stats-row { grid-template-columns: 1fr; } .seo-top { flex-direction: column; } }
      `}</style>

      <div className="seo-container">
        <Link href="/admin" className="back-link"><ArrowLeft size={15} /> Back to Admin Dashboard</Link>

        <div className="seo-top">
          <div>
            <h1>SEO Control Center</h1>
            <p>Scan your site for SEO issues and get fix suggestions.</p>
          </div>
          <div className="actions-bar">
            <button className="btn-primary" onClick={runScan} disabled={scanning}>
              <Play size={14} /> {scanning ? "Scanning..." : "Run SEO Scan"}
            </button>
            <button className="btn-primary" onClick={runFix} disabled={fixing}>
              <Wrench size={14} /> {fixing ? "Fixing..." : "Auto-Fix SEO"}
            </button>
            {scanResult && (
              <button className="btn-outline" onClick={downloadReport}>
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>

        {scanning && <div className="loading"><Gauge size={20} style={{ animation: "spin 1s linear infinite" }} /> Scanning your site...</div>}

        {fixing && <div className="loading"><Wrench size={20} style={{ animation: "spin 1s linear infinite" }} /> Generating fix suggestions...</div>}

        {!scanResult && !scanning && !fixing && (
          <div className="empty-state" style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Gauge size={48} style={{ color: "#d5d7da", marginBottom: 16 }} />
            <h3>SEO Scanner Ready</h3>
            <p>Click "Run SEO Scan" to analyze your site for SEO issues.</p>
          </div>
        )}

        {scanResult && (
          <>
            <div className="score-card">
              <div className="score-circle" style={{ borderColor: scoreColor(scanResult.score) }}>
                <h2 style={{ color: scoreColor(scanResult.score) }}>{scanResult.score}</h2>
                <small>/ 100</small>
              </div>
              <div className="score-info">
                <h3>SEO Score: {scoreLabel(scanResult.score)}</h3>
                <p>Found {scanResult.totalIssues} issues across {scanResult.pages} pages. Review and fix the highest priority items first.</p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <h4>{scanResult.score}/100</h4>
                <p>SEO Score</p>
              </div>
              <div className="stat-box">
                <h4>{scanResult.totalIssues}</h4>
                <p>Issues Found</p>
              </div>
              <div className="stat-box">
                <h4>{scanResult.pages}</h4>
                <p>Pages Scanned</p>
              </div>
            </div>

            <div className="issues-panel">
              <div className="issues-head"><h3>SEO Issues ({scanResult.issues.length})</h3></div>
              {scanResult.issues.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#888" }}>No issues found! Your SEO looks good.</div>
              ) : (
                scanResult.issues.map((issue, i) => (
                  <div className="issue-item" key={i}>
                    <div className="issue-dot" style={{ background: issue.includes("FIX") ? "#c62828" : issue.includes("Check") ? "#f57c00" : "#388e3c" }} />
                    <span>{issue}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {fixResult && (
          <div className="fixes-panel">
            <div className="fixes-head"><h3>Fix Suggestions ({fixResult.fixes.length})</h3></div>
            {fixResult.fixes.map((fix, i) => (
              <div className="fix-item" key={i}>{fix}</div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
