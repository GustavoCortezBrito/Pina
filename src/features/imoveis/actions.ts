"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { nullIfEmpty } from "@/lib/form";
import { requireAdmin, requireUser } from "@/lib/session";
import { today } from "@/lib/dates";
import { imovelSchema, statusImovelSchema, type ImovelInput } from "./schemas";

function paraBanco(dados: ImovelInput) {
  return {
    codigo: dados.codigo.toUpperCase(),
    titulo: dados.titulo,
    tipo: dados.tipo,
    status: dados.status,
    empreendimentoId: dados.empreendimentoId,
    proprietarioId: dados.proprietarioId,
    descricao: nullIfEmpty(dados.descricao),
    cep: nullIfEmpty(dados.cep),
    logradouro: nullIfEmpty(dados.logradouro),
    numero: nullIfEmpty(dados.numero),
    complemento: nullIfEmpty(dados.complemento),
    bairro: nullIfEmpty(dados.bairro),
    cidade: dados.cidade || "Barretos",
    uf: (dados.uf || "SP").toUpperCase(),
    quartos: dados.quartos,
    suites: dados.suites,
    banheiros: dados.banheiros,
    vagas: dados.vagas,
    areaM2: dados.areaM2,
    mobilia: dados.mobilia,
    aceitaPet: dados.aceitaPet,
    caracteristicas: dados.caracteristicas,
    valorAluguel: dados.valorAluguel,
    valorCondominio: dados.valorCondominio,
    valorIptuAnual: dados.valorIptuAnual,
    matricula: nullIfEmpty(dados.matricula),
    inscricaoIptu: nullIfEmpty(dados.inscricaoIptu),
    instalacaoAgua: nullIfEmpty(dados.instalacaoAgua),
    instalacaoEnergia: nullIfEmpty(dados.instalacaoEnergia),
    observacoes: nullIfEmpty(dados.observacoes),
  };
}

async function garantirCodigoLivre(codigo: string, ignorarId?: string) {
  const existente = await db.imovel.findUnique({ where: { codigo: codigo.toUpperCase() } });
  if (existente && existente.id !== ignorarId) {
    throw new AppError(`Já existe um imóvel com o código ${codigo.toUpperCase()}.`);
  }
}

export async function criarImovel(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = imovelSchema.parse(input);
      await garantirCodigoLivre(dados.codigo);

      const imovel = await db.imovel.create({ data: paraBanco(dados) });
      await audit({ usuarioId: user.id, acao: "CREATE", entidade: "Imovel", entidadeId: imovel.id });
      return { id: imovel.id };
    },
    { message: "Imóvel cadastrado." },
  );
}

export async function atualizarImovel(id: string, input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = imovelSchema.parse(input);
      await garantirCodigoLivre(dados.codigo, id);

      const temContratoAtivo = await db.contrato.findFirst({
        where: { imovelId: id, status: "ATIVO" },
        select: { id: true },
      });
      if (temContratoAtivo && dados.status !== "ALUGADO") {
        throw new AppError("O imóvel tem contrato ativo; o status precisa continuar como Alugado.");
      }

      await db.imovel.update({ where: { id }, data: paraBanco(dados) });
      await audit({ usuarioId: user.id, acao: "UPDATE", entidade: "Imovel", entidadeId: id });
      return { id };
    },
    { message: "Imóvel atualizado." },
  );
}

export async function alterarStatusImovel(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const { id, status } = statusImovelSchema.parse(input);

      const contratoAtivo = await db.contrato.findFirst({
        where: { imovelId: id, status: "ATIVO" },
        select: { numero: true },
      });
      if (contratoAtivo && status !== "ALUGADO") {
        throw new AppError(
          `O imóvel tem o contrato nº ${contratoAtivo.numero} ativo. Encerre o contrato antes de mudar o status.`,
        );
      }

      await db.imovel.update({ where: { id }, data: { status } });
      await audit({ usuarioId: user.id, acao: "UPDATE_STATUS", entidade: "Imovel", entidadeId: id, dados: { status } });
    },
    { message: "Status atualizado." },
  );
}

export async function excluirImovel(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const imovelId = z.string().min(1).parse(id);

      const contratos = await db.contrato.count({ where: { imovelId } });
      if (contratos > 0) {
        throw new AppError(
          "Este imóvel tem contratos registrados e não pode ser excluído. Use o status Inativo para tirá-lo da lista.",
        );
      }

      await db.imovel.update({ where: { id: imovelId }, data: { deletadoEm: today(), status: "INATIVO" } });
      await audit({ usuarioId: user.id, acao: "DELETE", entidade: "Imovel", entidadeId: imovelId });
    },
    { message: "Imóvel excluído." },
  );
}
