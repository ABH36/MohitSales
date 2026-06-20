const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const OTHERS_SUBCATS = [
  { folder: 'control-cable', name: 'Control Cable', slugSuffix: 'control-cable' },
  { folder: 'fire-protection-cable', name: 'Fire Protection Cable', slugSuffix: 'fire-protection-cable' },
  { folder: 'industrial-cable', name: 'Industrial Cable', slugSuffix: 'industrial-cable' },
  { folder: 'rubber-cable', name: 'Rubber Cable', slugSuffix: 'rubber-cable' },
  { folder: 'marine-and-offshoreonshore-cable', name: 'Marine & offshore/onshore Cable', slugSuffix: 'marine-and-offshoreonshore-cable' },
  { folder: 'high-temperature-cable', name: 'High Temperature Cable', slugSuffix: 'high-temperature-cable' },
  { folder: 'defence', name: 'Defence', slugSuffix: 'defence' },
  { folder: 'domestic-appliance-and-lighting-cable', name: 'Domestic Appliance & Lighting', slugSuffix: 'domestic-appliance-and-lighting-cable' },
  { folder: 'building-wires', name: 'Building Wires', slugSuffix: 'building-wires' },
  { folder: 'special-cable', name: 'Special Cable', slugSuffix: 'special-cable' },
  { folder: 'aerial-bunched-cable', name: 'Aerial Bunched Cable', slugSuffix: 'aerial-bunched-cable' }
];

// Helper to map original JSON path to correct category slug in DB
function getTargetCategorySlug(originalPath) {
  let clean = originalPath.toLowerCase().replace(/\.php$/, '');
  
  // Clean prefix
  if (clean.startsWith('industries/')) {
    clean = clean.replace('industries/', 'polycab/');
  }

  // If it's a category page directly (like industries/cables-by-application/building-infrastructure.php)
  // or a product page inside a category
  // Let's see: we want the directory part.
  const parts = clean.split('/');
  parts.pop(); // remove filename
  
  const folderPath = parts.join('/');

  // Map cables-by-application subcategories to their nested parent
  if (folderPath.includes('cables-by-application/')) {
    const sub = folderPath.split('cables-by-application/')[1];
    if (['residential', 'commercial', 'telecommunication', 'it-industry', 'datacenters'].includes(sub)) {
      return 'polycab/cables-by-application/building-infrastructure/' + sub;
    }
    if (['power-and-network', 'utility', 'renewable-energy', 'service-entrance'].includes(sub)) {
      return 'polycab/cables-by-application/energy-and-power-grid/' + sub;
    }
    if (['oil-gas-and-petrochemical', 'mining-drilling-and-tunneling'].includes(sub)) {
      return 'polycab/cables-by-application/exploration-industries/' + sub;
    }
    if (['automation-and-process-control', 'healthcare', 'food-and-beverages', 'water-treatment-and-waste-disposal', 'cement-industry', 'metal-industry', 'sugar-industry', 'pharmaceutical-industry'].includes(sub)) {
      return 'polycab/cables-by-application/manufacturing-industries/' + sub;
    }
    if (['aerospace-industry', 'defence-and-armaments-industry', 'mass-transit-railways-and-marine'].includes(sub)) {
      return 'polycab/cables-by-application/mobility-infrastructure/' + sub;
    }
  }

  // Map cables-by-standards subcategories
  if (folderPath.includes('cables-by-standards/')) {
    const sub = folderPath.split('cables-by-standards/')[1];
    if (sub === 'indian-standards' || sub === 'is-standards' || sub === 'is') {
      return 'polycab/cables-by-standards/indian-standards';
    }
    return 'polycab/cables-by-standards/international-standards';
  }

  // Map cables-by-type
  if (folderPath.includes('cables-by-type/')) {
    // If it's under others/
    if (folderPath.includes('cables-by-type/others/')) {
      const sub = folderPath.split('cables-by-type/others/')[1];
      const match = OTHERS_SUBCATS.find(s => s.folder === sub);
      if (match) {
        return 'polycab/cables-by-type/others/' + match.slugSuffix;
      }
    }
  }

  return folderPath;
}

async function main() {
  console.log('🏁 Restructuring "Others" subcategories and products...');

  const othersParent = await prisma.category.findUnique({
    where: { slug: 'polycab/cables-by-type/others' }
  });

  if (!othersParent) {
    console.error('❌ Error: "Others" parent category not found in DB!');
    return;
  }

  console.log(`Others Parent ID: ${othersParent.id}`);

  // 1. Create the 11 subcategories
  const catMap = {};
  for (const s of OTHERS_SUBCATS) {
    const targetSlug = `polycab/cables-by-type/others/${s.slugSuffix}`;
    let cat = await prisma.category.findUnique({
      where: { slug: targetSlug }
    });

    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: s.name,
          slug: targetSlug,
          parentId: othersParent.id,
          isActive: true
        }
      });
      console.log(`✅ Created subcategory: "${s.name}" (${targetSlug})`);
    } else {
      console.log(`ℹ️ Subcategory already exists: "${s.name}"`);
    }
    catMap[s.folder] = cat;
  }

  // Load content-export.json
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error('❌ content-export.json not found!');
  }
  const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Fetch all products
  const products = await prisma.product.findMany();
  console.log(`Processing ${products.length} products for category alignment...`);

  let movedCount = 0;
  let slugConflictCount = 0;

  for (const p of products) {
    // Find original entry in content-export.json
    let match = dataList.find(item => item.title === p.title || item.heading === p.title);
    if (!match) {
      const slugParts = p.slug.split('/');
      const lastPart = slugParts[slugParts.length - 1];
      match = dataList.find(item => {
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
      });
    }

    if (!match) {
      continue;
    }

    const targetCatSlug = getTargetCategorySlug(match.path);
    const dbCategory = await prisma.category.findUnique({
      where: { slug: targetCatSlug }
    });

    if (!dbCategory) {
      // Category doesn't exist, skip or log
      continue;
    }

    const slugParts = p.slug.split('/');
    const suffix = slugParts[slugParts.length - 1];
    const targetProductSlug = `${dbCategory.slug}/${suffix}`;

    // Update if categoryId or slug is different
    if (p.categoryId !== dbCategory.id || p.slug !== targetProductSlug) {
      // Check conflict
      const conflict = await prisma.product.findFirst({
        where: { slug: targetProductSlug, id: { not: p.id } }
      });

      if (conflict) {
        console.log(`⚠️ Conflict: Product with slug "${targetProductSlug}" already exists. Deleting duplicate.`);
        await prisma.product.delete({
          where: { id: p.id }
        });
        slugConflictCount++;
      } else {
        await prisma.product.update({
          where: { id: p.id },
          data: {
            categoryId: dbCategory.id,
            slug: targetProductSlug
          }
        });
        movedCount++;
      }
    }
  }

  console.log(`\n🎉 DONE!`);
  console.log(`Moved/updated products: ${movedCount}`);
  console.log(`Conflict duplicates resolved: ${slugConflictCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
