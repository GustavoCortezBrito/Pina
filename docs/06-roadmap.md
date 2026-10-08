# 6. Roadmap

As estimativas consideram **um desenvolvedor em meio período**. Cada fase termina com uma entrega utilizável e uma validação com o Rafael.

## Fase 0: Descoberta e setup (≈ 1 semana)
- [ ] Reunião com o Rafael para responder as [dúvidas em aberto](01-visao-geral.md#dúvidas-para-validar-com-o-rafael)
- [ ] Coletar o modelo de contrato atual, a planilha de imóveis e inquilinos e a logo em alta resolução
- [ ] Criar o repositório Git (GitHub privado)
- [ ] `create-next-app` com TypeScript, Tailwind, ESLint e App Router, usando `src/`
- [ ] Instalar shadcn/ui e definir o tema com as cores da logo
- [ ] `docker-compose.dev.yml` com PostgreSQL; Prisma configurado
- [ ] Prettier, Husky e Vitest
- [ ] Layout base: sidebar, header, tema claro e escuro, responsivo

## Fase 1: Fundação (≈ 1 semana)
- [ ] Schema Prisma inicial e primeira migration
- [ ] Auth.js com credenciais, middleware de rotas e tela de login
- [ ] Seed: usuário admin, categorias de despesa, configurações padrão e um imóvel de exemplo com as fotos de `ImovelExemplo/`
- [ ] `StorageProvider` local + `/api/upload` + `/api/arquivos` com sharp
- [ ] Utilitários: formatação de moeda e data, validadores de CPF/CNPJ, máscaras

## Fase 2: Imóveis e pessoas (≈ 2 semanas)
- [ ] CRUD de empreendimentos
- [ ] CRUD de imóveis com wizard, busca por CEP e filtros
- [ ] Galeria de fotos (upload, reordenação, capa, lightbox)
- [ ] Documentos do imóvel
- [ ] CRUD de pessoas (PF/PJ), documentos e link do WhatsApp
- **Entrega:** o Rafael já consegue cadastrar todos os imóveis e inquilinos.

## Fase 3: Contratos (≈ 2 semanas)
- [ ] Wizard de novo contrato
- [ ] Serviço de geração de cobranças, **com testes**
- [ ] Ativar, encerrar e rescindir, com as regras RN-01, RN-02 e RN-09
- [ ] Reajuste com recálculo das cobranças futuras
- [ ] Modelos de contrato com variáveis e PDF do contrato
- [ ] Anexo do contrato assinado
- **Entrega:** contratos vigentes cadastrados no sistema.

## Fase 4: Financeiro e dashboard (≈ 2 semanas)
- [ ] Lista de cobranças e modal de recebimento
- [ ] Cálculo de multa e juros, **com testes**
- [ ] Pagamento parcial e estorno
- [ ] Recibo em PDF e botão de WhatsApp
- [ ] Despesas por imóvel
- [ ] Dashboard (cards e listas de alertas)
- **Entrega: MVP completo.**

## Fase 5: Produção (≈ 1 semana)
- [ ] Dockerfile de produção (`output: "standalone"`)
- [ ] VPS, domínio, Caddy e HTTPS
- [ ] Backups automáticos com teste de restauração
- [ ] Importação dos dados da planilha (script)
- [ ] Treinamento rápido com o Rafael e o pai
- [ ] Monitoramento: Uptime Kuma e logs

## Fase 6: Pós-MVP
- [ ] Relatórios e exportação para Excel
- [ ] Gráfico de receita × despesa
- [ ] Manutenções (chamados)
- [ ] Vistorias com fotos
- [ ] Renovação de contrato
- [ ] Log de auditoria com tela de consulta
- [ ] PWA (instalar no celular)

## Futuro (P3)
- [ ] Boleto/Pix com baixa automática (Asaas, Efí, Inter, Mercado Pago)
- [ ] Lembretes automáticos por WhatsApp (API oficial ou Evolution API) e e-mail
- [ ] Busca automática de IGP-M/IPCA (API SGS do Banco Central)
- [ ] Portal do inquilino (2ª via e recibos)
- [ ] Assinatura digital (ZapSign, Clicksign, D4Sign)
- [ ] Vitrine pública de imóveis disponíveis
- [ ] Informe de rendimentos anual

## Definição de pronto
- Funciona no desktop e no celular
- Validação no cliente e no servidor
- Estados de carregamento, vazio e erro tratados
- Regras de negócio críticas com teste unitário
- Sem erros de lint ou de tipos
- Documentação atualizada, se o modelo de dados mudou
