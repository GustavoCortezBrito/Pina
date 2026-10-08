import {
  addDays,
  addMonths,
  daysInMonth,
  dayInMonth,
  diffDays,
  endOfMonth,
  maxDate,
  minDate,
  startOfMonth,
} from "@/lib/dates";
import { prorate } from "@/lib/money";

export type ParametrosCobranca = {
  dataInicio: Date;
  prazoMeses: number;
  diaVencimento: number;
  valorAluguel: number; // centavos
  valorEncargos: number; // centavos/mês
  aluguelAntecipado: boolean;
};

export type CobrancaPrevista = {
  competencia: Date;
  periodoInicio: Date;
  periodoFim: Date;
  vencimento: Date;
  valorAluguel: number;
  valorEncargos: number;
  valorTotal: number;
  proporcional: boolean;
};

/** Último dia do contrato: início + prazo − 1 dia (01/10/2026 + 12 meses → 30/09/2027). */
export function calcularDataFim(dataInicio: Date, prazoMeses: number): Date {
  return addDays(addMonths(dataInicio, prazoMeses), -1);
}

/**
 * Vencimento de uma competência (RN-03). No aluguel "vencido" (padrão) paga-se no mês
 * seguinte ao de uso; no "antecipado", no próprio mês — nunca antes do início do contrato.
 */
export function calcularVencimento(
  competencia: Date,
  diaVencimento: number,
  aluguelAntecipado: boolean,
  dataInicio: Date,
): Date {
  const mes = aluguelAntecipado ? competencia : addMonths(competencia, 1);
  return maxDate(dayInMonth(mes, diaVencimento), dataInicio);
}

/** Valor do período: integral se cobre o mês inteiro, senão proporcional aos dias (RN-04). */
export function valorDoPeriodo(valorMensal: number, periodoInicio: Date, periodoFim: Date) {
  const dias = diffDays(periodoFim, periodoInicio) + 1;
  const diasNoMes = daysInMonth(periodoInicio.getUTCFullYear(), periodoInicio.getUTCMonth() + 1);
  if (dias >= diasNoMes) return { valor: valorMensal, proporcional: false };
  return { valor: prorate(valorMensal, dias, diasNoMes), proporcional: true };
}

/**
 * Cobranças mensais por competência (mês civil). O primeiro e o último mês
 * são proporcionais quando o contrato não começa no dia 1.
 */
export function gerarCobrancas(p: ParametrosCobranca): CobrancaPrevista[] {
  if (p.prazoMeses < 1) return [];
  const dataFim = calcularDataFim(p.dataInicio, p.prazoMeses);
  const cobrancas: CobrancaPrevista[] = [];

  for (let mes = startOfMonth(p.dataInicio); mes <= dataFim; mes = addMonths(mes, 1)) {
    const periodoInicio = maxDate(mes, p.dataInicio);
    const periodoFim = minDate(endOfMonth(mes), dataFim);
    const aluguel = valorDoPeriodo(p.valorAluguel, periodoInicio, periodoFim);
    const encargos = valorDoPeriodo(p.valorEncargos, periodoInicio, periodoFim);
    cobrancas.push({
      competencia: mes,
      periodoInicio,
      periodoFim,
      vencimento: calcularVencimento(mes, p.diaVencimento, p.aluguelAntecipado, p.dataInicio),
      valorAluguel: aluguel.valor,
      valorEncargos: encargos.valor,
      valorTotal: aluguel.valor + encargos.valor,
      proporcional: aluguel.proporcional,
    });
  }

  // Ajuste de arredondamento: quando parcelas proporcionais usam meses com
  // quantidades de dias diferentes, a soma pode divergir do total esperado.
  // Corrige na última parcela para que o total bata exatamente.
  if (cobrancas.length > 0 && cobrancas.some((c) => c.proporcional)) {
    const totalEsperadoAluguel = p.valorAluguel * p.prazoMeses;
    const somaAluguel = cobrancas.reduce((acc, c) => acc + c.valorAluguel, 0);
    const diffAluguel = totalEsperadoAluguel - somaAluguel;

    const totalEsperadoEncargos = p.valorEncargos * p.prazoMeses;
    const somaEncargos = cobrancas.reduce((acc, c) => acc + c.valorEncargos, 0);
    const diffEncargos = totalEsperadoEncargos - somaEncargos;

    if (diffAluguel !== 0 || diffEncargos !== 0) {
      const ultima = cobrancas[cobrancas.length - 1];
      ultima.valorAluguel += diffAluguel;
      ultima.valorEncargos += diffEncargos;
      ultima.valorTotal = ultima.valorAluguel + ultima.valorEncargos;
    }
  }

  return cobrancas;
}
