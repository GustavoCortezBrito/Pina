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

/** Quantas fotos o card carrega (a primeira é a capa; as outras aparecem na prévia ao passar o mouse). */
const FOTOS_NO_CARD = 4;

/** O que o card da listagem precisa: campos públicos + as primeiras fotos. */
const SELECT_CARD = {
  ...CAMPOS_PUBLICOS,
  arquivos: {
    where: { categoria: "FOTO" },
    orderBy: [{ capa: "desc" }, { ordem: "asc" }],
    select: { id: true },
    take: FOTOS_NO_CARD,
  },
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
      select: SELECT_CARD,
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

/** Total publicado e quantos de cada tipo (para o selo do topo e os atalhos por tipo). */
export async function resumoVitrine() {
  const grupos = await db.imovel.groupBy({ by: ["tipo"], where: VISIVEL, _count: { _all: true } });
  const porTipo = Object.fromEntries(grupos.map((g) => [g.tipo, g._count._all])) as Partial<Record<TipoImovel, number>>;
  const total = grupos.reduce((soma, g) => soma + g._count._all, 0);
  return { total, porTipo };
}

/** O imóvel mais recente que já tem foto, para o destaque do topo da página inicial. */
export async function destaqueVitrine() {
  return db.imovel.findFirst({
    where: { ...VISIVEL, arquivos: { some: { categoria: "FOTO" } } },
    select: SELECT_CARD,
    orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
  });
}

/** Uma foto de capa para cada tipo de imóvel disponível (atalhos "explore por tipo"). */
export async function capasPorTipo() {
  const grupos = await db.imovel.groupBy({ by: ["tipo"], where: VISIVEL, _count: { _all: true } });
  const capas = await Promise.all(
    grupos.map(async (g) => {
      const imovel = await db.imovel.findFirst({
        where: { ...VISIVEL, tipo: g.tipo, arquivos: { some: { categoria: "FOTO" } } },
        orderBy: { publicadoEm: "desc" },
        select: { arquivos: { where: { categoria: "FOTO" }, orderBy: [{ capa: "desc" }, { ordem: "asc" }], select: { id: true }, take: 1 } },
      });
      return { tipo: g.tipo, total: g._count._all, foto: imovel?.arquivos[0]?.id ?? null };
    }),
  );
  return capas.sort((a, b) => b.total - a.total);
}

/** Ids e datas dos imóveis visíveis, para o sitemap. */
export async function imoveisParaSitemap() {
  return db.imovel.findMany({
    where: VISIVEL,
    select: { id: true, publicadoEm: true, atualizadoEm: true },
    orderBy: { publicadoEm: "desc" },
  });
}

/** Outros imóveis para sugerir no fim da página de um imóvel (mesmo tipo primeiro). */
export async function outrosImoveis(id: string, tipo: TipoImovel, quantos = 3) {
  const mesmos = await db.imovel.findMany({
    where: { ...VISIVEL, id: { not: id }, tipo },
    select: SELECT_CARD,
    orderBy: { publicadoEm: "desc" },
    take: quantos,
  });
  if (mesmos.length >= quantos) return mesmos;
  const resto = await db.imovel.findMany({
    where: { ...VISIVEL, id: { notIn: [id, ...mesmos.map((m) => m.id)] } },
    select: SELECT_CARD,
    orderBy: { publicadoEm: "desc" },
    take: quantos - mesmos.length,
  });
  return [...mesmos, ...resto];
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
