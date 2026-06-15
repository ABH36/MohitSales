#!/usr/bin/env node
/**
 * scripts/rebuild-category-tree.js
 *
 * Rebuilds the Category hierarchy from content-export.json breadcrumbs.
 *
 * What it does:
 *  1. Parses every entry's breadcrumbs:
 *       ["Home", "Brand", "Category", "Sub-category", "Product Name"]
 *     → intermediate nodes (all except "Home" and last leaf) become categories
 *     → leaf category is the one the product belongs to
 *
 *  2. Builds full hierarchical slugs:
 *       polycab
 *       polycab/fans
 *       polycab/fans/ceiling-fans
 *
 *  3. Upserts categories parent-first (sorted by depth), setting correct parentId.
 *
 *  4. Maps each product (by its path-slug) to its leaf category.
 *
 *  5. Removes orphaned categories that have no products and no children
 *     and are NOT part of the new tree.
 *
 * Usage:
 *   node scripts/rebuild-category-tree.js
 *
 * Dry-run (no DB writes):
 *   DRY_RUN=1 node scripts/rebuild-category-tree.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1';

if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes will happen\n');

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Returns a map of slug → { name, parentSlug, depth } for every
 * intermediate node found in the breadcrumb chains.
 *
 * Breadcrumb structure:
 *   [0] "Home"              ← always skip
 *   [1] Brand               ← depth 0 (top-level category)
 *   [2] Category            ← depth 1
 *   [3] Sub-category        ← depth 2   (optional)
 *   [4] Sub-sub-category    ← depth 3   (rare)
 *   [-1] Product name       ← always skip (leaf = product, not category)
 */
function buildCategoryNodes(entries) {
  const nodeMap = new Map(); // slug → { name, parentSlug, depth }

  for (const entry of entries) {
    if (!Array.isArray(entry.breadcrumbs) || entry.breadcrumbs.length < 3) continue;

    // Intermediate nodes = everything between "Home" (index 0) and last item (product name)
    const catCrumbs = entry.breadcrumbs.slice(1, -1);
    if (catCrumbs.length === 0) continue;

    let parentSlug = null;
    for (let depth = 0; depth < catCrumbs.length; depth++) {
      const name = catCrumbs[depth].trim();
      if (!name) continue;

      const slugPart = slugify(name);
      const fullSlug = parentSlug ? `${parentSlug}/${slugPart}` : slugPart;

      if (!nodeMap.has(fullSlug)) {
        nodeMap.set(fullSlug, { name, parentSlug, depth });
      }
      parentSlug = fullSlug;
    }
  }

  return nodeMap;
}

/**
 * Returns the leaf category slug for a given entry (the category the product belongs to).
 * That is all breadcrumb levels except "Home" and the last (product) name, joined as a slug path.
 */
function leafCategorySlug(entry) {
  if (!Array.isArray(entry.breadcrumbs) || entry.breadcrumbs.length < 3) return null;
  const catCrumbs = entry.breadcrumbs.slice(1, -1);
  if (catCrumbs.length === 0) return null;

  return catCrumbs
    .map(c => slugify(c.trim()))
    .filter(Boolean)
    .join('/');
}

/**
 * Returns the product slug derived from the entry path (strip .php extension).
 */
function productSlug(entry) {
  if (!entry.path) return null;
  return entry.path.replace(/\.php$/i, '').trim();
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const exportPath = path.join(__dirname, '..', 'content-export.json');
  if (!fs.existsSync(exportPath)) {
    console.error('❌ content-export.json not found at', exportPath);
    process.exit(1);
  }

  const entries = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  console.log(`📦 Loaded ${entries.length} entries from content-export.json\n`);

  // ── Step 1: Collect all unique category nodes ──────────────────────────
  const nodeMap = buildCategoryNodes(entries);
  console.log(`🌳 Found ${nodeMap.size} unique category nodes across all breadcrumb chains`);

  // Sort parent-first (ascending depth) so upserts never reference a missing parentId
  const sortedNodes = Array.from(nodeMap.entries()).sort((a, b) => a[1].depth - b[1].depth);

  // ── Step 2: Upsert categories ──────────────────────────────────────────
  console.log('\n📝 Upserting categories...');
  const slugToId = new Map(); // slug → DB id

  // Pre-load existing categories so we can resolve parent IDs without extra queries
  const existingCats = await prisma.category.findMany({ select: { id: true, slug: true, parentId: true } });
  for (const c of existingCats) slugToId.set(c.slug, c.id);

  let created = 0, updated = 0, skipped = 0;

  for (const [slug, node] of sortedNodes) {
    const parentId = node.parentSlug ? (slugToId.get(node.parentSlug) ?? null) : null;

    if (DRY_RUN) {
      console.log(`  [DRY] ${slug}  (parent: ${node.parentSlug ?? 'none'})`);
      skipped++;
      continue;
    }

    const existing = await prisma.category.findUnique({ where: { slug } });

    if (existing) {
      // Only update parentId/name if they drifted (avoids touching user-edited data)
      if (existing.parentId !== parentId) {
        await prisma.category.update({ where: { slug }, data: { parentId, name: node.name } });
        updated++;
      } else {
        skipped++;
      }
      slugToId.set(slug, existing.id);
    } else {
      const created_cat = await prisma.category.create({
        data: { slug, name: node.name, parentId, isActive: true },
      });
      slugToId.set(slug, created_cat.id);
      created++;
    }

    process.stdout.write(created % 50 === 0 && created > 0 ? '\n  ' : '.');
  }

  console.log(`\n✅ Categories — created: ${created}, updated: ${updated}, unchanged: ${skipped}`);

  // ── Step 3: Map products to their leaf categories ──────────────────────
  console.log('\n🔗 Mapping products to categories...');

  let mapped = 0, notInDb = 0, noLeaf = 0;

  for (const entry of entries) {
    const pSlug = productSlug(entry);
    const lSlug = leafCategorySlug(entry);

    if (!pSlug) continue;
    if (!lSlug) { noLeaf++; continue; }

    const categoryId = slugToId.get(lSlug);
    if (!categoryId) { noLeaf++; continue; }

    if (DRY_RUN) {
      process.stdout.write('.');
      mapped++;
      continue;
    }

    const result = await prisma.product.updateMany({
      where: { slug: pSlug },
      data: { categoryId },
    });

    if (result.count > 0) mapped++;
    else notInDb++;
  }

  console.log(`\n✅ Products — mapped: ${mapped}, path not in DB: ${notInDb}, no leaf found: ${noLeaf}`);

  // ── Step 4: Remove orphaned flat categories ────────────────────────────
  console.log('\n🧹 Scanning for orphaned categories...');

  const newSlugs = new Set(nodeMap.keys());

  const orphanCandidates = await prisma.category.findMany({
    where: { slug: { notIn: Array.from(newSlugs) } },
    include: { _count: { select: { products: true, children: true } } },
  });

  let deleted = 0;
  for (const cat of orphanCandidates) {
    if (cat._count.products === 0 && cat._count.children === 0) {
      if (!DRY_RUN) await prisma.category.delete({ where: { id: cat.id } });
      console.log(`  🗑️  ${cat.slug}`);
      deleted++;
    }
  }

  console.log(`✅ Orphaned categories removed: ${deleted}`);
  console.log('\n🎉 Category tree rebuild complete!');
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
