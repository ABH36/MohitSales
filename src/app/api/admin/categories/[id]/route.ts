/**
 * Admin Category By ID — /api/admin/categories/[id]
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

// Recursively collects all descendant categories (children, grandchildren, …)
async function getDescendants(categoryId: string, depth = 0): Promise<{ id: string; slug: string }[]> {
  if (depth > 10) return [];
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true, slug: true },
  });

  const result: { id: string; slug: string }[] = [...children];
  for (const child of children) {
    const grandchildren = await getDescendants(child.id, depth + 1);
    result.push(...grandchildren);
  }
  return result;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();

    // Resolve current category before update (needed to detect slug change)
    const current = await prisma.category.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }

    const newSlug: string | undefined = body.slug && body.slug !== current.slug ? body.slug : undefined;

    const parentId = body.parentId;
    if (parentId !== undefined && parentId !== '' && parentId !== 'new' && parentId !== null) {
      if (parentId === params.id) {
        return NextResponse.json({ success: false, message: 'A category cannot be its own parent.' }, { status: 400 });
      }
      const descendants = await getDescendants(params.id);
      const descendantIds = descendants.map(d => d.id);
      if (descendantIds.includes(parentId)) {
        return NextResponse.json({ success: false, message: 'A category cannot be nested under one of its own subcategories.' }, { status: 400 });
      }
    }

    // Update the category itself
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(newSlug && { slug: newSlug }),
        ...(body.name && { name: body.name }),
        description: body.description !== undefined ? body.description : undefined,
        image: body.image !== undefined ? body.image : undefined,
        parentId: body.parentId !== undefined
          ? (body.parentId === '' || body.parentId === 'new' ? null : body.parentId)
          : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : undefined,
      },
    });

    // ── Cascade slug rename to descendants + their products ─────────────────
    if (newSlug) {
      const oldPrefix = current.slug;
      const descendants = await getDescendants(params.id);

      // Helper: update every product of a given category whose slug starts
      // with oldCatSlug, replacing that prefix with newCatSlug.
      const updateProductSlugs = async (categoryId: string, oldCatSlug: string, newCatSlug: string) => {
        const products = await prisma.product.findMany({
          where: { categoryId },
          select: { id: true, slug: true },
        });
        for (const product of products) {
          if (!product.slug) continue;
          if (product.slug === oldCatSlug || product.slug.startsWith(`${oldCatSlug}/`)) {
            await prisma.product.update({
              where: { id: product.id },
              data: { slug: newCatSlug + product.slug.slice(oldCatSlug.length) },
            });
          }
        }
      };

      // Update products directly under the primary category
      await updateProductSlugs(params.id, oldPrefix, newSlug);

      // Update each descendant category's slug and its products
      for (const desc of descendants) {
        if (desc.slug.startsWith(`${oldPrefix}/`)) {
          const updatedDescSlug = newSlug + desc.slug.slice(oldPrefix.length);
          await prisma.category.update({
            where: { id: desc.id },
            data: { slug: updatedDescSlug },
          });
          await updateProductSlugs(desc.id, desc.slug, updatedDescSlug);
        }
      }
    }

    // Revalidate the category page cache so changes appear instantly
    revalidatePath(`/${category.slug}`);
    if (newSlug) {
      revalidatePath(`/${current.slug}`); // also revalidate old slug path
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error('[Admin Category PUT]', error);
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ success: false, message: 'That slug is already taken.' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const category = await prisma.category.findUnique({ where: { id: params.id }, select: { slug: true } });

    // Atomically unlink products and child categories, then delete
    await prisma.$transaction([
      prisma.product.updateMany({ where: { categoryId: params.id }, data: { categoryId: null } }),
      prisma.category.updateMany({ where: { parentId: params.id }, data: { parentId: null } }),
      prisma.category.delete({ where: { id: params.id } }),
    ]);

    // Revalidate the deleted category's page cache
    if (category?.slug) {
      revalidatePath(`/${category.slug}`);
    }

    return NextResponse.json({ success: true, message: 'Category deleted.' });
  } catch (error: any) {
    console.error('[Admin Category DELETE]', error);
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
