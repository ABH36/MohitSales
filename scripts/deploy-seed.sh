#!/bin/bash

# ============================================================
#  MohitSales - Docker Seed & Deploy Script
#  Run on server: bash scripts/deploy-seed.sh
# ============================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_CONTAINER="mohit-industries-app"
DB_CONTAINER="mohit-industries-db"
PROJECT_DIR=~/MohitSales_Node

# ── Docker internal DB URL (db = docker service name, not localhost) ──
DOCKER_DB_URL="postgresql://postgres:Abhi%40369@db:5432/mohit_industries?schema=public"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   MohitSales - Docker Seed & Deploy Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# ── Step 1: Check Docker containers are running ──────────────
echo -e "${YELLOW}[1/7] Checking Docker containers...${NC}"

if ! docker ps --format '{{.Names}}' | grep -q "$APP_CONTAINER"; then
  echo -e "${YELLOW}⚠️  App container not running. Starting docker-compose...${NC}"
  cd "$PROJECT_DIR/deployment" 2>/dev/null || cd "$PROJECT_DIR"
  docker-compose up -d
  echo -e "${YELLOW}⏳ Waiting 15 seconds for containers to be healthy...${NC}"
  sleep 15
else
  echo -e "${GREEN}✅ Containers are running${NC}"
fi
echo ""

# ── Step 2: Verify DB is reachable from app container ────────
echo -e "${YELLOW}[2/7] Verifying database connection (using Docker internal network)...${NC}"
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  npx prisma db push --skip-generate 2>&1 | tail -5 || {
    echo -e "${RED}❌ DB connection failed! Check if DB container is healthy.${NC}"
    echo -e "${YELLOW}📋 DB Container status:${NC}"
    docker inspect --format='{{.State.Health.Status}}' "$DB_CONTAINER"
    exit 1
  }
echo -e "${GREEN}✅ DB connection verified (db:5432 via Docker network)${NC}"
echo ""

# ── Step 3: Generate Prisma Client inside container ──────────
echo -e "${YELLOW}[3/7] Generating Prisma Client inside container...${NC}"
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# ── Step 4: Seed Products ────────────────────────────────────
echo -e "${YELLOW}[4/7] Seeding products into database...${NC}"
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node prisma/seed-products.js
echo -e "${GREEN}✅ Products seeded successfully${NC}"
echo ""

# ── Step 5: Rebuild Category Tree ───────────────────────────
echo -e "${YELLOW}[5/7] Rebuilding category hierarchy...${NC}"
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node scripts/rebuild-category-tree.js
echo -e "${GREEN}✅ Category tree rebuilt${NC}"
echo ""

# ── Step 6: Fix Seeded Product Descriptions ──────────────────
echo -e "${YELLOW}[6/7] Fixing seeded product description format...${NC}"
docker exec \
  -e DATABASE_URL="$DOCKER_DB_URL" \
  -e DIRECT_URL="$DOCKER_DB_URL" \
  "$APP_CONTAINER" \
  node prisma/fix-seeded-products.js
echo -e "${GREEN}✅ Product descriptions fixed${NC}"
echo ""

# ── Step 7: Restart App Container ───────────────────────────
echo -e "${YELLOW}[7/7] Restarting app container to refresh Next.js cache...${NC}"
docker restart "$APP_CONTAINER"
echo -e "${YELLOW}⏳ Waiting for app to be ready...${NC}"
sleep 5
echo -e "${GREEN}✅ App container restarted${NC}"
echo ""

# ── Done! ─────────────────────────────────────────────────────
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}🎉 All steps completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "📋 Docker Container Status:"
docker ps --filter "name=mohit-industries" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
