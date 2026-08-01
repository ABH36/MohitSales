# Deploy steps — Polycab data fill + 404 fix

Simple, in order. Run these on the **production** environment (where
`DATABASE_URL` points to the PROD database). Needs internet access to
`polycab.com` (for images).

> These scripts WRITE to the production database. Do the backup step first.

---

## Step 0 — Back up the database (safety)
Take a fresh PROD database backup before anything. If something looks wrong
later, you can restore.

## Step 1 — Get the latest code
```
git pull            # pull the main branch from your usual deploy remote
npm install
```

## Step 2 — (Optional) Preview what will change — writes nothing
```
npx tsx scripts/fill-datasheets-from-polycab.ts
npx tsx scripts/enrich-images-from-polycab.ts
```
These only print a summary and write report files under `scripts/`. No database
change yet. Read the summary if you want to see the counts.

## Step 3 — Fill the DATASHEETS (writes to DB)
```
npx tsx scripts/fill-datasheets-from-polycab.ts --apply
```
Sets the datasheet (PDF) link on ~499 products to the correct official Polycab
brochure.

## Step 4 — Fill the IMAGES (writes to DB)
```
npx tsx scripts/enrich-images-from-polycab.ts --apply
```
Fills the missing product/category images (108) with real Polycab images.
(This one fetches from polycab.com, so it takes 1–2 minutes.)

## Step 5 — Rebuild and redeploy the app
Do your normal deploy (build + restart), e.g.:
```
npm run build
# then restart / redeploy as usual (pm2 restart, docker, etc.)
```
**Why this matters:** the redeploy does two things —
1. Puts the "Page Not Found" fix live (transient DB errors no longer get
   cached as 404).
2. Regenerates the cached pages so the new images + datasheets show, AND
   clears any old stuck "Page Not Found" pages.

## Step 6 — Check it worked
Open a few pages in the browser:
- A product page → should now show a **Download / Datasheet** link.
- An Industries category page (e.g. `/industries/cables-by-application`) → should
  open normally (no "Page Not Found").
- A category tile that had the plain MSC logo → should now show a real image.

---

## Notes
- All links point to Polycab's own CDN (`cms.polycab.com`) — nothing is hosted
  by us, so no upload step.
- `scripts/not-on-polycab-OLD.tsv` = products we carry that did NOT match
  Polycab (possible old/discontinued). This is a **review list only** — do not
  auto-delete; some are just naming differences (e.g. switch colour variants).
- To re-run any step safely: the `--apply` scripts are idempotent (running
  twice sets the same values again).
