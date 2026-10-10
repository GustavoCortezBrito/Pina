import { AlertTriangleIcon, CalendarClockIcon, HandCoinsIcon, HouseIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import {
  cobrancasAtrasadas,
  cobrancasVencendoEmBreve,
  contratosVencendoEmBreve,
  reajustesProximos,
  resumoDashboard,
} from "@/features/dashboard/queries";
import { receitaDespesaMensal } from "@/features/relatorios/queries";
import { formatDate, formatDateLong } from "@/lib/dates";
import { INDICE_REAJUSTE } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const hoje = formatDateLong(new Date()).replace(/^\w/, (c) => c.toUpperCase());
  const [user, resumo, atrasadas, vencendoSemana, contratosVencendo, reajustes, serieMensal] = await Promise.all([
    requireUser(),
    resumoDashboard(),
    cobrancasAtrasadas(),
    cobrancasVencendoEmBreve(),
    contratosVencendoEmBreve(),
    reajustesProximos(),
    receitaDespesaMensal(12),
  ]);

  const ocupacao = resumo.totalUnidades ? Math.round((resumo.ocupadas / resumo.totalUnidades) * 100) : 0;
  const primeiroNome = user.name.split(" ")[0];
  const dadosGrafico = serieMensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa }));

  return (
    <div className="space-y-6">
      <PageHeader title={`Olá, ${primeiroNome}`} description={hoje} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Unidades" value={resumo.totalUnidades} icon={HouseIcon} style={{ animationDelay: "0ms" }} />
        <StatCard
          label="Ocupadas"
          value={resumo.ocupadas}
          hint={`${ocupacao}% de ocupação`}
          tone="positive"
          icon={HouseIcon}
          style={{ animationDelay: "40ms" }}
        />
        <StatCard label="Vagas" value={resumo.vagas} icon={HouseIcon} style={{ animationDelay: "80ms" }} />
        <StatCard
          label="Recebido no mês"
          value={formatBRL(resumo.recebidoMes)}
          tone="positive"
          icon={TrendingUpIcon}
          style={{ animationDelay: "120ms" }}
        />
        <StatCard
          label="A receber no mês"
          value={formatBRL(resumo.aReceberMes)}
          icon={HandCoinsIcon}
          style={{ animationDelay: "160ms" }}
        />
        <StatCard
          label="Em atraso"
          value={formatBRL(resumo.emAtrasoValor)}
          hint={`${resumo.emAtrasoQtde} cobranças`}
          tone={resumo.emAtrasoQtde > 0 ? "negative" : "default"}
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
            {atrasadas.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">Nenhuma cobrança atrasada. 🎉</p>
            ) : (
              atrasadas.map((item) => (
                <Link
                  key={item.id}
                  href="/financeiro/cobrancas"
                  className="flex items-center justify-between gap-2 border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">
                      {item.imovel} · {item.inquilino}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.diasAtraso} dias de atraso</p>
                  </div>
                  <Badge variant="destructive">{formatBRL(item.saldo)}</Badge>
                </Link>
              ))
            )}
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
            {vencendoSemana.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">Nada vencendo esta semana.</p>
            ) : (
              vencendoSemana.map((item) => (
                <Link
                  key={item.id}
                  href="/financeiro/cobrancas"
                  className="flex items-center justify-between gap-2 border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">
                      {item.imovel} · {item.inquilino}
                    </p>
                    <p className="text-xs text-muted-foreground">Vence em {formatDate(item.vencimento)}</p>
                  </div>
                  <Badge variant="secondary">{formatBRL(item.saldo)}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:320ms]">
          <CardHeader>
            <CardTitle className="text-base">Contratos vencendo (60 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {contratosVencendo.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">Nenhum contrato vencendo.</p>
            ) : (
              contratosVencendo.map((item) => (
                <Link
                  key={item.id}
                  href={`/contratos/${item.id}`}
                  className="block border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
                >
                  <p className="font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">Encerra em {formatDate(item.dataFim)}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:360ms]">
          <CardHeader>
            <CardTitle className="text-base">Reajustes nos próximos 30 dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            {reajustes.length === 0 ? (
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">Nenhum reajuste previsto.</p>
            ) : (
              reajustes.map((item) => (
                <Link
                  key={item.id}
                  href={`/contratos/${item.id}`}
                  className="block border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/40"
                >
                  <p className="font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.data)} · índice {INDICE_REAJUSTE[item.indice]}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both [animation-delay:400ms]">
        <CardHeader>
          <CardTitle className="text-base">Receita × despesa — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart dados={dadosGrafico} />
        </CardContent>
      </Card>
    </div>
  );
}
