#!/bin/bash
set -e

BACKUP_DIR="/backups"
DB_CONTAINER="postgres"
DB_USER="${POSTGRES_USER}"
TEST_DB_NAME="test_restore_$(date +%s)"

# Validate environment variable
if [ -z "$DB_USER" ]; then
    echo "Error: POSTGRES_USER environment variable not set"
    exit 1
fi

echo "========================================"
echo "Testing latest backup..."
echo "========================================"

LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backups found!"
    exit 1
fi

echo "Testing: $LATEST_BACKUP"
BACKUP_SIZE=$(du -h "$LATEST_BACKUP" | cut -f1)
echo "Size: $BACKUP_SIZE"
echo ""

echo "Extracting..."
gunzip -c "$LATEST_BACKUP" > /tmp/test_restore.sql

if [ ! -s /tmp/test_restore.sql ]; then
    echo "Failed to extract or file is empty!"
    rm -f /tmp/test_restore.sql
    exit 1
fi

echo "✓ Extraction successful"
echo ""

echo "Creating test database..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $TEST_DB_NAME;" 2>/dev/null

echo "Attempting restore..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" "$TEST_DB_NAME" < /tmp/test_restore.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Backup is valid!"
    
    echo "Cleaning up..."
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "DROP DATABASE $TEST_DB_NAME;" 2>/dev/null
else
    echo "✗ Restore failed - backup might be corrupted"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB_NAME;" 2>/dev/null
    rm -f /tmp/test_restore.sql
    exit 1
fi

rm -f /tmp/test_restore.sql

echo ""
echo "========================================"
echo "Verification done"
echo "========================================"
