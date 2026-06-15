const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: { parent: true }
  });

  const roots = categories.filter(c => !c.parentId);
  console.log('Roots:');
  for (const root of roots) {
    console.log(`- ${root.name} (${root.slug}) [ID: ${root.id}]`);
    const children = categories.filter(c => c.parentId === root.id);
    for (const child of children) {
      console.log(`  - ${child.name} (${child.slug}) [ID: ${child.id}]`);
      const grand = categories.filter(c => c.parentId === child.id);
      for (const g of grand) {
        console.log(`    - ${g.name} (${g.slug}) [ID: ${g.id}]`);
        const great = categories.filter(c => c.parentId === g.id);
        for (const gr of great) {
          console.log(`      - ${gr.name} (${gr.slug}) [ID: ${gr.id}]`);
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
