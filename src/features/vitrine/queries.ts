import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { TipoImovel } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export const VITRINE_POR_PAGINA = 12;

/** Só entra na vitrine o que foi publicado de propósito e está de fato disponível. */
const VISIVEL: Prisma.ImovelWhereInput = {
  deletadoEm: null,
  publicadoNoSite: true,
  status: "DISPONIVEL",
};

// Campos de divulgação. Nunca inclui inquilino, contrato, proprietário, matrícula, IPTU nem endereço exato.
const CAMPOS_PUBLICOS = {
  id: true,
  codigo: true,
  titulo: true,
  tipo: true,
  descricao: true,
  bairro: true,
  cidade: true,
  uf: true,
  quartos: true,
  banheiros: true,
  vagas: true,
  areaM2: true,
  aceitaPet: true,
  caracteristicas: true,
  valorAluguel: true,
  valorCondominio: true,
  publicadoEm: true,
} satisfies Prisma.ImovelSelect;

export type FiltrosVitrine = {
  tipo?: TipoImovel;
  quartos?: number;
  precoMax?: number; // em reais
  bairro?: string;
  page?: number;
};

export async function listarVitrine(filtros: FiltrosVitrine) {
  const page = Math.max(1, filtros.page ?? 1);
  const where: Prisma.ImovelWhereInput = {
    ...VISIVEL,
    tipo: filtros.tipo,
    bairro: filtros.bairro,
    quartos: filtros.quartos ? { gte: filtros.quartos } : undefined,
    valorAluguel: filtros.precoMax ? { lte: filtros.precoMax * 100 } : undefined,
  };

  const [itens, total] = await Promise.all([
    db.imovel.findMany({
      where,
      select: {
        ...CAMPOS_PUBLICOS,
        arquivos: {
          where: { categoria: "FOTO" },
          orderBy: [{ capa: "desc" }, { ordem: "asc" }],
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
      skip: (page - 1) * VITRINE_POR_PAGINA,
      take: VITRINE_POR_PAGINA,
    }),
    db.imovel.count({ where }),
  ]);

  return { itens, total, page, pageCount: Math.max(1, Math.ceil(total / VITRINE_POR_PAGINA)) };
}

export async function bairrosDaVitrine() {
  const linhas = await db.imovel.findMany({
    where: { ...VISIVEL, bairro: { not: null } },
    select: { bairro: true },
    distinct: ["bairro"],
    orderBy: { bairro: "asc" },
  });
  return linhas.map((l) => l.bairro as string);
}

export async function obterImovelVitrine(id: string) {
  return db.imovel.findFirst({
    where: { id, ...VISIVEL },
    select: {
      ...CAMPOS_PUBLICOS,
      arquivos: {
        where: { categoria: "FOTO" },
        orderBy: [{ capa: "desc" }, { ordem: "asc" }],
        select: { id: true, legenda: true },
      },
    },
  });
}

export type ImovelVitrine = Awaited<ReturnType<typeof listarVitrine>>["itens"][number];
