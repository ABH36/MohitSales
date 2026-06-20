const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function fileExists(imgPath) {
  if (!imgPath) return false;
  if (imgPath.startsWith('http')) return 'EXTERNAL';
  const fullPath = path.join(PUBLIC_DIR, imgPath);
  return fs.existsSync(fullPath) ? 'EXISTS' : 'MISSING';
}

async function main() {
  const allCats = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, parentId: true, image: true }
  });

  // Check category images
  console.log('\n========== CATEGORY IMAGE FILE CHECK ==========');
  let catMissing = [];
  allCats.forEach(c => {
    const status = fileExists(c.image);
    if (status === 'MISSING') catMissing.push(c);
  });
  console.log(`Missing images: ${catMissing.length}`);
  catMissing.forEach(c => console.log(`  MISSING: "${c.name}" => ${c.image}`));

  // Check product images (only those with imageSrc set)
  const prods = await prisma.product.findMany({
    where: { isActive: true, imageSrc: { not: null } },
    select: { id: true, title: true, slug: true, imageSrc: true }
  });

  console.log('\n========== PRODUCT IMAGE FILE CHECK ==========');
  let prodMissing = [], prodExternal = [], prodExists = [];
  prods.forEach(p => {
    const status = fileExists(p.imageSrc);
    if (status === 'MISSING') prodMissing.push(p);
    else if (status === 'EXTERNAL') prodExternal.push(p);
    else prodExists.push(p);
  });
  console.log(`Total with imageSrc: ${prods.length}`);
  console.log(`  File EXISTS: ${prodExists.length}`);
  console.log(`  EXTERNAL url: ${prodExternal.length}`);
  console.log(`  File MISSING: ${prodMissing.length}`);
  if (prodMissing.length > 0) {
    console.log('\nMissing product images:');
    prodMissing.slice(0, 30).forEach(p => console.log(`  MISSING: "${p.title}" => ${p.imageSrc}`));
  }

  // Check wrong slugs - categories with bad slugs
  console.log('\n========== PROBLEMATIC SLUGS ==========');
  const badSlugs = allCats.filter(c => 
    !c.slug.startsWith('polycab/') && 
    !c.slug.startsWith('dowells/') && 
    c.slug !== 'polycab' && 
    c.slug !== 'dowells'
  );
  console.log(`Categories with non-standard slugs: ${badSlugs.length}`);
  badSlugs.forEach(c => console.log(`  WARN: "${c.name}" => slug: "${c.slug}" (parent: ${c.parentId})`));

  // Check products with wrong/duplicate slugs
  const allProds = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, slug: true, categoryId: true }
  });
  
  const slugGroups = {};
  allProds.forEach(p => {
    if (!slugGroups[p.slug]) slugGroups[p.slug] = [];
    slugGroups[p.slug].push(p);
  });
  const dupes = Object.entries(slugGroups).filter(([slug, prods]) => prods.length > 1);
  console.log(`\n========== DUPLICATE PRODUCT SLUGS (${dupes.length}) ==========`);
  dupes.slice(0, 20).forEach(([slug, prods]) => {
    console.log(`  DUPE slug: "${slug}" (${prods.length} products)`);
    prods.forEach(p => console.log(`    - id: ${p.id} | "${p.title}" | cat: ${p.categoryId}`));
  });

  // Products under inactive categories
  console.log('\n========== PRODUCTS UNDER INACTIVE/MISSING CATEGORIES ==========');
  const inactiveCatIds = (await prisma.category.findMany({
    where: { isActive: false },
    select: { id: true, name: true }
  }));
  const inactiveCatIdSet = new Set(inactiveCatIds.map(c => c.id));
  const orphanProds = allProds.filter(p => p.categoryId && inactiveCatIdSet.has(p.categoryId));
  console.log(`Products under inactive categories: ${orphanProds.length}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
