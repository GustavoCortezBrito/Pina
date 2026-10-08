import { AlertTriangleIcon, CalendarClockIcon, HandCoinsIcon, HouseIcon, TrendingUpIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import {
  COBRANCAS_ATRASADAS_MOCK,
  CONTRATOS_VENCENDO_MOCK,
  REAJUSTES_PROXIMOS_MOCK,
  RECEITA_DESPESA_MOCK,
  RESUMO_MOCK,
  VENCENDO_SEMANA_MOCK,
} from "@/features/dashboard/mock";
import { formatDateLong } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Painel" };

const hoje = formatDateLong(new Date()).replace(/^\w/, (c) => c.toUpperCase());

export default async function DashboardPage() {
  const user = await requireUser();
  const r = RESUMO_MOCK;
  const ocupacao = Math.round((r.ocupadas / r.totalUnidades) * 100);
  const primeiroNome = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader title={`Olá, ${primeiroNome}`} description={hoje} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Unidades" value={r.totalUnidades} icon={HouseIcon} style={{ animationDelay: "0ms" }} />
        <StatCard
          label="Ocupadas"
          value={r.ocupadas}
          hint={`${ocupacao}% de ocupação`}
          tone="positive"
          icon={HouseIcon}
          style={{ animationDelay: "40ms" }}
        />
        <StatCard label="Vagas" value={r.vagas} icon={HouseIcon} style={{ animationDelay: "80ms" }} />
        <StatCard
          label="Recebido no mês"
          value={formatBRL(r.recebidoMes)}
          tone="positive"
          icon={TrendingUpIcon}
          style={{ animationDelay: "120ms" }}
        />
        <StatCard
          label="A receber no mês"
          value={formatBRL(r.aReceberMes)}
          icon={HandCoinsIcon}
          style={{ animationDelay: "160ms" }}
        />
        <StatCard
          label="Em atraso"
          value={formatBRL(r.emAtrasoValor)}
          hint={`${r.emAtrasoQtde} cobranças`}
          tone="negative"
          icon={AlertTriangleIcon}
          style={{ animationDelay: "200ms" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:240ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
              Cobranças em atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {COBRANCAS_ATRASADAS_MOCK.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.diasAtraso} dias de atraso</p>
                </div>
                <Badge variant="destructive">{formatBRL(item.valor || 150_000)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:280ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClockIcon className="size-4 text-amber-600 dark:text-amber-400" />
              Vencendo nos próximos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {VENCENDO_SEMANA_MOCK.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">Vence em {item.vencimento}</p>
                </div>
                <Badge variant="secondary">{formatBRL(item.valor)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:320ms]">
          <CardHeader>
            <CardTitle className="text-base">Contratos vencendo (60 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {CONTRATOS_VENCENDO_MOCK.map((item) => (
              <div
                key={item.id}
                className="border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
              >
                <p className="font-medium">
                  {item.imovel} · {item.inquilino}
                </p>
                <p className="text-xs text-muted-foreground">Encerra em {item.dataFim}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:360ms]">
          <CardHeader>
            <CardTitle className="text-base">Reajustes nos próximos 30 dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {REAJUSTES_PROXIMOS_MOCK.map((item) => (
              <div
                key={item.id}
                className="border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
              >
                <p className="font-medium">
                  {item.imovel} · {item.inquilino}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.data} · índice {item.indice}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:400ms]">
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart dados={RECEITA_DESPESA_MOCK} />
        </CardContent>
      </Card>
    </div>
  );
}
