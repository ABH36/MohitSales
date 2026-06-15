/**
 * Image Optimization Script: PNG → WebP conversion
 * Converts large PNG images to WebP format while keeping originals as fallback.
 * Run with: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Images to convert (only files actually used in components)
const imagesToConvert = [
  // Banner Desktop
  'assets/images/banner/desktop/cable.png',
  'assets/images/banner/desktop/polycab.png',
  'assets/images/banner/desktop/fans.png',
  'assets/images/banner/desktop/solar_product.png',
  'assets/images/banner/desktop/switchgear.png',
  'assets/images/banner/desktop/wire.png',
  'assets/images/banner/desktop/dowells.png',
  // Banner Mobile
  'assets/images/banner/mobile/cable.png',
  'assets/images/banner/mobile/polycab_banner.png',
  'assets/images/banner/mobile/fans.png',
  'assets/images/banner/mobile/solar_product.png',
  'assets/images/banner/mobile/switchgear.png',
  'assets/images/banner/mobile/wire.png',
  'assets/images/banner/mobile/dowells.png',
  // Logo
  'assets/images/logo/msc_logo_without_bg.png',
  // Background images (large ones used in homepage components)
  'assets/images/bg/footer-bg.png',
  'assets/images/bg/contact-form-bg.png',
];

async function convertImage(relativePath) {
  const inputPath = path.join(PUBLIC_DIR, relativePath);
  const outputPath = inputPath.replace(/\.png$/i, '.webp');

  if (!fs.existsSync(inputPath)) {
    console.log(`⏭ SKIP (not found): ${relativePath}`);
    return;
  }

  if (fs.existsSync(outputPath)) {
    console.log(`⏭ SKIP (already exists): ${relativePath.replace('.png', '.webp')}`);
    return;
  }

  const inputStats = fs.statSync(inputPath);
  const inputSizeKB = (inputStats.size / 1024).toFixed(1);

  try {
    await sharp(inputPath)
      .webp({ quality: 82 })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(1);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(0);

    console.log(`✅ ${relativePath}`);
    console.log(`   PNG: ${inputSizeKB}KB → WebP: ${outputSizeKB}KB (${savings}% smaller)`);
  } catch (err) {
    console.error(`❌ ERROR: ${relativePath}`, err.message);
  }
}

async function main() {
  console.log('🖼 Starting PNG → WebP conversion...\n');
  
  let totalPngSize = 0;
  let totalWebpSize = 0;

  for (const img of imagesToConvert) {
    const inputPath = path.join(PUBLIC_DIR, img);
    const outputPath = inputPath.replace(/\.png$/i, '.webp');
    
    if (fs.existsSync(inputPath)) {
      totalPngSize += fs.statSync(inputPath).size;
    }
    
    await convertImage(img);
    
    if (fs.existsSync(outputPath)) {
      totalWebpSize += fs.statSync(outputPath).size;
    }
  }

  console.log(`\n📊 Total PNG: ${(totalPngSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📊 Total WebP: ${(totalWebpSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📊 Savings: ${((1 - totalWebpSize / totalPngSize) * 100).toFixed(0)}%`);
  console.log('\n✅ Done! Original PNGs are preserved as fallback.');
}

main();
