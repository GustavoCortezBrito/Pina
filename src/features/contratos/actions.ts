"use server";

import { z } from "zod";
import { calcularDataFim, gerarCobrancas } from "@/features/contratos/services/cobrancas";
import { calcularNovoValor, proximoReajuste, recalcularCobranca } from "@/features/contratos/services/reajuste";
import { calcularMultaRescisoria, isRescisao } from "@/features/contratos/services/rescisao";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { parseISODate, today } from "@/lib/dates";
import { nullIfEmpty } from "@/lib/form";
import { sum } from "@/lib/money";
import { requireAdmin, requireUser } from "@/lib/session";
import { AppError } from "@/lib/errors";
import { getSettings } from "@/lib/settings";
import { contratoSchema } from "./schemas";

export async function criarContrato(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = contratoSchema.parse(input);
      const dataInicio = parseISODate(dados.dataInicio);
      if (!dataInicio) throw new AppError("Data de início inválida.");

      if (dados.garantia === "CAUCAO") {
        if (!dados.caucaoValor) throw new AppError("Informe o valor da caução.");
        if (dados.caucaoValor > dados.valorAluguel * 3) {
          throw new AppError("A caução não pode passar de 3 aluguéis (Lei 8.245/91, art. 38).");
        }
      }
      if (dados.garantia === "FIADOR" && !dados.fiadorId) {
        throw new AppError("Selecione o fiador.");
      }

      const imovel = await db.imovel.findUnique({ where: { id: dados.imovelId } });
      if (!imovel) throw new AppError("Imóvel não encontrado.");

      const ativoExistente = await db.contrato.findFirst({
        where: { imovelId: dados.imovelId, status: "ATIVO" },
        select: { numero: true },
      });
      if (ativoExistente) {
        throw new AppError(`Este imóvel já tem o contrato nº ${ativoExistente.numero} ativo.`);
      }

      const dataFim = calcularDataFim(dataInicio, dados.prazoMeses);
      const encargos = dados.encargos.filter((e) => e.descricao.trim() && e.valor > 0);
      const valorEncargos = sum(encargos.map((e) => e.valor));
      const cobrancasPrevistas = gerarCobrancas({
        dataInicio,
        prazoMeses: dados.prazoMeses,
        diaVencimento: dados.diaVencimento,
        valorAluguel: dados.valorAluguel,
        valorEncargos,
        aluguelAntecipado: dados.aluguelAntecipado,
      });

      const modeloPadrao = await db.modeloContrato.findFirst({
        where: { finalidade: dados.finalidade, padrao: true, ativo: true },
      });

      const contrato = await db.$transaction(async (tx) => {
        const criado = await tx.contrato.create({
          data: {
            status: "ATIVO",
            finalidade: dados.finalidade,
            imovelId: dados.imovelId,
            dataInicio,
            prazoMeses: dados.prazoMeses,
            dataFim,
            valorAluguel: dados.valorAluguel,
            valorInicial: dados.valorAluguel,
            diaVencimento: dados.diaVencimento,
            aluguelAntecipado: dados.aluguelAntecipado,
            indiceReajuste: dados.indiceReajuste,
            garantia: dados.garantia,
            caucaoValor: dados.garantia === "CAUCAO" ? dados.caucaoValor : null,
            seguradora: dados.garantia === "SEGURO_FIANCA" ? nullIfEmpty(dados.seguradora) : null,
            apolice: dados.garantia === "SEGURO_FIANCA" ? nullIfEmpty(dados.apolice) : null,
            modeloId: modeloPadrao?.id,
            observacoes: nullIfEmpty(dados.observacoes),
            criadoPorId: user.id,
            partes: {
              create: [
                { pessoaId: dados.locatarioId, papel: "LOCATARIO", principal: true },
                ...(dados.garantia === "FIADOR" && dados.fiadorId
                  ? [{ pessoaId: dados.fiadorId, papel: "FIADOR" as const, principal: false }]
                  : []),
              ],
            },
            encargos: { create: encargos },
            cobrancas: { create: cobrancasPrevistas },
          },
        });

        await tx.imovel.update({ where: { id: dados.imovelId }, data: { status: "ALUGADO" } });

        return criado;
      });

      await audit({ usuarioId: user.id, acao: "CREATE", entidade: "Contrato", entidadeId: contrato.id });
      return { id: contrato.id };
    },
    { message: "Contrato criado e cobranças geradas." },
  );
}

