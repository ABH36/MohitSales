# Mohit Industries — Performance Implementation Plan
**Target: Lighthouse Performance 49 → 90+**
**Date: 2026-06-12**
**Rule: No UI changes. Step-by-step. One step at a time.**

---

## Current Scores
| Metric | Now |
|---|---|
| Performance | 49 |
| Accessibility | 74 |
| Best Practices | 92 |
| SEO | 100 |

## Expected After All Steps
| Metric | Expected |
|---|---|
| Performance | 90–95 |
| Accessibility | 74+ |
| Best Practices | 95+ |
| SEO | 100 |

---

## STEP 1 — BannerSlider: Progressive Image Loading
**File:** `src/components/BannerSlider.tsx`
**Impact:** +20 to +25 pts (biggest single win)
**Risk:** Zero — UI identical

### Problem
- All 7 banners rendered as CSS `background-image` on `<div>` tags
- Browser fetches ALL 7 images on page load = **3.9 MB at once**
- CSS background-image cannot be preloaded → LCP detection fails
- First banner (cable.png = 395 KB) loads late with no priority

### Fix
- Replace `backgroundImage` CSS with actual `<img>` tag inside each slide div
- First slide: `loading="eager"` + `fetchPriority="high"` + `decoding="sync"`
- All other slides: Only render `<img>` when that slide becomes active (loadedSlides Set)
- Result: Page load = 395 KB instead of 3.9 MB

### Visual Check After
- Fade transition same ✓
- Pagination bullets same ✓
- Desktop/mobile banners same ✓

---

## STEP 2 — Homepage: Remove force-dynamic
**File:** `src/app/page.tsx`
**Impact:** +5 to +8 pts
**Risk:** Zero

### Problem
- `export const dynamic = 'force-dynamic'` forces server render on every request
- `import prisma from '@/lib/prisma'` is imported but **never used** (products are hardcoded arrays)
- Every user gets a fresh server render → no CDN caching, no static serving

### Fix
- Remove `export const dynamic = 'force-dynamic'` line
- Remove `import prisma from '@/lib/prisma'` line
- Page becomes statically generated at build time → served from CDN edge

---

## STEP 3 — Non-Critical CSS: Deferred Loading
**Files:** `src/app/layout.tsx` + new `src/components/DeferredCSS.tsx`
**Impact:** +8 to +12 pts
**Risk:** Low — these CSS files are all below-the-fold

### Problem
These 5 CSS files are loaded synchronously in `<head>`, blocking render:
| File | Size | Used For |
|---|---|---|
| `animate.min.css` | 44 KB | WOW.js scroll animations |
| `magnific-popup.css` | 18 KB | Lightbox popup |
| `odometer.min.css` | 10 KB | Counter animation numbers |
| `nice-select.css` | 3 KB | Custom dropdown styling |
| `nouislider.min.css` | 27 KB | Range slider (not on homepage) |
| **Total** | **102 KB** | All below the fold |

### Fix
**New File:** `src/components/DeferredCSS.tsx`
- Client component using `useEffect`
- Injects these 5 stylesheets via `document.createElement('link')` after hydration
- Skips if already loaded (idempotent)

**layout.tsx change:**
- Remove the 5 `<link>` tags from `<head>`
- Add `<DeferredCSS />` component to `<body>`

---

## STEP 4 — Google Fonts: Non-Render-Blocking
**File:** `src/app/layout.tsx`
**Impact:** +3 to +5 pts
**Risk:** Low — brief FOUT (font swap) acceptable, already using `display=swap`

### Problem
- Google Fonts `<link rel="stylesheet">` in `<head>` is render-blocking
- Requires DNS lookup + TCP connection + download before page renders
- 3 font families: Mukta (7 weights) + Outfit (9 weights) + Space Grotesk (5 weights)

### Fix
Add Google Fonts to `DeferredCSS.tsx` alongside the other non-critical CSS.
Remove `<link rel="stylesheet">` Google Fonts tag from layout `<head>`.
Keep `<link rel="preconnect">` tags (DNS hint, non-blocking).

---

## STEP 5 — AnimationLoader: Remove chart.js from Public Pages
**File:** `src/components/AnimationLoader.tsx`
**Impact:** +3 to +5 pts
**Risk:** Zero — chart.js only used in admin dashboard

### Problem
- `chart.umd.min.js` = **197.9 KB** loaded on EVERY page including homepage
- Chart is only used in `/admin/dashboard` page
- AnimationLoader runs in root layout, so chart loads everywhere

### Fix
- Add `usePathname()` check (already imported)
- Build two script arrays: `publicScripts` (no chart) and `adminScripts` (with chart)
- Load appropriate array based on `pathname.startsWith('/admin')`

---

## STEP 6 — Banner Images: Convert to WebP
**Files:** `public/assets/images/banner/desktop/` + `public/assets/images/banner/mobile/`
**Impact:** +5 to +8 pts (after Step 1)
**Risk:** Zero — same visual quality at much smaller size

