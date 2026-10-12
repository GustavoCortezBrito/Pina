import "server-only";
import { db } from "@/lib/db";
import { addMonths, today, toISOMonth } from "@/lib/dates";
import { resolverPeriodo, type PeriodoResolvido } from "./periodos";

export { PERIODOS_GRAFICO, resolverPeriodo } from "./periodos";
export type { ParamsPeriodo, PeriodoResolvido } from "./periodos";

export type PontoReceitaDespesa = { mes: string; mesLabel: string; receita: number; despesa: number };

/** Receita (pagamentos) x despesa por mês no período escolhido. */
export async function receitaDespesaPeriodo(periodo: PeriodoResolvido): Promise<PontoReceitaDespesa[]> {
  const { inicio, meses } = periodo;
  const limite = addMonths(inicio, meses);

  const [pagamentos, despesas] = await Promise.all([
    db.pagamento.findMany({
      where: { dataPagamento: { gte: inicio, lt: limite } },
      select: { dataPagamento: true, valorPago: true },
    }),
    db.despesa.findMany({
      where: { data: { gte: inicio, lt: limite } },
      select: { data: true, valor: true },
    }),
  ]);

  const porMes = new Map<string, { receita: number; despesa: number }>();
  for (let i = 0; i < meses; i++) {
    porMes.set(toISOMonth(addMonths(inicio, i)), { receita: 0, despesa: 0 });
  }
  for (const pagamento of pagamentos) {
    const bucket = porMes.get(toISOMonth(pagamento.dataPagamento));
    if (bucket) bucket.receita += pagamento.valorPago;
  }
  for (const despesa of despesas) {
    const bucket = porMes.get(toISOMonth(despesa.data));
    if (bucket) bucket.despesa += despesa.valor;
  }

  const fmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "short", year: "2-digit" });
  return [...porMes.entries()].map(([mes, valores]) => ({
    mes,
    mesLabel: fmt.format(new Date(`${mes}-01T00:00:00Z`)).replace(".", ""),
    ...valores,
  }));
}

/** Atalho: últimos N meses. */
export async function receitaDespesaMensal(meses = 12) {
  return receitaDespesaPeriodo(resolverPeriodo({ periodo: String(meses) }));
}

export type ResultadoImovel = {
  imovelId: string;
  codigo: string;
  titulo: string;
  receita: number;
  despesa: number;
};

/** Receita x despesa por imóvel no ano informado (padrão: ano corrente). */
export async function resultadoPorImovel(
  ano = today().getUTCFullYear(),
  imovelId?: string,
): Promise<ResultadoImovel[]> {
  const inicio = new Date(Date.UTC(ano, 0, 1));
  const fim = new Date(Date.UTC(ano + 1, 0, 1));

  const imoveis = await db.imovel.findMany({
    where: { deletadoEm: null, id: imovelId },
    select: {
      id: true,
      codigo: true,
      titulo: true,
      despesas: { where: { data: { gte: inicio, lt: fim } }, select: { valor: true } },
      contratos: {
        select: {
          cobrancas: {
            where: { competencia: { gte: inicio, lt: fim } },
            select: { pagamentos: { select: { valorPago: true } } },
          },
        },
      },
    },
    orderBy: { codigo: "asc" },
  });

  return imoveis
    .map((imovel) => ({
      imovelId: imovel.id,
      codigo: imovel.codigo,
      titulo: imovel.titulo,
      receita: imovel.contratos
        .flatMap((c) => c.cobrancas)
        .flatMap((c) => c.pagamentos)
        .reduce((soma, p) => soma + p.valorPago, 0),
      despesa: imovel.despesas.reduce((soma, d) => soma + d.valor, 0),
    }))
    .filter((r) => r.receita > 0 || r.despesa > 0)
    .sort((a, b) => b.receita - a.receita);
}
