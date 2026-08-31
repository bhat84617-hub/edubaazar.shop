#!/usr/bin/env node
/**
 * SEO Scanner - Auto-scans and fixes SEO issues
 * Usage: node seo-scanner.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.edubaazar.shop';
const REPORT_FILE = path.join(__dirname, 'seo-report.json');
const FIX_LOG_FILE = path.join(__dirname, 'seo-fix-log.json');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(type, message) {
  const symbols = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    scan: `${colors.blue}🔍${colors.reset}`,
    fix: `${colors.green}🔧${colors.reset}`
  };
  console.log(`${symbols[type] || '•'} ${message}`);
}

function logHeader(text) {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}  ${text}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'SEO-Bot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// SEO Checks
const seoChecks = [
  {
    name: 'Title Tag',
    check: (html) => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return {
        passed: match && match[1].length >= 30 && match[1].length <= 70,
        value: match ? match[1].trim() : null,
        message: match ? `Found: "${match[1].trim().substring(0, 50)}..."` : 'Missing title tag'
      };
    }
  },
  {
    name: 'Meta Description',
    check: (html) => {
      const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                   html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
      return {
        passed: match && match[1].length >= 120 && match[1].length <= 160,
        value: match ? match[1].trim() : null,
        message: match ? `Found (${match[1].length} chars)` : 'Missing meta description'
      };
    }
  },
  {
    name: 'Canonical URL',
    check: (html) => {
      const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                   html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      return {
        passed: !!match,
        value: match ? match[1] : null,
        message: match ? `Canonical: ${match[1].substring(0, 50)}...` : 'Missing canonical URL'
      };
    }
  },
  {
    name: 'Hreflang Tags',
    check: (html) => {
      const matches = html.match(/<link[^>]+hreflang=["']([^"']+)["']/gi) || [];
      const hasEn = matches.some(m => /hreflang=["']en["']/i.test(m));
      const hasHi = matches.some(m => /hreflang=["']hi["']/i.test(m));
      return {
        passed: hasEn && hasHi,
        value: matches,
        message: `Found ${matches.length} hreflang tags${hasEn ? ' (EN ✓)' : ' (EN ✗)'}${hasHi ? ' (HI ✓)' : ' (HI ✗)'}`
      };
    }
  },
  {
    name: 'Open Graph Tags',
    check: (html) => {
      const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
      const found = ogTags.filter(tag => html.includes(`property="${tag}"`) || html.includes(`name="${tag}"`));
      return {
        passed: found.length >= 4,
        value: found,
        message: `OG Tags: ${found.length}/5 (${found.join(', ')})`
      };
    }
  },
  {
    name: 'Twitter Cards',
    check: (html) => {
      const hasTwitterCard = html.includes('name="twitter:card"') || html.includes('property="twitter:card"');
      const hasTwitterImage = html.includes('name="twitter:image"') || html.includes('property="twitter:image"');
      return {
        passed: hasTwitterCard,
        value: { card: hasTwitterCard, image: hasTwitterImage },
        message: `Twitter Card: ${hasTwitterCard ? '✓' : '✗'}, Image: ${hasTwitterImage ? '✓' : '✗'}`
      };
    }
  },
  {
    name: 'Schema.org JSON-LD',
    check: (html) => {
      const matches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi) || [];
      const schemas = matches.map(m => {
        const contentMatch = html.match(/type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (contentMatch) {
          try {
            const data = JSON.parse(contentMatch[1]);
            return data['@type'];
          } catch (e) { return 'Invalid JSON'; }
        }
        return 'Found';
      });
      return {
        passed: schemas.length > 0,
        value: schemas,
        message: `JSON-LD: ${schemas.length} schema(s) - ${schemas.join(', ')}`
      };
    }
  },
  {
    name: 'Image Alt Attributes',
    check: (html) => {
      const images = html.match(/<img[^>]+>/gi) || [];
      const withAlt = images.filter(img => /\balt=["'][^"']+["']/i.test(img));
      const withoutAlt = images.filter(img => !/\balt=["'][^"']+["']/i.test(img));
      return {
        passed: withAlt.length > 0 && withoutAlt.length === 0,
        value: { total: images.length, withAlt: withAlt.length, withoutAlt: withoutAlt.length },
        message: `Images: ${images.length} total, ${withAlt.length} with alt, ${withoutAlt.length} missing alt`
      };
    }
  },
  {
    name: 'Heading Structure (H1)',
    check: (html) => {
      const h1s = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
      return {
        passed: h1s.length === 1,
        value: h1s.length,
        message: `H1 tags: ${h1s.length} (${h1s.length === 1 ? '✓ Good' : '✗ Should be exactly 1'})`
      };
    }
  },
  {
    name: 'SSL/HTTPS',
    check: () => ({
      passed: SITE_URL.startsWith('https'),
      value: SITE_URL.startsWith('https'),
      message: `Site URL: ${SITE_URL.startsWith('https') ? '✓ HTTPS' : '✗ HTTP (should use HTTPS)'}`
    })
  },
  {
    name: 'Robots.txt',
    check: async () => {
      try {
        const { body } = await fetchUrl(`${SITE_URL}/robots.txt`);
        const hasSitemap = body.includes('sitemap');
        return { passed: true, value: body, message: `robots.txt: ✓ Found${hasSitemap ? ' (Sitemap directive ✓)' : ' (No sitemap directive)'}` };
      } catch (e) {
        return { passed: false, value: null, message: 'robots.txt: ✗ Not found' };
      }
    }
  },
  {
    name: 'Sitemap.xml',
    check: async () => {
      try {
        const { body } = await fetchUrl(`${SITE_URL}/sitemap.xml`);
        const urlCount = (body.match(/<loc>/gi) || []).length;
        return { passed: true, value: body, message: `sitemap.xml: ✓ Found (${urlCount} URLs indexed)` };
      } catch (e) {
        return { passed: false, value: null, message: 'sitemap.xml: ✗ Not found' };
      }
    }
  },
  {
    name: 'Favicon',
    check: (html) => {
      const hasIcon = html.includes('rel="icon"') || html.includes('rel="shortcut icon"');
      return { passed: hasIcon, value: hasIcon, message: `Favicon: ${hasIcon ? '✓ Found' : '✗ Missing'}` };
    }
  },
  {
    name: 'Viewport Meta',
    check: (html) => {
      const hasViewport = html.includes('name="viewport"');
      return { passed: hasViewport, value: hasViewport, message: `Viewport: ${hasViewport ? '✓ Found' : '✗ Missing'}` };
    }
  },
  {
    name: 'Language Declaration',
    check: (html) => {
      const hasLang = html.includes('lang="en"') || html.includes('lang="en-IN"');
      return { passed: hasLang, value: hasLang, message: `Language: ${hasLang ? '✓ en/en-IN declared' : '✗ Missing lang attribute'}` };
    }
  }
];

// Geo SEO Checks
const geoChecks = [
  {
    name: 'Geo-Targeted Content (IN)',
    check: (html) => {
      const inIndicators = ['India', 'INR', 'Rupee', 'Indian', '+91', '₹'];
      const found = inIndicators.filter(ind => html.toLowerCase().includes(ind.toLowerCase()));
      return {
        passed: found.length >= 2,
        value: found,
        message: `Geo signals: ${found.length} found (${found.join(', ')})`
      };
    }
  },
  {
    name: 'Local Business Schema',
    check: (html) => {
      const hasLocalBusiness = html.includes('"@type":"LocalBusiness"') || html.includes("'@type':'LocalBusiness'");
      return { passed: hasLocalBusiness, value: hasLocalBusiness, message: `LocalBusiness schema: ${hasLocalBusiness ? '✓ Found' : '✗ Missing'}` };
    }
  },
  {
    name: 'Contact Information',
    check: (html) => {
      const hasPhone = /\+91[\s\-]?\d[\s\-]?\d{4}[\s\-]?\d{4}/.test(html);
      const hasAddress = html.includes('address') || html.includes('location');
      return {
        passed: hasPhone,
        value: { phone: hasPhone, address: hasAddress },
        message: `Contact: Phone ${hasPhone ? '✓' : '✗'}, Address ${hasAddress ? '✓' : '✗'}`
      };
    }
  },
  {
    name: 'Social Media Links',
    check: (html) => {
      const socials = ['instagram.com', 'facebook.com', 'twitter.com', 'wa.me', 'whatsapp'];
      const found = socials.filter(s => html.toLowerCase().includes(s.toLowerCase()));
      return { passed: found.length > 0, value: found, message: `Social links: ${found.length} found (${found.join(', ')})` };
    }
  }
];

// Performance Checks
const perfChecks = [
  {
    name: 'GZIP Compression',
    check: async () => {
      try {
        const res = await new Promise((resolve, reject) => {
          const req = https.get(SITE_URL, { headers: { 'Accept-Encoding': 'gzip, deflate' } }, resolve);
          req.on('error', reject);
        });
        const encoding = res.headers['content-encoding'];
        return { passed: encoding && encoding.includes('gzip'), value: encoding, message: `Compression: ${encoding || '✗ Not specified'}` };
      } catch (e) {
        return { passed: false, value: null, message: 'Compression: ✗ Could not check' };
      }
    }
  },
  {
    name: 'Cache Headers',
    check: async () => {
      try {
        const res = await new Promise((resolve, reject) => {
          const req = https.get(SITE_URL, resolve);
          req.on('error', reject);
        });
        const cacheControl = res.headers['cache-control'];
        return { passed: !!cacheControl, value: cacheControl, message: `Cache-Control: ${cacheControl || '✗ Not set'}` };
      } catch (e) {
        return { passed: false, value: null, message: 'Cache-Control: ✗ Could not check' };
      }
    }
  },
  {
    name: 'Response Time',
    check: async () => {
      const start = Date.now();
      try {
        await fetchUrl(SITE_URL);
        const time = Date.now() - start;
        return { passed: time < 2000, value: time, message: `Response: ${time}ms (${time < 500 ? '✓ Excellent' : time < 2000 ? '⚠ Acceptable' : '✗ Slow'})` };
      } catch (e) {
        return { passed: false, value: null, message: 'Response: ✗ Could not check' };
      }
    }
  }
];

async function runAudit() {
  logHeader('🔍 SEO AUTO-SCANNER BOT');

  console.log(`${colors.bold}Scanning: ${SITE_URL}${colors.reset}\n`);

  let report = {
    timestamp: new Date().toISOString(),
    siteUrl: SITE_URL,
    seoChecks: [],
    geoChecks: [],
    perfChecks: [],
    score: 0,
    totalChecks: 0,
    passedChecks: 0
  };

  // Fetch homepage for most checks
  let html = '';
  try {
    log('info', 'Fetching homepage...');
    const { status, body } = await fetchUrl(SITE_URL);
    if (status === 200) {
      html = body;
      log('success', 'Homepage fetched successfully');
    } else {
      log('error', `Homepage returned status ${status}`);
    }
  } catch (e) {
    log('error', `Failed to fetch: ${e.message}`);
  }

  // Run SEO checks
  logHeader('📊 SEO Checks');
  for (const check of seoChecks) {
    process.stdout.write(`  Checking ${check.name}... `);
    try {
      const result = check.check.length === 0
        ? await check.check()
        : check.check(html);
      const statusIcon = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(statusIcon);
      log(result.passed ? 'success' : 'error', result.message);
      report.seoChecks.push({ name: check.name, ...result });
      report.totalChecks++;
      if (result.passed) report.passedChecks++;
    } catch (e) {
      console.log(`${colors.yellow}⚠${colors.reset}`);
      log('warning', `${check.name}: Error - ${e.message}`);
      report.seoChecks.push({ name: check.name, passed: false, message: `Error: ${e.message}` });
      report.totalChecks++;
    }
  }

  // Run Geo checks
  logHeader('🌍 Geo SEO Checks');
  for (const check of geoChecks) {
    process.stdout.write(`  Checking ${check.name}... `);
    try {
      const result = check.check(html);
      const statusIcon = result.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(statusIcon);
      log(result.passed ? 'success' : 'warning', result.message);
      report.geoChecks.push({ name: check.name, ...result });
      report.totalChecks++;
      if (result.passed) report.passedChecks++;
    } catch (e) {
      console.log(`${colors.yellow}⚠${colors.reset}`);
      log('warning', `${check.name}: Error - ${e.message}`);
    }
  }

  // Run Performance checks
  logHeader('⚡ Performance Checks');
  for (const check of perfChecks) {
    process.stdout.write(`  Checking ${check.name}... `);
    try {
      const result = await check.check();
      const statusIcon = result.passed ? `${colors.green}✓${colors.reset}` : result.passed === undefined ? `${colors.yellow}⚠${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(statusIcon);
      log('info', result.message);
      report.perfChecks.push({ name: check.name, ...result });
      report.totalChecks++;
      if (result.passed) report.passedChecks++;
    } catch (e) {
      console.log(`${colors.yellow}⚠${colors.reset}`);
      log('warning', `${check.name}: Error - ${e.message}`);
    }
  }

  // Calculate score
  report.score = Math.round((report.passedChecks / report.totalChecks) * 100);

  // Save report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  log('success', `Report saved to: ${REPORT_FILE}`);

  // Print summary
  logHeader('📈 AUDIT SUMMARY');
  const scoreColor = report.score >= 80 ? colors.green : report.score >= 60 ? colors.yellow : colors.red;
  console.log(`\n  ${colors.bold}SEO Score: ${scoreColor}${report.score}%${colors.reset}${colors.bold}/100${colors.reset}\n`);
  console.log(`  Total Checks: ${report.totalChecks}`);
  console.log(`  ${colors.green}Passed: ${report.passedChecks}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${report.totalChecks - report.passedChecks}${colors.reset}\n`);

  // Generate recommendations
  logHeader('💡 RECOMMENDATIONS');
  const failedChecks = [...report.seoChecks, ...report.geoChecks].filter(c => !c.passed);
  if (failedChecks.length > 0) {
    console.log(`\n${colors.yellow}Issues to fix:${colors.reset}\n`);
    failedChecks.forEach((check, i) => {
      console.log(`  ${i + 1}. ${colors.red}${check.name}${colors.reset} - ${check.message}`);
    });
  } else {
    console.log(`\n  ${colors.green}✓ All checks passed!${colors.reset}\n`);
  }

  return report;
}

// Auto-fix suggestions
function generateFixScript(report) {
  const fixes = [];

  // Check for missing title
  const titleCheck = report.seoChecks.find(c => c.name === 'Title Tag');
  if (!titleCheck?.passed) {
    fixes.push(`
// FIX: Add/Improve Title Tag
// Current: "${titleCheck?.value || 'MISSING'}"
// Recommended: "Online Courses – EduBazar.shop | Hacking, Programming, Trading & More"
`);
  }

  // Check for missing description
  const descCheck = report.seoChecks.find(c => c.name === 'Meta Description');
  if (!descCheck?.passed) {
    fixes.push(`
// FIX: Add Meta Description
// Recommended: "Buy premium online courses in Ethical Hacking, Programming, Trading, Digital Marketing & more. Instant access, secure UPI payment."
`);
  }

  // Check for missing hreflang
  const hreflangCheck = report.seoChecks.find(c => c.name === 'Hreflang Tags');
  if (!hreflangCheck?.passed) {
    fixes.push(`
// FIX: Add Hreflang Tags
// Add to layout.tsx:
// alternates: { languages: { en: SITE_URL, hi: \`\${SITE_URL}/hi\` } }
`);
  }

  // Check for LocalBusiness schema
  const localSchema = report.geoChecks.find(c => c.name === 'Local Business Schema');
  if (!localSchema?.passed) {
    fixes.push(`
// FIX: Add LocalBusiness Schema
// Add to layout.tsx:
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "EduBazar.shop",
  "address": { "@type": "PostalAddress", "addressCountry": "IN" },
  "priceRange": "₹₹"
}
`);
  }

  const fixScript = fixes.join('\n');
  fs.writeFileSync(path.join(__dirname, 'seo-fixes-needed.txt'), fixScript);
  log('info', `Fix suggestions saved to: seo-fixes-needed.txt`);
}

// Run
runAudit()
  .then(report => {
    generateFixScript(report);
    process.exit(0);
  })
  .catch(err => {
    log('error', `Audit failed: ${err.message}`);
    process.exit(1);
  });
