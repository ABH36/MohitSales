#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/mohit-industries"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Ensure DATABASE_URL is available
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

echo "Starting database backup at $(date)..."

# Run pg_dump using DATABASE_URL directly and compress it
if pg_dump "$DATABASE_URL" | gzip > "${BACKUP_FILE}"; then
  echo "Backup successfully written to ${BACKUP_FILE}"
else
  echo "Error: pg_dump failed!" >&2
  exit 1
fi

# Set strict permissions (read/write only for owner)
chmod 600 "${BACKUP_FILE}"

# Prune old backups
echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "db_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "Backup process finished at $(date)."
