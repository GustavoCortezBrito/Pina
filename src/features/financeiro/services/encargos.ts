import type { StatusCobranca } from "@/generated/prisma/enums";
import { diffDays, proximoDiaUtil } from "@/lib/dates";
import { applyPercent } from "@/lib/money";

export type StatusCobrancaEfetivo = StatusCobranca | "ATRASADO";

/**
 * Multa e juros por atraso (RN-05 e RN-06). Sem encargos até o primeiro dia útil
 * a partir do vencimento; depois, multa única + juros pró-rata dia contados do vencimento.
 */
export function calcularEncargos(params: {
  saldo: number;
  vencimento: Date;
  dataPagamento: Date;
  percMulta: number;
  percJurosMes: number;
  feriados?: string[];
}) {
  const limite = proximoDiaUtil(params.vencimento, params.feriados);
  if (params.saldo <= 0 || params.dataPagamento <= limite) {
    return { diasAtraso: 0, multa: 0, juros: 0, limite };
  }
  const diasAtraso = diffDays(params.dataPagamento, params.vencimento);
  return {
    diasAtraso,
    multa: applyPercent(params.saldo, params.percMulta),
    juros: applyPercent(params.saldo, params.percJurosMes, diasAtraso, 30),
    limite,
  };
}

/** Status gravado a partir do quanto do principal já foi quitado. */
export function statusPorPagamentos(valorTotal: number, principalPago: number): StatusCobranca {
  if (principalPago >= valorTotal) return "PAGO";
  if (principalPago > 0) return "PAGO_PARCIAL";
  return "PENDENTE";
}

/** Status exibido: "ATRASADO" é calculado, nunca gravado (RN-07). */
export function statusEfetivo(
  status: StatusCobranca,
  vencimento: Date,
  hoje: Date,
  feriados?: string[],
): StatusCobrancaEfetivo {
  if (
    (status === "PENDENTE" || status === "PAGO_PARCIAL") &&
    proximoDiaUtil(vencimento, feriados) < hoje
  ) {
    return "ATRASADO";
  }
  return status;
}
