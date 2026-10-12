import { ArrowLeftIcon, CalendarIcon, HandCoinsIcon, ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, MonthFilter } from "@/components/shared/filters";
import { ImovelLink } from "@/components/shared/imovel-link";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { obterContrato } from "@/features/contratos/queries";
import { ReceberDialog } from "@/features/financeiro/cobrancas/components/receber-dialog";
import { listarCobrancas } from "@/features/financeiro/cobrancas/queries";
import { formatDate, formatMonth } from "@/lib/dates";
import { options, STATUS_COBRANCA } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { TONE_CARD, TONE_ICON, TONE_TEXT } from "@/lib/tones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cobranças do imóvel" };

const TONE_ICON_BG = TONE_ICON;

export default async function CobrancasDoContratoPage(props: PageProps<"/financeiro/cobrancas/[contratoId]">) {
  const { contratoId } = await props.params;
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);

  const [contrato, settings] = await Promise.all([obterContrato(contratoId), getSettings()]);
  if (!contrato) notFound();

  const { itens, total, page, pageCount } = await listarCobrancas({
    contratoId,
    mes: lerParam("mes"),
    status: lerParam("status") as never,
    page: Number(lerParam("page") ?? 1),
  });

  const inquilino = contrato.partes.find((p) => p.papel === "LOCATARIO")?.pessoa.nome ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link href="/financeiro/cobrancas">
            <ArrowLeftIcon /> Todos os imóveis
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          <ImovelLink id={contrato.imovel.id}>{contrato.imovel.titulo}</ImovelLink>
        </h1>
        <p className="text-sm text-muted-foreground">
          {contrato.imovel.codigo} · {inquilino}
        </p>
      </div>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {itens.map((cobranca, index) => {
              const status = STATUS_COBRANCA[cobranca.statusEfetivo];
              const podeReceber = cobranca.statusEfetivo !== "PAGO" && cobranca.statusEfetivo !== "CANCELADO";
              return (
                <Card
                  key={cobranca.id}
                  className={cn("h-full animate-fade-up py-0 duration-300 hover:-translate-y-0.5 hover:shadow-lg", TONE_CARD[status.tone])}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full",
                          TONE_ICON_BG[status.tone],
                        )}
                      >
                        <HandCoinsIcon className="size-5" />
                      </span>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-base font-semibold capitalize">
                        {formatMonth(cobranca.competencia)}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="size-3.5" />
                        Vence em {formatDate(cobranca.vencimento)}
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      {cobranca.statusEfetivo === "PAGO" ? (
                        <p className="mb-3 text-lg font-bold text-success tabular-nums">
                          {formatBRL(cobranca.valorTotal)} <span className="text-sm font-medium">recebido</span>
                        </p>
                      ) : (
                        <p className={cn("mb-3 text-lg font-bold tabular-nums", TONE_TEXT[status.tone])}>
                          {formatBRL(cobranca.saldo)}
                        </p>
                      )}
                      {podeReceber ? (
                        <ReceberDialog
                          cobrancaId={cobranca.id}
                          saldo={cobranca.saldo}
                          vencimento={cobranca.vencimento}
                          percMulta={Number(settings.financeiro.percMulta)}
                          percJurosMes={Number(settings.financeiro.percJurosMes)}
                          trigger={
                            <Button size="lg" className="w-full">
                              Receber
                            </Button>
                          }
                        />
                      ) : cobranca.statusEfetivo === "PAGO" ? (
                        <Button size="lg" variant="outline" className="w-full" asChild>
                          <a href={`/api/pdf/recibo/${cobranca.id}`} target="_blank" rel="noreferrer">
                            <ReceiptIcon /> Recibo
                          </a>
                        </Button>
                      ) : (
                        <Button size="lg" variant="outline" disabled className="w-full">
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
