"use server";

import { z } from "zod";
import { StatusManutencao } from "@/generated/prisma/enums";
import { runAction } from "@/lib/action";
import { audit, diffCampos } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { nullIfEmpty } from "@/lib/form";
import { requireAccess, requireAdmin } from "@/lib/session";
import { storage } from "@/lib/storage";
import { manutencaoSchema } from "./schemas";

export async function criarManutencao(input: unknown) {
  return runAction(
    async () => {
      const user = await requireAccess("manutencoes");
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
      const user = await requireAccess("manutencoes");
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

/** Edita título, prioridade e detalhes. O imóvel não muda (as despesas da manutenção seguem o imóvel dela). */
export async function atualizarManutencao(id: string, input: unknown) {
  return runAction(
    async () => {
      const user = await requireAccess("manutencoes");
      const dados = manutencaoSchema.parse(input);
      const antes = await db.manutencao.findUnique({ where: { id } });
      if (!antes) throw new AppError("Manutenção não encontrada.");

      const novos = {
        titulo: dados.titulo,
        descricao: nullIfEmpty(dados.descricao),
        prioridade: dados.prioridade,
      };
      await db.manutencao.update({ where: { id }, data: novos });
      await audit({
        usuarioId: user.id,
        acao: "UPDATE",
        entidade: "Manutencao",
        entidadeId: id,
        dados: diffCampos(antes, novos),
      });
      return { id };
    },
    { message: "Manutenção atualizada." },
  );
}

/** As despesas vinculadas continuam registradas, só deixam de apontar para a manutenção. */
export async function excluirManutencao(id: string) {
  return runAction(
    async () => {
      const user = await requireAdmin();
      const manutencaoId = z.string().min(1).parse(id);
      const arquivos = await db.arquivo.findMany({
        where: { manutencaoId },
        select: { caminho: true, caminhoThumb: true },
      });

      await db.manutencao.delete({ where: { id: manutencaoId } });
      for (const arquivo of arquivos) {
        await storage.remove(arquivo.caminho).catch(() => undefined);
        if (arquivo.caminhoThumb) await storage.remove(arquivo.caminhoThumb).catch(() => undefined);
      }
      await audit({ usuarioId: user.id, acao: "DELETE", entidade: "Manutencao", entidadeId: manutencaoId });
    },
    { message: "Manutenção excluída." },
  );
}
