# 8. Segurança

Este documento resume as proteções do sistema, os riscos conhecidos que foram aceitos e a rotina para manter tudo em dia. O sistema guarda dados pessoais (CPF, endereços, contratos, comprovantes), então a LGPD se aplica.

## 8.1 O que está protegido

### Acesso e senhas
- **HTTPS obrigatório.** O HTTP só redireciona; o cookie de sessão é `Secure`, `HttpOnly` e `SameSite=Lax`; o HSTS está ativo.
- **Cadastro fechado.** Só o administrador cria usuários; não existe "criar conta" público.
- **Senha:** mínimo de 10 caracteres, misturando ao menos duas classes (maiúscula, minúscula, número, símbolo); recusa senhas comuns, repetitivas e as que contêm o e-mail ou o nome. A regra vale na criação, na redefinição e na troca (`src/lib/senha.ts`).
- **Tentativas de login:** limite de 5 por minuto por endereço (o Caddy descarta um `X-Forwarded-For` forjado) **e** trava por conta: 10 erros em 15 minutos bloqueiam a conta por 10 minutos. Quem já entrou por um endereço continua entrando por ele, então um invasor não consegue trancar o dono para fora de propósito (`src/lib/protecao-login.ts`).
- **Histórico:** a 3ª senha errada e o bloqueio aparecem em **Histórico → Falhas de login**.
- **Sessões:** trocar a própria senha encerra as outras sessões; o administrador, ao redefinir a senha de alguém, encerra todas as sessões dessa pessoa; desativar um usuário também.

### Permissões
- Toda ação do servidor e toda rota de API conferem o perfil (administrador, gerente, operador, editor do site) no **servidor**; esconder um botão na tela nunca é a única proteção.
- **Só o administrador exclui.** Única exceção: fotos de imóveis, que quem cuida de imóveis (inclusive o editor do site) pode trocar.
- O operador não vê despesas, relatórios nem histórico (inclusive no gráfico do painel); o editor do site não vê contratos, pessoas nem financeiro.
- O site público só expõe imóveis publicados **e** disponíveis, sem inquilino, proprietário, matrícula, IPTU nem endereço exato.

### Arquivos enviados
- O tipo é identificado **pelo conteúdo**, não pelo nome nem pelo que o navegador informa; HTML, SVG e executáveis são recusados.
- Limites de tamanho (15 MB imagem, 25 MB PDF/documento), de arquivos por envio (20) e de pixels por imagem (80 milhões, contra "imagens-bomba").
- Fotos são reprocessadas (WebP, sem metadados nem GPS). Só imagem e PDF abrem no navegador; Word/Excel sempre baixam.
- Arquivos ficam fora da pasta pública e só saem para quem está logado (exceto as fotos de imóveis publicados no site).
- Os envios conferem a origem do pedido (`src/lib/origem.ts`) além do cookie `SameSite`.

### Navegador
- **CSP com código único por pedido** (`src/lib/csp.ts` e `src/proxy.ts`): só executa script que o próprio servidor entregou; bloqueia incorporação em outros sites (`frame-ancestors 'none'`), plugins e `base`/`form` externos.
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy` reforçados em `next.config.ts`.
- Origens aceitas no login: só o endereço do sistema (`BETTER_AUTH_URL`) e o que estiver em `TRUSTED_ORIGINS`. `localhost` e túneis (ngrok) só no desenvolvimento.
- O parâmetro `next` do login só aceita caminhos do próprio sistema (`src/lib/destino.ts`).

### Servidor
- Firewall fechando tudo menos SSH (porta 22022), 80 e 443; SSH só por chave, sem root por senha, sem X11; `fail2ban` no SSH; atualizações de segurança automáticas.
- PostgreSQL só em `localhost`, com senha forte; o sistema escuta só em `127.0.0.1:3000` e é isolado pelo systemd (nota 2,9 "OK").
- `.env` em 600; backups (dados pessoais) em 700/600, legíveis só pelo usuário `deploy`.

## 8.2 Riscos conhecidos e aceitos

| Risco | Por que foi aceito |
|---|---|
| Chaves SSH da própria HostGator no `authorized_keys` do root (`rundeck`, `br-wizard`, `jump1`...) | São do suporte/automação do provedor, que já tem acesso ao disco da VPS. Remover pode quebrar o console do painel deles. |
| Backup só no próprio servidor | Não protege contra perda da VPS. Ativar o **Backup** da HostGator e/ou copiar para fora (`rclone`). |
| Certificado do IP dura 6 dias | Renova sozinho (porta 80 aberta). Some quando houver domínio. |
| Sem autenticação em dois fatores | Senha forte + trava por conta + HTTPS cobrem o uso atual; vale avaliar se o sistema virar SaaS. |
| `npm audit` ainda lista avisos moderados | Estão em ferramentas de desenvolvimento (`minimatch` no ESLint/shadcn) ou não são alcançáveis (`uuid` dentro do `exceljs`, que só gera v4). Reavaliar a cada atualização. |
| Planilha enviada na importação de despesas pode ser um zip gigante | Só administrador e gerente importam; limite de 5 MB e 500 linhas. |
| Limite de tentativas e trava ficam na memória do processo | Reiniciar o serviço zera os contadores. Aceitável com um processo só. |

## 8.3 Rotina recomendada

- **Trocar as senhas temporárias** no primeiro acesso (Meu perfil). Senhas que passaram por chat ou e-mail devem ser consideradas expostas.
- **Olhar o Histórico → Falhas de login** de vez em quando; várias contas bloqueadas seguidas indicam ataque.
- **Mensal:** `npm audit` e atualizar Next.js, better-auth e Prisma dentro das faixas permitidas; testar e subir.
- **Mensal:** confirmar que o certificado renova (`journalctl -u caddy | grep -i "certificate obtained"`) e que o backup roda (`ls -la /var/backups/pinasystem`).
- **Trimestral:** testar a **restauração** de um backup em outro banco.
- Ao desligar um funcionário: desativar o usuário (encerra as sessões) e, se tinha acesso de administrador, trocar a senha dos demais administradores.

## 8.4 Se algo parecer errado

1. Desative o usuário suspeito (Configurações → Usuários) e redefina a senha dos administradores (isso encerra as sessões abertas).
2. Veja o Histórico (quem fez o quê) e os logs: `journalctl -u pinasystem -n 200` e `journalctl -u caddy -n 200`.
3. Restaure o último backup bom se houver dado alterado: `pg_restore` (passos na seção 7.7).
4. Se houver vazamento de dados pessoais, a LGPD exige avisar os titulares e a ANPD: guarde as evidências antes de mexer.
