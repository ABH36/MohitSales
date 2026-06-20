const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function main() {
  console.log('========== COMPREHENSIVE FINAL FIX ==========\n');

  // ─────────────────────────────────────────────────────────────────
  // FIX 1: Deactivate ALL products with "industries/" slug prefix
  // These are from the old wrong "Industries" category tree
  // ─────────────────────────────────────────────────────────────────
  const industryProds = await p.product.count({ 
    where: { isActive: true, slug: { startsWith: 'industries/' } } 
  });
  console.log(`FIX 1: Active products with "industries/" slug: ${industryProds}`);
  
  if (industryProds > 0) {
    const r1 = await p.product.updateMany({
      where: { isActive: true, slug: { startsWith: 'industries/' } },
      data: { isActive: false }
    });
    console.log(`  ✅ Deactivated ${r1.count} industries/ products\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 2: Also deactivate products with any other bad slug prefixes
  // ─────────────────────────────────────────────────────────────────
  const switchgearBadProds = await p.product.count({ 
    where: { isActive: true, slug: { startsWith: 'switchgears/' } } 
  });
  console.log(`FIX 2: Active products with "switchgears/" (non-polycab) slug: ${switchgearBadProds}`);
  if (switchgearBadProds > 0) {
    const r2 = await p.product.updateMany({
      where: { isActive: true, slug: { startsWith: 'switchgears/' } },
      data: { isActive: false }
    });
    console.log(`  ✅ Deactivated ${r2.count} bad switchgear products\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 3: Check all active product slugs - should only start with
  // polycab/ or dowells/ 
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 3: Checking remaining bad slug prefixes...');
  const allActiveProds = await p.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true }
  });
  
  const badPrefixProds = allActiveProds.filter(prod => {
    const s = prod.slug || '';
    return !s.startsWith('polycab/') && !s.startsWith('dowells/');
  });
  
  console.log(`  Products with bad/unknown prefix: ${badPrefixProds.length}`);
  if (badPrefixProds.length > 0) {
    badPrefixProds.slice(0, 20).forEach(p2 => console.log(`    WARN: "${p2.title}" => ${p2.slug}`));
    // Deactivate them all
    const r3 = await p.product.updateMany({
      where: { id: { in: badPrefixProds.map(p2 => p2.id) } },
      data: { isActive: false }
    });
    console.log(`  ✅ Deactivated ${r3.count} bad-prefix products\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIX 4: Check products that have images - verify files exist
  // ─────────────────────────────────────────────────────────────────
  console.log('FIX 4: Verifying product image files...');
  const prodsWithImg = await p.product.findMany({
    where: { isActive: true, imageSrc: { not: null } },
    select: { id: true, title: true, imageSrc: true }
  });
  
  let imgMissing = 0, imgExternal = 0, imgOk = 0;
  const missingIds = [];
  
  prodsWithImg.forEach(prod => {
    if (!prod.imageSrc) return;
    if (prod.imageSrc.startsWith('http')) { imgExternal++; return; }
    const fullPath = path.join(PUBLIC_DIR, prod.imageSrc);
    if (!fs.existsSync(fullPath)) {
      imgMissing++;
      missingIds.push(prod.id);
      if (imgMissing <= 10) console.log(`    MISSING FILE: "${prod.title}" => ${prod.imageSrc}`);
    } else {
      imgOk++;
    }
  });
  
  console.log(`  Image OK:      ${imgOk}`);
  console.log(`  External URL:  ${imgExternal}`);
  console.log(`  File MISSING:  ${imgMissing}`);
  
  if (missingIds.length > 0) {
    const r4 = await p.product.updateMany({
      where: { id: { in: missingIds } },
      data: { imageSrc: null }
    });
    console.log(`  ✅ Cleared ${r4.count} products with missing image files\n`);
  }

  // ─────────────────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────────────────
  const finalTotal = await p.product.count({ where: { isActive: true } });
  const finalWithImg = await p.product.count({ where: { isActive: true, imageSrc: { not: null } } });
  const finalNoImg = await p.product.count({ where: { isActive: true, imageSrc: null } });

  // Show sample of good active products
  const samples = await p.product.findMany({
    where: { isActive: true },
    select: { title: true, slug: true, imageSrc: true },
    take: 10,
    orderBy: { title: 'asc' }
  });
  console.log('\n  Sample clean active products:');
  samples.forEach(s => console.log(`    ✓ "${s.title}" | img: ${s.imageSrc ? 'YES' : 'no'} | /${s.slug}`));

  console.log('\n========== FINAL STATE ==========');
  console.log(`  Total active products: ${finalTotal}`);
  console.log(`    With images:  ${finalWithImg}`);
  console.log(`    Without:      ${finalNoImg}`);
  console.log('\n✅ ALL DONE! Database is clean.\n');

  await p.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); p.$disconnect(); });
