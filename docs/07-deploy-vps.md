# 7. Deploy na VPS (sem Docker)

Tudo roda direto no servidor: **Node 22 + PostgreSQL + Caddy (HTTPS) + systemd**. Os arquivos de apoio estão na pasta [`deploy/`](../deploy).

## 7.1 VPS recomendada

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| vCPU | 1 | 2 |
| RAM | 2 GB | 4 GB |
| Disco | 40 GB SSD | 80 GB SSD (as fotos crescem) |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

É preciso uma **VPS** com acesso **root por SSH** e Ubuntu puro (sem cPanel/WHM). Hospedagem compartilhada não serve.

Bom custo e latência para o Brasil: HostGator (VPS em São Paulo), Hostinger, DigitalOcean, Magalu Cloud, Locaweb. Hetzner e Contabo são baratos, mas ficam fora do Brasil.

> **Em produção hoje:** HostGator, VPS OCI NVMe 2 (1 vCPU, 2 GB de RAM, 50 GB), Ubuntu 22.04, SSH na porta **22022**. Funciona bem, mas com 2 GB de RAM o build do Next.js só passa com **swap** (7.2).

## 7.2 Preparar o servidor (uma vez)

```bash
# como root: usuário que roda a aplicação (sem login por senha)
adduser --disabled-password --gecos "" deploy
# autorize sua chave SSH no root (painel da VPS, aba "Chaves SSH") e, depois que tudo funcionar,
# desative o login por senha em /etc/ssh/sshd_config (PasswordAuthentication no)

# swap de 2 GB (obrigatório com 2 GB de RAM: sem ele o build é morto por falta de memória)
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo "/swapfile none swap sw 0 0" >> /etc/fstab

sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban unattended-upgrades git curl build-essential

# Firewall. Atenção: libere o SSH ANTES de ativar (aqui ele está na porta 22022; use 22 se for o seu caso)
sudo ufw allow 22022/tcp && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
# fail2ban no SSH: crie /etc/fail2ban/jail.d/sshd-pina.local com [sshd] enabled = true, port = 22022

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

Se o repositório for privado e o servidor não tiver acesso ao GitHub, envie o código do seu computador (sem histórico git):

```bash
git archive HEAD | ssh -p 22022 root@IP "tar -x -C /opt/pinasystem"
scp -P 22022 .env root@IP:/opt/pinasystem/.env
ssh -p 22022 root@IP "chown -R deploy:deploy /opt/pinasystem && chmod 600 /opt/pinasystem/.env"
```

No `.env` de produção, além do que está no exemplo, use **`SEED_DEMO="false"`**: sem isso o seed cria um empreendimento, imóvel e contrato de exemplo.

Gere o segredo com: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

## 7.5 Primeira instalação

```bash
cd /opt/pinasystem
npm ci
set -a; . ./.env; set +a      # o Prisma e o build leem as variáveis do .env
npx prisma migrate deploy     # cria as tabelas
npm run db:seed               # cria o administrador do .env, categorias, configurações e modelos de contrato
NODE_OPTIONS=--max-old-space-size=1536 npm run build

sudo cp deploy/pinasystem.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pinasystem

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile   # edite o domínio dentro dele
sudo systemctl reload caddy
```

O serviço (`deploy/pinasystem.service`) já vem isolado (sem privilégios, sistema de arquivos somente leitura, só escreve em `/opt/pinasystem` e `/var/lib/pinasystem`) e escuta apenas em `127.0.0.1:3000`; quem atende a internet é o Caddy. Confira a nota de exposição com `systemd-analyze security pinasystem` (esperado: abaixo de 3, "OK").

Acesse `https://sistema.seudominio.com.br` e troque a senha do admin em **Meu perfil**.

> **`npm ci` falhou com "Missing: @emnapi/... from lock file"?** O npm do servidor é mais antigo que o de quem gerou o lockfile. Instale a mesma versão: `npm i -g npm@$(versão local)`.

### Sem domínio ainda (HTTPS direto no IP)

