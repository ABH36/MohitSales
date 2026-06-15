import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET, DELETE } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

vi.mock('@/lib/prisma', () => ({
  default: {
    media: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('cloudinary', () => {
  const mockUploadStream = vi.fn().mockImplementation((options, callback) => {
    // Return a mock stream object that calls the callback when end is called
    return {
      end: vi.fn().mockImplementation(() => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          public_id: 'sample',
          width: 800,
          height: 600,
        });
      }),
    };
  });

  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload_stream: mockUploadStream,
        destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
  };
});

describe('Admin Media API Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockFormData = (fields: Record<string, string | File>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    return formData;
  };

  describe('POST handler (upload file)', () => {
    it('should return 401 if user ID is missing', async () => {
      const file = new File(['mock content'], 'test.png', { type: 'image/png' });
      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'POST',
        body: createMockFormData({ file }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('Unauthorized');
    });

    it('should return 403 if user is a VIEWER', async () => {
      const file = new File(['mock content'], 'test.png', { type: 'image/png' });
      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'POST',
        body: createMockFormData({ file }),
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'VIEWER',
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('Insufficient permissions');
    });

    it('should return 413 if Content-Length header is too large', async () => {
      const file = new File(['mock content'], 'test.png', { type: 'image/png' });
      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'POST',
        body: createMockFormData({ file }),
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'ADMIN',
          'content-length': String(15 * 1024 * 1024), // 15MB
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('exceeds 10MB limit');
    });

    it('should return 415 if file type is not allowed', async () => {
      const file = new File(['mock content'], 'dangerous.exe', { type: 'application/x-msdownload' });
      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'POST',
        body: createMockFormData({ file }),
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'EDITOR',
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(415);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('type not allowed');
    });

    it('should successfully upload file to Cloudinary and create DB record', async () => {
      const file = new File(['mock content'], 'image.png', { type: 'image/png' });
      const mockMedia = {
        id: 'media_123',
        filename: 'image.png',
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      };
      vi.mocked(prisma.media.create).mockResolvedValue(mockMedia as any);

      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'POST',
        body: createMockFormData({ file }),
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'ADMIN',
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.url).toBe(mockMedia.url);
      expect(body.data).toEqual(mockMedia);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalled();
    });
  });

  describe('GET handler (list media)', () => {
    it('should return 401 if user ID is missing', async () => {
      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'GET',
      });

      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('should retrieve list of media from database', async () => {
      const mockList = [{ id: '1', filename: 'image.png' }];
      vi.mocked(prisma.media.findMany).mockResolvedValue(mockList as any);

      const req = new NextRequest('http://localhost/api/admin/media', {
        method: 'GET',
        headers: {
          'x-user-id': 'user_123',
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockList);
    });
  });

  describe('DELETE handler', () => {
    it('should return 403 if user is not authorized to delete', async () => {
      const req = new NextRequest('http://localhost/api/admin/media?id=media_123', {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'VIEWER',
        },
      });

      const res = await DELETE(req);
      expect(res.status).toBe(403);
    });

    it('should return 404 if media item does not exist in DB', async () => {
      vi.mocked(prisma.media.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/admin/media?id=non_existent', {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'ADMIN',
        },
      });

      const res = await DELETE(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('Media not found');
    });

    it('should call Cloudinary destroy and delete DB record', async () => {
      const mockItem = {
        id: 'media_123',
        storedName: 'mohit_media/sample',
        mimeType: 'image/png',
      };
      vi.mocked(prisma.media.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(prisma.media.delete).mockResolvedValue(mockItem as any);

      const req = new NextRequest('http://localhost/api/admin/media?id=media_123', {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user_123',
          'x-user-role': 'EDITOR',
        },
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(mockItem.storedName, { resource_type: 'image' });
      expect(prisma.media.delete).toHaveBeenCalledWith({ where: { id: mockItem.id } });
    });
  });
});
