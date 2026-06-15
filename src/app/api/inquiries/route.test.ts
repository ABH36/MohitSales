import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMail } from '../../../lib/mailer';
import * as captcha from '@/lib/captcha';

vi.mock('@/lib/prisma', () => ({
  default: {
    inquiry: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../../lib/mailer', () => ({
  sendMail: vi.fn(),
  emailConfig: {
    from: vi.fn().mockReturnValue('from@example.com'),
    toInquiry: 'to@example.com',
    bcc: 'bcc@example.com',
  },
}));

vi.mock('@/lib/captcha', () => ({
  decryptCaptcha: vi.fn(),
  isTokenUsed: vi.fn(),
  markTokenUsed: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
  inquiryRateLimiter: {
    limit: vi.fn().mockReturnValue(false),
  },
}));

describe('Inquiries API POST handler', () => {
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

  it('should return 400 if captcha input or token is missing', async () => {
    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Captcha is required');
  });

  it('should return 400 if captcha token has already been used (replay prevention)', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(true);

    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'valid-token:sig',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('already been used');
  });

  it('should return 400 if captcha decrypts to null (invalid token)', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue(null);

    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'invalid-token:sig',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid captcha token');
  });

  it('should return 400 if captcha token is expired', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now() - 11 * 60 * 1000, // 11 minutes ago (expired)
    });

    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'expired-token:sig',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('expired');
  });

  it('should return 400 if captcha input is incorrect', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now(),
    });

    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '5555', // incorrect
      captchaToken: 'valid-token:sig',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Incorrect captcha code');
  });

  it('should reject attachment file if type is not allowed', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now(),
    });

    const badFile = new File(['mock content'], 'test.html', { type: 'text/html' });
    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'valid-token:sig',
      file: badFile,
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('file type not allowed');
  });

  it('should reject attachment file if extension does not match MIME type (content spoofing)', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now(),
    });

    // An HTML file renamed to JPG
    const spoofedFile = new File(['mock content'], 'test.jpg', { type: 'text/html' });
    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'valid-token:sig',
      file: spoofedFile,
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('content type mismatch');
  });

  it('should successfully submit form, write to database, and trigger email send', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now(),
    });
    vi.mocked(prisma.inquiry.create).mockResolvedValue({ id: 'inq_123' } as any);

    const goodFile = new File(['mock content'], 'image.png', { type: 'image/png' });
    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'valid-token:sig',
      file: goodFile,
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('submitted successfully');

    expect(captcha.markTokenUsed).toHaveBeenCalledWith('sig');
    expect(prisma.inquiry.create).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalled();
  });

  it('should return 500 and not send email if database write fails', async () => {
    vi.mocked(captcha.isTokenUsed).mockReturnValue(false);
    vi.mocked(captcha.decryptCaptcha).mockReturnValue({
      code: '1234',
      timestamp: Date.now(),
    });
    vi.mocked(prisma.inquiry.create).mockRejectedValue(new Error('Database connection failed'));

    const formData = createMockFormData({
      name: 'John Doe',
      cname: 'Mohit Industries',
      email: 'john@example.com',
      mobile: '9876543210',
      message: 'Hello!',
      captchaInput: '1234',
      captchaToken: 'valid-token:sig',
    });

    const req = new NextRequest('http://localhost/api/inquiries', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Failed to record enquiry');

    expect(sendMail).not.toHaveBeenCalled();
  });
});