const reajusteSchema = z.object({
  contratoId: z.string().min(1),
  percentual: z.number().refine((v) => v !== 0, "Informe um percentual diferente de zero."),
  dataAplicacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function aplicarReajuste(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = reajusteSchema.parse(input);
      const dataAplicacao = parseISODate(dados.dataAplicacao);
      if (!dataAplicacao) throw new AppError("Data inválida.");

      const contrato = await db.contrato.findUnique({
        where: { id: dados.contratoId },
        include: { cobrancas: { where: { status: { in: ["PENDENTE"] } } }, reajustes: true },
      });
      if (!contrato) throw new AppError("Contrato não encontrado.");
      if (contrato.status !== "ATIVO") throw new AppError("Só é possível reajustar contratos ativos.");

      const valorNovo = calcularNovoValor(contrato.valorAluguel, dados.percentual);
      const competenciaInicio =
        proximoReajuste({
          dataInicio: contrato.dataInicio,
          dataFim: contrato.dataFim,
          indice: contrato.indiceReajuste,
          reajustesAplicados: contrato.reajustes.length,
        }) ?? dataAplicacao;

      await db.$transaction(async (tx) => {
        await tx.reajuste.create({
          data: {
            contratoId: contrato.id,
            dataAplicacao,
            competenciaInicio,
            indice: contrato.indiceReajuste,
            percentual: dados.percentual,
            valorAnterior: contrato.valorAluguel,
            valorNovo,
          },
        });
        await tx.contrato.update({ where: { id: contrato.id }, data: { valorAluguel: valorNovo } });

        for (const cobranca of contrato.cobrancas) {
          if (cobranca.competencia < competenciaInicio) continue;
          const recalculo = recalcularCobranca(
            {
              periodoInicio: cobranca.periodoInicio,
              periodoFim: cobranca.periodoFim,
              valorEncargos: cobranca.valorEncargos,
              desconto: cobranca.desconto,
            },
            valorNovo,
          );
          await tx.cobranca.update({ where: { id: cobranca.id }, data: recalculo });
        }
      });

      await audit({
        usuarioId: user.id,
        acao: "REAJUSTE",
        entidade: "Contrato",
        entidadeId: contrato.id,
        dados: { percentual: dados.percentual, valorAnterior: contrato.valorAluguel, valorNovo },
      });
      return { valorNovo };
    },
    { message: "Reajuste aplicado." },
  );
}

const encerramentoSchema = z.object({
  contratoId: z.string().min(1),
  dataSaida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motivo: z.string().trim().max(500).optional(),
  statusImovelApos: z.enum(["DISPONIVEL", "EM_REFORMA"]),
});

export async function encerrarContrato(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = encerramentoSchema.parse(input);
      const dataSaida = parseISODate(dados.dataSaida);
      if (!dataSaida) throw new AppError("Data inválida.");

      const contrato = await db.contrato.findUnique({
        where: { id: dados.contratoId },
        include: { cobrancas: true },
      });
      if (!contrato) throw new AppError("Contrato não encontrado.");
      if (contrato.status !== "ATIVO") throw new AppError("Este contrato já não está ativo.");

      const rescisao = isRescisao(dataSaida, contrato.dataFim);
      let valorMulta: number | null = null;

      await db.$transaction(async (tx) => {
        if (rescisao) {
          const resultado = calcularMultaRescisoria({
            valorAluguel: contrato.valorAluguel,
            multaMeses: contrato.multaRescisoriaMeses,
            dataInicio: contrato.dataInicio,
            dataFim: contrato.dataFim,
            dataSaida,
          });
          valorMulta = resultado.multa;
        }

        // Cancela cobranças futuras (competência após a saída) que ainda não foram pagas.
        for (const cobranca of contrato.cobrancas) {
          if (cobranca.competencia > dataSaida && cobranca.status !== "PAGO") {
            await tx.cobranca.update({ where: { id: cobranca.id }, data: { status: "CANCELADO" } });
          }
        }

        if (rescisao && valorMulta && valorMulta > 0) {
          await tx.cobranca.create({
            data: {
              contratoId: contrato.id,
              tipo: "MULTA_RESCISORIA",
              competencia: dataSaida,
              periodoInicio: dataSaida,
              periodoFim: dataSaida,
              vencimento: dataSaida,
              valorAluguel: 0,
              valorEncargos: 0,
              valorTotal: valorMulta,
              status: "PENDENTE",
              observacao: "Multa por rescisão antecipada do contrato.",
            },
          });
        }

        await tx.contrato.update({
          where: { id: contrato.id },
          data: {
            status: rescisao ? "RESCINDIDO" : "ENCERRADO",
            dataEncerramento: dataSaida,
            motivoEncerramento: nullIfEmpty(dados.motivo ?? ""),
            valorMultaRescisoria: valorMulta,
          },
        });

        await tx.imovel.update({ where: { id: contrato.imovelId }, data: { status: dados.statusImovelApos } });
      });

      await audit({
        usuarioId: user.id,
        acao: rescisao ? "RESCISAO" : "ENCERRAMENTO",
        entidade: "Contrato",
        entidadeId: contrato.id,
        dados: { dataSaida: dados.dataSaida, valorMulta },
      });
      return { rescisao, valorMulta };
    },
    { message: "Contrato encerrado." },
  );
}

export async function excluirContratoRascunho(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const contratoId = z.string().min(1).parse(id);
      const contrato = await db.contrato.findUnique({ where: { id: contratoId } });
      if (!contrato) throw new AppError("Contrato não encontrado.");
      if (contrato.status !== "RASCUNHO") throw new AppError("Só é possível excluir contratos em rascunho.");

      await db.contrato.delete({ where: { id: contratoId } });
      await audit({ usuarioId: user.id, acao: "DELETE", entidade: "Contrato", entidadeId: contratoId });
    },
    { message: "Rascunho excluído." },
  );
}

/** Usado pela tela de reajuste para sugerir a data e mostrar se já está em atraso. */
export async function obterSugestaoReajuste(contratoId: string) {
  const contrato = await db.contrato.findUnique({
    where: { id: contratoId },
    include: { reajustes: true },
  });
  if (!contrato) return null;
  const settings = await getSettings();
  const sugestao = proximoReajuste({
    dataInicio: contrato.dataInicio,
    dataFim: contrato.dataFim,
    indice: contrato.indiceReajuste,
    reajustesAplicados: contrato.reajustes.length,
  });
  return {
    dataSugerida: sugestao ?? today(),
    indice: contrato.indiceReajuste,
    percentualPadrao: contrato.indiceReajuste === "FIXO" ? 0 : null,
    indiceLabelPadrao: settings.financeiro.indiceReajuste,
  };
}
