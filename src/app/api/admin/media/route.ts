import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;

    // Pre-validate Content-Length to protect memory uploader buffer limits (10MB max)
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const parsedLength = parseInt(contentLength, 10);
      if (!isNaN(parsedLength) && parsedLength > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: 'File size exceeds 10MB limit.' }, { status: 413 });
      }
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Limit to 10MB to prevent memory exhaustion and Cloudinary saturation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File size exceeds 10MB limit.' }, { status: 413 });
    }

    const ext = extname(file.name).toLowerCase();
    const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ success: false, message: 'File type not allowed.' }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mohit_media',
          resource_type: 'auto', // Auto detects image, video, raw files (PDFs, DOCs)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const storedName = uploadResult.public_id || file.name;

    // Save metadata in PostgreSQL database
    const newMedia = await prisma.media.create({
      data: {
        filename: file.name,
        storedName: storedName,
        url: fileUrl,
        mimeType: file.type || 'application/octet-stream',
        size: buffer.length,
        width: uploadResult.width || null,
        height: uploadResult.height || null,
        uploadedBy: userId,
      }
    });

    return NextResponse.json({ success: true, url: fileUrl, data: newMedia });
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all'; // all | image | pdf

    const where: any = {};
    if (search) where.filename = { contains: search, mode: 'insensitive' };
    if (type === 'image') where.mimeType = { startsWith: 'image/' };
    else if (type === 'pdf') where.mimeType = 'application/pdf';

    const [media, filteredTotal, allCount, imageCount, pdfCount] = await Promise.all([
      prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.media.count({ where }),
      prisma.media.count(),
      prisma.media.count({ where: { mimeType: { startsWith: 'image/' } } }),
      prisma.media.count({ where: { mimeType: 'application/pdf' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: media,
      pagination: { page, limit, total: filteredTotal, totalPages: Math.ceil(filteredTotal / limit) },
      counts: { total: allCount, images: imageCount, pdfs: pdfCount },
    });
  } catch (error) {
    console.error('[Admin Media GET]', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ success: false, message: 'Media ID is required' }, { status: 400 });
    }

    // Find the media record in DB first
    const mediaItem = await prisma.media.findUnique({
      where: { id }
    });

    if (!mediaItem) {
      return NextResponse.json({ success: false, message: 'Media not found' }, { status: 404 });
    }

    // In-use safeguard: block deleting a file that's referenced by structured
    // fields (product image/datasheet, blog cover, category image) unless the
    // caller explicitly forces it. Prevents silently breaking live images.
    if (!force) {
      const url = mediaItem.url;
      const [prodImg, prodDatasheet, blogCover, catImg] = await Promise.all([
        prisma.product.count({ where: { imageSrc: url } }),
        prisma.product.count({ where: { datasheetLink: url } }),
        prisma.blogPost.count({ where: { coverImage: url } }),
        prisma.category.count({ where: { image: url } }),
      ]);
      const products = prodImg + prodDatasheet;
      const usageTotal = products + blogCover + catImg;
      if (usageTotal > 0) {
        const parts: string[] = [];
        if (products) parts.push(`${products} product${products > 1 ? 's' : ''}`);
        if (blogCover) parts.push(`${blogCover} blog post${blogCover > 1 ? 's' : ''}`);
        if (catImg) parts.push(`${catImg} categor${catImg > 1 ? 'ies' : 'y'}`);
        return NextResponse.json(
          {
            success: false,
            inUse: true,
            message: `This file is used by ${parts.join(', ')}. Deleting it will break those images.`,
            usage: { products, blogPosts: blogCover, categories: catImg },
          },
          { status: 409 },
        );
      }
    }

    // Delete from Cloudinary
    try {
      let resourceType = 'image';
      if (mediaItem.mimeType.startsWith('image/')) {
        resourceType = 'image';
      } else if (mediaItem.mimeType.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw';
      }
      await cloudinary.uploader.destroy(mediaItem.storedName, { resource_type: resourceType });
    } catch (cloudinaryError) {
      // Log error but continue to delete from DB to prevent orphaned DB records
      console.error('[Admin Media DELETE] Cloudinary destruction error:', cloudinaryError);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[Admin Media DELETE] Unexpected error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

