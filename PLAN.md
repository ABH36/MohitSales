# MOHIT INDUSTRIES — Full Wiring Plan
## Admin Panel ↔ Frontend Integration + Tailwind CSS Migration
### Version: 1.0 | Date: 2026-06-10 | Status: Pending Approval

---

## SECTION 1: CURRENT ARCHITECTURE

### Frontend Rendering Priority Order (`src/app/[...slug]/page.tsx`)

```
Request aata hai (e.g. /fans/ceiling-fans/celebration-series)
        ↓
[Priority 1] DB mein hai + image/edit? → renderDbProduct()
        ↓ nahi mila
[Priority 2] Legacy PHP file exist karta hai? → dangerouslySetInnerHTML
        ↓ nahi mila
[Priority 3] content-export.json entry hai? → renderProductLayout()
        ↓ nahi mila
[Priority 4] DB mein koi bhi product? → renderDbProduct()
        ↓ nahi mila
[Priority 5] DB mein category? → renderDbCategory()
        ↓ nahi mila
[Priority 6] 404 Page
```

### Legacy PHP File Structure (currently live)

```
legacy_content/
  fans/
    ceiling-fans/              (sub-category)
      celebration-series.php
      design-series.php
    exhaust-fans/              (sub-category)
      industrial-fans.php
  home-appliances/
    irons/
    water-heaters/
  polycab/                     (category — 3 product files)
  industries/
    cables-by-application/     (49 items)
    cables-by-standards/       (122 items)
    cables-by-type/            (14 items)
  cable-terminal/
  conduit-accessories/
  gland/
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.3 App Router |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jose library), cookie: `admin_token` |
| CSS | Tailwind 3.4 (preflight: false) + Bootstrap 5 hybrid |
| Legacy | 2,217 PHP files served via dangerouslySetInnerHTML |

### DB Current State

| Data | Count |
|---|---|
| Total Products in DB | 4,442 |
| Products with Image (admin-added) | 162 |
| Categories in DB | 159 (all flat, no nesting) |
| Legacy PHP files | 2,217 |
| content-export.json entries | 2,170 |

### Admin Panel

- URL: `http://localhost:3001/admin/login`
- Email: `admin@mohitscpl.com`
- Password: `Admin@2024!`

---

## SECTION 2: CURRENT BUGS (Must Fix Before Anything Else)

### Bug 1 — Edit karo to description/features delete ho jaata hai (DATA LOSS)
- **File**: `src/app/admin/products/page.tsx` line 71–73
- **Problem**: `handleOpenEdit` mein description/features/datasheetLink hardcoded `''`
- **Effect**: Product edit → save → in teen fields ka data blank ho jaata hai DB mein
- **Fix**: 3 lines — existing values load karo form mein

### Bug 2 — Features + Datasheet Link form mein hain hi nahi
- **File**: `src/app/admin/products/page.tsx` line ~291
- **Problem**: DB mein `features` aur `datasheetLink` columns hain, form mein nahi
- **Effect**: In dono fields ko admin se fill nahi kar sakta
- **Fix**: 2 new form fields add karna

### Bug 3 — Stock kabhi save nahi hota
- **File**: `src/app/api/admin/products/route.ts` line 85 (POST) + `[id]/route.ts` line 29 (PUT)
- **Problem**: `stock:` line dono jagah commented out hai
- **Effect**: Stock form mein dikhti hai par DB mein hamesha 0 rehta hai
- **Fix**: 2 lines uncomment

### Bug 4 — PUT route: empty string se description overwrite hoti hai
- **File**: `src/app/api/admin/products/[id]/route.ts` line 22
- **Problem**: `description ?? undefined` — `??` sirf null/undefined check karta hai, `""` nahi
- **Effect**: Bug 1 ke wajah se `""` send hota hai, ye ise DB mein save kar leta hai
- **Fix**: 1 line — proper empty string handle karo

### Bug 5 — Category hierarchy nahi hai (flat list only)
- **File**: `src/app/admin/categories/page.tsx`
- **Problem**: Category form mein parent category select karne ka option nahi
- **Effect**: Polycab → Sub-category → Product structure create nahi ho sakti
- **Fix**: Medium — parent dropdown add karna, slug auto-path generation

---

## SECTION 3: CSS MIGRATION PLAN (Hardcoded → Tailwind)

### Current globals.css (~2,080 lines) Breakdown

| CSS Block | Lines | Action |
|---|---|---|
| Bootstrap 5 overrides (legacy PHP) | ~400 | KEEP — legacy pages ke liye zaroori |
| Legacy PHP specific styles | ~300 | KEEP — old site same rehna chahiye |
| Admin panel CSS (`.admin-*`) | ~600 | REMOVE → Tailwind se replace |
| DB component CSS (`.db-*`) | ~200 | REMOVE → Tailwind se replace |
| Pricelist CSS (`.pricelist-*`) | ~150 | REMOVE → Tailwind se replace |
| Misc + variables | rest | REVIEW |

