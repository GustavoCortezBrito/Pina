"use server";

import { z } from "zod";
import { StatusManutencao } from "@/generated/prisma/enums";
import { runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { nullIfEmpty } from "@/lib/form";
import { requireAdmin, requireUser } from "@/lib/session";
import { manutencaoSchema } from "./schemas";

export async function criarManutencao(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const dados = manutencaoSchema.parse(input);
      const manutencao = await db.manutencao.create({
        data: {
          imovelId: dados.imovelId,
          titulo: dados.titulo,
          descricao: nullIfEmpty(dados.descricao),
          prioridade: dados.prioridade,
        },
      });
      await audit({ usuarioId: user.id, acao: "CREATE", entidade: "Manutencao", entidadeId: manutencao.id });
      return { id: manutencao.id };
    },
    { message: "Manutenção registrada." },
  );
}

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(StatusManutencao) });

export async function alterarStatusManutencao(input: unknown) {
  return runAction(
    async () => {
      const user = await requireUser();
      const { id, status } = statusSchema.parse(input);
      await db.manutencao.update({
        where: { id },
        data: { status, concluidaEm: status === "CONCLUIDA" ? new Date() : null },
      });
      await audit({ usuarioId: user.id, acao: "UPDATE_STATUS", entidade: "Manutencao", entidadeId: id, dados: { status } });
    },
    { message: "Status atualizado." },
  );
}

export async function excluirManutencao(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const manutencaoId = z.string().min(1).parse(id);
      const despesas = await db.despesa.count({ where: { manutencaoId } });
      if (despesas > 0) throw new AppError("Esta manutenção tem despesas vinculadas e não pode ser excluída.");

      await db.manutencao.delete({ where: { id: manutencaoId } });
      await audit({ usuarioId: user.id, acao: "DELETE", entidade: "Manutencao", entidadeId: manutencaoId });
    },
    { message: "Manutenção excluída." },
  );
}
