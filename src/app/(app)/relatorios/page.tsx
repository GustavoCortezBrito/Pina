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
import { ExportarMenu } from "@/features/relatorios/components/exportar-menu";
import { PeriodoFilter } from "@/features/relatorios/components/periodo-filter";
import { receitaDespesaPeriodo, resolverPeriodo, resultadoPorImovel } from "@/features/relatorios/queries";
import { today } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Relatórios" };

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

  const periodo = resolverPeriodo({ periodo: lerParam("periodo"), de: lerParam("de"), ate: lerParam("ate") });
  const ano = Number(lerParam("ano") ?? today().getUTCFullYear());
  const imovelId = lerParam("imovel");

  const [serieMensal, resultadoImoveis, imoveis] = await Promise.all([
    receitaDespesaPeriodo(periodo),
    resultadoPorImovel(ano, imovelId),
    opcoesImoveis(),
  ]);
  const dadosGrafico = serieMensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Receita, despesa e resultado por imóvel."
        actions={<ExportarMenu />}
      />

      <FilterBar>
        <PeriodoFilter />
        <FilterSelect param="ano" placeholder="Ano" options={opcoesAnos()} allLabel={String(today().getUTCFullYear())} />
        <FilterSelect param="imovel" placeholder="Imóvel" options={imoveis} allLabel="Todos os imóveis" />
      </FilterBar>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — {periodo.rotulo}</CardTitle>
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
                className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/50 sm:px-6"
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
                      ? "rounded-full bg-success/12 px-2.5 py-0.5 font-bold tabular-nums text-success"
                      : "rounded-full bg-danger/12 px-2.5 py-0.5 font-bold tabular-nums text-danger"
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