### Migration Rule

```
Legacy PHP pages   → Bootstrap 5 rakhna hai. Kuch nahi badalna.
Admin panel        → .admin-* CSS hataao, Tailwind utility classes daalo.
Frontend DB cards  → .db-* CSS hataao, Tailwind utility classes daalo.
Pricelist          → .pricelist-* hataao, Tailwind daalo.
Result             → globals.css ~400–600 lines pe aa jaayegi.
```

### Tailwind Already Configured

```js
// tailwind.config.ts
preflight: false   // Bootstrap ke saath conflict nahi hoga
content: ["./src/**/*.{ts,tsx}"]
```

---

## SECTION 4: HIERARCHY WIRING (Polycab Example)

### User ka Requirement

> "admin mein new product list by list frontend mein dekhi jaise Polycab ke andar item fir uske andar bhi item"

### DB Schema Already Supports This

```
Category: "Polycab"         slug: polycab           parentId: null
  └── Category: "LV Cables"   slug: polycab/lv-cables  parentId: Polycab.id
      └── Product: "Armoured"   slug: polycab/lv-cables/armoured  categoryId: LV Cables.id
```

### URL Mapping

```
/polycab                          → Category page  (Polycab ka grid — sub-categories + products)
/polycab/lv-cables                → Sub-category page (LV Cables products grid)
/polycab/lv-cables/armoured       → Product detail page (image, desc, enquiry button)
```

### Admin Se Kaise Create Karo (After Plan Implemented)

```
Step 1: Admin → Categories → Add
        Name: "Polycab"
        Slug: polycab
        Parent: (none)

Step 2: Admin → Categories → Add
        Name: "LV Cables"
        Slug: polycab/lv-cables     ← auto-generated from parent + name
        Parent: Polycab

Step 3: Admin → Products → Add
        Title: "Armoured Cable"
        Slug: polycab/lv-cables/armoured
        Category: LV Cables
        Image: [upload karo]
        Description: [likhho]
        Features: [likhho]

Step 4: Frontend automatically kaam karta hai — no extra code needed
```

---

## SECTION 5: PHASE-BY-PHASE PLAN

---

### PHASE 1 — BUG FIXES (Foundation)
**Estimated Time**: ~2 hours
**Risk**: Low
**Frontend UI Change**: None

| # | File | Change |
|---|---|---|
| 1.1 | `src/app/admin/products/page.tsx` | `handleOpenEdit` mein `description: p.description \|\| ''`, `features: p.features \|\| ''`, `datasheetLink: p.datasheetLink \|\| ''` |
| 1.2 | `src/app/admin/products/page.tsx` | Modal form mein Features textarea + Datasheet Link input add karo |
| 1.3 | `src/app/api/admin/products/route.ts` | POST mein `stock: body.stock \|\| 0` uncomment |
| 1.4 | `src/app/api/admin/products/[id]/route.ts` | PUT mein `stock` uncomment + `description: description !== undefined ? description : undefined` |

**Deliverable**: Admin se product create/edit karo → sab fields properly save hongi → frontend pe correct data dikhega.

---

### PHASE 2 — CATEGORY HIERARCHY
**Estimated Time**: ~3 hours
**Risk**: Medium
**Frontend UI Change**: None (backend only + renderDbCategory logic)

| # | File | Change |
|---|---|---|
| 2.1 | `src/app/admin/categories/page.tsx` | Form mein Parent Category dropdown add karo |
| 2.2 | `src/app/admin/categories/page.tsx` | Slug auto-generation: parent slug + `/` + current name |
| 2.3 | `src/app/api/admin/categories/route.ts` | POST + PUT mein `parentId` support |
| 2.4 | `src/app/[...slug]/page.tsx` | `renderDbCategory` mein nested sub-categories grid show karo |
| 2.5 | `src/app/[...slug]/page.tsx` | Admin-created category (image ya description ho) ko Priority 1 mein include karo |

**Deliverable**: Admin → Polycab → LV Cables → Armoured Cable hierarchy possible. Frontend `/polycab` pe category page, `/polycab/lv-cables` pe sub-category, product detail pe full page.

---

### PHASE 3 — CSS MIGRATION: Admin Panel
**Estimated Time**: ~3 hours
**Risk**: Low (admin only, no user-facing change)
**Frontend UI Change**: None

