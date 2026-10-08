import { diffDays } from "@/lib/dates";
import { prorate } from "@/lib/money";

/**
 * Multa rescisória sugerida (Lei 8.245/91, art. 4º): a multa contratual
 * (N aluguéis) é reduzida na proporção do tempo já cumprido.
 */
export function calcularMultaRescisoria(params: {
  valorAluguel: number;
  multaMeses: number;
  dataInicio: Date;
  dataFim: Date;
  dataSaida: Date;
}) {
  const diasTotais = diffDays(params.dataFim, params.dataInicio) + 1;
  const diasRestantes = Math.max(0, diffDays(params.dataFim, params.dataSaida));
  const multaIntegral = params.valorAluguel * params.multaMeses;
  const multa = diasTotais > 0 ? prorate(multaIntegral, diasRestantes, diasTotais) : 0;
  return { diasTotais, diasRestantes, multaIntegral, multa };
}

/** Saída antes do fim do contrato caracteriza rescisão; na data final (ou depois), encerramento. */
export function isRescisao(dataSaida: Date, dataFim: Date): boolean {
  return dataSaida < dataFim;
}
