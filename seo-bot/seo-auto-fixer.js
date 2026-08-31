#!/usr/bin/env node
/**
 * SEO Auto-Fixer - Automatically fixes common SEO issues
 * Usage: node seo-auto-fixer.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_FILE = path.join(__dirname, 'seo-report.json');
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = path.join(__dirname, 'backups', new Date().toISOString().replace(/[:.]/g, '-'));

function log(type, message) {
  const symbols = {
    success: '\x1b[32m✓\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
    warning: '\x1b[33m⚠\x1b[0m',
    info: '\x1b[36mℹ\x1b[0m',
    fix: '\x1b[32m🔧\x1b[0m',
    dry: '\x1b[33m📝\x1b[0m'
  };
  const prefix = DRY_RUN ? symbols.dry : symbols[type] || '•';
  console.log(`${prefix} ${message}`);
}

function logHeader(text) {
  console.log(`\n\x1b[36m${'='.repeat(60)}\x1b[0m`);
  console.log(`\x1b[36m  ${text}\x1b[0m`);
  console.log(`\x1b[36m${'='.repeat(60)}\x1b[0m\n`);
}

function ensureBackupDir() {
  if (!DRY_RUN && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function backupFile(filePath) {
  if (DRY_RUN) return;
  const relPath = path.relative(__dirname, filePath);
  const backupPath = path.join(BACKUP_DIR, relPath.replace(/\//g, '_'));
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(filePath, backupPath);
  log('info', `Backed up: ${relPath}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    log('error', `Cannot read ${filePath}: ${e.message}`);
    return null;
  }
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    log('dry', `Would write to ${filePath}`);
    return;
  }
  backupFile(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
  log('success', `Updated: ${path.relative(__dirname, filePath)}`);
}

function fixLayoutTsx() {
  const filePath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
  let content = readFile(filePath);
  if (!content) return false;

  let changed = false;

  // 1. Fix Meta Description (make it <=160 chars)
  const descMatch = content.match(/description:\s*`([^`]*)`/);
  if (descMatch) {
    let desc = descMatch[1];
    if (desc.length > 160) {
      // Truncate to 160 chars and add ellipsis if needed
      desc = desc.substring(0, 157) + '...';
      content = content.replace(/description:\s*`[^`]*`/, `description: \`${desc}\``);
      changed = true;
      log('info', `Fixed meta description length: ${descMatch[1].length} → ${desc.length}`);
    }
  }

  // 2. Fix Hreflang - ensure Hindi version exists
  const alternatesMatch = content.match(/alternates:\s*\{[^}]+\}/);
  if (alternatesMatch) {
    const alternatesBlock = alternatesMatch[0];
    if (!alternatesBlock.includes('hi:')) {
      // Add Hindi hreflang
      const newAlternates = alternatesBlock.replace(
        /languages:\s*\{/,
        'languages: {\n      en: SITE_URL,\n      hi: `${SITE_URL}/hi`,'
      );
      content = content.replace(alternatesBlock, newAlternates);
      changed = true;
      log('info', 'Added Hindi hreflang tag');
    }
  } else {
    // If no alternates block, we need to add it (but layout.tsx should have it from our previous fix)
    log('warning', 'Could not find alternates block in layout.tsx');
  }

  // 3. Add LocalBusiness Schema JSON-LD if missing
  if (!content.includes('"@type":"LocalBusiness"')) {
    // Find where to insert - after the existing JSON-LD scripts
    const headCloseMatch = content.match(/<\/head>/);
    if (headCloseMatch) {
      const localBusinessSchema = `
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "EduBazar.shop",
            "url": SITE_URL,
            "logo": {
              "@type": "ImageObject",
              "url": SITE_URL + "/logo/edulogo.jpeg"
            },
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            },
            "priceRange": "₹₹",
            "telephone": "+91-9759131256",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9759131256",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://instagram.com/edubazarshop",
              "https://wa.me/919759131256"
            ]
          }
        </script>`;

      // Insert before </head>
      content = content.replace('</head>', `${localBusinessSchema}\n      </head>`);
      changed = true;
      log('info', 'Added LocalBusiness schema JSON-LD');
    }
  }

  if (changed) {
    writeFile(filePath, content);
    return true;
  }
  return false;
}

function fixImageAltAttributes() {
  // Scan for React components with images missing alt
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  if (!fs.existsSync(componentsDir)) {
    log('warning', 'Components directory not found');
    return false;
  }

  let totalFixed = 0;
  const extRegex = /\.(tsx|jsx)$/;

  function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        processDir(fullPath);
      } else if (stat.isFile() && extRegex.test(file)) {
        let content = readFile(fullPath);
        if (!content) continue;

        // Find img tags without alt attributes
        const imgRegex = /<img([^>]*)(?:\/>|>)/g;
        let match;
        let changed = false;

        while ((match = imgRegex.exec(content)) !== null) {
          const fullTag = match[0];
          const attrs = match[1];

          // Check if alt attribute exists
          if (!/\s+alt\s*=/.test(attrs)) {
            // Generate alt from nearby context or use a default
            // For now, we'll add a placeholder - in real scenario, this should be smarter
            const newTag = fullTag.replace(
              /(<img[^>]*?)(\/>|>)/,
              `$1 alt="Image" $2`
            );
            content = content.replace(fullTag, newTag);
            changed = true;
            totalFixed++;
            log('info', `Added alt attribute to image in ${path.relative(__dirname, fullPath)}`);
          }
        }

        if (changed) {
          writeFile(fullPath, content);
        }
      }
    }
  }

  processDir(componentsDir);
  return totalFixed > 0;
}

function fixH1Tags() {
  // Ensure only one H1 per page - this is tricky without knowing the exact structure
  // For now, we'll just log that this needs manual review
  log('warning', 'H1 tag fix requires manual review - please ensure each page has exactly one H1');
  return false;
}

function main() {
  logHeader('🔧 SEO AUTO-FIXER BOT');
  if (DRY_RUN) {
    log('info', 'Running in DRY-RUN mode - no changes will be made');
  }

  // Check if report exists
  if (!fs.existsSync(REPORT_FILE)) {
    log('error', 'SEO report not found. Please run seo-scanner.js first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
  log('info', `Loaded SEO report (Score: ${report.score}%)`);

  let fixesApplied = 0;

  // Fix layout.tsx
  if (fixLayoutTsx()) fixesApplied++;

  // Fix image alt attributes
  if (fixImageAltAttributes()) fixesApplied++;

  // H1 tags - manual fix needed
  fixH1Tags();

  if (fixesApplied > 0 || DRY_RUN) {
    logHeader('✅ AUTO-FIX COMPLETE');
    log('success', `Applied ${fixesApplied} automatic fixes`);
    if (!DRY_RUN) {
      log('info', `Backups saved to: ${BACKUP_DIR}`);
      log('info', 'Review changes and commit when ready:');
      log('info', `  git add .`);
      log('info', `  git commit -m "SEO: Auto-fixed common issues"`);
    }
  } else {
    log('info', 'No automatic fixes were needed or applied');
  }

  // Generate summary
  logHeader('📋 NEXT STEPS');
  console.log(`
  1. Review the changes made above
  2. For H1 tags: Manually ensure each page has exactly one H1
  3. Test the site: npm run dev
  4. Run the scanner again to verify improvements:
     node seo-scanner.js
  5. Commit changes:
     git add .
     git commit -m "SEO: Auto-fixed meta description, hreflang, alt tags, LocalBusiness schema"
  `);
}

main();