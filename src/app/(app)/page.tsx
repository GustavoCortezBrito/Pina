import {
  AlertTriangleIcon,
  CalendarClockIcon,
  ChevronRightIcon,
  FileSignatureIcon,
  FileWarningIcon,
  HandCoinsIcon,
  HouseIcon,
  PlusIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import {
  cobrancasAtrasadas,
  cobrancasVencendoEmBreve,
  contratosVencendoEmBreve,
  reajustesProximos,
  resumoDashboard,
} from "@/features/dashboard/queries";
import { PeriodoFilter } from "@/features/relatorios/components/periodo-filter";
import { receitaDespesaPeriodo, resolverPeriodo } from "@/features/relatorios/queries";
import { formatDate, formatDateLong } from "@/lib/dates";
import { INDICE_REAJUSTE } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { ROLE_LABEL, normalizeRole } from "@/lib/permissions";
import { requireAccessPage } from "@/lib/session";

export const metadata: Metadata = { title: "Painel" };

const ATALHOS = [
  { href: "/contratos/novo", label: "Novo contrato", icon: FileSignatureIcon },
  { href: "/imoveis/novo", label: "Novo imóvel", icon: HouseIcon },
  { href: "/pessoas/novo", label: "Nova pessoa", icon: UserPlusIcon },
];

function ListaVazia({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

function SecaoCard({
  titulo,
  icon: Icon,
  cor,
  contagem,
  delay,
  className,
  children,
}: {
  titulo: string;
  icon: React.ComponentType<{ className?: string }>;
  cor: string;
  contagem?: number;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={`animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-2 ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <span className={`flex size-8 items-center justify-center rounded-lg ${cor}`}>
            <Icon className="size-4.5" />
          </span>
          {titulo}
          {contagem != null && contagem > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {contagem}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

const LINHA =
  "group flex items-center justify-between gap-3 border-t px-6 py-3 text-sm transition-colors first:border-t-0 hover:bg-muted/60";

export default async function DashboardPage(props: PageProps<"/">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const periodo = resolverPeriodo({ periodo: lerParam("periodo"), de: lerParam("de"), ate: lerParam("ate") });
  const hoje = formatDateLong(new Date()).replace(/^\w/, (c) => c.toUpperCase());
  const [user, resumo, atrasadas, vencendoSemana, contratosVencendo, reajustes, serieMensal] =
    await Promise.all([
      requireAccessPage("contratos"),
      resumoDashboard(),
      cobrancasAtrasadas(),
      cobrancasVencendoEmBreve(),
      contratosVencendoEmBreve(),
      reajustesProximos(),
      receitaDespesaPeriodo(periodo),
    ]);

  const ocupacao = resumo.totalUnidades ? Math.round((resumo.ocupadas / resumo.totalUnidades) * 100) : 0;
  const totalMes = resumo.recebidoMes + resumo.aReceberMes;
  const pctRecebido = totalMes ? Math.round((resumo.recebidoMes / totalMes) * 100) : 0;
  const primeiroNome = user.name.split(" ")[0];
  const dadosGrafico = serieMensal.map((p) => ({ mes: p.mesLabel, receita: p.receita, despesa: p.despesa }));

  return (
    <div className="space-y-6">
      <section className="surface-brand relative animate-scale-in overflow-hidden rounded-2xl p-5 pl-7 shadow-xl ring-1 ring-white/10 sm:p-8 sm:pl-10">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
        <LogoMark className="pointer-events-none absolute -right-10 -bottom-14 size-56 animate-float text-primary opacity-[0.13] sm:size-72" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <Badge className="border-transparent bg-primary text-primary-foreground">
              {ROLE_LABEL[normalizeRole(user.role)]}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Olá, <span className="text-gradient-brand">{primeiroNome}</span>
            </h1>
            <p className="text-zinc-300">{hoje}</p>
            <p className="text-sm text-zinc-400">
              {resumo.emAtrasoQtde > 0 ? (
                <>
                  <span className="font-semibold text-red-300">
                    {resumo.emAtrasoQtde} {resumo.emAtrasoQtde === 1 ? "cobrança em atraso" : "cobranças em atraso"}
                  </span>{" "}
                  ({formatBRL(resumo.emAtrasoValor)}) ·{" "}
                </>
              ) : (
                <>
                  <span className="font-semibold text-emerald-300">Nenhuma cobrança em atraso</span> ·{" "}
                </>
              )}
              {vencendoSemana.length} vencendo nos próximos 7 dias · {ocupacao}% de ocupação
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:flex sm:w-auto sm:flex-wrap">
            {ATALHOS.map(({ href, label, icon: Icon }, i) => (
              <Button
                key={href}
                asChild
                size="lg"
                className={
                  i === 0
                    ? "shadow-md"
                    : "border border-white/20 bg-transparent text-white hover:border-primary hover:bg-white/5 hover:text-white"
                }
              >
                <Link href={href}>
                  <Icon /> {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Recebido no mês"
          value={<AnimatedNumber value={resumo.recebidoMes} format="brl" />}
          tone="success"
          icon={TrendingUpIcon}
          hint={
            <div className="space-y-1.5">
              <Progress value={pctRecebido} className="h-2 [&_[data-slot=progress-indicator]]:bg-success" />
              <span>{pctRecebido}% do previsto do mês</span>
            </div>
          }
          style={{ animationDelay: "0ms" }}
        />
        <StatCard
          label="A receber no mês"
          value={<AnimatedNumber value={resumo.aReceberMes} format="brl" />}
          tone="info"
          icon={HandCoinsIcon}
          hint={`${vencendoSemana.length} vencendo em 7 dias`}
          href="/financeiro/cobrancas"
          style={{ animationDelay: "40ms" }}
        />
        <StatCard
          label="Em atraso"
          value={<AnimatedNumber value={resumo.emAtrasoValor} format="brl" />}
          tone={resumo.emAtrasoQtde > 0 ? "negative" : "neutral"}
          icon={AlertTriangleIcon}
          hint={`${resumo.emAtrasoQtde} ${resumo.emAtrasoQtde === 1 ? "cobrança" : "cobranças"}`}
          href="/financeiro/cobrancas"
          style={{ animationDelay: "80ms" }}
        />
        <StatCard
          label="Ocupação"
          value={<AnimatedNumber value={ocupacao} format="percent" />}
          tone="brand"
          icon={HouseIcon}
          hint={
            <div className="space-y-1.5">
              <Progress value={ocupacao} className="h-2" />
              <span>
                {resumo.ocupadas} alugadas · {resumo.vagas} vagas
                {resumo.emReforma > 0 && ` · ${resumo.emReforma} em reforma`}
              </span>
            </div>
          }
          href="/imoveis"
          style={{ animationDelay: "120ms" }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SecaoCard
          titulo={`Receita × despesa — ${periodo.rotulo}`}
          icon={TrendingUpIcon}
          cor="bg-primary/15 text-primary-ink"
          delay={160}
          className="xl:col-span-2"
        >
          <div className="space-y-4 p-4 sm:p-6">
            <PeriodoFilter />
            <RevenueChart dados={dadosGrafico} />
          </div>
        </SecaoCard>

        <SecaoCard
          titulo="Cobranças em atraso"
          icon={AlertTriangleIcon}
          cor={atrasadas.length > 0 ? "bg-danger/14 text-danger" : "bg-muted text-foreground"}
          contagem={atrasadas.length}
          delay={200}
        >
          {atrasadas.length === 0 ? (
            <ListaVazia>Nenhuma cobrança atrasada. 🎉</ListaVazia>
          ) : (
            atrasadas.map((item) => (
              <Link key={item.id} href={`/financeiro/cobrancas/${item.contratoId}`} className={LINHA}>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-danger">{item.diasAtraso} dias de atraso</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="destructive">{formatBRL(item.saldo)}</Badge>
                  <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))
          )}
        </SecaoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SecaoCard
          titulo="Vencendo em 7 dias"
          icon={CalendarClockIcon}
          cor="bg-primary/15 text-primary-ink"
          contagem={vencendoSemana.length}
          delay={240}
        >
          {vencendoSemana.length === 0 ? (
            <ListaVazia>Nada vencendo esta semana.</ListaVazia>
          ) : (
            vencendoSemana.map((item) => (
              <Link key={item.id} href={`/financeiro/cobrancas/${item.contratoId}`} className={LINHA}>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">Vence em {formatDate(item.vencimento)}</p>
                </div>
                <StatusBadge label={formatBRL(item.saldo)} tone="warning" />
              </Link>
            ))
          )}
        </SecaoCard>

        <SecaoCard
          titulo="Contratos vencendo (60 dias)"
          icon={FileWarningIcon}
          cor="bg-info/14 text-info"
          contagem={contratosVencendo.length}
          delay={280}
        >
          {contratosVencendo.length === 0 ? (
            <ListaVazia>Nenhum contrato vencendo.</ListaVazia>
          ) : (
            contratosVencendo.map((item) => (
              <Link key={item.id} href={`/contratos/${item.id}`} className={LINHA}>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">Encerra em {formatDate(item.dataFim)}</p>
                </div>
                <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))
          )}
        </SecaoCard>

        <SecaoCard
          titulo="Reajustes (30 dias)"
          icon={PlusIcon}
          cor="bg-muted text-foreground"
          contagem={reajustes.length}
          delay={320}
        >
          {reajustes.length === 0 ? (
            <ListaVazia>Nenhum reajuste previsto.</ListaVazia>
          ) : (
            reajustes.map((item) => (
              <Link key={item.id} href={`/contratos/${item.id}`} className={LINHA}>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.imovel} · {item.inquilino}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.data)} · {INDICE_REAJUSTE[item.indice]}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))
          )}
        </SecaoCard>
      </div>
    </div>
  );
}
