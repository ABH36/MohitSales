#!/bin/bash
# ============================================================
# MohitSales — Server Migration Script
# Usage: bash scripts/server-migrate.sh
# Run from: ~/MohitSales_Node on the server
# ============================================================

set -e

APP_CONTAINER="mohit-industries-app"
DB_CONTAINER="mohit-industries-db"
PROJECT_DIR="${HOME}/MohitSales_Node"
DOCKER_DB_URL="postgresql://postgres:Abhi%40369@db:5432/mohit_industries?schema=public"
BRANCH="testing"

cd "$PROJECT_DIR"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       MohitSales — Server Migration Script       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Pull latest code ──────────────────────────────
echo "[1/5] Pulling latest code from '$BRANCH' branch..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "✅ Code updated"

# ── Step 2: Rebuild Docker image ──────────────────────────
echo ""
echo "[2/5] Rebuilding app Docker image (no cache)..."
cd "$PROJECT_DIR/deployment"
docker-compose build --no-cache app
echo "✅ Image rebuilt"

# ── Step 3: Restart containers ────────────────────────────
echo ""
echo "[3/5] Restarting containers..."
docker-compose down
docker-compose up -d
echo "⏳ Waiting for DB to be healthy..."
sleep 15
echo "✅ Containers up"

# ── Step 4: Run Prisma DB Push (schema sync) ──────────────
echo ""
echo "[4/5] Running prisma db push (schema sync)..."
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  npx prisma db push --accept-data-loss
echo "✅ Schema synced"

# ── Step 5: Verify app is running ─────────────────────────
echo ""
echo "[5/5] Verifying containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "mohit|NAME"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Migration complete! App is live on port 3000 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
