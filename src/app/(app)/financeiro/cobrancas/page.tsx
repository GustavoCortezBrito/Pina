import { CalendarIcon, HandCoinsIcon, ReceiptIcon } from "lucide-react";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, MonthFilter } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReceberDialog } from "@/features/financeiro/cobrancas/components/receber-dialog";
import { listarCobrancas } from "@/features/financeiro/cobrancas/queries";
import { formatDate, formatMonth } from "@/lib/dates";
import { options, STATUS_COBRANCA } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cobranças" };

const TONE_ICON_BG: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:text-red-300",
  primary: "bg-primary/15 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

export default async function CobrancasPage(props: PageProps<"/financeiro/cobrancas">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const statusParam = lerParam("status");

  const [{ itens, total, page, pageCount }, settings] = await Promise.all([
    listarCobrancas({
      mes: lerParam("mes"),
      status: statusParam as never,
      imovelId: lerParam("imovel"),
      page: Number(lerParam("page") ?? 1),
    }),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranças" description="Aluguéis e encargos de cada competência." />

      <FilterBar>
        <MonthFilter param="mes" />
        <FilterSelect param="status" placeholder="Status" options={options(STATUS_COBRANCA)} />
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandCoinsIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma cobrança encontrada</EmptyTitle>
            <EmptyDescription>Ajuste os filtros para ver outras competências.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {itens.map((cobranca, index) => {
              const status = STATUS_COBRANCA[cobranca.statusEfetivo];
              const podeReceber =
                cobranca.statusEfetivo !== "PAGO" && cobranca.statusEfetivo !== "CANCELADO";
              const inquilino = cobranca.contrato.partes[0]?.pessoa.nome ?? "—";
              return (
                <Card
                  key={cobranca.id}
                  className="animate-in duration-500 fill-mode-both fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full",
                        TONE_ICON_BG[status.tone],
                      )}
                    >
                      <HandCoinsIcon className="size-6" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold capitalize">
                          {formatMonth(cobranca.competencia)}
                        </p>
                        <StatusBadge label={status.label} tone={status.tone} className="text-xs" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cobranca.contrato.imovel.titulo} ({cobranca.contrato.imovel.codigo}) ·{" "}
                        {inquilino}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarIcon className="size-4" />
                        Vence em {formatDate(cobranca.vencimento)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums">{formatBRL(cobranca.saldo)}</p>
                    </div>

                    <div className="w-full shrink-0 sm:w-auto">
                      {podeReceber ? (
                        <ReceberDialog
                          cobrancaId={cobranca.id}
                          saldo={cobranca.saldo}
                          vencimento={cobranca.vencimento}
                          percMulta={Number(settings.financeiro.percMulta)}
                          percJurosMes={Number(settings.financeiro.percJurosMes)}
                          trigger={
                            <Button size="lg" className="w-full sm:w-auto">
                              Receber
                            </Button>
                          }
                        />
                      ) : cobranca.statusEfetivo === "PAGO" ? (
                        <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                          <a href={`/api/pdf/recibo/${cobranca.id}`} target="_blank" rel="noreferrer">
                            <ReceiptIcon /> Recibo
                          </a>
                        </Button>
                      ) : (
                        <Button size="lg" variant="outline" disabled className="w-full sm:w-auto">
                          Cancelado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Pagination page={page} pageCount={pageCount} total={total} label="cobranças" />
        </>
      )}
    </div>
  );
}
