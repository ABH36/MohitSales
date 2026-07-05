# Phase 4 (Option B) — Media → Cloudinary Migration Plan

> Status: **PROPOSED** (awaiting approval)
> Branch: `feat/phase-4-redo`
> Works against the production replica (`mohit_prod`): 2,173 products, 4,339 page_contents.

---

## 1. Reality (from the real-data audit)

| Asset type | Count | Size | Referenced by |
|---|---|---|---|
| **Images** (jpg/png/webp/svg) | 4,442 | **150 MB** | code, DB fields, and **all 4,339 page_contents HTML** |
| **PDFs** (datasheets/catalogues) | 734 | **2,136 MB** | page HTML `datasheet`/`document-pdf` links, product.datasheetLink |

Every one of the 4,339 `page_contents` HTML documents references `/assets/images/…`.

---

## 2. Scope decision — quota-aware ⚠️

The target Cloudinary is the client's **free tier** (25 credits/mo, already ~28% used by the live site's media). 1 credit ≈ 1 GB storage **or** 1 GB delivery bandwidth.

- **Images (150 MB) → Cloudinary ✅** — small footprint, biggest perf/SEO win (CDN + auto-format/quality). Negligible quota impact.
- **PDFs (2.1 GB) → NOT on free Cloudinary ❌** — would consume ~2 GB storage **plus** delivery bandwidth on every download; realistic risk of blowing the free tier and breaking the **live** site's image delivery. PDFs are downloads (not perf-critical), so they stay local for now. (Alt later: S3/Cloudflare R2/a paid bucket — separate decision.)

**This plan migrates IMAGES only.** PDFs remain in `public/assets`.

---

## 3. Migration approach (images)

For each image actually referenced anywhere:

1. **Upload** to Cloudinary with a deterministic `public_id` (`mohit/<path-without-ext>`), `overwrite: true` → re-runs never duplicate.
2. **Build a map** `localPath → cloudinarySecureUrl`.
3. **Rewrite every reference** using that map:
   - **Code** (`src/**`) — string-replace `/assets/images/…` literals.
   - **DB scalar fields** — `product.imageSrc`, `category.image`, `blogPost.coverImage`.
   - **DB HTML/JSON fields** — `pageContent.htmlContent` (**all 4,339**), `cmsSection.content`, `setting.value`, `blogPost.content`, `product.description/features` — regex-replace each `/assets/images/…` occurrence with its Cloudinary URL.
4. **Verify** (see §6), then **delete** the migrated local image files (`public/assets/images` shrinks ~150 MB → near-0; PDFs stay).

`next.config.js` already whitelists `res.cloudinary.com`, so `next/image` and `<img>` both work with the new URLs.

---

## 4. The risky part — rewriting 4,339 HTML documents

- Regex: replace `/assets/images/<path>.<ext>` (case-insensitive, handles `?v=` query strings and spaces via a tolerant matcher) **only** when `<path>` is in the upload map — never touch unknown/PDF paths.
- Dynamic/loop-built paths (e.g. clientele `brand-thumb-${n}`) don't appear as literals in HTML, so they're handled via the **code** rewrite instead (upload brand set + point the component at Cloudinary, as done before).
- Idempotent: already-`res.cloudinary.com` URLs are skipped.

---

## 5. Safety / idempotency / rollback

- **DRY-RUN first** — report: images to upload, references to rewrite (per source), 0 DB writes.
- **DB snapshot before write:** `pg_dump mohit_prod → mohit_prod_pre_cloudinary.sql.gz` (instant rollback of all DB rewrites).
- **Code** changes are on the `feat/phase-4-redo` branch (git-revertable).
- **Deterministic public_ids + overwrite** → safe re-runs.
- **Never delete** a local image until its Cloudinary URL is confirmed live (HTTP 200).
- **Production is untouched** — all of this runs against the local `mohit_prod` replica. Production migration is a separate, later step (run the same idempotent script against prod DB, after approval).

---

## 6. Verification (before deleting locals)

1. `res.cloudinary.com` reference count in DB/code goes **up**; `/assets/images/` (non-PDF) references go to **~0**.
2. Crawl a representative set (home, several `industries/*` and `polycab/*` PageContent pages, product/category pages) → all 200, images point to `res.cloudinary.com`, sample image URLs return HTTP 200.
3. Cloudinary usage delta stays well within free tier.
4. No broken-image references remain (grep DB + rendered HTML).

---

## 7. Execution phases (each verified + committed)

- **B1** — Upload images + build map + **dry-run** report (no writes).
- **B2** — Rewrite **code** references; build + verify.
- **B3** — Snapshot DB; rewrite **DB scalar + HTML/JSON** references (products, categories, blogs, cms, settings, 4,339 page_contents); verify pages render Cloudinary URLs.
- **B4** — Confirm Cloudinary URLs live → **delete local images**; final verify + Cloudinary-usage check.
- **(Deploy)** — later, run the same script against the **production** DB (Phase 5), then deploy code.

**Effort:** ~1–1.5 days. **Risk:** medium (bulk HTML rewrite) — mitigated by dry-run + DB snapshot + staged verification.

---

## 8. Explicitly out of scope (here)
- The **2.1 GB PDFs** (quota) — stay local; storage decision deferred.
- Production DB migration — deferred to Phase 5 (deployment), using the same idempotent script.
