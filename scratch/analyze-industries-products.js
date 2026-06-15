const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { category: { slug: 'industries' } }
  });

  const patterns = {};
  for (const p of prods) {
    const parts = p.slug.split('/');
    // e.g. industries/cables-by-standards/ansiscte-74/polycab-coaxial-cable
    // parts: ['industries', 'cables-by-standards', 'ansiscte-74', 'polycab-coaxial-cable']
    const pathPattern = parts.slice(0, parts.length - 1).join('/');
    patterns[pathPattern] = (patterns[pathPattern] || 0) + 1;
  }

  console.log('Path patterns of products under industries:');
  console.log(JSON.stringify(patterns, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
