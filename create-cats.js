const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function formatName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function main() {
  const generalProds = await prisma.product.findMany({
    where: { category: { name: 'General' } }
  });
  
  const categories = await prisma.category.findMany();
  const catMap = new Map();
  categories.forEach(c => catMap.set(c.slug, c.id));
  
  let newCats = 0;
  let updated = 0;

  for (const p of generalProds) {
    const parts = p.slug.split('/');
    if (parts.length > 1) {
      const catSlug = parts[parts.length - 2];
      
      let catId = catMap.get(catSlug);
      
      if (!catId) {
        // Create the missing category
        const newCat = await prisma.category.create({
          data: {
            slug: catSlug,
            name: formatName(catSlug),
            // Parent can be the category above it, but for simplicity let's just create it at the root or under 'Polycab' if we can't figure it out.
            // Let's just create it at the root to fix the 'General' issue
          }
        });
        catMap.set(catSlug, newCat.id);
        catId = newCat.id;
        newCats++;
      }
      
      if (catId) {
        await prisma.product.update({
          where: { id: p.id },
          data: { categoryId: catId }
        });
        updated++;
      }
    }
  }
  
  console.log('Created new categories:', newCats);
  console.log('Updated products:', updated);
  
  const remaining = await prisma.product.count({ where: { category: { name: 'General' } } });
  console.log('Remaining in General:', remaining);
}

main().catch(console.error).finally(() => prisma.$disconnect());
