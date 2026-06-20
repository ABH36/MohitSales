const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'assets', 'images', 'industries');

// Recursively get all image files in a directory
function getAllImages(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllImages(fullPath, baseDir));
    } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(item)) {
      const relativePath = '/' + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
      results.push({ filename: item, path: relativePath, dir: path.relative(baseDir, path.dirname(fullPath)).replace(/\\/g, '/') });
    }
  }
  return results;
}

// Normalize string for matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('========== OPTIMIZED IMAGE LINKING ==========\n');

  // Get all images from industries folder
  const allImages = getAllImages(IMAGES_DIR);
  console.log(`Total images in /assets/images/industries/: ${allImages.length}`);
  
  // Get all images from our_products/polycab/cables
  const cableImagesDir = path.join(PUBLIC_DIR, 'assets', 'images', 'our_products', 'polycab');
  const cableImages = fs.existsSync(cableImagesDir) ? getAllImages(cableImagesDir) : [];
  console.log(`Total images in /assets/images/our_products/polycab/: ${cableImages.length}`);
  
  const allAvailableImages = [...allImages, ...cableImages];
  console.log(`Total searchable images: ${allAvailableImages.length}`);

  // Pre-normalize all images
  const imagesNormalized = allAvailableImages.map(img => {
    const fnNorm = normalize(img.filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/[-_]/g, ' '));
    return { ...img, fnNorm };
  });

  // Get active products without images
  const noImgProds = await p.product.findMany({
    where: { isActive: true, imageSrc: null },
    select: { id: true, title: true, slug: true }
  });
  console.log(`Products without images: ${noImgProds.length}`);

  let matched = 0;
  const updates = [];

  for (const prod of noImgProds) {
    const titleWords = normalize(prod.title).split(' ').filter(w => w.length > 2);
    if (titleWords.length === 0) continue;

    let bestScore = 0;
    let bestImg = null;

    for (const img of imagesNormalized) {
      let matchCount = 0;
      for (const word of titleWords) {
        if (img.fnNorm.includes(word)) matchCount++;
      }
      const score = matchCount / titleWords.length;
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestImg = img;
      }
    }

    if (bestImg) {
      matched++;
      updates.push({ id: prod.id, title: prod.title, imageSrc: bestImg.path, score: bestScore });
    }
  }

  console.log(`Auto-matched: ${matched} out of ${noImgProds.length}`);

  // Apply image updates
  if (updates.length > 0) {
    console.log(`Updating ${updates.length} products...`);
    let count = 0;
    for (const upd of updates) {
      try {
        await p.product.update({
          where: { id: upd.id },
          data: { imageSrc: upd.imageSrc }
        });
        count++;
        if (count <= 10) {
          console.log(`  UPDATED: "${upd.title}" => ${upd.imageSrc}`);
        }
      } catch (err) {
        console.error(`  FAILED to update product ID ${upd.id}:`, err.message);
      }
    }
    console.log(`✅ Successfully updated ${count} / ${updates.length} product images in database`);
  }

  // Verification step
  console.log('\n========== VERIFYING UPDATED DATABASE RECORDS ==========');
  if (updates.length > 0) {
    const sampleIds = updates.slice(0, 5).map(u => u.id);
    const verified = await p.product.findMany({
      where: { id: { in: sampleIds } },
      select: { id: true, title: true, imageSrc: true }
    });
    console.log('Verified sample updates in DB:');
    verified.forEach(v => {
      console.log(`  - ID: ${v.id} | Title: "${v.title}" | DB imageSrc: "${v.imageSrc}"`);
    });
  }

  await p.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); p.$disconnect(); });
