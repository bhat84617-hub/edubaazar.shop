"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, ExternalLink, Gauge, Globe2, LockKeyhole, Search, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import { seoIssues, seoSummary, seoUrls, type SeoIssue, type SeoSeverity } from "@/lib/seo-audit";

const severityOrder: SeoSeverity[] = ["critical", "high", "medium", "low"];

function downloadReport(issues: SeoIssue[]) {
  const header = "Issue,Severity,URL,Status,Evidence,Recommendation\n";
  const rows = issues.map((issue) => [issue.title, issue.severity, issue.url, issue.status, issue.evidence, issue.recommendation]
    .map((value) => `"${value.replaceAll('"', '""')}"`).join(","));
  const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "edubazar-seo-issues.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SeoDashboardPage() {
  const { mounted } = useStore();
  const [filter, setFilter] = useState<"all" | SeoSeverity>("all");
  const [query, setQuery] = useState("");
  const [localIssues, setLocalIssues] = useState(seoIssues);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => setAuthed(response.ok)).catch(() => setAuthed(false)).finally(() => setSessionChecked(true));
  }, []);
  const filteredIssues = useMemo(() => localIssues
    .filter((issue) => filter === "all" || issue.severity === filter)
    .filter((issue) => `${issue.title} ${issue.url} ${issue.evidence}`.toLowerCase().includes(query.toLowerCase())), [filter, localIssues, query]);

  const markAcknowledged = (id: string) => {
    setLocalIssues((current) => current.map((issue) => issue.id === id ? { ...issue, status: "acknowledged" } : issue));
  };

  if (!mounted || !sessionChecked) {
    return <main className="seo-loading"><Gauge size={24} /> Loading SEO control center...</main>;
  }

  if (!authed) {
    return (
      <main className="seo-locked">
        <LockKeyhole size={42} />
        <h1>SEO Control Center</h1>
        <p>Admin authentication is required to view technical SEO data.</p>
        <Link href="/admin/login" className="btn btn-primary">Go to Admin Login</Link>
      </main>
    );
  }

  return (
    <main className="seo-shell">
      <header className="seo-header">
        <div>
          <Link href="/admin" className="seo-back"><ArrowLeft size={15} /> Admin dashboard</Link>
          <p className="seo-kicker">EDUBAZAR.SHOP / SEARCH HEALTH</p>
          <h1>SEO Control Center</h1>
          <p className="seo-subtitle">Technical visibility snapshot for your public catalog.</p>
        </div>
        <div className="seo-actions">
          <span className="seo-fresh"><span className="seo-dot" /> Repository audit · 23 Aug 2026</span>
          <button className="btn btn-primary btn-sm" onClick={() => downloadReport(filteredIssues)}><Download size={14} /> Export issues</button>
        </div>
      </header>

      <section className="seo-connection" aria-label="Data connections">
        <div className="seo-connection-icon"><Search size={20} /></div>
        <div><strong>Search Console is not connected</strong><span>Technical audit is live. Connect Search Console, GA4 and PageSpeed APIs to unlock real ranking, click, impression and Core Web Vitals data.</span></div>
        <button className="btn btn-outline btn-sm" disabled>Connection setup · Phase 2</button>
      </section>

      <section className="seo-kpis" aria-label="SEO summary">
        <div className="seo-kpi"><span>Indexable URLs</span><strong>{seoSummary.indexableUrls}</strong><small>Public routes in current audit</small></div>
        <div className="seo-kpi"><span>Sitemap coverage</span><strong>{Math.round((seoSummary.sitemapUrls / seoSummary.indexableUrls) * 100)}%</strong><small>{seoSummary.sitemapUrls} URLs listed</small></div>
        <div className="seo-kpi seo-kpi-alert"><span>Critical issues</span><strong>{seoSummary.critical}</strong><small>Immediate action required</small></div>
        <div className="seo-kpi"><span>Missing assets</span><strong>{seoSummary.missingAssets}</strong><small>Broken image references</small></div>
      </section>

      <div className="seo-grid">
        <section className="seo-panel seo-health">
          <div className="seo-panel-head"><div><p className="seo-kicker">HEALTH SCORE</p><h2>Technical readiness</h2></div><Gauge size={21} /></div>
          <div className="seo-score-row"><strong>62</strong><span>/ 100</span><b>Needs attention</b></div>
          <div className="seo-progress"><span style={{ width: "62%" }} /></div>
          <div className="seo-breakdown"><span><i className="pass" /> Crawlability <b>82%</b></span><span><i className="warn" /> Metadata <b>68%</b></span><span><i className="fail" /> Security <b>36%</b></span><span><i className="warn" /> Assets <b>54%</b></span></div>
        </section>
        <section className="seo-panel seo-coverage">
          <div className="seo-panel-head"><div><p className="seo-kicker">INDEXATION</p><h2>URL coverage</h2></div><Globe2 size={21} /></div>
          <div className="seo-bars"><div><span>Indexable public URLs</span><b>{seoSummary.indexableUrls}</b><em><i style={{ width: "100%" }} /></em></div><div><span>In sitemap</span><b>{seoSummary.sitemapUrls}</b><em><i style={{ width: "100%" }} /></em></div><div><span>Private URLs excluded</span><b>8</b><em><i className="muted" style={{ width: "35%" }} /></em></div></div>
          <p className="seo-note"><ShieldAlert size={14} /> Rankings are unavailable until a provider is connected.</p>
        </section>
      </div>

      <section className="seo-panel seo-issues-panel">
        <div className="seo-panel-head seo-issues-head"><div><p className="seo-kicker">ACTION QUEUE</p><h2>SEO issues</h2><p>Evidence from the code and live sitemap audit. Fix the highest-impact items first.</p></div><AlertTriangle size={21} /></div>
        <div className="seo-toolbar"><div className="seo-search"><Search size={16} /><input aria-label="Search SEO issues" placeholder="Search issues or URLs" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="seo-filters" role="group" aria-label="Filter issue severity">{["all", ...severityOrder.slice(0, 3)].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item as "all" | SeoSeverity)}>{item}</button>)}</div></div>
        <div className="seo-issue-list">{filteredIssues.map((issue) => <article className="seo-issue" key={issue.id}><div className={`seo-severity ${issue.severity}`}>{issue.severity}</div><div className="seo-issue-copy"><div className="seo-issue-title"><strong>{issue.title}</strong><span>{issue.id}</span></div><Link href={issue.url.startsWith("http") ? issue.url : issue.url} className="seo-issue-url">{issue.url}<ExternalLink size={12} /></Link><p>{issue.evidence}</p><small>Fix: {issue.recommendation}</small></div><div className="seo-issue-action"><span className={`seo-status ${issue.status}`}>{issue.status}</span>{issue.status === "open" && <button onClick={() => markAcknowledged(issue.id)}>Acknowledge</button>}</div></article>)}{filteredIssues.length === 0 && <p className="seo-empty">No issues match this filter.</p>}</div>
      </section>

      <section className="seo-panel seo-url-panel"><div className="seo-panel-head"><div><p className="seo-kicker">URL INVENTORY</p><h2>Public pages</h2></div><span className="seo-count">{seoUrls.length} audited</span></div><div className="seo-table-wrap"><table className="seo-table"><thead><tr><th>URL</th><th>Type</th><th>Indexable</th><th>Sitemap</th><th>Issues</th><th>Status</th></tr></thead><tbody>{seoUrls.slice(0, 12).map((item) => <tr key={item.url}><td><strong>{item.url}</strong><small>{item.title}</small></td><td>{item.type}</td><td><CheckCircle2 size={15} className="seo-table-pass" /> Yes</td><td>{item.inSitemap ? "Yes" : "No"}</td><td>{item.issues || "—"}</td><td><span className={`seo-pill ${item.status}`}>{item.status}</span></td></tr>)}</tbody></table></div><p className="seo-note">Showing the first 12 URLs. Full inventory contains {seoUrls.length} public routes from the current catalog.</p></section>
    </main>
  );
}
