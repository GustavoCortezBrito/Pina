import { CalendarIcon, HandCoinsIcon } from "lucide-react";
import type { Metadata } from "next";
import { FilterBar, SearchInput } from "@/components/shared/filters";
import { CardOverlayLink, ImovelLink } from "@/components/shared/imovel-link";
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
import { TONE_CARD, TONE_ICON, TONE_TEXT } from "@/lib/tones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cobranças" };

const TONE_ICON_BG = TONE_ICON;

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
              <div
                key={item.contratoId}
                className="group relative animate-fade-up rounded-xl"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <CardOverlayLink
                  href={`/financeiro/cobrancas/${item.contratoId}`}
                  label={`Ver cobranças de ${item.imovel.titulo}`}
                />
                <Card
                  className={cn(
                    "pointer-events-none h-full py-0 duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/40",
                    TONE_CARD[tone],
                  )}
                >
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
                      <p className="truncate text-base font-semibold">
                        <ImovelLink id={item.imovel.id}>{item.imovel.titulo}</ImovelLink>
                      </p>
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
                      <p className={cn("text-lg font-bold tabular-nums", TONE_TEXT[tone])}>{formatBRL(item.saldoAberto)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
