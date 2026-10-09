import { ChartColumnIcon } from "lucide-react";
import type { Metadata } from "next";
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
import { RECEITA_DESPESA_MOCK } from "@/features/dashboard/mock";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Relatórios" };

const RESULTADO_POR_IMOVEL_MOCK = [
  { imovel: "ADM-02", receita: 1_800_000, despesa: 320_000 },
  { imovel: "CASA-07", receita: 1_200_000, despesa: 540_000 },
  { imovel: "KITNET-03", receita: 950_000, despesa: 90_000 },
];

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Receita, inadimplência e resultado por imóvel." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart dados={RECEITA_DESPESA_MOCK} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultado por imóvel (ano)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {RESULTADO_POR_IMOVEL_MOCK.map((item) => (
            <div
              key={item.imovel}
              className="flex items-center justify-between gap-2 border-t px-6 py-3 text-sm first:border-t-0"
            >
              <span className="font-medium">{item.imovel}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatBRL(item.receita)} receita · {formatBRL(item.despesa)} despesa
              </span>
              <span className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                {formatBRL(item.receita - item.despesa)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartColumnIcon />
          </EmptyMedia>
          <EmptyTitle>Mais relatórios em construção</EmptyTitle>
          <EmptyDescription>
            Inadimplência detalhada e exportação para Excel entram na próxima etapa.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
