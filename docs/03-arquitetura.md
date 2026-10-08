# 3. Arquitetura

## 3.1 Decisão de stack

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Framework | **Next.js (App Router), versão estável atual** + **TypeScript** | Front e back no mesmo projeto: um repositório, um deploy e tipos compartilhados |
| UI | **React** + **Tailwind CSS v4** + **shadcn/ui** (Radix) | Componentes acessíveis e prontos (tabela, dialog, form, calendário) que ficam no próprio código |
| Formulários | **React Hook Form** + **Zod** | O mesmo schema valida no cliente e no servidor |
| Tabelas | **TanStack Table** | Ordenação, filtros e paginação server-side |
| Backend | **Node.js** no próprio Next.js: *Server Actions* para mutações e *Route Handlers* (`app/api/...`) para upload, download e PDF | Dispensa um serviço separado; o volume do sistema é pequeno |
| Banco | **PostgreSQL 16+** | Robusto, gratuito e fácil de fazer backup |
| ORM | **Prisma** | Migrations versionadas, tipagem forte e Prisma Studio para inspecionar dados |
| Autenticação | **Auth.js (NextAuth)** com Credentials e sessão JWT, ou **Better Auth** | Login por e-mail e senha, sem dependência externa |
| Arquivos | **Disco local da VPS** (volume Docker) por trás de uma interface `StorageProvider`; adaptador **S3/MinIO** opcional | Simples e barato, e troca de provedor sem mexer nas telas |
| Imagens | **sharp** | Converte para WebP, redimensiona e gera miniaturas; corrige rotação EXIF (fotos de celular) |
| PDF | **@react-pdf/renderer** | Contratos e recibos gerados no servidor com componentes React |
| Datas | **date-fns** + **@date-fns/tz** | Cálculo de vencimentos e formatação pt-BR |
| Gráficos | **Recharts** | Integra bem com shadcn/ui (`chart`) |
| Testes | **Vitest** (regras de negócio) + **Playwright** (fluxos principais) | Os cálculos financeiros **precisam** de testes |
| Qualidade | ESLint + Prettier + Husky/lint-staged | Padroniza o código |
| Infra | **Docker Compose** + **Caddy** (HTTPS automático) na VPS | Deploy reproduzível |

### Por que não Python no backend?

Seria possível (FastAPI + SQLAlchemy), mas isso cria **dois projetos, dois deploys e tipos duplicados**. Para um sistema interno com poucos usuários, o Next.js cobre o backend com folga. Se no futuro surgir uma necessidade específica (ex.: OCR de documentos ou automações pesadas), dá para criar um microserviço Python à parte.

### Supabase ou PostgreSQL próprio?

| Critério | Supabase Cloud | Supabase self-hosted | **PostgreSQL + Prisma (escolhido)** |
|----------|----------------|----------------------|-------------------------------------|
| Custo | Grátis com limites (projeto pausa por inatividade); pago a partir de ~US$ 25/mês | Grátis, mas são cerca de 10 containers | Grátis, 1 container |
| Recursos de VPS | Nenhum | Altos (RAM) | Baixos |
| Auth e Storage prontos | Sim | Sim | Via Auth.js + disco local |
| Migração para a VPS | Exige exportar e adaptar | Já está lá | Já está lá |
| Dependência de fornecedor | Média | Baixa | Nenhuma |

**Decisão:** usar **PostgreSQL puro com Prisma**. Como o destino final é uma VPS, isso evita retrabalho e mantém o ambiente leve. Como tudo passa pelo Prisma e pela interface `StorageProvider`, ainda é possível apontar para um Postgres do Supabase (ou outro gerenciado) só trocando a `DATABASE_URL`.

## 3.2 Visão da arquitetura

```mermaid
flowchart LR
    U[Navegador / Celular] -- HTTPS --> C[Caddy<br/>proxy reverso]
    C --> N[Next.js app<br/>React SSR + Server Actions + API]
    N -- Prisma --> P[(PostgreSQL)]
    N -- fs --> F[/Volume de arquivos<br/>fotos, docs, PDFs/]
    B[Container de backup<br/>cron] --> P
    B --> F
    B -- rclone --> R[(Armazenamento externo<br/>Backblaze B2 / Google Drive)]
```

## 3.3 Estrutura de pastas

