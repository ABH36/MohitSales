import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Create a map to hold categories by ID
    const map = new Map<string, any>();
    categories.forEach(cat => {
      map.set(cat.id, {
        id: cat.id,
        slug: cat.slug,
        name: cat.name.trim(),
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        image: cat.image,
        description: cat.description,
        children: [],
      });
    });

    const tree: any[] = [];

    // Construct the parent-child tree
    categories.forEach(cat => {
      const node = map.get(cat.id);
      if (cat.parentId) {
        const parentNode = map.get(cat.parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // If parent is not active/found, treat as top-level fallback
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return NextResponse.json(
      { success: true, data: tree },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching navigation tree:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