| # | Files | Change |
|---|---|---|
| 3.1 | `src/app/globals.css` | `.admin-modal`, `.admin-btn`, `.admin-table`, `.admin-stat-*`, `.admin-badge`, `.admin-form-*` — sab hataao |
| 3.2 | `src/app/admin/components/AdminShell.tsx` | Tailwind utility classes se replace |
| 3.3 | `src/app/admin/categories/page.tsx` | Tailwind classes |
| 3.4 | `src/app/admin/products/page.tsx` | Tailwind classes |
| 3.5 | Other admin pages | Tailwind classes |

**Deliverable**: Admin panel exactly same dikhega. globals.css ~600 lines choti ho jaayegi.

---

### PHASE 4 — CSS MIGRATION: Frontend DB Components
**Estimated Time**: ~2 hours
**Risk**: Low
**Frontend UI Change**: None (same look, different CSS method)

| # | Files | Change |
|---|---|---|
| 4.1 | `src/app/globals.css` | `.db-product-card`, `.db-subcategory-card`, `.db-product-img`, `.db-product-body`, `.db-product-title`, `.db-product-footer` — hataao |
| 4.2 | `src/app/[...slug]/page.tsx` | `renderDbProduct()` + `renderDbCategory()` mein Tailwind classes |
| 4.3 | `src/app/globals.css` | `.pricelist-inner`, `.pricelist-tabs`, `.pricelist-card`, `.pricelist-btn` — hataao |
| 4.4 | Pricelist component | Tailwind classes |

**Deliverable**: Product pages + category pages same dikhenge, pure Tailwind mein.

---

### PHASE 5 — ENQUIRY FORM WIRING
**Estimated Time**: ~2 hours
**Risk**: Low
**Frontend UI Change**: Enquiry modal add hoga (new feature, existing UI mein change nahi)

| # | File | Change |
|---|---|---|
| 5.1 | `src/app/[...slug]/page.tsx` | "Send Enquiry" button → existing `/api/inquiries` se connect |
| 5.2 | `src/app/[...slug]/page.tsx` | Enquiry modal/form — name, company, email, phone, message |
| 5.3 | `src/app/[...slug]/page.tsx` | "Download Datasheet" → `datasheetLink` field ka URL use karo |

**Deliverable**: Product page pe "Send Enquiry" click → form → submit → admin panel inquiries mein dikhega.

---

### PHASE 6 — INTEGRATION TEST
**Estimated Time**: ~1 hour
**Risk**: None

| Test Case | Expected Result |
|---|---|
| Admin: naya top-level category create | `/slug` pe category page dikhey |
| Admin: sub-category under parent create | `/parent/slug` pe sub-category grid dikhey |
| Admin: product + image add | `/parent/sub/slug` pe product detail page dikhey |
| Admin: product edit karo | Frontend pe updated data dikhey |
| Admin: product delete karo | Frontend pe 404 aaye |
| Legacy PHP pages | Sab same rahen, koi regression nahi |
| Enquiry form submit | Admin panel inquiries tab mein aaye |
| CSS visual check | Bootstrap pages same, DB pages same |
| Mobile responsive | Koi breakage nahi |

---

## SECTION 6: WHAT DOES NOT CHANGE (Guarantee)

```
Homepage layout              → koi change nahi
Navigation / Header / Footer → koi change nahi
Legacy PHP pages             → koi change nahi (fans, polycab, gland, etc.)
Pricelist page               → koi change nahi
About Us / Contact / Resources → koi change nahi
URL structure                → koi change nahi
Bootstrap 5                  → rakhna hai, nahi hata rahe
Mobile responsiveness        → same rahegi
content-export.json          → touch nahi karenge
```

---

## SECTION 7: EFFORT SUMMARY

| Phase | What | Hours | Deliverable |
|---|---|---|---|
| Phase 1 | 5 Bug Fixes | ~2h | Admin CRUD properly works |
| Phase 2 | Category Hierarchy | ~3h | Polycab → Sub → Product |
| Phase 3 | CSS Admin → Tailwind | ~3h | Clean code, same admin UI |
| Phase 4 | CSS Frontend → Tailwind | ~2h | Clean code, same frontend |
| Phase 5 | Enquiry Form | ~2h | Enquiry fully functional |
| Phase 6 | Integration Test | ~1h | End-to-end verified |
| **TOTAL** | | **~13 hours** | **Fully wired system** |

---

## SECTION 8: APPROVAL CHECKLIST

- [ ] Phase 1 approved (bug fixes)
- [ ] Phase 2 approved (category hierarchy)
- [ ] Phase 3 approved (admin CSS migration)
- [ ] Phase 4 approved (frontend CSS migration)
- [ ] Phase 5 approved (enquiry form)
- [ ] Phase 6 approved (testing)

---

*Plan prepared by: Claude Code (claude-sonnet-4-6)*
*For approval by: Antigravity*
*Project: Mohit Industries — PHP → Next.js Migration*
