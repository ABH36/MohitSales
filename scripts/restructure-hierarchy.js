const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔄 Starting database restructuring...');

  // 1. Get root Brand categories
  const polycab = await prisma.category.findUnique({ where: { slug: 'polycab' } });
  const dowells = await prisma.category.findUnique({ where: { slug: 'dowells' } });

  if (!polycab || !dowells) {
    console.error('❌ Root brands (polycab/dowells) not found!');
    return;
  }

  console.log(`ℹ️ Polycab ID: ${polycab.id}`);
  console.log(`ℹ️ Dowells ID: ${dowells.id}`);

  // Helper to safely re-parent a category by ID
  async function reparentCategory(id, newParentId, newSlug, newName = null) {
    const updateData = { parentId: newParentId, slug: newSlug };
    if (newName) updateData.name = newName;
    
    await prisma.category.update({
      where: { id },
      data: updateData
    });
    console.log(`✅ Category ID ${id} -> parented to ${newParentId}, slug: "${newSlug}"`);
  }

  // ── STEP 1: Process root-level cables categories ──────────────────────────
  console.log('\n📦 Step 1: Processing main Cables categories...');
  
  // Find category Cables By Application, Cables By Standards, Cables By Type
  const cba = await prisma.category.findFirst({ where: { slug: { in: ['industries/cables-by-application', 'cables-by-application', 'polycab/cables-by-application'] } } });
  const cbs = await prisma.category.findFirst({ where: { slug: { in: ['industries/cables-by-standards', 'cables-by-standards', 'polycab/cables-by-standards'] } } });
  const cbt = await prisma.category.findFirst({ where: { slug: { in: ['industries/cables-by-type', 'cables-by-type', 'polycab/cables-by-type'] } } });
  
  // Also clean up Cables By Standard (singular duplicate)
  const cbtSingular = await prisma.category.findFirst({ where: { slug: { in: ['industries/cables-by-standard', 'cables-by-standard', 'polycab/cables-by-standard'] } } });

  if (cbtSingular && cbs) {
    console.log(`🔄 Merging duplicate Cables By Standard (${cbtSingular.id}) into Cables By Standards (${cbs.id})...`);
    await prisma.product.updateMany({
      where: { categoryId: cbtSingular.id },
      data: { categoryId: cbs.id }
    });
    await prisma.category.delete({ where: { id: cbtSingular.id } });
    console.log('✅ Duplicate deleted.');
  }

  // Reparent cba, cbs, cbt under Polycab
  if (cba) await reparentCategory(cba.id, polycab.id, 'polycab/cables-by-application');
  if (cbs) await reparentCategory(cbs.id, polycab.id, 'polycab/cables-by-standards');
  if (cbt) await reparentCategory(cbt.id, polycab.id, 'polycab/cables-by-type');

  const cbaId = cba ? cba.id : null;
  const cbsId = cbs ? cbs.id : null;
  const cbtId = cbt ? cbt.id : null;

  // ── STEP 2: Process subcategories of Cables By Application ────────────────
  console.log('\n🌳 Step 2: Restructuring Cables By Application subcategories...');
  
  if (cbaId) {
    const appSubCats = [
      { currentSlugs: ['industries/building-infrastructure', 'building-infrastructure', 'polycab/cables-by-application/building-infrastructure'], newSlug: 'polycab/cables-by-application/building-infrastructure', name: 'Building Infrastructure' },
      { currentSlugs: ['industries/energy-and-power-grid', 'energy-and-power-grid', 'polycab/cables-by-application/energy-and-power-grid'], newSlug: 'polycab/cables-by-application/energy-and-power-grid', name: 'Energy And Power Grid' },
      { currentSlugs: ['industries/exporation-industries', 'exploration-industries', 'exporation-industries', 'polycab/cables-by-application/exploration-industries'], newSlug: 'polycab/cables-by-application/exploration-industries', name: 'Exploration Industries' },
      { currentSlugs: ['industries/manufacturing-industries', 'manufacturing-industries', 'polycab/cables-by-application/manufacturing-industries'], newSlug: 'polycab/cables-by-application/manufacturing-industries', name: 'Manufacturing Industries' },
      { currentSlugs: ['industries/mobility-infrastructure', 'mobility-infrastructure', 'polycab/cables-by-application/mobility-infrastructure'], newSlug: 'polycab/cables-by-application/mobility-infrastructure', name: 'Mobility Infrastructure' }
    ];

    // Clean up spelling duplicates for Mobility first
    const mobilityDups = await prisma.category.findMany({
      where: {
        slug: { in: ['industries/mobility-infrasture', 'industries/mobility-infrasturcture', 'mobility-infrasture', 'mobility-infrasturcture'] }
      }
    });

    const targetMobility = await prisma.category.findFirst({
      where: { slug: { in: ['industries/mobility-infrastructure', 'mobility-infrastructure', 'polycab/cables-by-application/mobility-infrastructure'] } }
    });

    if (targetMobility && mobilityDups.length > 0) {
      console.log(`🧹 Merging ${mobilityDups.length} duplicate mobility categories into "${targetMobility.slug}"...`);
      for (const dup of mobilityDups) {
        // Move products
        await prisma.product.updateMany({
          where: { categoryId: dup.id },
          data: { categoryId: targetMobility.id }
        });
        // Reparent children
        await prisma.category.updateMany({
          where: { parentId: dup.id },
          data: { parentId: targetMobility.id }
        });
        // Delete duplicate
        await prisma.category.delete({ where: { id: dup.id } });
      }
      console.log('✅ Mobility categories merged successfully.');
    }

    // Clean up duplicate child categories under targetMobility (e.g. duplicate residential categories)
    if (targetMobility) {
      const mobilityResCats = await prisma.category.findMany({
        where: { parentId: targetMobility.id, name: 'Residential' }
      });
      if (mobilityResCats.length > 1) {
        const keepCat = mobilityResCats.find(c => c.slug === 'polycab/cables-by-application/mobility-infrastructure/residential') || mobilityResCats[0];
        console.log(`🧹 Merging duplicate Residential children under Mobility Infrastructure into Category ID ${keepCat.id}...`);
        for (const cat of mobilityResCats) {
          if (cat.id === keepCat.id) continue;
          // Move products
          await prisma.product.updateMany({
            where: { categoryId: cat.id },
            data: { categoryId: keepCat.id }
          });
          // Delete duplicate
          await prisma.category.delete({ where: { id: cat.id } });
        }
        console.log('✅ Duplicate Residential children merged successfully.');
      }
    }

    for (const item of appSubCats) {
      const cat = await prisma.category.findFirst({ where: { slug: { in: item.currentSlugs } } });
      if (cat) {
        await reparentCategory(cat.id, cbaId, item.newSlug, item.name);
        
        // Reparent and rename its Residential child category if any
        const resChild = await prisma.category.findFirst({ where: { parentId: cat.id } });
        if (resChild) {
          const resNewSlug = `${item.newSlug}/residential`;
          await reparentCategory(resChild.id, cat.id, resNewSlug);
        }
      }
    }
  }

  // ── STEP 3: Process subcategories of Cables By Standards ──────────────────
  console.log('\n📜 Step 3: Setting up Cables By Standards subcategories...');
  
  if (cbsId) {
    // 1. Indian Standards (IS)
    let isCat = await prisma.category.findUnique({ where: { slug: 'polycab/cables-by-standards/indian-standards' } });
    if (!isCat) {
      isCat = await prisma.category.create({
        data: {
          name: 'Indian Standards (IS)',
          slug: 'polycab/cables-by-standards/indian-standards',
          parentId: cbsId,
          description: 'Cables complying with Indian Standards (IS)'
        }
      });
      console.log('✅ Created category: Indian Standards (IS)');
    }

    // 2. International Standards
    let interCat = await prisma.category.findUnique({ where: { slug: 'polycab/cables-by-standards/international-standards' } });
    if (!interCat) {
      interCat = await prisma.category.create({
        data: {
          name: 'International Standards',
          slug: 'polycab/cables-by-standards/international-standards',
          parentId: cbsId,
          description: 'Cables complying with BS, IEC, UL and other International Standards'
        }
      });
      console.log('✅ Created category: International Standards');
    }
  }

  // ── STEP 4: Process subcategories of Cables By Type ───────────────────────
  console.log('\n🔌 Step 4: Restructuring Cables By Type subcategories...');
  
  if (cbtId) {
    const typeSubCats = await prisma.category.findMany({
      where: { parentId: cbtId }
    });

    for (const cat of typeSubCats) {
      // Slugs are currently like industries/cables-by-type/mv-power-cable or polycab/cables-by-type/mv-power-cable
      // Update to polycab/cables-by-type/...
      const slugPart = cat.slug.split('/').pop();
      const targetSlug = `polycab/cables-by-type/${slugPart}`;
      
      // Update slug, parent is already cbtId
      if (cat.slug !== targetSlug) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { slug: targetSlug }
        });
        console.log(`✅ Updated type subcat slug: "${cat.slug}" -> "${targetSlug}"`);
      }

      // Update its Residential child category if any
      const resChild = await prisma.category.findFirst({ where: { parentId: cat.id } });
      if (resChild) {
        const resNewSlug = `${targetSlug}/residential`;
        await reparentCategory(resChild.id, cat.id, resNewSlug);
      }
    }

    // Create "Others" category under Cables By Type if not exists
    let othersCat = await prisma.category.findUnique({ where: { slug: 'polycab/cables-by-type/others' } });
    if (!othersCat) {
      othersCat = await prisma.category.create({
        data: {
          name: 'Others',
          slug: 'polycab/cables-by-type/others',
          parentId: cbtId,
          description: 'Other specialized cable products'
        }
      });
      console.log('✅ Created category: Others under Cables By Type');
    }
  }

  // ── STEP 5: Process Dowells Crimping Tool Category ────────────────────────
  console.log('\n🔧 Step 5: Creating Crimping Tool category under Dowells...');
  
  let crimpCat = await prisma.category.findUnique({ where: { slug: 'dowells/crimping-tool' } });
  if (!crimpCat) {
    crimpCat = await prisma.category.create({
      data: {
        name: 'Crimping Tool',
        slug: 'dowells/crimping-tool',
        parentId: dowells.id,
        description: 'Manual and Hydraulic Crimping Tools'
      }
    });
    console.log('✅ Created Dowells category: Crimping Tool');
  }

  // ── STEP 5.5: Reparent products of the "industries" category ──────────────
  console.log('\n📦 Step 5.5: Re-parenting products under retired "industries" category...');
  
  const industriesRootForProducts = await prisma.category.findUnique({
    where: { slug: 'industries' }
  });

  if (industriesRootForProducts) {
    const industriesProds = await prisma.product.findMany({
      where: { categoryId: industriesRootForProducts.id }
    });

    if (industriesProds.length > 0) {
      console.log(`Found ${industriesProds.length} products assigned to "industries". Resolving correct category IDs...`);
      
      const jsonPath = path.join(process.cwd(), 'content-export.json');
      if (!fs.existsSync(jsonPath)) {
        throw new Error('❌ Cannot reparent products: content-export.json not found!');
      }
      const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Find all target categories
      const catBuilding = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/building-infrastructure' } });
      const catEnergy = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/energy-and-power-grid' } });
      const catExploration = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/exploration-industries' } });
      const catManufacturing = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/manufacturing-industries' } });
      const catMobility = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-application/mobility-infrastructure' } });
      const catIndian = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-standards/indian-standards' } });
      const catInternational = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-standards/international-standards' } });
      const catTypeOthers = await prisma.category.findFirst({ where: { slug: 'polycab/cables-by-type/others' } });

      let movedCount = 0;
      for (const p of industriesProds) {
        let match = dataList.find(item => item.title === p.title || item.heading === p.title);
        if (!match) {
          const slugParts = p.slug.split('/');
          const lastPart = slugParts[slugParts.length - 1];
          match = dataList.find(item => {
            const itemParts = item.path.replace(/\.php$/, '').split('/');
            return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
          });
        }

        if (!match) {
          console.warn(`⚠️ No match in content-export.json for product: "${p.title}". Skipping.`);
          continue;
        }

        const originalPath = match.path.toLowerCase();
        let targetCategoryId = null;

        if (originalPath.includes('cables-by-standards')) {
          const isIndian = p.title.toLowerCase().includes('is-') || p.title.toLowerCase().includes('is ') || originalPath.includes('/is-') || originalPath.includes('is/');
          if (isIndian && catIndian) {
            targetCategoryId = catIndian.id;
          } else if (catInternational) {
            targetCategoryId = catInternational.id;
          }
        } else if (originalPath.includes('cables-by-type')) {
          const parts = originalPath.split('/');
          const typeIdx = parts.indexOf('cables-by-type');
          if (typeIdx !== -1 && typeIdx + 1 < parts.length) {
            const subcatSlug = parts[typeIdx + 1].replace(/\.php$/, '');
            const dbSubcat = await prisma.category.findFirst({
              where: { slug: `polycab/cables-by-type/${subcatSlug}` }
            });
            if (dbSubcat) {
              targetCategoryId = dbSubcat.id;
            } else if (catTypeOthers) {
              targetCategoryId = catTypeOthers.id;
            }
          } else if (catTypeOthers) {
            targetCategoryId = catTypeOthers.id;
          }
        } else if (originalPath.includes('cables-by-application')) {
          if (originalPath.includes('commercial') || originalPath.includes('building') || originalPath.includes('residential') || originalPath.includes('hospital')) {
            targetCategoryId = catBuilding ? catBuilding.id : null;
          } else if (originalPath.includes('power-generation') || originalPath.includes('energy-and-power-grid') || originalPath.includes('grid')) {
            targetCategoryId = catEnergy ? catEnergy.id : null;
          } else if (originalPath.includes('exploration') || originalPath.includes('mining') || originalPath.includes('oil-gas')) {
            targetCategoryId = catExploration ? catExploration.id : null;
          } else if (originalPath.includes('cement') || originalPath.includes('steel') || originalPath.includes('automation') || 
                     originalPath.includes('chemical') || originalPath.includes('glass') || originalPath.includes('food') || 
                     originalPath.includes('heavy-engineering') || originalPath.includes('textile') || originalPath.includes('paper') || 
                     originalPath.includes('water-') || originalPath.includes('packaging')) {
            targetCategoryId = catManufacturing ? catManufacturing.id : null;
          } else if (originalPath.includes('mobility') || originalPath.includes('defence') || originalPath.includes('aerospace') || 
                     originalPath.includes('railway') || originalPath.includes('marine') || originalPath.includes('ports') || 
                     originalPath.includes('telecommunication') || originalPath.includes('transit')) {
            targetCategoryId = catMobility ? catMobility.id : null;
          } else {
            targetCategoryId = catManufacturing ? catManufacturing.id : null;
          }
        }

        if (targetCategoryId) {
          await prisma.product.update({
            where: { id: p.id },
            data: { categoryId: targetCategoryId }
          });
          movedCount++;
        }
      }
      console.log(`✅ Reparented ${movedCount} products out of "industries".`);
    } else {
      console.log('ℹ️ No products remaining directly in "industries" category.');
    }
  }

  // ── STEP 6: Safely delete retired roots ───────────────────────────────────
  console.log('\n🧹 Step 6: Cleaning up retired "industries" root category...');
  
  const industriesRoot = await prisma.category.findUnique({
    where: { slug: 'industries' },
    include: { _count: { select: { products: true, children: true } } }
  });

  if (industriesRoot) {
    if (industriesRoot._count.products === 0 && industriesRoot._count.children === 0) {
      await prisma.category.delete({ where: { id: industriesRoot.id } });
      console.log('✅ Deleted empty industries root category.');
    } else {
      // Re-fetch count in case we moved products in Step 5.5
      const freshRoot = await prisma.category.findUnique({
        where: { id: industriesRoot.id },
        include: { _count: { select: { products: true, children: true } } }
      });
      if (freshRoot && freshRoot._count.products === 0 && freshRoot._count.children === 0) {
        await prisma.category.delete({ where: { id: freshRoot.id } });
        console.log('✅ Deleted empty industries root category.');
      } else {
        console.warn(`⚠️ Cannot delete industries category — still has ${freshRoot._count.products} products and ${freshRoot._count.children} children.`);
      }
    }
  }

  // ── STEP 7: Re-parent Product Slugs & Categories ─────────────────────────
  console.log('\n📝 Step 7: Re-aligning product slugs with the new hierarchy...');
  
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  console.log(`Processing ${products.length} products to align slugs...`);
  
  // To avoid unique constraint conflicts during updates, we use a two-pass strategy:
  // Pass 1: Identify all products that ALREADY have their correct slug and add them to processedSlugs first.
  const processedSlugs = new Set();
  const pendingUpdates = [];

  for (const prod of products) {
    if (!prod.category) continue;
    const slugParts = prod.slug.split('/');
    const lastPart = slugParts[slugParts.length - 1];
    const targetProductSlug = `${prod.category.slug}/${lastPart}`;

    if (prod.slug === targetProductSlug) {
      processedSlugs.add(targetProductSlug);
    } else {
      pendingUpdates.push({ prod, targetProductSlug });
    }
  }

  // Pass 2: Process the pending updates, deleting any that would cause a duplicate.
  let deletedCount = 0;
  let updatedProductsCount = 0;

  for (const { prod, targetProductSlug } of pendingUpdates) {
    if (processedSlugs.has(targetProductSlug)) {
      // Deleting duplicate row to avoid constraint conflict
      await prisma.product.delete({ where: { id: prod.id } });
      deletedCount++;
    } else {
      processedSlugs.add(targetProductSlug);
      await prisma.product.update({
        where: { id: prod.id },
        data: { slug: targetProductSlug }
      });
      updatedProductsCount++;
    }
  }

  console.log(`✅ Deleted ${deletedCount} duplicate products to prevent conflicts.`);
  console.log(`✅ Updated ${updatedProductsCount} product slugs to match the new category structure.`);
  console.log('\n🎉 RESTRUCTURE COMPLETE!');
}

main()
  .catch((e) => {
    console.error('❌ Restructuring failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
