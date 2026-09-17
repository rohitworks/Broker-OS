#!/usr/bin/env bash
set -euo pipefail
: "${SUPABASE_DB_URL:?required}" "${BACKUP_ENCRYPTION_KEY:?required}" "${R2_BACKUP_BUCKET:?required}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WORK=$(mktemp "/tmp/broker-os-${STAMP}.sql.gz.XXXX")
trap 'rm -f "$WORK" "$WORK.enc"' EXIT
pg_dump "$SUPABASE_DB_URL" | gzip | openssl enc -aes-256-gcm -salt -pbkdf2 -pass "pass:$BACKUP_ENCRYPTION_KEY" -out "$WORK.enc"
aws s3 cp "$WORK.enc" "s3://$R2_BACKUP_BUCKET/postgres/${STAMP}.sql.gz.enc" --endpoint-url "$R2_BACKUP_ENDPOINT"
echo "Encrypted backup uploaded: ${STAMP}"
