import { CalendarIcon, HandCoinsIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, SearchInput } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { resumoCobrancasPorContrato } from "@/features/financeiro/cobrancas/queries";
import { formatDate } from "@/lib/dates";
import type { Tone } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cobranças" };

const TONE_ICON_BG: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:text-red-300",
  primary: "bg-primary/15 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

export default async function CobrancasPage(props: PageProps<"/financeiro/cobrancas">) {
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const resumos = await resumoCobrancasPorContrato(q);

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranças" description="Um card por imóvel — clique para ver as parcelas." />

      <FilterBar>
        <SearchInput placeholder="Buscar por imóvel ou inquilino..." />
      </FilterBar>

      {resumos.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandCoinsIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma cobrança encontrada</EmptyTitle>
            <EmptyDescription>Ajuste a busca ou crie um contrato para gerar cobranças.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resumos.map((item, index) => {
            const tone: Tone = item.atrasadasCount > 0 ? "danger" : item.pendentesCount > 0 ? "warning" : "success";
            const statusLabel =
              item.atrasadasCount > 0
                ? `${item.atrasadasCount} em atraso`
                : item.pendentesCount > 0
                  ? `${item.pendentesCount} pendente${item.pendentesCount > 1 ? "s" : ""}`
                  : "Em dia";

            return (
              <Link
                key={item.contratoId}
                href={`/financeiro/cobrancas/${item.contratoId}`}
                className="animate-in fade-in slide-in-from-bottom-2 block rounded-xl duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full",
                          TONE_ICON_BG[tone],
                        )}
                      >
                        <HandCoinsIcon className="size-5" />
                      </span>
                      <StatusBadge label={statusLabel} tone={tone} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-base font-semibold">{item.imovel.titulo}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.imovel.codigo} · {item.inquilino}
                      </p>
                      {item.proximoVencimento && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="size-3.5" />
                          Próximo vencimento {formatDate(item.proximoVencimento)}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        {item.pendentesCount > 0 ? "Saldo em aberto" : "Tudo recebido"}
                      </p>
                      <p className="text-lg font-bold tabular-nums">{formatBRL(item.saldoAberto)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
