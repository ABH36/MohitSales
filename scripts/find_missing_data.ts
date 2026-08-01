import { buildExplorerArms } from '../src/lib/home-explorer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const FALLBACK_IMAGE = 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

  console.log("=== CHECKING MISSING PRODUCT IMAGES & DATASHEETS ===");
  const products = await prisma.product.findMany({
    select: { title: true, slug: true, imageSrc: true, datasheetLink: true }
  });

  const missingImageProducts = products.filter(p => !p.imageSrc || p.imageSrc === FALLBACK_IMAGE);
  console.log(`\nFound ${missingImageProducts.length} products with missing images:`);
  missingImageProducts.forEach(p => console.log(`- ${p.title} (${p.slug})`));

  const missingDatasheetProducts = products.filter(p => !p.datasheetLink);
  console.log(`\nFound ${missingDatasheetProducts.length} products with missing datasheets:`);
  missingDatasheetProducts.forEach(p => console.log(`- ${p.title} (${p.slug})`));

  console.log("\n=== CHECKING EXPLORER CATEGORIES (HOME MENU) USING FALLBACK IMAGE ===");
  const arms = await buildExplorerArms();
  let fallbackCategories: string[] = [];

  for (const armKey in arms) {
    const arm = arms[armKey as keyof typeof arms];
    for (const cat of arm.categories) {
      if (cat.image === FALLBACK_IMAGE) {
        fallbackCategories.push(`[${arm.label}] ${cat.name} (${cat.slug})`);
      }
      if (cat.children) {
        for (const child of cat.children) {
          if (child.image === FALLBACK_IMAGE) {
            fallbackCategories.push(`[${arm.label}] ${cat.name} -> ${child.name} (${child.slug})`);
          }
        }
      }
    }
  }

  console.log(`\nFound ${fallbackCategories.length} categories using the fallback image:`);
  fallbackCategories.forEach(c => console.log(`- ${c}`));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
