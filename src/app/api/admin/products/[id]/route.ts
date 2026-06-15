/**
 * Admin Product By ID — /api/admin/products/[id]
 * ================================================
 * PUT: Update a product
 * DELETE: Delete a product
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, description, features, imageSrc, categoryId, datasheetLink, isActive, sortOrder } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        description: description !== undefined ? description : undefined,
        features: features !== undefined ? features : undefined,
        imageSrc: imageSrc !== undefined ? imageSrc : undefined,
        categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
        datasheetLink: datasheetLink !== undefined ? datasheetLink : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        stock: body.stock !== undefined ? body.stock : undefined,
      },
    });

    // Revalidate the product page cache so changes appear instantly
    if (product.slug) {
      revalidatePath(`/${product.slug}`);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('[Admin Product PUT]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const product = await prisma.product.findUnique({ where: { id: params.id }, select: { slug: true } });
    await prisma.product.delete({ where: { id: params.id } });

    // Revalidate the deleted product's page cache
    if (product?.slug) {
      revalidatePath(`/${product.slug}`);
    }

    return NextResponse.json({ success: true, message: 'Product deleted.' });
  } catch (error: any) {
    console.error('[Admin Product DELETE]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
