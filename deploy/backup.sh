#!/usr/bin/env bash
# Backup diário: dump do banco + fotos/documentos. Roda via cron como usuário "deploy".
set -euo pipefail
set -a; source /opt/pinasystem/.env; set +a

DESTINO="${BACKUP_DIR:-/var/backups/pinasystem}"
UPLOADS="${STORAGE_LOCAL_PATH:-/var/lib/pinasystem/uploads}"
DATA=$(date +%Y-%m-%d_%H%M)
mkdir -p "$DESTINO"

pg_dump "$DATABASE_URL" -Fc -f "$DESTINO/db_$DATA.dump"
tar -czf "$DESTINO/uploads_$DATA.tar.gz" -C "$(dirname "$UPLOADS")" "$(basename "$UPLOADS")"

# mantém 30 dias localmente
find "$DESTINO" -type f -mtime +30 -delete
echo "$(date -Is) backup ok: $DATA"
