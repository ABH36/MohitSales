/**
 * Admin Products API — /api/admin/products
 * ==========================================
 * GET: List products with search and pagination
 * POST: Create a new product
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('[Admin Products GET]', error);
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
    const { slug, title, description, features, imageSrc, categoryId, datasheetLink, isActive, sortOrder, stock } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { success: false, message: 'Slug and title are required.' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A product with this slug already exists.' },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        slug,
        title,
        description,
        features,
        imageSrc,
        categoryId: categoryId || null,
        datasheetLink,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
        stock: stock || 0,
      },
    });

    // Instantly clear ISR cache so new product is live immediately
    revalidatePath(`/${product.slug}`);
    
    if (product.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: product.categoryId },
        select: { slug: true }
      });
      if (category && category.slug) {
        revalidatePath(`/${category.slug}`);
      }
    }

    revalidatePath('/', 'layout'); // also clear homepage/nav cache

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Products POST]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
