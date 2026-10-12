"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit, diffCampos } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { nullIfEmpty } from "@/lib/form";
import { requireAdmin, requireUser } from "@/lib/session";
import { empreendimentoSchema, type EmpreendimentoInput } from "./schemas";

function paraBanco(dados: EmpreendimentoInput) {
  return {
    nome: dados.nome,
    cep: nullIfEmpty(dados.cep),
    logradouro: nullIfEmpty(dados.logradouro),
    numero: nullIfEmpty(dados.numero),
    bairro: nullIfEmpty(dados.bairro),
    cidade: dados.cidade || "Barretos",
    uf: (dados.uf || "SP").toUpperCase(),
    observacoes: nullIfEmpty(dados.observacoes),
  };
}

export async function criarEmpreendimento(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = empreendimentoSchema.parse(input);
      const empreendimento = await db.empreendimento.create({ data: paraBanco(dados) });
      await audit({
        usuarioId: user.id,
        acao: "CREATE",
        entidade: "Empreendimento",
        entidadeId: empreendimento.id,
      });
      return { id: empreendimento.id };
    },
    { message: "Empreendimento cadastrado." },
  );
}

export async function atualizarEmpreendimento(id: string, input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = empreendimentoSchema.parse(input);
      const antes = await db.empreendimento.findUnique({ where: { id } });
      const novos = paraBanco(dados);
      await db.empreendimento.update({ where: { id }, data: novos });
      await audit({
        usuarioId: user.id,
        acao: "UPDATE",
        entidade: "Empreendimento",
        entidadeId: id,
        dados: antes ? diffCampos(antes, novos) : undefined,
      });
      return { id };
    },
    { message: "Empreendimento atualizado." },
  );
}

export async function excluirEmpreendimento(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const empreendimentoId = z.string().min(1).parse(id);

      const unidades = await db.imovel.count({ where: { empreendimentoId, deletadoEm: null } });
      if (unidades > 0) {
        throw new AppError(
          "Este empreendimento tem imóveis vinculados. Remova ou mova as unidades antes.",
        );
      }

      await db.empreendimento.delete({ where: { id: empreendimentoId } });
      await audit({
        usuarioId: user.id,
        acao: "DELETE",
        entidade: "Empreendimento",
        entidadeId: empreendimentoId,
      });
    },
    { message: "Empreendimento excluído." },
  );
}