```
pinasystem/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                  # usa ImovelExemplo/ para popular fotos
├── public/
│   └── logo.svg                 # a partir de PinaLogo/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (app)/               # rotas protegidas (layout com sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                     # dashboard
│   │   │   ├── imoveis/
│   │   │   │   ├── page.tsx                 # lista
│   │   │   │   ├── novo/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx             # detalhes (abas)
│   │   │   │       └── editar/page.tsx
│   │   │   ├── empreendimentos/
│   │   │   ├── pessoas/
│   │   │   ├── contratos/
│   │   │   ├── financeiro/
│   │   │   │   ├── cobrancas/
│   │   │   │   └── despesas/
│   │   │   ├── manutencoes/
│   │   │   ├── relatorios/
│   │   │   └── configuracoes/
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── upload/route.ts
│   │       ├── arquivos/[...path]/route.ts  # serve arquivo com checagem de sessão
│   │       └── pdf/
│   │           ├── contrato/[id]/route.ts
│   │           └── recibo/[id]/route.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── layout/              # sidebar, header, breadcrumbs
│   │   └── shared/              # DataTable, MoneyInput, CpfInput, PhotoUploader...
│   ├── features/                # organização por domínio
│   │   ├── imoveis/
│   │   │   ├── actions.ts       # server actions
│   │   │   ├── queries.ts       # leituras no banco
│   │   │   ├── schemas.ts       # zod
│   │   │   └── components/
│   │   ├── pessoas/
│   │   ├── contratos/
│   │   │   └── services/
│   │   │       ├── gerar-cobrancas.ts
│   │   │       ├── reajuste.ts
│   │   │       └── rescisao.ts
│   │   └── financeiro/
│   │       └── services/calculo-encargos.ts
│   ├── lib/
│   │   ├── db.ts                # singleton do Prisma
│   │   ├── auth.ts
│   │   ├── storage/             # StorageProvider (local | s3)
│   │   ├── pdf/                 # templates react-pdf
│   │   ├── format.ts            # moeda, data, CPF
│   │   ├── validators.ts        # CPF, CNPJ
│   │   └── permissions.ts
│   └── middleware.ts            # redireciona quem não está logado
├── tests/
│   ├── unit/
│   └── e2e/
├── docker/
│   ├── Dockerfile
│   ├── Caddyfile
│   └── backup.sh
├── docker-compose.yml           # produção
├── docker-compose.dev.yml       # apenas Postgres para dev
├── .env.example
└── docs/
```

## 3.4 Padrões de implementação

### Camadas

- **Página (Server Component)**: busca dados via `queries.ts` e renderiza.
- **Componente cliente**: formulários e interações; chama *Server Actions*.
- **Server Action**: `auth()` → checa a permissão → `schema.parse()` → chama o *service* → `revalidatePath()`.
- **Service**: regra de negócio pura e testável, sem depender do Next.

### Exemplo de Server Action

```ts
// src/features/imoveis/actions.ts
"use server";

export async function criarImovel(input: unknown) {
  const user = await requireUser();          // lança erro se não logado
  const data = imovelSchema.parse(input);    // Zod
  const imovel = await db.imovel.create({ data: { ...data, criadoPorId: user.id } });
  revalidatePath("/imoveis");
  return { ok: true, id: imovel.id };
}
```

### Upload de fotos

1. O cliente envia `multipart/form-data` para `POST /api/upload` com `entidade` e `entidadeId`.
2. O servidor valida a sessão, o tipo MIME real (magic bytes) e o tamanho.
3. O **sharp** gera `original.webp` (máx. 2000px) e `thumb.webp` (400px) e remove metadados EXIF, incluindo GPS.
4. `StorageProvider.save()` grava em `/data/uploads/imoveis/{imovelId}/{uuid}.webp`.
5. É criado um registro em `Arquivo` com caminho, tamanho, mime e ordem.
6. Arquivos são servidos só por `GET /api/arquivos/...`, com checagem de sessão. **Nunca** ficam em `public/`.

### Dinheiro e datas

- Banco: `Decimal(12,2)`. No código: `Prisma.Decimal` ou centavos inteiros nos cálculos.
- Datas de vencimento e competência usam o tipo `@db.Date` (sem hora).
- Toda exibição passa por `formatCurrency()` e `formatDate()` em `lib/format.ts`.

## 3.5 Convenções

- **Idioma**: o domínio fica em **português** (`Imovel`, `Contrato`, `Cobranca`) para bater com a linguagem do cliente; termos técnicos ficam em inglês (`actions`, `queries`, `schemas`).
- **Git**: branch `main` protegida, branches `feat/...`, `fix/...` e *Conventional Commits* (`feat: cadastro de imóveis`).
- **Variáveis de ambiente** (`.env.example`):

```env
DATABASE_URL="postgresql://pina:pina@localhost:5432/pinasystem"
AUTH_SECRET="gerar com: npx auth secret"
AUTH_URL="http://localhost:3000"
STORAGE_DRIVER="local"            # local | s3
STORAGE_LOCAL_PATH="./data/uploads"
# S3_ENDPOINT= S3_BUCKET= S3_ACCESS_KEY= S3_SECRET_KEY=
APP_TIMEZONE="America/Sao_Paulo"
```
