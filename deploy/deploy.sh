#!/usr/bin/env bash
# Atualiza o sistema na VPS: código, dependências, migrações, build e reinício.
set -euo pipefail
cd /opt/pinasystem

echo "→ Atualizando código"
git pull --ff-only origin main

echo "→ Instalando dependências"
npm ci

echo "→ Aplicando migrações do banco"
npx prisma migrate deploy

echo "→ Gerando build"
npm run build

echo "→ Reiniciando"
sudo systemctl restart pinasystem
sleep 3
systemctl is-active --quiet pinasystem && echo "✓ No ar" || { echo "✗ Falhou, veja: journalctl -u pinasystem -n 50"; exit 1; }
