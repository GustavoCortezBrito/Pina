import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusContrato } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export const CONTRATOS_POR_PAGINA = 15;

export type FiltrosContrato = { q?: string; status?: StatusContrato; page?: number };

export async function listarContratos(filtros: FiltrosContrato) {
  const page = Math.max(1, filtros.page ?? 1);
  const termo = filtros.q?.trim();

  const where: Prisma.ContratoWhereInput = {
    status: filtros.status,
    ...(termo
      ? {
          OR: [
            { imovel: { codigo: { contains: termo, mode: "insensitive" } } },
            { imovel: { titulo: { contains: termo, mode: "insensitive" } } },
            { partes: { some: { pessoa: { nome: { contains: termo, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const [itens, total] = await Promise.all([
    db.contrato.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      include: {
        imovel: { select: { id: true, codigo: true, titulo: true } },
        partes: {
          orderBy: { principal: "desc" },
          select: { papel: true, pessoa: { select: { id: true, nome: true } } },
        },
      },
      skip: (page - 1) * CONTRATOS_POR_PAGINA,
      take: CONTRATOS_POR_PAGINA,
    }),
    db.contrato.count({ where }),
  ]);

  return { itens, total, page, pageCount: Math.max(1, Math.ceil(total / CONTRATOS_POR_PAGINA)) };
}

export async function obterContrato(id: string) {
  return db.contrato.findUnique({
    where: { id },
    include: {
      imovel: { select: { id: true, codigo: true, titulo: true } },
      partes: { include: { pessoa: { select: { id: true, nome: true, documento: true } } } },
      encargos: true,
      reajustes: { orderBy: { dataAplicacao: "desc" } },
      cobrancas: { orderBy: { competencia: "asc" }, include: { pagamentos: true } },
      vistorias: { orderBy: { data: "desc" } },
      arquivos: { orderBy: { criadoEm: "desc" } },
    },
  });
}

export type ContratoDetalhe = NonNullable<Awaited<ReturnType<typeof obterContrato>>>;

/** Tudo que o PDF do contrato precisa: endereço completo do imóvel e dados completos das pessoas. */
export async function obterContratoParaPdf(id: string) {
  return db.contrato.findUnique({
    where: { id },
    include: {
      imovel: true,
      partes: { include: { pessoa: true } },
      encargos: true,
      modelo: true,
    },
  });
}

export type ContratoParaPdf = NonNullable<Awaited<ReturnType<typeof obterContratoParaPdf>>>;
