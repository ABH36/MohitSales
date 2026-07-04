# Phase 3 Plan — Hardening (Security, Validation, Types, Tests)

> Status: **IN PROGRESS**
> Branch: `feat/phase-3-hardening`
> Goal: make the API production-secure and maintainable without changing behavior.

---

## Current state (audit)
- **47 API routes**; **31** repeat the same inline `x-user-role` role check; **26** read `request.json()` with **no schema validation** (manual `if (!field)` only).
- **No** shared auth-guard or validation layer. `zod` not installed (added in 3.2).
- `auth.ts`: `createToken(payload: any)`, and a **hardcoded dev JWT secret fallback**.
- **125** `any` / `as any` across the codebase.

---

## Steps (prioritized)

### 3.1 — Shared auth guard  ★ foundational
Centralize the duplicated role check into one helper.
- `src/lib/api/guard.ts`: `getUserContext(request)` + `requireRole(request, roles)` returning either the user context or a ready `403` `NextResponse`.
- Establish the pattern on the products routes, then roll out to the other 30.
- **Risk:** low (same behavior, one source of truth). **Verify:** admin write still 403s for VIEWER, 200 for ADMIN.

### 3.2 — Zod request validation  ★ foundational
- `npm i zod`; `src/lib/api/validate.ts`: `parseBody(request, schema)` → `{ data }` or `400` with field errors.
- `src/lib/schemas/*`: per-domain schemas (product, category, blog, inquiry, …).
- Apply to all 26 write routes; replace manual checks.
- **Risk:** low-med (must match existing field names). **Verify:** bad payload → 400 with messages; good payload → unchanged.

### 3.3 — Auth secret & token typing
- Remove the hardcoded JWT secret fallback (fail-fast if unset; dev uses `.env`).
- Type `createToken` payload (`{ userId: string; role: string }`).
- **Risk:** low. **Verify:** app boots with `.env` secret; missing secret throws clearly.

### 3.4 — `any` cleanup (incremental)
- Replace `any` with real types/Prisma types, starting at the API + guard/validation layer. Ongoing, not a blocker.

### 3.5 — Refresh tokens (optional, deferred)
- Short-lived access token + refresh cookie + rotation. Higher risk (auth flow) — do last, behind its own verification.

### 3.6 — Tests
- Unit tests for `requireRole`, `parseBody`, and a couple of route handlers (Vitest is already set up).

---

## Sequencing
```
3.1 guard ─┐
3.2 zod   ─┴─► roll out to 47 routes ─► 3.3 secret/typing ─► 3.6 tests
3.4 any-cleanup: continuous alongside      3.5 refresh tokens: optional, last
```
**Effort:** ~1 week. Each step committed separately; behavior-preserving.

## Approach
Build the shared helpers, prove the pattern on the **products** routes (role check + JSON body + `[id]`), verify end-to-end, commit — then roll the pattern out across the remaining routes in batches.
