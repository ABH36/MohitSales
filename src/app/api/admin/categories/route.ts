/**
 * Admin Categories API — /api/admin/categories
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { categoryCreateSchema } from '@/lib/schemas/category';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: true } },
            children: {
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: { select: { products: true } },
                children: {
                  orderBy: { sortOrder: 'asc' },
                  include: { _count: { select: { products: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('[Admin Categories GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, categoryCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const body = parsed.data;
    const { slug, name, description, image, parentId, sortOrder } = body;

    // Check duplicate slug in Categories table
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Category slug already exists.' }, { status: 409 });
    }

    // Check duplicate slug in Products table
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return NextResponse.json({ success: false, message: 'This slug is already used by a Product. Please choose a different slug to avoid routing conflicts.' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        slug,
        name,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
    });

    // Make the new category live immediately: its own page, its parent's listing,
    // and the nav (rendered from the layout).
    revalidatePath(`/${category.slug}`);
    if (category.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: category.parentId },
        select: { slug: true },
      });
      if (parent?.slug) revalidatePath(`/${parent.slug}`);
    }
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Categories POST]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
