import type { IndiceReajuste } from "@/generated/prisma/enums";
import { addMonths } from "@/lib/dates";
import { reajustar } from "@/lib/money";
import { valorDoPeriodo } from "./cobrancas";

/** Data do próximo reajuste anual (RN-08), ou null se não houver mais nenhum no contrato. */
export function proximoReajuste(params: {
  dataInicio: Date;
  dataFim: Date;
  indice: IndiceReajuste;
  reajustesAplicados: number;
}): Date | null {
  if (params.indice === "NENHUM") return null;
  const data = addMonths(params.dataInicio, 12 * (params.reajustesAplicados + 1));
  return data <= params.dataFim ? data : null;
}

export function calcularNovoValor(valorAtual: number, percentual: number): number {
  return reajustar(valorAtual, percentual);
}

/** Novo valor de uma cobrança pendente depois do reajuste (mantém proporcionalidade e desconto). */
export function recalcularCobranca(
  cobranca: { periodoInicio: Date; periodoFim: Date; valorEncargos: number; desconto: number },
  novoAluguel: number,
) {
  const { valor } = valorDoPeriodo(novoAluguel, cobranca.periodoInicio, cobranca.periodoFim);
  return {
    valorAluguel: valor,
    valorTotal: valor + cobranca.valorEncargos - cobranca.desconto,
  };
}