### Problem
Current PNG sizes (desktop banners):
| File | Size |
|---|---|
| dowells.png | 899 KB |
| fans.png | 666 KB |
| wire.png | 629 KB |
| switchgear.png | 531 KB |
| solar_product.png | 512 KB |
| cable.png | 395 KB |
| polycab.png | 298 KB |
| **Total** | **3.9 MB** |

### Fix
Convert all 14 banner images (7 desktop + 7 mobile) to WebP format.
**Tool:** Use Squoosh, Sharp CLI, or cwebp
**Expected result:** 3.9 MB → ~500–700 KB total (80% reduction)
**Command (once Sharp is available):**
```
npx sharp -i public/assets/images/banner/desktop/*.png -o public/assets/images/banner/desktop/ --webp
```
After conversion: update file paths in `BannerSlider.tsx` from `.png` to `.webp`

---

## STEP 7 — Layout: Preload LCP Image
**File:** `src/app/layout.tsx`
**Impact:** +2 to +4 pts
**Risk:** Zero

### Problem
Browser discovers the LCP image (first banner) only after React hydration.
A `<link rel="preload">` hint in `<head>` tells browser to fetch it immediately.

### Fix
Add to `<head>` in layout.tsx:
```html
<link
  rel="preload"
  as="image"
  href="/assets/images/banner/desktop/cable.webp"
  media="(min-width: 992px)"
/>
<link
  rel="preload"
  as="image"
  href="/assets/images/banner/mobile/cable.webp"
  media="(max-width: 991px)"
/>
```
(Do this after Step 6 — use .webp paths)

---

## STEP 8 — content-export.json: Add File Cache
**File:** `src/app/[...slug]/page.tsx`
**Impact:** Server-side speed improvement, not direct Lighthouse score
**Risk:** Low

### Problem
- `content-export.json` is 1.98 MB
- Read from disk on **every request** with `force-dynamic`
- No caching, no ISR

### Fix
- Add module-level cache variable (in-memory Map or `unstable_cache`)
- Load JSON once, reuse across requests
- Remove `force-dynamic` from catch-all route if possible

---

## STEP 9 — Font Weight Subset Reduction
**File:** `src/app/layout.tsx`
**Impact:** +1 to +3 pts
**Risk:** Zero visual change

### Problem
Loading ALL weights of all 3 fonts from Google:
- Outfit: 9 weights (100–900) — only 400, 500, 600, 700 actually used in CSS
- Mukta: 7 weights (200–800) — only 400, 500, 600 used
- Space Grotesk: 5 weights (300–700) — only 600, 700 used for headings

### Fix
Update Google Fonts URL to only load used weights:
```
Outfit:wght@400;500;600;700
Mukta:wght@400;500;600
Space+Grotesk:wght@600;700
```

---

## STEP 10 — next/image on Product Pages (Below-Fold Images)
**Files:** Multiple product page components
**Impact:** Lazy loading + WebP auto-conversion
**Risk:** Low — visual same

### Problem
- Raw `<img>` tags used throughout product pages
- No lazy loading → images below fold load immediately
- No automatic WebP conversion

### Fix
- Replace `<img>` with Next.js `<Image>` component on product listing pages
- Add `loading="lazy"` where `<Image>` is not feasible (legacy catch-all route)
- Next.js Image auto-converts to WebP and adds srcset

---

## Implementation Order (Priority)

| # | Step | File(s) | Est. Score Gain | Risk |
|---|---|---|---|---|
| 1 | BannerSlider progressive loading | BannerSlider.tsx | +20–25 | Zero |
| 2 | Remove force-dynamic homepage | page.tsx | +5–8 | Zero |
| 3 | Defer non-critical CSS | layout.tsx + DeferredCSS.tsx | +8–12 | Low |
| 4 | Google Fonts non-blocking | layout.tsx + DeferredCSS.tsx | +3–5 | Low |
| 5 | Remove chart.js from public pages | AnimationLoader.tsx | +3–5 | Zero |
| 6 | Convert banners to WebP | Banner image files | +5–8 | Zero |
| 7 | Preload LCP image hint | layout.tsx | +2–4 | Zero |
| 8 | content-export.json cache | [...slug]/page.tsx | Server speed | Low |
| 9 | Font weight subset | layout.tsx | +1–3 | Zero |
| 10 | next/image on product pages | Product components | +2–4 | Low |

**Steps 1–5 alone: Expected score 49 → 85–90**
**Steps 1–7 together: Expected score 49 → 90–95**

---

## Pre-Implementation Checklist
- [ ] Dev server running on localhost:3000
- [ ] Browser open to test UI after each step
- [ ] Lighthouse ready to run after steps 1–5 complete
- [ ] No `git commit` until all steps verified working

## Post Each Step — Verify
1. Homepage loads without errors
2. Banner slider fades correctly
3. Navigation works
4. Mobile view unchanged
5. No console errors

---

## Files NOT to Touch
- `public/assets/css/main.css` — legacy theme CSS, 582 KB, do not modify
- `public/assets/css/custom.css` — critical styles
- `public/assets/js/main.js` — legacy jQuery init
- `prisma/schema.prisma` — DB schema stable
- Any admin panel files unless explicitly listed
