/**
 * Backfill Legacy Content → PageContent table
 *
 * Processes ALL legacy PHP files using the EXACT same logic as getLegacyPHPContent()
 * in src/app/[...slug]/page.tsx, then stores the result in the database.
 *
 * After running this script, the PHP files are no longer needed for rendering.
 *
 * Usage: node prisma/backfill-legacy-content.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const prisma = new PrismaClient();
const cloneDir = path.join(process.cwd(), 'legacy_content');

// ── Exact copy of getLegacyPath from page.tsx ──────────────────
function getLegacyPath(slugPath) {
  let clean = slugPath.toLowerCase();

  if (clean.startsWith('polycab/cables-by-')) {
    clean = clean.replace('polycab/cables-by-', 'industries/cables-by-');
  } else if (clean.startsWith('polycab/')) {
    clean = clean.substring('polycab/'.length);
  } else if (clean.startsWith('dowells/')) {
    clean = clean.substring('dowells/'.length);
  }

  clean = clean.replace('cables-by-application/building-infrastructure/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/energy-and-power-grid/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/exploration-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/manufacturing-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/mobility-infrastructure/', 'cables-by-application/');

  clean = clean.replace('conduit-and-accessories', 'conduit-accessories');
  clean = clean.replace('fans/air-circulator-fans', 'fans/air-circulator');

  return clean;
}

// ── Exact copy of scopeCss from page.tsx ──────────────────────
function scopeCss(css, prefix) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let result = '';
  let i = 0;

  while (i < css.length) {
    if (/\s/.test(css[i])) { result += css[i]; i++; continue; }

    if (css[i] === '@') {
      if (css.substring(i, i + 10).toLowerCase() === '@keyframes') {
        const startBrace = css.indexOf('{', i);
        if (startBrace === -1) { result += css.substring(i); break; }
        let braceCount = 1;
        let j = startBrace + 1;
        while (j < css.length && braceCount > 0) {
          if (css[j] === '{') braceCount++;
          else if (css[j] === '}') braceCount--;
          j++;
        }
        result += css.substring(i, j);
        i = j;
        continue;
      }

      const startBrace = css.indexOf('{', i);
      if (startBrace === -1) { result += css.substring(i); break; }
      result += css.substring(i, startBrace + 1);
      i = startBrace + 1;

      let braceCount = 1;
      let innerCss = '';
      while (i < css.length && braceCount > 0) {
        const char = css[i];
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        if (braceCount > 0) { innerCss += char; i++; }
      }

      result += scopeCss(innerCss, prefix);
      if (i < css.length && css[i] === '}') { result += '}'; i++; }
      continue;
    }

    const nextBrace = css.indexOf('{', i);
    if (nextBrace === -1) { result += css.substring(i).trim(); break; }

    const selectorsPart = css.substring(i, nextBrace);
    let braceCount = 1;
    let j = nextBrace + 1;
    while (j < css.length && braceCount > 0) {
      if (css[j] === '{') braceCount++;
      else if (css[j] === '}') braceCount--;
      j++;
    }

    const declarationsPart = css.substring(nextBrace, j);

    const scopedSelectors = selectorsPart
      .split(',')
      .map(sel => {
        const trimmed = sel.trim();
        if (!trimmed) return '';
        if (trimmed.match(/^(from|to|\d+%)/i)) return trimmed;
        if (trimmed === 'body' || trimmed === 'html') return prefix;
        return `${prefix} ${trimmed}`;
      })
      .filter(Boolean)
      .join(', ');

    result += scopedSelectors + ' ' + declarationsPart;
    i = j;
  }

  return result;
}

// ── Exact replication of getLegacyPHPContent from page.tsx ─────
async function processPhpFile(slugPath, productName) {
  try {
    const legacyPath = getLegacyPath(slugPath);
    const phpPath = legacyPath.endsWith('.php') ? legacyPath : `${legacyPath}.php`;
    const fullPath = path.join(cloneDir, phpPath);

    if (!fs.existsSync(fullPath)) return null;
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) return null;

    let fileContent = fs.readFileSync(fullPath, 'utf-8');

    // Extract all style blocks from the entire file content
    const styleMatches = Array.from(fileContent.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi));
    const scopedStyles = styleMatches.map(m => {
      const attrs = m[1];
      const cssContent = m[2];
      try {
        const scoped = scopeCss(cssContent, '.legacy-php-content');
        return `<style${attrs}>${scoped}</style>`;
      } catch (e) {
        return m[0];
      }
    }).join('\n');

    // Extract inside <main> tag
    const mainMatch = fileContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (!mainMatch) return null;
    let html = mainMatch[1];

    // Strip style tags inside main
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Add scoped styles
    if (scopedStyles) {
      html = scopedStyles + '\n' + html;
    }

    // Replace sidebar includes
    const includeRegex = /<\?php\s+include\s+ROOT_PATH\s*\.\s*'\/common\/([^']+)'\s*;\s*\?>/g;
    const matches = Array.from(html.matchAll(includeRegex));
    const sidebarContents = new Map();
    for (const match of matches) {
      const sidebarName = match[1];
      const sidebarPath = path.join(cloneDir, 'common', sidebarName);
      try {
        if (fs.existsSync(sidebarPath)) {
          let sidebarHtml = fs.readFileSync(sidebarPath, 'utf-8');
          sidebarHtml = sidebarHtml.replace(/<\?php\s+echo\s+BASE_URL\s*;\s*\?>/g, '/');
          sidebarHtml = sidebarHtml.replace(/href="([^"]+)\.php([^"]*)"/g, (m, p1, p2) => {
            if (p1.includes('<?php') || p1.startsWith('/') || p1.startsWith('http') || p1.startsWith('mailto:')) {
              return `href="${p1}${p2}"`;
            }
            const parts = slugPath.split('/');
            parts.pop();
            let target = p1;
            if (parts.length > 0) {
              target = '/' + parts.join('/') + '/' + target;
            } else {
              target = '/' + target;
            }
            return `href="${target.toLowerCase()}${p2}"`;
          });
          sidebarContents.set(sidebarName, sidebarHtml);
        }
      } catch (err) { /* skip */ }
    }

    html = html.replace(includeRegex, (match, sidebarName) => {
      return sidebarContents.get(sidebarName) || '';
    });

    // Replace BASE_URL references
    html = html.replace(/<\?php\s+echo\s+BASE_URL\s*\.\s*'([^']*)'\s*;?\s*\?>/g, '/$1');
    html = html.replace(/<\?php\s+echo\s+BASE_URL\s*;?\s*\?>/g, '/');
    html = html.replace(/<\?php[\s\S]*?\?>/g, '');

    // Clean .php links
    html = html.replace(/href="([^"]+)\.php([^"]*)"/g, (match, linkPath, query) => {
      let target = linkPath;
      if (!target.startsWith('/') && !target.startsWith('http') && !target.startsWith('mailto:')) {
        const parts = slugPath.split('/');
        parts.pop();
        if (parts.length > 0) {
          target = '/' + parts.join('/') + '/' + target;
        } else {
          target = '/' + target;
        }
      }
      return `href="${target.toLowerCase()}${query || ''}"`;
    });

    // Fix index routes
    html = html.replace(/href="(?:[^"]*\/)?index(?:\.php|\.html)?"/gi, 'href="/"');

    // Make asset paths absolute
    html = html.replace(/src="(?:\.\.\/)*assets\/images\/([^"]+)"/g, 'src="/assets/images/$1"');
    html = html.replace(/data-background="(?:\.\.\/)*assets\/images\/([^"]+)"/g, 'data-background="/assets/images/$1"');
    html = html.replace(/url\('(?:\.\.\/)*assets\/images\/([^']+)'\)/g, "url('/assets/images/$1')");
    html = html.replace(/url\("(?:\.\.\/)*assets\/images\/([^"]+)"\)/g, "url('/assets/images/$1')");

    // Trim attribute whitespace
    html = html.replace(/src="\s*([^"]*?)\s*"/g, 'src="$1"');
    html = html.replace(/href="\s*([^"]*?)\s*"/g, 'href="$1"');
    html = html.replace(/data-background="\s*([^"]*?)\s*"/g, 'data-background="$1"');

    // Convert data-background to inline styles
    html = html.replace(/data-background="([^"]+)"/g, 'data-background="$1" style="background-image: url(\'$1\')"');

    // Fix enquiry buttons with Cheerio
    const contextUrl = productName ? `/contact-us?product=${encodeURIComponent(productName)}` : '/contact-us';
    try {
      const $ = cheerio.load(html, null, false);
      $('.enquiry-btn').each((_, elem) => {
        const container = $(elem);
        const links = container.find('.rs-banner-btn a');
        if (links.length > 0) {
          const wrapper = $('<div class="enquiry-btn-container mt-4" style="display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:16px"></div>');
          links.each((_, linkElem) => {
            const link = $(linkElem);
            const href = link.attr('href') || '#';
            const text = link.text().trim();
            const isDatasheet = text.toLowerCase().includes('datasheet') || href.toLowerCase().includes('.pdf');
            const cleanHref = isDatasheet ? href : contextUrl;
            const cleanText = isDatasheet ? 'Download Datasheet' : 'Send Enquiry';
            const targetBlank = isDatasheet ? 'target="_blank" rel="noopener noreferrer"' : '';
            const btnWrapper = $(`
              <div class="rs-banner-btn">
                <a class="rs-btn has-theme-orange has-icon has-bg" href="${cleanHref}" ${targetBlank}>
                  ${cleanText}
                  <span class="icon-box">
                    <svg class="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                    </svg>
                    <svg class="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                    </svg>
                  </span>
                </a>
              </div>
            `);
            wrapper.append(btnWrapper);
          });
          container.replaceWith(wrapper);
        }
      });
      html = $.html();
    } catch (e) { /* skip Cheerio errors */ }

    // Replace standalone contact links
    html = html.replace(/href="\/contact-us"/gi, `href="${contextUrl}"`);

    // Fix nested <a> tags
    html = html.replace(/<a>\s*(<a[^>]*>[\s\S]*?<\/a>)\s*<\/a>/gi, '$1');
    html = html.replace(/<a>\s*<\/a>/gi, '');

    // Force legacy product cards to use Flexbox
    html = html.replace(/class="col-md-4\s*mt-4"/g, 'class="col-md-4 mt-4 d-flex align-items-stretch"');
    html = html.replace(/class="product-card"/g, 'class="product-card flex flex-col flex-grow h-full w-full"');
    html = html.replace(/class="product-content"/g, 'class="product-content flex flex-col flex-grow"');
    html = html.replace(/class="enquiry-btn"/g, 'class="enquiry-btn mt-auto"');

    // Strip legacy hardcoded CSS blocks (now in globals.css)
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Convert legacy inline tab switch triggers to data-tab-target
    try {
      const $ = cheerio.load(html, null, false);
      $('button[onclick*="openTab"]').each((_, elem) => {
        const btn = $(elem);
        const onclick = btn.attr('onclick') || '';
        const match = onclick.match(/openTab\s*\(\s*event\s*,\s*['"]([^'"]+)['"]\)/);
        if (match) {
          btn.attr('data-tab-target', match[1]);
        }
      });
      html = $.html();
    } catch (e) { /* skip */ }

    return html;
  } catch (error) {
    console.error(`Error processing ${slugPath}:`, error.message);
    return null;
  }
}

