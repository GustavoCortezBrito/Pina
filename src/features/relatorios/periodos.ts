import { addMonths, parseISOMonth, startOfMonth, today } from "@/lib/dates";

export const PERIODOS_GRAFICO = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
  { value: "24", label: "Últimos 24 meses" },
  { value: "36", label: "Últimos 36 meses" },
  { value: "ano", label: "Este ano" },
  { value: "custom", label: "Personalizado…" },
] as const;

export type ParamsPeriodo = { periodo?: string; de?: string; ate?: string };
export type PeriodoResolvido = { inicio: Date; fim: Date; meses: number; rotulo: string; valor: string };

const MAX_MESES = 60;

/** Converte os parâmetros da URL (preset ou de/até) em um intervalo de meses, sempre válido. */
export function resolverPeriodo(params: ParamsPeriodo): PeriodoResolvido {
  const hoje = startOfMonth(today());
  let inicio: Date;
  let fim = hoje;
  let valor = params.periodo ?? "12";

  if (valor === "custom") {
    const de = parseISOMonth(params.de);
    const ate = parseISOMonth(params.ate);
    if (de || ate) {
      fim = ate ?? hoje;
      inicio = de ?? addMonths(fim, -11);
      if (inicio > fim) [inicio, fim] = [fim, inicio];
      if (monthsBetween(inicio, fim) > MAX_MESES) inicio = addMonths(fim, -(MAX_MESES - 1));
    } else {
      valor = "12";
      inicio = addMonths(hoje, -11);
    }
  } else if (valor === "ano") {
    inicio = new Date(Date.UTC(hoje.getUTCFullYear(), 0, 1));
  } else {
    const n = [3, 6, 12, 24, 36].includes(Number(valor)) ? Number(valor) : 12;
    valor = String(n);
    inicio = addMonths(hoje, -(n - 1));
  }

  const meses = monthsBetween(inicio, fim);
  const fmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "short", year: "numeric" });
  const rotulo =
    valor === "custom" || valor === "ano"
      ? `${fmt.format(inicio).replace(".", "")} a ${fmt.format(fim).replace(".", "")}`
      : `últimos ${meses} meses`;
  return { inicio, fim, meses, rotulo, valor };
}

function monthsBetween(inicio: Date, fim: Date) {
  return (fim.getUTCFullYear() - inicio.getUTCFullYear()) * 12 + (fim.getUTCMonth() - inicio.getUTCMonth()) + 1;
}