Dá para ter HTTPS sem domínio: a Let's Encrypt emite certificado para o próprio endereço IP (validade curta, 6 dias; o Caddy renova sozinho a cada ~2 dias). Use o bloco "SEM DOMÍNIO" do `deploy/Caddyfile` e, no `.env`, `BETTER_AUTH_URL="https://SEU-IP"`; depois `sudo systemctl reload caddy && sudo systemctl restart pinasystem`. O HTTP (porta 80) passa a só redirecionar para HTTPS. **Nunca deixe o sistema em HTTP**: a senha e o cookie de sessão trafegariam em texto puro.

A renovação depende da **porta 80 aberta** e do Caddy rodando. Para conferir: `journalctl -u caddy | grep -i "certificate obtained"`. Se a renovação falhar por mais de ~4 dias, o navegador passa a mostrar erro de certificado; por isso o ideal é registrar um domínio, que usa certificado comum de 90 dias.

Quando tiver domínio: crie o registro A para o IP, troque o endereço do site no Caddyfile pelo domínio e apague o bloco `tls`, ajuste `BETTER_AUTH_URL` para `https://dominio` e rode `sudo systemctl reload caddy && sudo systemctl restart pinasystem`. O Caddy emite o certificado normal sozinho.

Confirme que a porta 3000 não responde por fora (`curl http://IP:3000` deve falhar).

### Criar os outros usuários

```bash
npm run usuario:criar -- "Nome Completo" pessoa@exemplo.com.br admin
```

O comando imprime uma senha temporária. Papéis: `admin`, `gerente`, `operador`, `site`.

## 7.6 Atualizar o sistema (rotina de deploy)

```bash
ssh deploy@IP
/opt/pinasystem/deploy/deploy.sh
```

O script faz `git pull`, `npm ci`, migrações, build e reinicia o serviço, então exige que `/opt/pinasystem` seja um clone git com acesso ao repositório (no GitHub privado, use uma *deploy key* só de leitura). Se o código foi enviado com `git archive` (7.4), repita o envio e rode `npm ci`, `npx prisma migrate deploy`, o build e `sudo systemctl restart pinasystem` à mão. Ver logs: `journalctl -u pinasystem -f`.

## 7.7 Backups

`deploy/backup.sh` gera o dump do banco e um `.tar.gz` das fotos/documentos e apaga o que tem mais de 30 dias:

```bash
sudo cp /opt/pinasystem/deploy/backup.sh /usr/local/bin/pina-backup.sh && sudo chmod 755 /usr/local/bin/pina-backup.sh
# todo dia às 03:30, como usuário deploy:
echo '30 3 * * * deploy /usr/local/bin/pina-backup.sh >> /var/log/pina-backup.log 2>&1' | sudo tee /etc/cron.d/pinasystem-backup
sudo touch /var/log/pina-backup.log && sudo chown deploy /var/log/pina-backup.log

# teste na hora:
sudo -u deploy /usr/local/bin/pina-backup.sh && ls -la /var/backups/pinasystem
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
- [ ] `EMBEDDED_POSTGRES="false"` e `SEED_DEMO="false"`
- [ ] Swap criado (servidores de 2 GB de RAM)
- [ ] Postgres escutando só em localhost; firewall só com SSH, 80 e 443 (a 3000 bloqueada por fora e o serviço ouvindo só em 127.0.0.1)
- [ ] Login por senha do root desativado no SSH (só chave), sem X11
- [ ] HTTPS ativo (Caddy) e o HTTP só redirecionando; `BETTER_AUTH_URL` em `https://`
- [ ] `systemd-analyze security pinasystem` abaixo de 3
- [ ] Backups legíveis só pelo usuário `deploy` (`/var/backups/pinasystem` em 700, arquivos em 600)
- [ ] Backup diário rodando **e restauração testada**
- [ ] Cópia externa dos backups configurada
- [ ] Monitoramento de disponibilidade (UptimeRobot ou Uptime Kuma)
- [ ] Senhas temporárias dos usuários trocadas no primeiro acesso
- [ ] `unattended-upgrades` e `fail2ban` ativos

Mais sobre proteções, riscos aceitos e a rotina de segurança: [Segurança](08-seguranca.md).
