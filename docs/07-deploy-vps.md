# 7. Deploy na VPS (sem Docker)

Tudo roda direto no servidor: **Node 22 + PostgreSQL + Caddy (HTTPS) + systemd**. Os arquivos de apoio estão na pasta [`deploy/`](../deploy).

## 7.1 VPS recomendada

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| vCPU | 1 | 2 |
| RAM | 2 GB | 4 GB |
| Disco | 40 GB SSD | 80 GB SSD (as fotos crescem) |
| SO | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |

Bom custo e latência para o Brasil: Hostinger, Contabo, Hetzner, DigitalOcean, Magalu Cloud, Locaweb.

## 7.2 Preparar o servidor (uma vez)

```bash
# como root: usuário comum + SSH por chave
adduser deploy && usermod -aG sudo deploy
# (copie sua chave: ssh-copy-id deploy@IP; depois desative senha/root em /etc/ssh/sshd_config)

sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban unattended-upgrades git curl build-essential
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL (só local, não exposto à internet)
sudo apt install -y postgresql postgresql-contrib

# Caddy (HTTPS automático)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

**DNS:** crie um registro **A** `sistema.seudominio.com.br` apontando para o IP da VPS.

## 7.3 Banco de dados

```bash
sudo -u postgres psql <<'SQL'
CREATE USER pina WITH PASSWORD 'TROQUE-POR-UMA-SENHA-FORTE';
CREATE DATABASE pinasystem OWNER pina;
SQL
```

O Postgres do Ubuntu já escuta só em `localhost`. Confirme: `sudo ss -tlnp | grep 5432` deve mostrar `127.0.0.1`.

## 7.4 Código e configuração

```bash
sudo mkdir -p /opt/pinasystem /var/lib/pinasystem/uploads /var/backups/pinasystem
sudo chown -R deploy:deploy /opt/pinasystem /var/lib/pinasystem /var/backups/pinasystem

cd /opt/pinasystem
git clone https://github.com/GustavoCortezBrito/Pina.git .
cp deploy/env.production.example .env
nano .env        # preencha DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ADMIN_*
chmod 600 .env
```

Gere o segredo com: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## 7.5 Primeira instalação

```bash
cd /opt/pinasystem
npm ci
npx prisma migrate deploy     # cria as tabelas
npm run db:seed               # cria o administrador do .env e os modelos de contrato padrão
npm run build

sudo cp deploy/pinasystem.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pinasystem

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile   # edite o domínio dentro dele
sudo systemctl reload caddy
```

Acesse `https://sistema.seudominio.com.br` e troque a senha do admin em **Meu perfil**.

### Criar os outros usuários

```bash
npm run usuario:criar -- "Enivaldo Pina" enivaldopina@gmail.com admin
npm run usuario:criar -- "Rafael Pina" rafaelpina2003@gmail.com admin
```

O comando imprime uma senha temporária. Papéis: `admin`, `gerente`, `operador`, `site`.

## 7.6 Atualizar o sistema (rotina de deploy)

```bash
ssh deploy@IP
/opt/pinasystem/deploy/deploy.sh
```

O script faz `git pull`, `npm ci`, migrações, build e reinicia o serviço. Ver logs: `journalctl -u pinasystem -f`.

## 7.7 Backups

`deploy/backup.sh` gera o dump do banco e um `.tar.gz` das fotos/documentos e apaga o que tem mais de 30 dias:

```bash
chmod +x /opt/pinasystem/deploy/*.sh
# todo dia às 03:00, como usuário deploy:
( crontab -l 2>/dev/null; echo "0 3 * * * /opt/pinasystem/deploy/backup.sh >> /var/log/pinasystem-backup.log 2>&1" ) | crontab -
```

**Cópia externa (obrigatória):** o backup só no próprio servidor não protege contra perda da VPS. Use `rclone` num cron para enviar `/var/backups/pinasystem` ao Backblaze B2 ou Google Drive (de preferência com `rclone crypt`).

**Restaurar (teste antes de ir para produção):**

```bash
pg_restore -h localhost -U pina -d pinasystem --clean --if-exists db_AAAA-MM-DD_HHMM.dump
tar -xzf uploads_AAAA-MM-DD_HHMM.tar.gz -C /var/lib/pinasystem
```

## 7.8 Checklist de produção

- [ ] `BETTER_AUTH_SECRET` e senha do Postgres fortes e fora do Git
- [ ] `.env` com permissão 600 e **nunca** commitado
- [ ] `BETTER_AUTH_URL` com o endereço `https://` real
- [ ] `EMBEDDED_POSTGRES="false"`
- [ ] Postgres escutando só em localhost; firewall só com 22, 80 e 443
- [ ] HTTPS ativo (Caddy)
- [ ] Backup diário rodando **e restauração testada**
- [ ] Cópia externa dos backups configurada
- [ ] Monitoramento de disponibilidade (UptimeRobot ou Uptime Kuma)
- [ ] Senhas temporárias dos usuários trocadas no primeiro acesso
- [ ] `unattended-upgrades` e `fail2ban` ativos
