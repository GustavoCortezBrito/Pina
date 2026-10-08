# 2. Requisitos

Códigos: **RF** = requisito funcional, **RN** = regra de negócio, **RNF** = requisito não funcional.
Prioridade: **P1** = MVP, **P2** = logo após o MVP, **P3** = futuro.

## 2.1 Autenticação e usuários

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-01 | Login com e-mail e senha; sessão persistente com opção "lembrar-me" | P1 |
| RF-02 | Perfis `ADMIN` e `OPERADOR` com permissões diferentes | P1 |
| RF-03 | Admin cria, edita e desativa usuários (sem exclusão física) | P1 |
| RF-04 | Troca de senha pelo próprio usuário; admin pode resetar a senha de outros | P1 |
| RF-05 | Log de auditoria: quem criou, alterou ou excluiu o quê, e quando | P2 |

## 2.2 Imóveis

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-10 | CRUD de **Empreendimentos** (prédio ou condomínio com várias unidades): nome, endereço e observações | P1 |
| RF-11 | CRUD de **Imóveis**: código interno, tipo (casa, apartamento, kitnet, sala comercial, outro), endereço completo com busca por CEP (ViaCEP), unidade/complemento, empreendimento (opcional), quartos, banheiros, vagas, área (m²), mobiliado (sim, não ou semi), aceita pet, descrição | P1 |
| RF-12 | Valores de referência: aluguel sugerido, condomínio, IPTU (anual ou mensal) | P1 |
| RF-13 | Dados legais: matrícula, inscrição do IPTU, nº de instalação de água e de energia | P1 |
| RF-14 | Status: `DISPONIVEL`, `ALUGADO`, `RESERVADO`, `EM_REFORMA`, `INATIVO`. `ALUGADO` é definido automaticamente pelo contrato ativo | P1 |
| RF-15 | **Galeria de fotos**: upload múltiplo com arrastar e soltar, reordenação, definição da foto de capa, legenda, compressão e miniatura automáticas | P1 |
| RF-16 | **Documentos** do imóvel (PDF ou imagem): matrícula, IPTU, contas, laudos etc. | P1 |
| RF-17 | Listagem com filtros (tipo, status, bairro, cidade, empreendimento, faixa de valor) e busca por texto | P1 |
| RF-18 | Página do imóvel com abas: Dados · Fotos · Documentos · Contratos (histórico) · Financeiro · Manutenções | P1 |
| RF-19 | Dono do imóvel (proprietário), para permitir no futuro a administração de imóveis de terceiros | P2 |

## 2.3 Pessoas (clientes)

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-20 | Cadastro único de **Pessoa** (PF ou PJ) com papéis: inquilino, fiador e proprietário (uma pessoa pode ter vários) | P1 |
| RF-21 | PF: nome, CPF, RG, data de nascimento, estado civil, profissão, renda, cônjuge. PJ: razão social, nome fantasia, CNPJ, representante | P1 |
| RF-22 | Contatos: telefones (com marcação de WhatsApp), e-mail e endereço | P1 |
| RF-23 | Documentos anexos (RG, CPF, comprovantes de renda e de residência) | P1 |
| RF-24 | Validação de CPF e CNPJ; bloquear duplicidade | P1 |
| RF-25 | Página da pessoa com contratos vinculados e histórico de pagamentos | P1 |
| RF-26 | Link rápido "abrir no WhatsApp" (`https://wa.me/55...`) | P1 |

## 2.4 Contratos

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-30 | Criar contrato: imóvel, locatário(s), fiador(es), data de início, prazo (meses), valor do aluguel, dia de vencimento, índice de reajuste, garantia e finalidade (residencial ou comercial) | P1 |
| RF-31 | Garantia: `FIADOR`, `CAUCAO` (valor e nº de meses), `SEGURO_FIANCA` (seguradora e apólice), `TITULO_CAPITALIZACAO`, `SEM_GARANTIA` | P1 |
| RF-32 | Encargos adicionais cobrados junto com o aluguel (condomínio, IPTU, água, taxa de lixo), com valor fixo mensal | P1 |
| RF-33 | Ao ativar o contrato, **gerar as cobranças mensais** de todo o período | P1 |
| RF-34 | Status: `RASCUNHO`, `ATIVO`, `ENCERRADO`, `RESCINDIDO`, `RENOVADO` | P1 |
| RF-35 | **Gerar PDF do contrato** a partir de um modelo com variáveis (`{{locatario.nome}}`, `{{imovel.endereco}}` etc.) | P1 |
| RF-36 | Anexar o contrato assinado (PDF escaneado) | P1 |
| RF-37 | **Reajuste**: registrar o percentual aplicado, a data e o novo valor. As cobranças futuras são recalculadas | P1 |
| RF-38 | **Rescisão**: data, motivo, cálculo sugerido da multa proporcional, cancelamento das cobranças futuras | P1 |
| RF-39 | **Renovação**: cria um novo contrato ligado ao anterior | P2 |
| RF-40 | Vistorias de entrada e saída: data, responsável, observações, fotos e PDF | P2 |
| RF-41 | Busca automática do índice acumulado (IGP-M/IPCA) via API do Banco Central (SGS) | P3 |

