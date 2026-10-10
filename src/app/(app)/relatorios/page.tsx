import { ChartColumnIcon } from "lucide-react";
import type { Metadata } from "next";
import { FilterBar, FilterSelect } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { opcoesImoveis } from "@/features/imoveis/queries";
import { receitaDespesaMensal, resultadoPorImovel } from "@/features/relatorios/queries";
import { today } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Relatórios" };

const PERIODOS = [
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
  { value: "24", label: "Últimos 24 meses" },
];

function opcoesAnos() {
  const anoAtual = today().getUTCFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const ano = anoAtual - i;
    return { value: String(ano), label: String(ano) };
  });
}

export default async function RelatoriosPage(props: PageProps<"/relatorios">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);

  const periodo = Number(lerParam("periodo") ?? 12);
  const ano = Number(lerParam("ano") ?? today().getUTCFullYear());
  const imovelId = lerParam("imovel");

  const [serieMensal, resultadoImoveis, imoveis] = await Promise.all([
    receitaDespesaMensal(periodo),
    resultadoPorImovel(ano, imovelId),
    opcoesImoveis(),
  ]);
  const dadosGrafico = serieMensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa }));

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Receita, despesa e resultado por imóvel." />

      <FilterBar>
        <FilterSelect param="periodo" placeholder="Período" options={PERIODOS} allLabel="Últimos 12 meses" />
        <FilterSelect param="ano" placeholder="Ano" options={opcoesAnos()} allLabel={String(today().getUTCFullYear())} />
        <FilterSelect param="imovel" placeholder="Imóvel" options={imoveis} allLabel="Todos os imóveis" />
      </FilterBar>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — últimos {periodo} meses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart dados={dadosGrafico} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado por imóvel ({ano})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {resultadoImoveis.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhuma movimentação registrada em {ano}.
            </p>
          ) : (
            resultadoImoveis.map((item) => (
              <div
                key={item.imovelId}
                className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3 text-sm first:border-t-0"
              >
                <span className="font-medium">
                  {item.codigo} · {item.titulo}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatBRL(item.receita)} receita · {formatBRL(item.despesa)} despesa
                </span>
                <span
                  className={
                    item.receita - item.despesa >= 0
                      ? "font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
                      : "font-semibold tabular-nums text-red-600 dark:text-red-400"
                  }
                >
                  {formatBRL(item.receita - item.despesa)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartColumnIcon />
          </EmptyMedia>
          <EmptyTitle>Mais relatórios em construção</EmptyTitle>
          <EmptyDescription>Inadimplência detalhada e exportação para Excel entram em breve.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
