import { describe, it, expect } from 'vitest';
import { cld } from './cloudinary';

const BASE = 'https://res.cloudinary.com/da2dmtm9b/image/upload';

describe('cld', () => {
  it('inserts f_auto,q_auto after /image/upload/ before the version', () => {
    expect(cld(`${BASE}/v1783167906/mohit/inner-banner/products.png`)).toBe(
      `${BASE}/f_auto,q_auto/v1783167906/mohit/inner-banner/products.png`,
    );
  });

  it('is idempotent — an already-transformed URL is unchanged', () => {
    const already = `${BASE}/f_auto,q_auto/v1783167906/mohit/foo.png`;
    expect(cld(already)).toBe(already);
  });

  it('does not double-transform a URL carrying a different transform', () => {
    const url = `${BASE}/w_600/v1783167906/mohit/foo.png`;
    expect(cld(url)).toBe(url);
  });

  it('accepts a custom transform string', () => {
    expect(cld(`${BASE}/v1/mohit/foo.png`, 'w_600,f_auto,q_auto')).toBe(
      `${BASE}/w_600,f_auto,q_auto/v1/mohit/foo.png`,
    );
  });

  it('leaves non-Cloudinary URLs untouched', () => {
    expect(cld('/assets/images/logo/logo.png')).toBe('/assets/images/logo/logo.png');
    expect(cld('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  it('leaves a Cloudinary URL without a version segment untouched', () => {
    // no `/vNNN` after upload/ → nothing to anchor on, return as-is
    const url = 'https://res.cloudinary.com/da2dmtm9b/image/upload/mohit/foo.png';
    expect(cld(url)).toBe(url);
  });

  it('is a no-op for empty / falsy input', () => {
    expect(cld('')).toBe('');
    // @ts-expect-error runtime guard for undefined
    expect(cld(undefined)).toBe(undefined);
  });
});
