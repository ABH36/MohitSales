const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('content-export.json not found!');
    return;
  }
  const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const prods = await prisma.product.findMany({
    where: { category: { slug: 'industries' } }
  });

  console.log(`Analyzing ${prods.length} products associated with industries category...`);

  let matchedCount = 0;
  let resolvedMap = [];

  for (const p of prods) {
    // Try to find a match in the JSON list by title or slug
    let match = dataList.find(item => item.title === p.title || item.heading === p.title);
    if (!match) {
      // Try by matching slug suffix
      const slugParts = p.slug.split('/');
      const lastPart = slugParts[slugParts.length - 1];
      match = dataList.find(item => {
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
      });
    }

    if (match) {
      matchedCount++;
      resolvedMap.push({
        productId: p.id,
        title: p.title,
        currentSlug: p.slug,
        jsonPath: match.path
      });
    } else {
      // console.log(`No match for: ${p.title} (${p.slug})`);
    }
  }

  console.log(`Matched ${matchedCount} / ${prods.length} products to content-export.json.`);
  console.log('Sample matches:');
  console.log(JSON.stringify(resolvedMap.slice(0, 15), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
