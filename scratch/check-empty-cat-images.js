const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      products: {
        take: 3
      }
    }
  });

  console.log('Categories with empty or null image:');
  const emptyImgCats = categories.filter(c => !c.image);
  
  for (const c of emptyImgCats) {
    const parentName = c.parent ? c.parent.name : 'ROOT';
    const productsCount = await prisma.product.count({ where: { categoryId: c.id } });
    const activeProducts = await prisma.product.findMany({
      where: {
        categoryId: c.id,
        imageSrc: {
          not: {
            equals: ''
          }
        }
      },
      take: 3
    });
    
    console.log(`- Slug: ${c.slug} | Name: ${c.name} | Parent: ${parentName}`);
    console.log(`  Products count: ${productsCount}`);
    if (activeProducts.length > 0) {
      console.log(`  Sample product images: ${activeProducts.map(p => p.imageSrc).join(', ')}`);
    } else {
      console.log('  No product with image found in this category');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
