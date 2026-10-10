import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusManutencao } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export type FiltrosManutencao = { status?: StatusManutencao; imovelId?: string };

export async function listarManutencoes(filtros: FiltrosManutencao = {}) {
  const where: Prisma.ManutencaoWhereInput = {
    status: filtros.status,
    imovelId: filtros.imovelId,
  };
  return db.manutencao.findMany({
    where,
    orderBy: [{ status: "asc" }, { abertaEm: "desc" }],
    include: { imovel: { select: { id: true, codigo: true, titulo: true } } },
  });
}
