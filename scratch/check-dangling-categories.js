const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Mock getLegacyPath to match page.tsx routing
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

async function main() {
  const categories = await prisma.category.findMany();
  console.log(`Total categories in DB: ${categories.length}`);

  console.log('\nChecking if categories exist in legacy_content...');
  let danglingCount = 0;
  for (const c of categories) {
    if (c.slug === 'polycab' || c.slug === 'dowells') {
      // Root brands are virtual/layout directories, they are fine
      continue;
    }

    const legacyPath = getLegacyPath(c.slug);
    const fullPathPhp = path.join(process.cwd(), 'legacy_content', legacyPath + '.php');
    const fullPathDir = path.join(process.cwd(), 'legacy_content', legacyPath);

    const fileExists = fs.existsSync(fullPathPhp);
    const dirExists = fs.existsSync(fullPathDir);

    if (!fileExists && !dirExists) {
      console.log(`❌ Dangling Category: "${c.name}"`);
      console.log(`   Slug: "${c.slug}"`);
      console.log(`   Expected legacy path: "legacy_content/${legacyPath}"`);
      danglingCount++;
    }
  }

  console.log(`\nTotal dangling categories: ${danglingCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
