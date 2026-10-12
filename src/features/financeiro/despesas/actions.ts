"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit, diffCampos } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { parseISODate } from "@/lib/dates";
import { nullIfEmpty } from "@/lib/form";
import { requireAccess, requireAdmin } from "@/lib/session";
import { despesaSchema } from "./schemas";

/** Despesa ligada a uma manutenção herda o imóvel dela (evita dado inconsistente). */
async function alinharManutencao<T extends z.infer<typeof despesaSchema>>(dados: T): Promise<T> {
  if (!dados.manutencaoId) return dados;
  const manutencao = await db.manutencao.findUnique({
    where: { id: dados.manutencaoId },
    select: { imovelId: true },
  });
  if (!manutencao) throw new AppError("Manutenção não encontrada.");
  return { ...dados, imovelId: manutencao.imovelId };
}

function paraBanco(dados: z.infer<typeof despesaSchema>) {
  return {
    imovelId: dados.imovelId,
    ...(dados.manutencaoId !== undefined ? { manutencaoId: dados.manutencaoId } : {}),
    categoriaId: dados.categoriaId,
    data: parseISODate(dados.data)!,
    valor: dados.valor,
    fornecedor: nullIfEmpty(dados.fornecedor),
    descricao: nullIfEmpty(dados.descricao),
    pago: dados.pago,
  };
}

export async function criarDespesa(input: unknown) {
  return runAction(
    async () => {
      const user = await requireAccess("despesas");
      const dados = await alinharManutencao(despesaSchema.parse(input));
      const despesa = await db.despesa.create({
        data: { ...paraBanco(dados), criadoPorId: user.id },
      });
      await audit({
        usuarioId: user.id,
        acao: "CREATE",
        entidade: "Despesa",
        entidadeId: despesa.id,
      });
      return { id: despesa.id };
    },
    { message: "Despesa registrada." },
  );
}

export async function atualizarDespesa(id: string, input: unknown) {
  return runAction(
    async () => {
      const user = await requireAccess("despesas");
      const dados = await alinharManutencao(despesaSchema.parse(input));
      const antes = await db.despesa.findUnique({ where: { id } });
      const novos = paraBanco(dados);
      await db.despesa.update({ where: { id }, data: novos });
      await audit({
        usuarioId: user.id,
        acao: "UPDATE",
        entidade: "Despesa",
        entidadeId: id,
        dados: antes ? diffCampos(antes, novos) : undefined,
      });
      return { id };
    },
    { message: "Despesa atualizada." },
  );
}

export async function excluirDespesa(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const despesaId = z.string().min(1).parse(id);
      await db.despesa.delete({ where: { id: despesaId } });
      await audit({
        usuarioId: user.id,
        acao: "DELETE",
        entidade: "Despesa",
        entidadeId: despesaId,
      });
    },
    { message: "Despesa excluída." },
  );
}
