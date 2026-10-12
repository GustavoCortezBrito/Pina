import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusManutencao } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export type FiltrosManutencao = { status?: StatusManutencao; imovelId?: string };

// Abertas antes de concluídas/canceladas; dentro de cada status, as mais urgentes primeiro.
const ORDEM_STATUS = { ABERTA: 0, EM_ANDAMENTO: 1, CONCLUIDA: 2, CANCELADA: 3 } as const;
const ORDEM_PRIORIDADE = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 } as const;

export async function listarManutencoes(filtros: FiltrosManutencao = {}) {
  const where: Prisma.ManutencaoWhereInput = {
    status: filtros.status,
    imovelId: filtros.imovelId,
  };
  const manutencoes = await db.manutencao.findMany({
    where,
    orderBy: { abertaEm: "desc" },
    include: {
      imovel: { select: { id: true, codigo: true, titulo: true } },
      despesas: { select: { valor: true } },
    },
  });

  return manutencoes.sort(
    (a, b) =>
      ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] ||
      ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade],
  );
}
