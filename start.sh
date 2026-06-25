#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Running database seed..."
npm run db:seed || echo "Seed execution failed or already applied"

echo "Starting application..."
npm run start
