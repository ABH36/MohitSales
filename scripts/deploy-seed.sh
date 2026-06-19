#!/bin/bash
# Run from project root: bash scripts/deploy-seed.sh

set -e

APP_CONTAINER="mohit-industries-app"
PROJECT_DIR=~/MohitSales_Node
DOCKER_DB_URL="postgresql://postgres:Abhi%40369@db:5432/mohit_industries?schema=public"

echo "===== MohitSales Docker Seed Script ====="

# Step 1: Check container is running
echo "[1/6] Checking containers..."
if ! docker ps --format '{{.Names}}' | grep -q "$APP_CONTAINER"; then
  echo "Starting docker-compose..."
  cd "$PROJECT_DIR/deployment" 2>/dev/null || cd "$PROJECT_DIR"
  docker-compose up -d
  sleep 15
fi
echo "✅ Container running"

# Step 2: Copy content-export.json into container
echo "[2/6] Copying content-export.json into container..."
if [ ! -f "$PROJECT_DIR/content-export.json" ]; then
  echo "❌ content-export.json not found in $PROJECT_DIR"
  exit 1
fi
docker cp "$PROJECT_DIR/content-export.json" "$APP_CONTAINER:/app/content-export.json"
echo "✅ content-export.json copied"

# Step 3: Seed products
echo "[3/6] Seeding products..."
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node prisma/seed-products.js
echo "✅ Products seeded"

# Step 4: Rebuild category tree
echo "[4/6] Rebuilding category tree..."
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node scripts/rebuild-category-tree.js
echo "✅ Category tree rebuilt"

# Step 5: Fix product descriptions
echo "[5/6] Fixing product descriptions..."
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node prisma/fix-seeded-products.js
echo "✅ Descriptions fixed"

# Step 6: Restart container
echo "[6/6] Restarting app container..."
docker restart "$APP_CONTAINER"
echo "✅ Done! App restarted."
