const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Check remaining industries/ slugs
  const industryProds = await p.product.findMany({
    where: { isActive: true, slug: { startsWith: 'industries/' } },
    select: { id: true, title: true, slug: true, imageSrc: true, stock: true }
  });
  console.log(`Still active industries/ products: ${industryProds.length}`);
  industryProds.slice(0, 10).forEach(p2 => console.log(`  - "${p2.title}" | ${p2.slug} | img: ${p2.imageSrc ? 'YES' : 'NO'} | stock: ${p2.stock}`));

  // 2. Check ALL bad slugs (not polycab/ or dowells/)
  const badSlugProds = await p.product.findMany({
    where: { 
      isActive: true,
      AND: [
        { slug: { not: { startsWith: 'polycab/' } } },
        { slug: { not: { startsWith: 'dowells/' } } }
      ]
    },
    select: { id: true, slug: true }
  });
  console.log(`\nTotal bad-slug active products: ${badSlugProds.length}`);
  badSlugProds.slice(0, 10).forEach(p2 => console.log(`  - ${p2.slug}`));

  // 3. Check stock distribution
  const stockNull = await p.product.count({ where: { isActive: true, stock: null } });
  const stockZero = await p.product.count({ where: { isActive: true, stock: 0 } });
  const stockPos = await p.product.count({ where: { isActive: true, stock: { gt: 0 } } });
  console.log(`\nStock distribution (active products):`);
  console.log(`  stock = null: ${stockNull}`);
  console.log(`  stock = 0:    ${stockZero} (OUT OF STOCK)`);
  console.log(`  stock > 0:    ${stockPos}`);
  
  // 4. Check specific problem product
  const specific = await p.product.findFirst({
    where: { slug: { contains: 'ehv-al-cs' } },
    select: { id: true, title: true, slug: true, imageSrc: true, stock: true, isActive: true }
  });
  console.log(`\nSpecific product (EHV AL CS+PAL): `, specific);

  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
