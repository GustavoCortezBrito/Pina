"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { parseISODate } from "@/lib/dates";
import { nullIfEmpty } from "@/lib/form";
import { requireAdmin, requireUser } from "@/lib/session";
import { despesaSchema } from "./schemas";

function paraBanco(dados: z.infer<typeof despesaSchema>) {
  return {
    imovelId: dados.imovelId,
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
      const user = await requireUser();
      const dados = despesaSchema.parse(input);
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
      const user = await requireUser();
      const dados = despesaSchema.parse(input);
      await db.despesa.update({ where: { id }, data: paraBanco(dados) });
      await audit({ usuarioId: user.id, acao: "UPDATE", entidade: "Despesa", entidadeId: id });
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
