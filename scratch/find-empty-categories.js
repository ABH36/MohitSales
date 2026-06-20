const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
      children: true
    }
  });

  console.log(`Total categories in DB: ${categories.length}`);

  const emptyCats = categories.filter(c => 
    c.products.length === 0 && 
    c.children.length === 0 && 
    c.slug !== 'polycab' && 
    c.slug !== 'dowells'
  );

  console.log(`\nEmpty categories (0 products, 0 subcategories): ${emptyCats.length}`);
  for (const c of emptyCats) {
    console.log(`- Name: "${c.name}", Slug: "${c.slug}", ID: "${c.id}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
