/**
 * Cloudinary URL helper — inserts on-the-fly delivery transformations so the CDN
 * serves modern formats (AVIF/WebP via `f_auto`) at an automatically-tuned
 * quality (`q_auto`) instead of the original PNG/JPG. This typically cuts image
 * bytes 40–70% with no visual change and no re-upload.
 *
 * The stored URLs look like:
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/mohit/foo.png
 * and become:
 *   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v123/mohit/foo.png
 *
 * Idempotent: if the URL already carries a transformation segment (or isn't a
 * Cloudinary upload URL) it is returned unchanged.
 */
const UPLOAD = '/image/upload/';

export function cld(url: string, transforms = 'f_auto,q_auto'): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const i = url.indexOf(UPLOAD);
  if (i === -1) return url;
  const rest = url.slice(i + UPLOAD.length);
  // A transformation segment starts with `<param>_` (e.g. f_auto, w_600);
  // a bare version starts with `v<digits>` (e.g. v1783…). Only inject when the
  // next segment is a version — i.e. nothing has been transformed yet.
  if (!/^v\d/.test(rest)) return url;
  return url.slice(0, i + UPLOAD.length) + transforms + '/' + rest;
}
