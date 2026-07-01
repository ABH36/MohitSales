#!/bin/bash
# ============================================================
# Mohit Sales — Automated PostgreSQL Database Backup Script
# Keeps 7 days of backups and deletes older ones.
# ============================================================

# Save backups to the easypanel user directory (avoids Permission Denied errors)
BACKUP_DIR="/home/easypanel/db_backups"

# Create the backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get current date in YYYY-MM-DD format
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/mohit_postgres_$DATE.sql"

# Use the exact container name for PostgreSQL
CONTAINER_ID="mohit-industries-db"

echo "Starting PostgreSQL database backup for $DATE..."

# Run pg_dump to backup the database (username: postgres, dbname: mohit_industries)
docker exec -t "$CONTAINER_ID" pg_dump -U postgres mohit_industries > "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE"

# Find and delete backup files older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -exec rm {} \;

echo "Old backups cleaned up successfully!"
