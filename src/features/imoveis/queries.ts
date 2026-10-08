import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusImovel, TipoImovel } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export const IMOVEIS_POR_PAGINA = 12;

export type FiltrosImovel = {
  q?: string;
  tipo?: TipoImovel;
  status?: StatusImovel;
  empreendimentoId?: string;
  page?: number;
};

function montarWhere(filtros: FiltrosImovel): Prisma.ImovelWhereInput {
  const termo = filtros.q?.trim();
  return {
    deletadoEm: null,
    tipo: filtros.tipo,
    status: filtros.status,
    empreendimentoId: filtros.empreendimentoId,
    ...(termo
      ? {
          OR: [
            { codigo: { contains: termo, mode: "insensitive" } },
            { titulo: { contains: termo, mode: "insensitive" } },
            { logradouro: { contains: termo, mode: "insensitive" } },
            { bairro: { contains: termo, mode: "insensitive" } },
            { complemento: { contains: termo, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const RESUMO_SELECT = {
  id: true,
  codigo: true,
  titulo: true,
  tipo: true,
  status: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  quartos: true,
  banheiros: true,
  vagas: true,
  areaM2: true,
  valorAluguel: true,
  empreendimento: { select: { id: true, nome: true } },
  arquivos: {
    where: { categoria: "FOTO" as const, capa: true },
    select: { id: true },
    take: 1,
  },
  contratos: {
    where: { status: "ATIVO" as const },
    take: 1,
    select: {
      id: true,
      numero: true,
      valorAluguel: true,
      dataFim: true,
      partes: {
        where: { papel: "LOCATARIO" as const },
        orderBy: { principal: "desc" as const },
        take: 1,
        select: { pessoa: { select: { id: true, nome: true } } },
      },
    },
  },
} satisfies Prisma.ImovelSelect;

export type ImovelResumo = Prisma.ImovelGetPayload<{ select: typeof RESUMO_SELECT }>;

export async function listarImoveis(filtros: FiltrosImovel) {
  const page = Math.max(1, filtros.page ?? 1);
  const where = montarWhere(filtros);

  const [itens, total] = await Promise.all([
    db.imovel.findMany({
      where,
      select: RESUMO_SELECT,
      orderBy: [{ codigo: "asc" }],
      skip: (page - 1) * IMOVEIS_POR_PAGINA,
      take: IMOVEIS_POR_PAGINA,
    }),
    db.imovel.count({ where }),
  ]);

  return { itens, total, page, pageCount: Math.max(1, Math.ceil(total / IMOVEIS_POR_PAGINA)) };
}

export async function obterImovel(id: string) {
  return db.imovel.findFirst({
    where: { id, deletadoEm: null },
    include: {
      empreendimento: true,
      proprietario: { select: { id: true, nome: true, documento: true, telefone1: true } },
      arquivos: { orderBy: [{ categoria: "asc" }, { ordem: "asc" }] },
      contratos: {
        orderBy: { dataInicio: "desc" },
        include: {
          partes: { include: { pessoa: { select: { id: true, nome: true } } } },
        },
      },
      manutencoes: { orderBy: { abertaEm: "desc" } },
    },
  });
}

export type ImovelDetalhe = NonNullable<Awaited<ReturnType<typeof obterImovel>>>;

/** Opções para os seletores de imóvel (contratos, despesas, manutenções). */
export async function opcoesImoveis(apenasDisponiveis = false) {
  const imoveis = await db.imovel.findMany({
    where: {
      deletadoEm: null,
      ...(apenasDisponiveis ? { status: { in: ["DISPONIVEL", "RESERVADO"] } } : {}),
    },
    select: { id: true, codigo: true, titulo: true, bairro: true, cidade: true, status: true },
    orderBy: { codigo: "asc" },
  });
  return imoveis.map((imovel) => ({
    value: imovel.id,
    label: `${imovel.codigo} · ${imovel.titulo}`,
    description: [imovel.bairro, imovel.cidade].filter(Boolean).join(", "),
    status: imovel.status,
  }));
}

/** Números do imóvel usados na aba Financeiro. */
export async function resumoFinanceiroImovel(imovelId: string) {
  const [recebido, despesas, aberto] = await Promise.all([
    db.pagamento.aggregate({
      where: { cobranca: { contrato: { imovelId } } },
      _sum: { valorPago: true },
    }),
    db.despesa.aggregate({ where: { imovelId }, _sum: { valor: true } }),
    db.cobranca.findMany({
      where: { contrato: { imovelId }, status: { in: ["PENDENTE", "PAGO_PARCIAL"] } },
      select: { valorTotal: true, pagamentos: { select: { valorPrincipal: true } } },
    }),
  ]);

  const emAberto = aberto.reduce(
    (total, cobranca) =>
      total + cobranca.valorTotal - cobranca.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0),
    0,
  );

  return {
    recebido: recebido._sum.valorPago ?? 0,
    despesas: despesas._sum.valor ?? 0,
    emAberto,
  };
}