## 2.5 Financeiro

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-50 | Lista de **cobranças** com filtros: mês, status, imóvel, inquilino | P1 |
| RF-51 | Status: `PENDENTE`, `PAGO`, `PAGO_PARCIAL`, `ATRASADO` (calculado), `CANCELADO` | P1 |
| RF-52 | **Registrar pagamento**: data, valor, forma (Pix, dinheiro, transferência, boleto, outro), comprovante anexo. Permite vários pagamentos parciais | P1 |
| RF-53 | Cálculo automático de multa e juros ao pagar em atraso, com possibilidade de desconto ou ajuste manual justificado | P1 |
| RF-54 | **Recibo em PDF** com logo, dados do locador, locatário, imóvel, competência, valores e forma de pagamento | P1 |
| RF-55 | **Despesas** por imóvel: categoria, data, valor, fornecedor, descrição, comprovante | P1 |
| RF-56 | Lançamentos avulsos (receita extra, reembolso) | P2 |
| RF-57 | Relatórios: receita por período, inadimplência, resultado por imóvel (receita − despesas), exportação em CSV/Excel | P2 |
| RF-58 | Informe anual de rendimentos por inquilino (para o IR) | P3 |
| RF-59 | Boleto/Pix com baixa automática (Asaas, Mercado Pago, Inter, Efí etc.) | P3 |

## 2.6 Manutenções

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-60 | Registrar chamados de manutenção por imóvel: título, descrição, prioridade, status (aberto, em andamento, concluído), fotos | P2 |
| RF-61 | Vincular a despesa gerada ao chamado | P2 |

## 2.7 Dashboard e alertas

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-70 | Cards: total de unidades, ocupadas, vagas, taxa de ocupação, recebido no mês, a receber no mês, em atraso | P1 |
| RF-71 | Listas: cobranças vencidas, vencendo nos próximos 7 dias, contratos vencendo em 60 dias, reajustes nos próximos 30 dias | P1 |
| RF-72 | Gráfico de receita × despesa dos últimos 12 meses | P2 |
| RF-73 | Notificações por e-mail ou WhatsApp (resumo diário para os administradores, lembrete ao inquilino) | P3 |

## 2.8 Configurações

| Código | Requisito | Prior. |
|--------|-----------|--------|
| RF-80 | Dados do locador (nome, CPF/CNPJ, endereço, chave Pix) usados nos PDFs | P1 |
| RF-81 | Parâmetros padrão: % de multa, % de juros ao mês, dia de vencimento, índice de reajuste | P1 |
| RF-82 | Editor de modelos de contrato (texto com variáveis) | P1 |
| RF-83 | Categorias de despesa editáveis | P1 |

---

## Regras de negócio

| Código | Regra |
|--------|-------|
| RN-01 | Um imóvel só pode ter **um contrato `ATIVO`** por vez. |
| RN-02 | Ao ativar um contrato, o imóvel passa para `ALUGADO`. Ao encerrar ou rescindir, volta para `DISPONIVEL`, a não ser que outro status seja escolhido. |
| RN-03 | Cobranças são geradas por **competência** (mês/ano). O vencimento é o `diaVencimento` do mês seguinte à competência ou do próprio mês, conforme a configuração "aluguel antecipado ou vencido". O padrão no Brasil é o **vencido**: paga-se depois de usar. |
| RN-04 | O primeiro e o último mês podem ser **proporcionais** aos dias de ocupação: `valor × dias / dias_do_mês`. |
| RN-05 | Se o vencimento cair em fim de semana ou feriado, a cobrança **não** é considerada atrasada até o próximo dia útil. |
| RN-06 | Atraso: `multa = valor × %multa` (única) e `juros = valor × %juros_mes × dias_atraso / 30` (pró-rata). Os percentuais são configuráveis e o padrão sugerido é **10% de multa e 1% ao mês**, a validar com o cliente. |
| RN-07 | "Atrasado" é um **estado calculado** (`PENDENTE` com vencimento passado) e não é gravado no banco. Assim não é preciso rodar um job para atualizar status. |
| RN-08 | O reajuste é aplicado a cada 12 meses a partir do início do contrato. O sistema **alerta** mas **não aplica sozinho**: o usuário confirma o índice. |
| RN-09 | Multa rescisória sugerida (Lei 8.245/91, art. 4º): `multa_contratual × meses_restantes / prazo_total`. O valor é editável. |
| RN-10 | Caução: no máximo **3 meses** de aluguel (Lei 8.245/91, art. 38). O sistema valida esse limite. |
| RN-11 | Um contrato só pode ter **uma** modalidade de garantia (Lei 8.245/91, art. 37, parágrafo único). |
| RN-12 | Não excluir fisicamente pessoas, imóveis ou contratos que tenham histórico financeiro. Nesses casos, usar inativação (*soft delete*). |
| RN-13 | Valores monetários são armazenados como `Decimal(12,2)`, nunca `float`. |
| RN-14 | Um pagamento é imutável depois de registrado. Para corrigir, faz-se o **estorno** (novo registro negativo), com motivo. |

---

## Requisitos não funcionais

| Código | Requisito |
|--------|-----------|
| RNF-01 | **Responsivo**: funciona bem no celular (o uso em campo é comum). |
| RNF-02 | Interface em **pt-BR**, com datas `dd/MM/yyyy`, moeda `R$ 1.234,56` e fuso `America/Sao_Paulo`. |
| RNF-03 | **Segurança**: HTTPS, senhas com hash (argon2 ou bcrypt), rotas protegidas no servidor, validação com Zod em toda entrada, arquivos servidos só para usuários autenticados, limite de tentativas no login. |
| RNF-04 | **LGPD**: dados pessoais (CPF, RG, renda, documentos) visíveis só para usuários logados, com auditoria de alterações e backups criptografados. |
| RNF-05 | **Backup** diário do banco e dos arquivos, com retenção mínima de 30 dias e cópia fora da VPS. |
| RNF-06 | **Desempenho**: listagens paginadas no servidor; imagens convertidas para WebP com miniaturas. |
| RNF-07 | **Portabilidade**: todo o ambiente sobe com `docker compose up`, e trocar de VPS é só restaurar o backup. |
| RNF-08 | Upload de até **10 MB** por imagem e **20 MB** por PDF; tipos permitidos: jpg, jpeg, png, webp, heic, pdf. |
