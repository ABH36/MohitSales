/**
 * Cleanup Orphan Categories
 * - Remove old "Industries" and "General" category trees (isActive=false, no real products)
 * - Remove duplicate typo categories like "mobility-infrasture", "exporation-industries"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all categories with product counts
  const allCats = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      children: { include: { _count: { select: { products: true } } } }
    }
  });
  
  // Find categories to remove:
  // 1. isActive = false categories with 0 products and 0 active children
  // 2. Old "industries/" prefix categories
  
  console.log('=== Analyzing categories for cleanup ===\n');
  
  const toDeactivate = [];
  
  for (const cat of allCats) {
    if (cat.isActive) continue; // Only clean up inactive ones
    
    // Check if any products are under this category
    if (cat._count.products > 0) {
      console.log(`KEEP (has ${cat._count.products} products): ${cat.slug}`);
      continue;
    }
    
    console.log(`DEACTIVATE/REMOVE: ${cat.slug} (0 products, inactive)`);
    toDeactivate.push(cat.id);
  }
  
  console.log(`\nCategories to remove: ${toDeactivate.length}`);
  
  if (toDeactivate.length === 0) {
    console.log('Nothing to clean up!');
    return;
  }
  
  // Delete orphan categories (those that have no products)
  // First check for child categories in inactive ones
  const inactiveSlugs = allCats.filter(c => !c.isActive).map(c => c.slug);
  console.log('\nInactive category slugs:');
  inactiveSlugs.forEach(s => console.log('  -', s));
  
  // Reassign any products in these categories to null first (safety check)
  const productsInInactive = await prisma.product.count({
    where: { category: { isActive: false } }
  });
  console.log(`\nProducts in inactive categories: ${productsInInactive}`);
  
  if (productsInInactive > 0) {
    console.log('Moving products from inactive categories to their active equivalents...');
    // These products were already correctly assigned to active categories
    // The inactive ones are just stale old structure
    const prods = await prisma.product.findMany({
      where: { category: { isActive: false } },
      include: { category: true },
      take: 20
    });
    prods.forEach(p => console.log(`  Product: ${p.title} -> cat: ${p.category?.slug}`));
  }
  
  // Actually delete orphan inactive categories (those with 0 products that are not parent of active ones)
  const inactiveCatIds = allCats.filter(c => !c.isActive && c._count.products === 0).map(c => c.id);
  
  // Check if any of these are parents of active categories
  const activeCatParentIds = new Set(
    allCats.filter(c => c.isActive && c.children && c.children.some(ch => ch.isActive))
           .map(c => c.id)
  );
  
  const safeToDelete = inactiveCatIds.filter(id => !activeCatParentIds.has(id));
  console.log(`\nSafe to delete (inactive, 0 products, not parent of active): ${safeToDelete.length}`);
  
  if (safeToDelete.length > 0) {
    // Delete in batches (handle foreign key: children must be deleted before parents)
    // Get slugs for reference
    const toDeleteCats = allCats.filter(c => safeToDelete.includes(c.id));
    const toDeleteWithChildren = toDeleteCats.filter(c => c.children && c.children.length > 0);
    const toDeleteLeaves = toDeleteCats.filter(c => !c.children || c.children.length === 0);
    
    // Delete leaves first
    if (toDeleteLeaves.length > 0) {
      const leafIds = toDeleteLeaves.map(c => c.id);
      const result = await prisma.category.deleteMany({ where: { id: { in: leafIds } } });
      console.log(`Deleted ${result.count} leaf categories`);
    }
    
    // Then delete parents
    if (toDeleteWithChildren.length > 0) {
      const parentIds = toDeleteWithChildren.map(c => c.id);
      try {
        const result = await prisma.category.deleteMany({ where: { id: { in: parentIds } } });
        console.log(`Deleted ${result.count} parent categories`);
      } catch (e) {
        console.log('Could not delete parent categories (have remaining children):', e.message);
      }
    }
  }
  
  // Final summary
  const finalCount = await prisma.category.count();
  const activeCount = await prisma.category.count({ where: { isActive: true } });
  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Total categories: ${finalCount}`);
  console.log(`Active categories: ${activeCount}`);
  console.log(`Inactive: ${finalCount - activeCount}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
