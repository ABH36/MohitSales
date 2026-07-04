/**
 * Admin Products API — /api/admin/products
 * ==========================================
 * GET: List products with search and pagination
 * POST: Create a new product
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { productCreateSchema } from '@/lib/schemas/product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const statusFilter = searchParams.get('status') || 'all'; // 'all' | 'active' | 'inactive'
    const stockFilter = searchParams.get('stock') || '';       // '' | 'outofstock'

    const where: Prisma.ProductWhereInput = {};
    // Admin shows ALL products by default (no isActive filter unless explicitly requested)
    if (statusFilter === 'active') where.isActive = true;
    if (statusFilter === 'inactive') where.isActive = false;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (stockFilter === 'outofstock') {
      where.stock = 0;
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
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, productCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { slug, title, description, features, imageSrc, categoryId, datasheetLink, isActive, sortOrder, stock, metaTitle, metaDescription, metaKeywords } = parsed.data;

    // Check for duplicate slug in Products table
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A product with this slug already exists.' },
        { status: 409 }
      );
    }

    // Check for duplicate slug in Categories table
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'This slug is already used by a Category. Please choose a different slug to avoid routing conflicts.' },
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
        sortOrder: sortOrder ?? 0,
        stock: stock ?? 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
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
