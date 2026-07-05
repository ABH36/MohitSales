# Production-Grade Roadmap — Mohit Sales

> Goal: bring the codebase to a **clean, well-organized, centralized, fully-reusable
> (zero duplication), high-performance (lazy-loaded), 100% SEO-friendly** state.
> Written against the real system (2,173 products, 4,339 HTML page_contents,
> `mohit_prod` replica) after the re-baseline.

---

## 0. Where we already are (done — don't redo)

| Area | Status |
|---|---|
| Security hardening (guards, zod, auth secret) | ✅ `feat/hardening-on-baseline` (pushed) |
| Serverless-safe rendering (no fs-writes / legacy file reads) | ✅ Phase 2 redo |
| Media centralized on Cloudinary (2,303 images) | ✅ Phase 4 |
| Accessibility 86 → 95 (icon aria-labels, form labels) | ✅ |
| CSS minified (685K→535K, safe) | ✅ |
| SEO de-duplication (2,122 polycab→industries 308) | ✅ |

**These are the foundation. Everything below builds on the `feat/phase-4-redo` branch.**

---

## The root problem the rest of this plan fixes

Most remaining gaps trace to two inherited design choices:
1. **Content = raw HTML blobs** — 4,339 `page_contents.htmlContent` rows, rendered by a
   **1,400-line god-component** (`[...slug]/page.tsx`) that post-processes them with
   **cheerio at request time**. → heavy HTML (up to 180 KB/page), no `next/image`
   optimization on blob images, hard to maintain, not "structured/centralized".
2. **Hardcoded landing/catalogue pages** — brand pages (dowells, polycab, fans, …) and
   catalogue pages carry **data + JSX inline**, duplicated across ~15 files.

Incremental patches can't fully fix these — they need the phases below.

---

## PHASE A — Content & Rendering refactor  ★ highest impact
**Objective:** kill the god-component + cheerio-at-runtime; make content clean, lazy-loadable, light.

Two tracks (do **A1 pragmatic first**, A2 selectively):

### A1 — Pragmatic clean-up (keep HTML, optimize it) — *recommended first*
- **Pre-process HTML once at write-time**, not per request: run the cheerio breadcrumb/
  card/link fixes in the admin save path (or a one-time migration), store clean HTML →
  the render path drops cheerio entirely (pure DB read + sanitized render).
- **Add `loading="lazy"` + `decoding="async"`** to every `<img>` inside stored HTML
  (one-time DB pass) → native lazy-loading for the thousands of blob images.
- **Split `[...slug]/page.tsx`** into small modules: `resolveSlug()`, `<DbProduct/>`,
  `<DbCategory/>`, `<HtmlPage/>` — each a focused file.
- **Deliverables:** cheerio removed from runtime, lazy-loaded blob images, god-component
  → 4–5 small components. **Risk:** medium (broad HTML). **Effort:** ~3–4 days.

### A2 — Structured migration (HTML → data) for high-value templates
- For the **product/spec pages**, parse the repeated table/card HTML into structured
  fields (specs JSON) and render via a real React template + `next/image`.
- Do this **only** where the HTML is uniform (cable spec tables) — not for one-off pages.
- **Deliverables:** top product templates fully structured + `next/image`. **Risk:** high.
  **Effort:** ~1 week. *(Optional / phase-gated — A1 delivers most of the value.)*

---

## PHASE B — Componentization & de-duplication
**Objective:** zero duplication; landing/catalogue content centralized + reusable.

- Extract repeated JSX into reusable components: `<BrandLandingPage/>`, `<CatalogueGrid/>`,
  `<ProductCard/>`, `<SectionHeader/>`, `<Breadcrumbs/>`.
- Move the **hardcoded arrays** (brand landing data, catalogue PDF lists) out of `.tsx`
  into the **DB/CMS** so they're editable + single-source.
- Delete duplicated markup across the ~15 hardcoded pages → each becomes a thin
  data-driven page.
- **Deliverables:** no duplicated page JSX; landing/catalogue data in DB. **Risk:** medium
  (visual parity — needs QA). **Effort:** ~4–5 days.

---

## PHASE C — Design system (reusable UI primitives)
**Objective:** consistent, reusable building blocks.

- Grow `src/components/ui/` into a small system: `Button`, `Input`, `Card`, `Section`,
  `Container`, `Heading`, `Badge`, `Modal` — typed, variant-based (cva already present).
