# Stage 1: Install all dependencies (including devDependencies for build & migrations)
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 2: Build the Next.js application
FROM node:20-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
# Provide dummy env vars for Next.js build verification and Prisma schema validation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV JWT_SECRET="dummy_secret_for_build_only"
ENV CAPTCHA_SECRET="dummy_secret_for_build_only"
# Generate Prisma client for the correct platform (linux-slim)
RUN npx prisma generate
# Build the application
RUN npm run build

# Stage 3: Production runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files, prisma schema, scripts, and build outputs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/content-export.json ./content-export.json

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Startup command: sync schema (additive only, no data loss) then start app
# NOTE: Seeding is intentionally removed from here — run deploy-seed.sh manually
#       to seed initial data only once. Never seed on every restart (overwrites real data).
CMD ["sh", "-c", "npx prisma db push && npm run start"]
