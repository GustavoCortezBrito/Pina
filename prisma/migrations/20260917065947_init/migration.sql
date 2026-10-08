-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('CASA', 'APARTAMENTO', 'KITNET', 'SALA_COMERCIAL', 'GALPAO', 'TERRENO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('DISPONIVEL', 'ALUGADO', 'RESERVADO', 'EM_REFORMA', 'INATIVO');

-- CreateEnum
CREATE TYPE "Mobilia" AS ENUM ('NAO', 'SEMI', 'SIM');

-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "PapelPessoa" AS ENUM ('INQUILINO', 'FIADOR', 'PROPRIETARIO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTEIRO', 'CASADO', 'UNIAO_ESTAVEL', 'DIVORCIADO', 'SEPARADO', 'VIUVO');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('RASCUNHO', 'ATIVO', 'ENCERRADO', 'RESCINDIDO', 'RENOVADO');

-- CreateEnum
CREATE TYPE "TipoGarantia" AS ENUM ('SEM_GARANTIA', 'FIADOR', 'CAUCAO', 'SEGURO_FIANCA', 'TITULO_CAPITALIZACAO');

-- CreateEnum
CREATE TYPE "IndiceReajuste" AS ENUM ('IGPM', 'IPCA', 'INPC', 'IVAR', 'FIXO', 'NENHUM');

-- CreateEnum
CREATE TYPE "Finalidade" AS ENUM ('RESIDENCIAL', 'COMERCIAL');

-- CreateEnum
CREATE TYPE "PapelContrato" AS ENUM ('LOCATARIO', 'FIADOR');

-- CreateEnum
CREATE TYPE "TipoCobranca" AS ENUM ('ALUGUEL', 'MULTA_RESCISORIA');

-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'PAGO_PARCIAL', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'TRANSFERENCIA', 'BOLETO', 'CARTAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusManutencao" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TipoVistoria" AS ENUM ('ENTRADA', 'SAIDA', 'PERIODICA');

-- CreateEnum
CREATE TYPE "CategoriaArquivo" AS ENUM ('FOTO', 'DOCUMENTO', 'CONTRATO_ASSINADO', 'COMPROVANTE', 'VISTORIA', 'OUTRO');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT DEFAULT 'operador',
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empreendimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'Barretos',
    "uf" TEXT NOT NULL DEFAULT 'SP',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoImovel" NOT NULL,
    "status" "StatusImovel" NOT NULL DEFAULT 'DISPONIVEL',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "empreendimentoId" TEXT,
    "proprietarioId" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL DEFAULT 'Barretos',
    "uf" TEXT NOT NULL DEFAULT 'SP',
    "quartos" INTEGER NOT NULL DEFAULT 0,
    "suites" INTEGER NOT NULL DEFAULT 0,
    "banheiros" INTEGER NOT NULL DEFAULT 0,
    "vagas" INTEGER NOT NULL DEFAULT 0,
    "areaM2" DOUBLE PRECISION,
    "mobilia" "Mobilia" NOT NULL DEFAULT 'NAO',
    "aceitaPet" BOOLEAN NOT NULL DEFAULT false,
    "caracteristicas" TEXT[],
    "valorAluguel" INTEGER,
    "valorCondominio" INTEGER,
    "valorIptuAnual" INTEGER,
    "matricula" TEXT,
    "inscricaoIptu" TEXT,
    "instalacaoAgua" TEXT,
    "instalacaoEnergia" TEXT,
    "observacoes" TEXT,
    "deletadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPessoa" NOT NULL DEFAULT 'PF',
    "papeis" "PapelPessoa"[],
    "nome" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "documento" TEXT NOT NULL,
    "rg" TEXT,
    "orgaoEmissor" TEXT,
    "dataNascimento" DATE,
    "estadoCivil" "EstadoCivil",
    "profissao" TEXT,
    "rendaMensal" INTEGER,
    "nacionalidade" TEXT DEFAULT 'brasileira',
    "email" TEXT,
    "telefone1" TEXT,
    "telefone1Whats" BOOLEAN NOT NULL DEFAULT true,
    "telefone2" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "conjugeNome" TEXT,
    "conjugeDocumento" TEXT,
    "representanteNome" TEXT,
    "representanteDocumento" TEXT,
    "observacoes" TEXT,
    "deletadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "status" "StatusContrato" NOT NULL DEFAULT 'RASCUNHO',
    "finalidade" "Finalidade" NOT NULL DEFAULT 'RESIDENCIAL',
    "imovelId" TEXT NOT NULL,
    "dataInicio" DATE NOT NULL,
    "prazoMeses" INTEGER NOT NULL DEFAULT 30,
    "dataFim" DATE NOT NULL,
    "valorAluguel" INTEGER NOT NULL,
    "valorInicial" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "aluguelAntecipado" BOOLEAN NOT NULL DEFAULT false,
    "indiceReajuste" "IndiceReajuste" NOT NULL DEFAULT 'IGPM',
    "percMulta" DECIMAL(7,4) NOT NULL DEFAULT 10,
    "percJurosMes" DECIMAL(7,4) NOT NULL DEFAULT 1,
    "multaRescisoriaMeses" INTEGER NOT NULL DEFAULT 3,
    "garantia" "TipoGarantia" NOT NULL DEFAULT 'SEM_GARANTIA',
    "caucaoValor" INTEGER,
    "seguradora" TEXT,
    "apolice" TEXT,
    "garantiaObs" TEXT,
    "dataEncerramento" DATE,
    "motivoEncerramento" TEXT,
    "valorMultaRescisoria" INTEGER,
    "contratoAnteriorId" TEXT,
    "modeloId" TEXT,
    "observacoes" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoParte" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "papel" "PapelContrato" NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContratoParte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoEncargo" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "ContratoEncargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reajuste" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "dataAplicacao" DATE NOT NULL,
    "competenciaInicio" DATE NOT NULL,
    "indice" "IndiceReajuste" NOT NULL,
    "percentual" DECIMAL(7,4) NOT NULL,
    "valorAnterior" INTEGER NOT NULL,
    "valorNovo" INTEGER NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reajuste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobranca" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "tipo" "TipoCobranca" NOT NULL DEFAULT 'ALUGUEL',
    "competencia" DATE NOT NULL,
    "periodoInicio" DATE NOT NULL,
    "periodoFim" DATE NOT NULL,
    "vencimento" DATE NOT NULL,
    "valorAluguel" INTEGER NOT NULL,
    "valorEncargos" INTEGER NOT NULL DEFAULT 0,
    "desconto" INTEGER NOT NULL DEFAULT 0,
    "valorTotal" INTEGER NOT NULL,
    "proporcional" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "cobrancaId" TEXT NOT NULL,
    "dataPagamento" DATE NOT NULL,
    "valorPrincipal" INTEGER NOT NULL,
    "valorMulta" INTEGER NOT NULL DEFAULT 0,
    "valorJuros" INTEGER NOT NULL DEFAULT 0,
    "valorDesconto" INTEGER NOT NULL DEFAULT 0,
    "valorPago" INTEGER NOT NULL,
    "forma" "FormaPagamento" NOT NULL,
    "observacao" TEXT,
    "motivoAjuste" TEXT,
    "estornoDeId" TEXT,
    "registradoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaDespesa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CategoriaDespesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT,
    "categoriaId" TEXT NOT NULL,
    "manutencaoId" TEXT,
    "data" DATE NOT NULL,
    "valor" INTEGER NOT NULL,
    "fornecedor" TEXT,
    "descricao" TEXT,
    "pago" BOOLEAN NOT NULL DEFAULT true,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusManutencao" NOT NULL DEFAULT 'ABERTA',
    "abertaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vistoria" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "tipo" "TipoVistoria" NOT NULL,
    "data" DATE NOT NULL,
    "responsavel" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "categoria" "CategoriaArquivo" NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "caminhoThumb" TEXT,
    "mime" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "largura" INTEGER,
    "altura" INTEGER,
    "legenda" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "capa" BOOLEAN NOT NULL DEFAULT false,
    "imovelId" TEXT,
    "pessoaId" TEXT,
    "contratoId" TEXT,
    "pagamentoId" TEXT,
    "despesaId" TEXT,
    "manutencaoId" TEXT,
    "vistoriaId" TEXT,
    "enviadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModeloContrato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "finalidade" "Finalidade" NOT NULL DEFAULT 'RESIDENCIAL',
    "conteudo" TEXT NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeloContrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "chave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_codigo_key" ON "Imovel"("codigo");

-- CreateIndex
CREATE INDEX "Imovel_status_idx" ON "Imovel"("status");

-- CreateIndex
CREATE INDEX "Imovel_tipo_idx" ON "Imovel"("tipo");

-- CreateIndex
CREATE INDEX "Imovel_empreendimentoId_idx" ON "Imovel"("empreendimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_documento_key" ON "Pessoa"("documento");

-- CreateIndex
CREATE INDEX "Pessoa_nome_idx" ON "Pessoa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_numero_key" ON "Contrato"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_contratoAnteriorId_key" ON "Contrato"("contratoAnteriorId");

-- CreateIndex
CREATE INDEX "Contrato_status_idx" ON "Contrato"("status");

-- CreateIndex
CREATE INDEX "Contrato_imovelId_idx" ON "Contrato"("imovelId");

-- CreateIndex
CREATE INDEX "Contrato_dataFim_idx" ON "Contrato"("dataFim");

-- CreateIndex
CREATE INDEX "ContratoParte_pessoaId_idx" ON "ContratoParte"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoParte_contratoId_pessoaId_papel_key" ON "ContratoParte"("contratoId", "pessoaId", "papel");

-- CreateIndex
CREATE INDEX "Cobranca_vencimento_status_idx" ON "Cobranca"("vencimento", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Cobranca_contratoId_competencia_tipo_key" ON "Cobranca"("contratoId", "competencia", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_estornoDeId_key" ON "Pagamento"("estornoDeId");

-- CreateIndex
CREATE INDEX "Pagamento_dataPagamento_idx" ON "Pagamento"("dataPagamento");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaDespesa_nome_key" ON "CategoriaDespesa"("nome");

-- CreateIndex
CREATE INDEX "Despesa_imovelId_data_idx" ON "Despesa"("imovelId", "data");

-- CreateIndex
CREATE INDEX "Despesa_data_idx" ON "Despesa"("data");

-- CreateIndex
CREATE INDEX "Manutencao_status_idx" ON "Manutencao"("status");

-- CreateIndex
CREATE INDEX "Arquivo_imovelId_categoria_ordem_idx" ON "Arquivo"("imovelId", "categoria", "ordem");

-- CreateIndex
CREATE INDEX "Arquivo_pessoaId_idx" ON "Arquivo"("pessoaId");

-- CreateIndex
CREATE INDEX "Arquivo_contratoId_idx" ON "Arquivo"("contratoId");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "AuditLog_criadoEm_idx" ON "AuditLog"("criadoEm");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_contratoAnteriorId_fkey" FOREIGN KEY ("contratoAnteriorId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ModeloContrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoParte" ADD CONSTRAINT "ContratoParte_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoParte" ADD CONSTRAINT "ContratoParte_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoEncargo" ADD CONSTRAINT "ContratoEncargo_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reajuste" ADD CONSTRAINT "Reajuste_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_estornoDeId_fkey" FOREIGN KEY ("estornoDeId") REFERENCES "Pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaDespesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "Pagamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
