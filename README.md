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
| 7 | [Deploy na VPS](docs/07-deploy-vps.md) | Docker, proxy reverso, HTTPS e backups |

## Stack em uma linha

Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui · API no próprio Next.js (Node) · PostgreSQL + Prisma · Auth.js · Docker Compose na VPS.

## Pastas de apoio

- `PinaLogo/`: logotipo da marca (usado no layout, nos PDFs e no favicon)
- `ImovelExemplo/`: fotos de um imóvel real, usadas no seed de desenvolvimento

## Como rodar (quando o código existir)

```bash
cp .env.example .env          # preencher variáveis
docker compose up -d db       # sobe o PostgreSQL local
npm install
npx prisma migrate dev        # cria as tabelas
npm run db:seed               # dados de exemplo (usa ImovelExemplo/)
npm run dev                   # http://localhost:3000
```
