# Apply recovered data to PRODUCTION — DevOps steps

Goal: fill the missing product **images** and **datasheets** in the production
database (same change we already tested locally).

> ⚠️ These scripts write to whatever `DATABASE_URL` points to. Run them on the
> **production** environment only, where `DATABASE_URL` = the prod DB. They need
> internet access to `polycab.com`. They are idempotent — safe to re-run.

---

## Steps (in order)

**1. Backup the prod database first.**
```
pg_dump "$DATABASE_URL" -Fc -f prod_backup_$(date +%F).dump
```

**2. Get the latest code.**
```
git pull
npm install
```

**3. Fill datasheets (writes to DB):**
```
npx tsx scripts/fill-datasheets-from-polycab.ts --apply
```
Sets the datasheet PDF link on ~499 products (official Polycab brochures).

**4. Fill images (writes to DB, fetches from polycab.com — ~1–2 min):**
```
npx tsx scripts/enrich-images-from-polycab.ts --apply
```
Fills ~108 missing product/category images.

**5. Rebuild + redeploy the app** (your normal deploy).
```
npm run build   # then restart / redeploy as usual
```
This makes the code changes live AND regenerates cached pages so the new
images + datasheets show.

**6. Quick check.** Open in browser:
- a product page → "Download Datasheet" link shows
- `/industries/cables-by-application` → opens with a card grid (no "Page Not Found")
- a category tile that had the plain MSC logo → now shows a real image

---

## Notes
- All image/PDF links point to Polycab's own CDN (`cms.polycab.com`) — **no file
  upload needed**.
- To preview before writing, run the same two commands **without** `--apply`
  (prints counts only, no DB change).
- If anything looks wrong, restore the backup from step 1.
