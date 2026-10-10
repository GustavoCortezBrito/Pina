import { ChartColumnIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { receitaDespesaMensal, resultadoPorImovel } from "@/features/relatorios/queries";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Relatórios" };

export default async function RelatoriosPage() {
  const [serieMensal, resultadoImoveis] = await Promise.all([
    receitaDespesaMensal(12),
    resultadoPorImovel(),
  ]);
  const dadosGrafico = serieMensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa }));

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Receita, despesa e resultado por imóvel." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart dados={dadosGrafico} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado por imóvel (ano atual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {resultadoImoveis.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhuma movimentação registrada este ano ainda.
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
