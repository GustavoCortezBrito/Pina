import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusCobranca } from "@/generated/prisma/enums";
import { statusEfetivo, type StatusCobrancaEfetivo } from "@/features/financeiro/services/encargos";
import { db } from "@/lib/db";
import { parseISOMonth, today } from "@/lib/dates";

export const COBRANCAS_POR_PAGINA = 20;

export type FiltrosCobranca = {
  mes?: string;
  status?: StatusCobrancaEfetivo;
  contratoId?: string;
  page?: number;
};

export async function listarCobrancas(filtros: FiltrosCobranca) {
  const page = Math.max(1, filtros.page ?? 1);
  const mes = parseISOMonth(filtros.mes);
  const hoje = today();

  const where: Prisma.CobrancaWhereInput = {
    competencia: mes ?? undefined,
    contratoId: filtros.contratoId,
    status:
      filtros.status === "ATRASADO"
        ? { in: ["PENDENTE", "PAGO_PARCIAL"] as StatusCobranca[] }
        : filtros.status
          ? filtros.status
          : undefined,
    ...(filtros.status === "ATRASADO" ? { vencimento: { lt: hoje } } : {}),
  };

  const [registros, total] = await Promise.all([
    db.cobranca.findMany({
      where,
      orderBy: { vencimento: "asc" },
      include: {
        contrato: {
          select: {
            id: true,
            imovel: { select: { id: true, codigo: true, titulo: true } },
            partes: {
              where: { papel: "LOCATARIO" },
              orderBy: { principal: "desc" },
              take: 1,
              select: { pessoa: { select: { id: true, nome: true } } },
            },
          },
        },
        pagamentos: { select: { valorPrincipal: true } },
      },
      skip: (page - 1) * COBRANCAS_POR_PAGINA,
      take: COBRANCAS_POR_PAGINA,
    }),
    db.cobranca.count({ where }),
  ]);

  const itens = registros.map((cobranca) => {
    const principalPago = cobranca.pagamentos.reduce((soma, p) => soma + p.valorPrincipal, 0);
    return {
      ...cobranca,
      statusEfetivo: statusEfetivo(cobranca.status, cobranca.vencimento, hoje),
      saldo: cobranca.valorTotal - principalPago,
    };
  });

  return { itens, total, page, pageCount: Math.max(1, Math.ceil(total / COBRANCAS_POR_PAGINA)) };
}

export type CobrancaItem = Awaited<ReturnType<typeof listarCobrancas>>["itens"][number];

export type ResumoContratoCobranca = {
  contratoId: string;
  imovel: { id: string; codigo: string; titulo: string };
  inquilino: string;
  statusContrato: string;
  pendentesCount: number;
  atrasadasCount: number;
  saldoAberto: number;
  proximoVencimento: Date | null;
};

/**
 * Um card por contrato (não por cobrança): junta as parcelas de cada imóvel para a
 * lista principal não ficar poluída com todas as competências soltas (ver RF-50/RF-70).
 */
export async function resumoCobrancasPorContrato(q?: string): Promise<ResumoContratoCobranca[]> {
  const hoje = today();
  const termo = q?.trim();

  const contratos = await db.contrato.findMany({
    where: {
      OR: [{ status: "ATIVO" }, { cobrancas: { some: { status: { in: ["PENDENTE", "PAGO_PARCIAL"] } } } }],
      ...(termo
        ? {
            OR: [
              { imovel: { codigo: { contains: termo, mode: "insensitive" } } },
              { imovel: { titulo: { contains: termo, mode: "insensitive" } } },
              { partes: { some: { pessoa: { nome: { contains: termo, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    },
    include: {
      imovel: { select: { id: true, codigo: true, titulo: true } },
      partes: {
        where: { papel: "LOCATARIO" },
        orderBy: { principal: "desc" },
        take: 1,
        select: { pessoa: { select: { nome: true } } },
      },
      cobrancas: {
        where: { status: { in: ["PENDENTE", "PAGO_PARCIAL"] } },
        select: { valorTotal: true, vencimento: true, pagamentos: { select: { valorPrincipal: true } } },
      },
    },
  });

  const resumos = contratos.map((contrato) => {
    const pendentes = contrato.cobrancas;
    const saldoAberto = pendentes.reduce((soma, cb) => {
      const pago = cb.pagamentos.reduce((s, p) => s + p.valorPrincipal, 0);
      return soma + (cb.valorTotal - pago);
    }, 0);
    const atrasadasCount = pendentes.filter((cb) => cb.vencimento < hoje).length;
    const proximoVencimento = pendentes.length
      ? pendentes.reduce((min, cb) => (cb.vencimento < min ? cb.vencimento : min), pendentes[0].vencimento)
      : null;

    return {
      contratoId: contrato.id,
      imovel: contrato.imovel,
      inquilino: contrato.partes[0]?.pessoa.nome ?? "—",
      statusContrato: contrato.status,
      pendentesCount: pendentes.length,
      atrasadasCount,
      saldoAberto,
      proximoVencimento,
    };
  });

  return resumos.sort((a, b) => {
    if (a.atrasadasCount !== b.atrasadasCount) return b.atrasadasCount - a.atrasadasCount;
    if (a.proximoVencimento && b.proximoVencimento) {
      return a.proximoVencimento.getTime() - b.proximoVencimento.getTime();
    }
    if (a.proximoVencimento) return -1;
    if (b.proximoVencimento) return 1;
    return a.imovel.codigo.localeCompare(b.imovel.codigo);
  });
}
