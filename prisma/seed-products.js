const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const SLUG_TO_CATEGORY = [
  { match: /^industries\/cables-by-application\/|^polycab\/cables-by-application\//, slug: 'polycab-cables' },
  { match: /^industries\/cables-by-standards\/|^polycab\/cables-by-standards\//, slug: 'polycab-cables' },
  { match: /^industries\/cables-by-type\/|^polycab\/cables-by-type\//, slug: 'polycab-cables' },
  { match: /^switchgears\/|^polycab\/switchgears\//, slug: 'polycab-switchgears' },
  { match: /^fans\/|^polycab\/fans\//, slug: 'polycab-fans' },
  { match: /^solar\/|^polycab\/solar\//, slug: 'polycab-solar' },
  { match: /^conduit-accessories\/|^polycab\/conduit/, slug: 'polycab-conduits' },
  { match: /^home-appliances\/|^polycab\/home-appliances\//, slug: 'polycab-home-appliances' },
  { match: /^cable-terminal\/|^dowells\/cable-terminal\//, slug: 'dowells-cable-terminal' },
  { match: /^gland\/|^dowells\/gland\//, slug: 'dowells-gland' },
  { match: /^crimping-tool\/|^dowells\/crimping-tool\//, slug: 'dowells-crimping-tool' },
];

function findCategorySlug(productSlug) {
  for (const rule of SLUG_TO_CATEGORY) {
    if (rule.match.test(productSlug)) return rule.slug;
  }
  return null;
}

async function main() {
  console.log('Reading content-export.json...');
  const dataPath = path.join(__dirname, '..', 'content-export.json');

  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: content-export.json not found!');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const products = JSON.parse(rawData);

  console.log(`Found ${products.length} products to import.\n`);

  // Load all categories into a map for fast lookup
  const allCats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = new Map(allCats.map(c => [c.slug, c.id]));
  console.log(`Loaded ${catMap.size} categories from DB.\n`);

  // Fallback: "General" category (hidden from nav, used as uncategorized bucket)
  let generalCatId = catMap.get('general');
  if (!generalCatId) {
    const gen = await prisma.category.create({
      data: { name: 'General', slug: 'general', isActive: false },
    });
    generalCatId = gen.id;
  } else {
    await prisma.category.update({
      where: { slug: 'general' },
      data: { isActive: false },
    });
  }

  let successCount = 0;
  let skipCount = 0;
  let categorized = 0;
  let uncategorized = 0;

  for (const item of products) {
    const cleanSlug = item.path.replace(/\.php$/i, '').toLowerCase();

    const exists = await prisma.product.findUnique({
      where: { slug: cleanSlug },
      select: { id: true, categoryId: true },
    });

    // Determine correct category
    const matchedCatSlug = findCategorySlug(cleanSlug);
    const categoryId = matchedCatSlug ? (catMap.get(matchedCatSlug) || generalCatId) : generalCatId;

    if (matchedCatSlug && catMap.get(matchedCatSlug)) {
      categorized++;
    } else {
      uncategorized++;
    }

    if (exists) {
      // Re-categorize existing products that are stuck in "General"
      if (exists.categoryId === generalCatId && matchedCatSlug && catMap.get(matchedCatSlug)) {
        await prisma.product.update({
          where: { id: exists.id },
          data: { categoryId: catMap.get(matchedCatSlug) },
        });
      }
      skipCount++;
      continue;
    }

    try {
      await prisma.product.create({
        data: {
          slug: cleanSlug,
          title: item.heading || item.title || cleanSlug.split('/').pop(),
          description: item.description ? JSON.stringify(item.description) : null,
          features: item.cards ? JSON.stringify(item.cards) : null,
          imageSrc: item.imageSrc || null,
          datasheetLink: item.datasheet || null,
          categoryId,
          isActive: true,
          stock: 999,
        },
      });
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`  Imported ${successCount} products...`);
      }
    } catch (e) {
      console.error(`Failed to import ${cleanSlug}:`, e.message);
    }
  }

  console.log('\n✅ Import Completed!');
  console.log(`  New imports     : ${successCount}`);
  console.log(`  Skipped (exist) : ${skipCount}`);
  console.log(`  Categorized     : ${categorized}`);
  console.log(`  Uncategorized   : ${uncategorized} (in hidden "General" bucket)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
