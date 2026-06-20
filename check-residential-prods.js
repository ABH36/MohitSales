const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'polycab/cables/cables-by-application/building-infrastructure/residential' },
    include: {
      products: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageSrc: true
        }
      }
    }
  });

  if (!cat) {
    console.log('Category not found.');
    return;
  }

  console.log(`Subcategory: "${cat.name}" | Slug: "${cat.slug}"`);
  console.log(`Total Products under this subcategory: ${cat.products.length}`);
  console.log('\nFirst 20 products:');
  cat.products.slice(0, 20).forEach(p => {
    console.log(`- Title: "${p.title}" | Slug: "${p.slug}"`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