// ── Determine brand from breadcrumbs ──────────────────────────
function determineBrand(breadcrumbs) {
  if (!breadcrumbs || !Array.isArray(breadcrumbs)) return null;
  for (const crumb of breadcrumbs) {
    const lower = crumb.toLowerCase().trim();
    if (lower === 'polycab') return 'polycab';
    if (lower === 'dowells') return 'dowells';
  }
  return null;
}

// ── Reverse mapping: PHP path → canonical slug ────────────────
function computeCanonicalSlug(phpPath, brand) {
  let slug = phpPath.replace(/\.php$/i, '').toLowerCase();

  // Reverse the special mappings from getLegacyPath
  if (slug.startsWith('industries/cables-by-')) {
    slug = slug.replace('industries/cables-by-', 'cables-by-');
    if (brand) slug = brand + '/' + slug;
    else slug = 'polycab/' + slug;
    return slug;
  }

  // Reverse conduit-accessories → conduit-and-accessories
  slug = slug.replace('conduit-accessories', 'conduit-and-accessories');

  // Reverse air-circulator → air-circulator-fans
  slug = slug.replace('fans/air-circulator', 'fans/air-circulator-fans');

  if (brand) {
    slug = brand + '/' + slug;
  }

  return slug;
}

// ── Walk directory recursively ────────────────────────────────
function walkDir(dir, relative) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'common') continue; // Skip common includes
      results.push(...walkDir(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.php')) {
      results.push(rel);
    }
  }
  return results;
}

