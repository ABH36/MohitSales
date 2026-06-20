const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check category tree
  const cats = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: {
            include: { children: true }
          }
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  console.log('=== CATEGORY TREE ===');
  console.log('Root categories:', cats.length);
  
  cats.forEach(c => {
    console.log(`\n=== ${c.name} (slug: ${c.slug}, isActive: ${c.isActive}) ===`);
    c.children.forEach(sub => {
      console.log(`  -> ${sub.name} (${sub.slug}) - children: ${sub.children.length}, isActive: ${sub.isActive}`);
      sub.children.forEach(sub2 => {
        console.log(`      -> ${sub2.name} (${sub2.slug}) - children: ${sub2.children.length}, isActive: ${sub2.isActive}`);
      });
    });
  });

  // Check product stats
  const totalProds = await prisma.product.count();
  const activeProds = await prisma.product.count({ where: { isActive: true } });
  const inactiveProds = await prisma.product.count({ where: { isActive: false } });
  const withImage = await prisma.product.count({ where: { imageSrc: { not: null, not: '' } } });
  const withoutImage = await prisma.product.count({ where: { OR: [{ imageSrc: null }, { imageSrc: '' }] } });
  const withCategory = await prisma.product.count({ where: { categoryId: { not: null } } });
  const withoutCategory = await prisma.product.count({ where: { categoryId: null } });

  console.log('\n=== PRODUCT STATS ===');
  console.log(`Total: ${totalProds}`);
  console.log(`Active: ${activeProds}, Inactive: ${inactiveProds}`);
  console.log(`With image: ${withImage}, Without image: ${withoutImage}`);
  console.log(`With category: ${withCategory}, Without category: ${withoutCategory}`);

  // Sample a few products to see their data
  const sampleProds = await prisma.product.findMany({
    take: 5,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\n=== SAMPLE PRODUCTS (last 5) ===');
  sampleProds.forEach(p => {
    console.log(`- ${p.title}`);
    console.log(`  slug: ${p.slug}`);
    console.log(`  imageSrc: ${p.imageSrc || 'NONE'}`);
    console.log(`  category: ${p.category ? p.category.name : 'NULL'} (${p.category ? p.category.slug : 'N/A'})`);
    console.log(`  isActive: ${p.isActive}, stock: ${p.stock}`);
  });

  // Check products with no category
  const noCatSample = await prisma.product.findMany({
    where: { categoryId: null },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });
  
  if (noCatSample.length > 0) {
    console.log('\n=== PRODUCTS WITHOUT CATEGORY (sample 3) ===');
    noCatSample.forEach(p => {
      console.log(`- ${p.title} | slug: ${p.slug} | image: ${p.imageSrc || 'NONE'}`);
    });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
