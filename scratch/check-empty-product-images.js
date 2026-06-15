const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allProducts = await prisma.product.findMany({
    include: {
      category: true
    }
  });

  console.log(`Total products in DB: ${allProducts.length}`);
  const emptyImgProds = allProducts.filter(p => !p.imageSrc);
  console.log(`Products with null or empty imageSrc: ${emptyImgProds.length}`);
  
  const sampleEmpty = emptyImgProds.slice(0, 15);
  console.log('\nSample products with missing images:');
  sampleEmpty.forEach(p => {
    console.log(`- Title: ${p.title} | Slug: ${p.slug} | Cat: ${p.category?.name} (${p.category?.slug})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
