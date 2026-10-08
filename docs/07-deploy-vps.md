# 7. Deploy na VPS

## 7.1 VPS recomendada

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| vCPU | 1 | 2 |
| RAM | 2 GB | 4 GB |
| Disco | 40 GB SSD | 80 GB SSD (as fotos crescem) |
| SO | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |

Opções com bom custo e latência para o Brasil: Hostinger, Contabo, Hetzner, DigitalOcean, Magalu Cloud, Locaweb.

## 7.2 Preparação do servidor

```bash
# usuário não-root + SSH por chave
adduser deploy && usermod -aG sudo deploy
# desabilitar login por senha e root em /etc/ssh/sshd_config
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban unattended-upgrades
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
```

DNS: criar um registro **A** `sistema.dominio.com.br` apontando para o IP da VPS.

## 7.3 `docker-compose.yml` (produção)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql://pina:${POSTGRES_PASSWORD}@db:5432/pinasystem
      STORAGE_LOCAL_PATH: /data/uploads
    volumes:
      - uploads:/data/uploads
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: pina
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: pinasystem
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pina"]
      interval: 10s
      retries: 5
    # sem "ports": o banco não fica exposto para a internet

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on:
      - app

  backup:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      PGPASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./docker/backup.sh:/backup.sh:ro
      - uploads:/data/uploads:ro
      - backups:/backups
    entrypoint: ["/bin/sh", "-c", "echo '0 3 * * * /backup.sh' | crontab - && crond -f"]

volumes:
  pgdata:
  uploads:
  caddy_data:
  backups:
```

## 7.4 `docker/Caddyfile`

```
sistema.dominio.com.br {
    encode gzip zstd
    request_body max_size 25MB
    reverse_proxy app:3000
}
```

O Caddy emite e renova o certificado HTTPS (Let's Encrypt) automaticamente.

## 7.5 `docker/Dockerfile`

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
USER app
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

> Requer `output: "standalone"` em `next.config.ts`.

## 7.6 Backups (`docker/backup.sh`)

```sh
#!/bin/sh
set -e
DATA=$(date +%Y-%m-%d_%H%M)
pg_dump -h db -U pina -Fc pinasystem > /backups/db_$DATA.dump
tar -czf /backups/uploads_$DATA.tar.gz -C /data uploads
# manter 30 dias localmente
find /backups -type f -mtime +30 -delete
```

**Cópia externa (obrigatória):** usar `rclone` num cron do host para sincronizar o volume `backups` com Backblaze B2, Google Drive ou outro armazenamento, de preferência com criptografia (`rclone crypt`).

**Restauração (testar antes de ir para produção):**
```bash
docker compose exec -T db pg_restore -U pina -d pinasystem --clean < db_AAAA-MM-DD.dump
docker compose run --rm -v $(pwd):/restore app tar -xzf /restore/uploads_AAAA-MM-DD.tar.gz -C /data
```

## 7.7 Rotina de deploy

```bash
ssh deploy@vps
cd ~/pinasystem
git pull origin main
docker compose up -d --build
docker compose logs -f app
```

Depois, dá para automatizar com GitHub Actions (build da imagem → GHCR → `docker compose pull && up -d` via SSH).

## 7.8 Checklist de produção

- [ ] `AUTH_SECRET` e `POSTGRES_PASSWORD` fortes e fora do Git
- [ ] Porta do Postgres **não** exposta
- [ ] HTTPS ativo
- [ ] Backup diário rodando **e restauração testada**
- [ ] Cópia externa dos backups configurada
- [ ] Monitoramento de disponibilidade (Uptime Kuma ou UptimeRobot)
- [ ] Senha do admin inicial trocada
- [ ] Limite de tentativas no login ativo
- [ ] `unattended-upgrades` e `fail2ban` ativos
