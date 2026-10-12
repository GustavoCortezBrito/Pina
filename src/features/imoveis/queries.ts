import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusImovel, TipoImovel } from "@/generated/prisma/enums";
import { statusEfetivo } from "@/features/financeiro/services/encargos";
import { today } from "@/lib/dates";
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
      manutencoes: { orderBy: { abertaEm: "desc" }, include: { despesas: { select: { valor: true } } } },
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

/** Aba Financeiro do imóvel: totais, atrasos, próximas cobranças e últimas despesas. */
export async function detalheFinanceiroImovel(imovelId: string) {
  const hoje = today();
  const [resumo, abertas, despesas, contratos] = await Promise.all([
    resumoFinanceiroImovel(imovelId),
    db.cobranca.findMany({
      where: { contrato: { imovelId }, status: { in: ["PENDENTE", "PAGO_PARCIAL"] } },
      orderBy: { vencimento: "asc" },
      take: 120,
      select: {
        id: true,
        contratoId: true,
        competencia: true,
        vencimento: true,
        status: true,
        valorTotal: true,
        pagamentos: { select: { valorPrincipal: true } },
      },
    }),
    db.despesa.findMany({
      where: { imovelId },
      orderBy: { data: "desc" },
      take: 5,
      select: { id: true, data: true, valor: true, fornecedor: true, categoria: { select: { nome: true } } },
    }),
    db.contrato.findMany({
      where: { imovelId },
      orderBy: [{ status: "asc" }, { dataInicio: "desc" }],
      select: { id: true, status: true },
    }),
  ]);

  const cobrancas = abertas.map((c) => ({
    id: c.id,
    contratoId: c.contratoId,
    competencia: c.competencia,
    vencimento: c.vencimento,
    saldo: c.valorTotal - c.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0),
    atrasada: statusEfetivo(c.status, c.vencimento, hoje) === "ATRASADO",
  }));
  const atrasadas = cobrancas.filter((c) => c.atrasada);

  return {
    ...resumo,
    resultado: resumo.recebido - resumo.despesas,
    atrasadasQtde: atrasadas.length,
    atrasadasValor: atrasadas.reduce((s, c) => s + c.saldo, 0),
    proximas: cobrancas.slice(0, 4),
    ultimasDespesas: despesas,
    // Página de cobranças a abrir: do contrato ativo, ou do mais recente.
    contratoId: (contratos.find((c) => c.status === "ATIVO") ?? contratos[0])?.id ?? null,
  };
}
