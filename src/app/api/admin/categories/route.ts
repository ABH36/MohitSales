/**
 * Admin Categories API — /api/admin/categories
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

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
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, name, description, image, parentId, sortOrder } = body;

    if (!slug || !name) {
      return NextResponse.json({ success: false, message: 'Slug and name are required.' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Categories POST]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
