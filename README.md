# PinaSystem

Sistema interno de gestão de locação de imóveis (casas, apartamentos e kitnets) em Barretos-SP e região.

Controla imóveis e suas fotos, inquilinos e fiadores, contratos, cobranças mensais, pagamentos, despesas e vistorias, num único painel web.

## Documentação

| # | Documento | Conteúdo |
|---|-----------|----------|
| 1 | [Visão geral](docs/01-visao-geral.md) | Contexto, objetivos, usuários, escopo e dúvidas em aberto |
| 2 | [Requisitos](docs/02-requisitos.md) | Módulos, funcionalidades, regras de negócio e requisitos não funcionais |
| 3 | [Arquitetura](docs/03-arquitetura.md) | Stack, decisões técnicas, estrutura de pastas e convenções |
| 4 | [Modelo de dados](docs/04-modelo-de-dados.md) | Entidades, relacionamentos e rascunho do schema Prisma |
| 5 | [Telas e fluxos](docs/05-telas-e-fluxos.md) | Mapa de telas e fluxos principais |
| 6 | [Roadmap](docs/06-roadmap.md) | Fases de entrega e checklist |
| 7 | [Deploy na VPS](docs/07-deploy-vps.md) | Node + PostgreSQL + Caddy + systemd (sem Docker), HTTPS e backups |
| 8 | [Segurança](docs/08-seguranca.md) | Proteções, riscos aceitos e rotina de segurança |

## Stack em uma linha

Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui · API no próprio Next.js (Node) · PostgreSQL + Prisma · Better Auth · Node, PostgreSQL e Caddy direto na VPS (sem Docker).

## Pastas de apoio

- `PinaLogo/`: logotipo da marca (usado no layout, nos PDFs e no favicon)
- `ImovelExemplo/`: fotos de um imóvel real, usadas no seed de desenvolvimento

## Como rodar

No desenvolvimento o PostgreSQL é embutido (sem Docker): o `npm run dev` já sobe o banco na porta 5433, com os dados em `~/.pinasystem/postgres`.

```bash
cp .env.example .env          # preencher variáveis
npm install
npm run db:migrate            # cria as tabelas
npm run db:seed               # administrador, modelos de contrato e dados de exemplo (usa ImovelExemplo/)
npm run dev                   # http://localhost:3000
```

A página inicial (`/`) é o **site público** de imóveis; a equipe entra pelo ícone de cadeado no cabeçalho (ou direto em `/login`) e cai no painel, em `/painel`.

Comandos úteis: `npm run db:start | db:stop | db:status`, `npm run usuario:criar -- "Nome" email@x.com admin`, `npm test`, `npm run typecheck`.

Produção: veja [Deploy na VPS](docs/07-deploy-vps.md).