- Replace ad-hoc markup + inline styles with these primitives.
- Establish tokens (spacing/color/typography) so styling is centralized.
- **Deliverables:** UI primitive library; components consume it. **Risk:** low–medium.
  **Effort:** ~3–4 days. (Supports Phase B.)

---

## PHASE D — Performance pass  (measure on real infra first)
**Objective:** genuinely high performance.

- **Deploy to staging** (Vercel/Render) and **re-run Lighthouse** — local numbers are
  unreliable; get real LCP/TBT/CLS.
- **CSS:** purge unused rules (PurgeCSS against the real DOM) + move `fontawesome-pro`
  (508K) to non-blocking load — **with visual QA**.
- **Lazy-load:** below-fold sections/components (`next/dynamic`), route-level code-split,
  defer non-critical JS (sliders init on interaction/visibility).
- **Images:** `next/image` (responsive + lazy) wherever we control the markup (products,
  landing) — Cloudinary already backs delivery; add `f_auto,q_auto` transforms.
- **Fonts:** `next/font` self-host + preload; drop the runtime GoogleFontsLoader if possible.
- **Deliverables:** measured LCP/TBT targets met on staging; unused CSS purged; lazy
  loading everywhere. **Risk:** medium (visual). **Effort:** ~4–5 days. **Depends on:** A, and a deploy.

---

## PHASE E — SEO finish (→ 100%)
**Objective:** close the SEO gaps.

- **Fix soft-404:** `notFound()` currently returns HTTP 200 — make unknown/thin pages
  return a real 404/410 + noindex (middleware-level check or route fix).
- **Structured data audit:** ensure Product/BreadcrumbList/Organization JSON-LD on every
  relevant page (SchemaInjector exists — verify coverage).
- **Canonical + meta audit** across all templates; trim/lighten the 180 KB pages.
- **Deliverables:** true 404s, complete structured data, clean canonicals. **Risk:** low.
  **Effort:** ~2–3 days.

---

## PHASE F — Types, tests & CI
**Objective:** maintainable, regression-safe.

- Drive down the remaining `any` (Prisma types, typed API responses).
- Tests: guard/validation (done) + key route handlers + a render smoke suite (Vitest +
  Playwright for a few critical pages).
- **CI** (GitHub Actions): typecheck + lint + build + tests on PR.
- **Deliverables:** green CI, meaningful coverage, near-zero `any`. **Risk:** low.
  **Effort:** ~3–4 days (ongoing).

---

## PHASE G — Deployment & data-sync
**Objective:** ship it, correctly.

- Choose host (**Vercel** for best Next.js perf, or **Render**) + **managed Postgres**
  (Neon/Supabase/Render PG).
- **Data-sync:** run the committed idempotent scripts (seed, image-migrate, redirects,
  A1 HTML passes) against the **production** DB — or restore a transformed dump.
- Env/secrets, CI/CD, monitoring/logging.
- **Re-measure Lighthouse on production** → confirm targets.
- **Deliverables:** live on modern infra, data synced, perf verified. **Risk:** medium.
  **Effort:** ~2–3 days.

---

## Sequencing & dependencies

```
(done: hardening, Phase2, Phase4, SEO-dedup)
        │
        ▼
PHASE A (content/render)  ──►  PHASE D (perf)  ──►  PHASE G (deploy + re-measure)
        │                         ▲                        ▲
        ▼                         │                        │
PHASE C (design system) ─► PHASE B (componentize/dedupe) ──┘
                                  
PHASE E (SEO finish)  ── small, can run in parallel
PHASE F (types/tests/CI) ── continuous, gate each phase
```

**Recommended order:** A1 → C → B → E → (deploy staging) → D → F → G.

---

## Honest effort & expectation

- **Total:** ~4–6 focused weeks for the full bar (A1 path). A2 (full structured content)
  adds ~1–2 weeks and is optional.
- This is a **program of work**, not a patch. It can be delivered **phase-by-phase**, each
  independently valuable, verifiable, and deployable.
- **Current maturity vs the bar:** ~55–60%. Phases A + B + D move the needle most.

## Suggested first move
**Phase A1** (pragmatic content/render clean-up) — biggest single jump toward
clean + reusable + performant, at medium risk, ~3–4 days, and it unblocks D (perf).
