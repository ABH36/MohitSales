/**
 * Admin Analytics API — /api/admin/analytics
 * ==========================================
 * GET: Aggregates real-time statistics across all tables (Products, Inquiries, Blog, Media).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (!userRole) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') 
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    // 1. Overview Totals
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalBlogs,
      totalBlogViewsAggregate,
      totalInquiries,
      totalMediaCount,
      totalMediaSizeAggregate,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.blogPost.count(),
      prisma.blogPost.aggregate({ _sum: { viewCount: true } }),
      prisma.inquiry.count(),
      prisma.media.count(),
      prisma.media.aggregate({ _sum: { size: true } }),
    ]);

    const totalBlogViews = totalBlogViewsAggregate._sum.viewCount || 0;
    const totalMediaSize = totalMediaSizeAggregate._sum.size || 0; // in bytes

    // 2. Out-of-stock and Low-stock alerts
    const outOfStockCount = await prisma.product.count({ where: { stock: 0 } });
    const lowStockCount = await prisma.product.count({
      where: {
        stock: {
          gt: 0,
          lt: 10,
        },
      },
    });

    const lowStockProductsList = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
          lt: 10,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        stock: true,
      },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    // 3. Category distribution (Products per Category)
    const categoriesProductCount = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const categoriesDistribution = categoriesProductCount.map(c => ({
      name: c.name,
      count: c._count.products,
    }));

    // 4. Inquiries Status Segmentation
    const inquiryStatusGroup = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: true,
    });

    const inquiryStatus = {
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
    inquiryStatusGroup.forEach(g => {
      const s = g.status.toLowerCase() as keyof typeof inquiryStatus;
      if (s in inquiryStatus) {
        inquiryStatus[s] = g._count;
      }
    });

    // 5. Inquiries Source & Locale
    const inquirySourceGroup = await prisma.inquiry.groupBy({
      by: ['source'],
      _count: true,
    });
    const inquirySources = inquirySourceGroup.map(g => ({
      source: g.source,
      count: g._count,
    }));

    const inquiryLocaleGroup = await prisma.inquiry.groupBy({
      by: ['locale'],
      _count: true,
    });
    const inquiryLocales = inquiryLocaleGroup.map(g => ({
      locale: g.locale,
      count: g._count,
    }));

    // 6. Inquiries last 30 days trend (grouped in JS for consistency)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Reset time to start of day
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const inquiries = await prisma.inquiry.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Create a continuous list of the last 30 days
    const trendMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      trendMap.set(key, 0);
    }

    inquiries.forEach(inq => {
      const key = new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) || 0) + 1);
      }
    });

    const inquiryTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // 7. Blog: Top Read Articles
    const topBlogsList = await prisma.blogPost.findMany({
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        isPublished: true,
        category: {
          select: { name: true },
        },
      },
    });

    const topBlogs = topBlogsList.map(b => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      views: b.viewCount,
      isPublished: b.isPublished,
      category: b.category?.name || 'Uncategorized',
    }));

    // 8. Media MIME Groups & Heaviest files
    const mediaMimeGroup = await prisma.media.groupBy({
      by: ['mimeType'],
      _count: true,
      _sum: { size: true },
    });

    const mediaMimeTypes = mediaMimeGroup.map(g => ({
      type: g.mimeType,
      count: g._count,
      size: g._sum.size || 0,
    }));

    const heaviestMedia = await prisma.media.findMany({
      orderBy: { size: 'desc' },
      take: 5,
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        size: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          products: { total: totalProducts, active: activeProducts },
          categories: { total: totalCategories },
          blogs: { total: totalBlogs, views: totalBlogViews },
          inquiries: { total: totalInquiries, status: inquiryStatus },
          media: { total: totalMediaCount, size: totalMediaSize },
        },
        inventory: {
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          alerts: lowStockProductsList,
        },
        categoriesDistribution,
        inquiryTrend,
        inquirySources,
        inquiryLocales,
        topBlogs,
        mediaTypes: mediaMimeTypes,
        heaviestMedia,
      },
    });

  } catch (error: any) {
    console.error('[Admin Analytics GET]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
