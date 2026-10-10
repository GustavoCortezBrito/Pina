import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { parseISOMonth } from "@/lib/dates";

export const DESPESAS_POR_PAGINA = 20;

export type FiltrosDespesa = {
  imovelId?: string;
  categoriaId?: string;
  mes?: string;
  page?: number;
};

export async function listarDespesas(filtros: FiltrosDespesa) {
  const page = Math.max(1, filtros.page ?? 1);
  const mes = parseISOMonth(filtros.mes);

  const where: Prisma.DespesaWhereInput = {
    imovelId: filtros.imovelId,
    categoriaId: filtros.categoriaId,
    ...(mes
      ? {
          data: {
            gte: mes,
            lt: new Date(Date.UTC(mes.getUTCFullYear(), mes.getUTCMonth() + 1, 1)),
          },
        }
      : {}),
  };

  const [itens, total, soma] = await Promise.all([
    db.despesa.findMany({
      where,
      orderBy: { data: "desc" },
      include: { categoria: true, imovel: { select: { id: true, codigo: true, titulo: true } } },
      skip: (page - 1) * DESPESAS_POR_PAGINA,
      take: DESPESAS_POR_PAGINA,
    }),
    db.despesa.count({ where }),
    db.despesa.aggregate({ where, _sum: { valor: true } }),
  ]);

  return {
    itens,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / DESPESAS_POR_PAGINA)),
    somaValor: soma._sum.valor ?? 0,
  };
}

export async function categoriasAtivas() {
  return db.categoriaDespesa.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
}
