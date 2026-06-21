#!/bin/bash
# ============================================================
# MohitSales — Server Migration Script
# Usage:  bash scripts/server-migrate.sh
# Run from: ~/MohitSales_Node  (project root)
# ============================================================

set -e

# ── Config ────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"   # always resolves to project root
DEPLOY_DIR="$PROJECT_DIR/deployment"
APP_CONTAINER="mohit-industries-app"
DB_CONTAINER="mohit-industries-db"
DOCKER_DB_URL="postgresql://postgres:Abhi%40369@db:5432/mohit_industries?schema=public"
BRANCH="testing"

# Support both old docker-compose and new docker compose plugin
if command -v docker-compose &>/dev/null; then
  DC="docker-compose"
else
  DC="docker compose"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       MohitSales — Server Migration Script       ║"
echo "╚══════════════════════════════════════════════════╝"
echo "  Project : $PROJECT_DIR"
echo "  Deploy  : $DEPLOY_DIR"
echo "  Compose : $DC"
echo ""

# ── Step 1: Pull latest code ──────────────────────────────
echo "[1/5] Pulling latest code from '$BRANCH' branch..."
cd "$PROJECT_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "✅ Code updated"

# ── Step 2: Rebuild app Docker image ─────────────────────
echo ""
echo "[2/5] Rebuilding app Docker image (no cache)..."
cd "$DEPLOY_DIR"
$DC build --no-cache app
echo "✅ Image rebuilt"

# ── Step 3: Restart containers ────────────────────────────
echo ""
echo "[3/5] Restarting containers..."
$DC down
$DC up -d
echo "⏳ Waiting 20s for DB to be healthy..."
sleep 20
echo "✅ Containers up"

# ── Step 4: Prisma DB Push (safe — no data loss) ──────────
# Applies only additive schema changes (new tables/columns).
# Will REFUSE if any change would destroy existing data.
echo ""
echo "[4/5] Running prisma db push (safe schema sync)..."
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  npx prisma db push
echo "✅ Schema synced (real data untouched)"

# ── Step 5: Verify ────────────────────────────────────────
echo ""
echo "[5/5] Verifying containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" \
  | grep -E "mohit|NAME"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Done! App is live on port 3000               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
