#!/bin/bash

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="postgres"
DB_NAME="transcendence"
DB_USER="postgres"
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "========================================"
echo "Starting backup at $(date)"
echo "========================================"

if ! docker ps | grep -q $DB_CONTAINER; then
    echo "Error: Database container not running!"
    exit 1
fi

docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup failed - no file created"
    exit 1
fi

if [ ! -s "$BACKUP_FILE" ]; then
    echo "Backup failed - file is empty"
    rm $BACKUP_FILE
    exit 1
fi

echo "Compressing..."
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "✓ Backup done: $BACKUP_FILE ($BACKUP_SIZE)"
    
    echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    find $BACKUP_DIR -name "backup_${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo ""
    echo "Current backups:"
    ls -lh $BACKUP_DIR/backup_${DB_NAME}_*.sql.gz 2>/dev/null | tail -5
else
    echo "Compression failed!"
    exit 1
fi

echo "Done at $(date)"
echo "========================================"
