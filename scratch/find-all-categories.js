const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log(`Total categories in database: ${categories.length}`);
  
  // Group by parentId
  const byParent = {};
  for (const cat of categories) {
    const pId = cat.parentId || 'NULL';
    byParent[pId] = byParent[pId] || [];
    byParent[pId].push(cat);
  }

  console.log('\nCategories grouped by parentId:');
  for (const [pId, cats] of Object.entries(byParent)) {
    console.log(`Parent ID: ${pId} (Count: ${cats.length})`);
    for (const cat of cats.slice(0, 5)) {
      console.log(`  - ${cat.name} (${cat.slug}) [ID: ${cat.id}]`);
    }
    if (cats.length > 5) {
      console.log(`  - ... and ${cats.length - 5} more`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
