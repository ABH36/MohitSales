const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      parentId: true,
      parent: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });

  console.log(`Total categories in DB: ${categories.length}`);
  
  const rootCategories = categories.filter(c => !c.parentId);
  const childCategories = categories.filter(c => c.parentId);
  
  console.log(`Root categories: ${rootCategories.length}`);
  console.log(`Child categories: ${childCategories.length}`);
  
  console.log('\n--- ROOT CATEGORIES ---');
  rootCategories.forEach(c => {
    console.log(`- ${c.name} (${c.slug})`);
  });

  console.log('\n--- CHILD CATEGORIES (First 20) ---');
  childCategories.slice(0, 20).forEach(c => {
    console.log(`- ${c.name} (${c.slug}) -> Parent: ${c.parent?.name} (${c.parent?.slug})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