// ── Main backfill function ────────────────────────────────────
async function main() {
  console.log('=== Backfill Legacy Content to PageContent table ===\n');

  // 1. Build slug map from content-export.json
  const slugMap = new Map(); // slug → { title, heading, phpPath }
  let contentExport = [];
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  if (fs.existsSync(jsonPath)) {
    contentExport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${contentExport.length} entries from content-export.json`);

    for (const entry of contentExport) {
      const brand = determineBrand(entry.breadcrumbs);
      const canonicalSlug = computeCanonicalSlug(entry.path, brand);
      const phpPathClean = entry.path.replace(/\.php$/i, '').toLowerCase();

      slugMap.set(canonicalSlug, {
        title: entry.title || '',
        heading: entry.heading || entry.title || '',
        phpPath: phpPathClean,
        productName: entry.heading || entry.title || ''
      });
    }
  }

  // 2. Add DB category slugs
  const dbCategories = await prisma.category.findMany({ select: { slug: true, name: true } });
  console.log(`Found ${dbCategories.length} DB categories`);
  for (const cat of dbCategories) {
    if (!slugMap.has(cat.slug)) {
      const legacyPath = getLegacyPath(cat.slug);
      slugMap.set(cat.slug, {
        title: cat.name,
        heading: cat.name,
        phpPath: legacyPath,
        productName: cat.name
      });
    }
  }

  // 3. Add DB product slugs
  const dbProducts = await prisma.product.findMany({ select: { slug: true, title: true } });
  console.log(`Found ${dbProducts.length} DB products`);
  for (const prod of dbProducts) {
    if (!slugMap.has(prod.slug)) {
      const legacyPath = getLegacyPath(prod.slug);
      slugMap.set(prod.slug, {
        title: prod.title,
        heading: prod.title,
        phpPath: legacyPath,
        productName: prod.title
      });
    }
  }

  // 4. Walk legacy_content/ for any PHP files not yet covered
  const allPhpFiles = walkDir(cloneDir, '');
  console.log(`Found ${allPhpFiles.length} PHP files in legacy_content/`);

  const coveredPaths = new Set([...slugMap.values()].map(v => v.phpPath));
  for (const phpFile of allPhpFiles) {
    const phpPathClean = phpFile.replace(/\.php$/i, '').toLowerCase();
    if (coveredPaths.has(phpPathClean)) continue;

    // Uncovered file — add as standalone slug (no brand prefix)
    const slug = phpPathClean;
    slugMap.set(slug, {
      title: path.basename(phpPathClean).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      heading: path.basename(phpPathClean).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      phpPath: phpPathClean,
      productName: ''
    });
  }

  console.log(`\nTotal unique slugs to process: ${slugMap.size}\n`);

  // 5. Process each slug
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const [slug, meta] of slugMap) {
    try {
      const html = await processPhpFile(slug, meta.productName);
      if (!html) {
        skipped++;
        continue;
      }

      await prisma.pageContent.upsert({
        where: { slug },
        create: {
          slug,
          legacyPath: meta.phpPath,
          htmlContent: html,
          title: meta.title || null,
          heading: meta.heading || null,
          isActive: true
        },
        update: {
          htmlContent: html,
          legacyPath: meta.phpPath,
          title: meta.title || null,
          heading: meta.heading || null,
        }
      });

      processed++;
      if (processed % 100 === 0) {
        console.log(`  Processed ${processed} pages...`);
      }
    } catch (err) {
      errors++;
      console.error(`  ERROR [${slug}]: ${err.message}`);
    }
  }

  console.log(`\n=== Backfill Complete ===`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped (no <main> / empty): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in DB: ${await prisma.pageContent.count()}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
