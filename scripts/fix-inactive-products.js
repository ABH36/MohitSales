/**
 * FINAL FIX SCRIPT - Activate all valid inactive products and link images
 * 
 * Strategy:
 * 1. Build an index of ALL available local image files
 * 2. For each inactive product with a real title:
 *    a. Try to match an existing image by product slug → filename comparison
 *    b. If found, use that image
 *    c. Activate the product with stock=1
 * 3. Skip products with generic/category-level titles
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Products with generic/placeholder titles — don't activate these
const SKIP_TITLES = new Set([
  'Renewable Energy', 'Others', 'Special Cable', 'Rubber Cable',
  'Building Infrastructure', 'Manufacturing Industries', 'Exploration Industries',
  'Mobility Infrastructure', 'Energy and Power Grid', 'Cables By Application',
  'Cables By Type', 'Cables By Standards', 'International Standards',
  'Indian Standards', 'Communication & Data Cable', 'EHV Power Cable',
  'LV Power Cable', 'MV Power Cable', 'Instrumentation Cable',
  'Cables By Application', 'Cables By Standard', 'Cables By Standards',
]);

function slugToFilename(slug) {
  // Extract last part of slug and make it a filename-friendly pattern
  const parts = slug.split('/');
  return parts[parts.length - 1].toLowerCase();
}

function buildImageIndex(publicDir) {
  const index = new Map(); // filename-stem → full path
  
  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
            const stem = path.basename(entry.name, ext).toLowerCase();
            // Store relative URL from public dir
            const relPath = fullPath.replace(publicDir, '').replace(/\\/g, '/');
            if (!index.has(stem)) {
              index.set(stem, relPath);
            }
          }
        }
      }
    } catch (e) {
      // ignore unreadable dirs
    }
  }
  
  scanDir(publicDir);
  return index;
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('Building image index from public/assets/images...');
  const imageIndex = buildImageIndex(path.join(publicDir, 'assets', 'images'));
  console.log(`Image index built: ${imageIndex.size} images`);
  
  // Load content-export.json for title-based slug lookups
  const content = JSON.parse(fs.readFileSync('content-export.json', 'utf8'));
  const byTitle = new Map();
  content.forEach(item => {
    const titleKey = (item.title || item.heading || '').trim().toLowerCase();
    if (titleKey && item.imageSrc) byTitle.set(titleKey, item.imageSrc);
  });
  
  // Find all inactive products
  const inactiveProds = await prisma.product.findMany({
    where: { isActive: false },
    include: { category: true },
    orderBy: { slug: 'asc' }
  });
  
  console.log(`\nFound ${inactiveProds.length} inactive products to process\n`);
  
  let activated = 0;
  let imageLinked = 0;
  let skipped = 0;
  
  const batchUpdates = [];
  
  for (const prod of inactiveProds) {
    // Skip generic titles
    if (SKIP_TITLES.has(prod.title.trim())) {
      skipped++;
      continue;
    }
    
    // Determine image to use
    let imageSrc = prod.imageSrc || null;
    
    if (!imageSrc) {
      // Try by slug filename
      const slugFilename = slugToFilename(prod.slug);
      if (imageIndex.has(slugFilename)) {
        imageSrc = imageIndex.get(slugFilename);
        imageLinked++;
      }
      
      // Try by legacy content JSON
      if (!imageSrc) {
        const titleKey = prod.title.trim().toLowerCase();
        if (byTitle.has(titleKey)) {
          imageSrc = byTitle.get(titleKey);
          imageLinked++;
        }
      }
    }
    
    // Queue the update
    batchUpdates.push({
      id: prod.id,
      imageSrc,
      title: prod.title
    });
  }
  
  console.log(`Activating ${batchUpdates.length} products (skipping ${skipped} generic ones)...`);
  console.log(`Images found for ${imageLinked} products\n`);
  
  // Process in batches of 50
  let processed = 0;
  for (let i = 0; i < batchUpdates.length; i += 50) {
    const batch = batchUpdates.slice(i, i + 50);
    await Promise.all(batch.map(p =>
      prisma.product.update({
        where: { id: p.id },
        data: {
          isActive: true,
          stock: 1,
          imageSrc: p.imageSrc || undefined,
          updatedAt: new Date()
        }
      })
    ));
    processed += batch.length;
    process.stdout.write(`\rProcessed: ${processed}/${batchUpdates.length}`);
  }
  
  console.log('\n\n=== FINAL SUMMARY ===');
  const totalActive = await prisma.product.count({ where: { isActive: true } });
  const totalInactive = await prisma.product.count({ where: { isActive: false } });
  const withImg = await prisma.product.count({ where: { imageSrc: { not: null, not: '' } } });
  
  console.log(`Total Active: ${totalActive}`);
  console.log(`Total Inactive: ${totalInactive}`);
  console.log(`With images: ${withImg}`);
  console.log(`Newly activated: ${batchUpdates.length}`);
  console.log(`Images linked: ${imageLinked}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
