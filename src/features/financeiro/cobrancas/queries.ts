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
  imovelId?: string;
  page?: number;
};

export async function listarCobrancas(filtros: FiltrosCobranca) {
  const page = Math.max(1, filtros.page ?? 1);
  const mes = parseISOMonth(filtros.mes);
  const hoje = today();

  const where: Prisma.CobrancaWhereInput = {
    competencia: mes ?? undefined,
    contrato: filtros.imovelId ? { imovelId: filtros.imovelId } : undefined,
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
