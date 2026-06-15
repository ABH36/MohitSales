const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  
  // Group children by parentId and lowercase name
  const group = {};
  for (const cat of categories) {
    if (!cat.parentId) continue;
    const key = `${cat.parentId}:${cat.name.toLowerCase()}`;
    group[key] = group[key] || [];
    group[key].push(cat);
  }

  console.log('Duplicate child categories (same parent and name):');
  for (const [key, cats] of Object.entries(group)) {
    if (cats.length > 1) {
      console.log(`Key: ${key} (Count: ${cats.length})`);
      for (const cat of cats) {
        console.log(`  - ID: ${cat.id}, Slug: "${cat.slug}"`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
