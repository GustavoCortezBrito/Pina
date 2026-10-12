import { FileSignatureIcon, PlusIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, SearchInput } from "@/components/shared/filters";
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
import { StatusContrato } from "@/generated/prisma/enums";
import { listarContratos } from "@/features/contratos/queries";
import { formatDate } from "@/lib/dates";
import { formatNumeroContrato } from "@/lib/format";
import { options, PAPEL_CONTRATO, STATUS_CONTRATO } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { TONE_CARD, TONE_ICON, TONE_TEXT } from "@/lib/tones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contratos" };


export default async function ContratosPage(props: PageProps<"/contratos">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);
  const statusParam = lerParam("status");

  const { itens, total, page, pageCount } = await listarContratos({
    q: lerParam("q"),
    status: Object.values(StatusContrato).includes(statusParam as StatusContrato)
      ? (statusParam as StatusContrato)
      : undefined,
    page: Number(lerParam("page") ?? 1),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Locações em andamento e encerradas."
        actions={
          <Button size="lg" asChild>
            <Link href="/contratos/novo">
              <PlusIcon /> Novo contrato
            </Link>
          </Button>
        }
      />

      <FilterBar>
        <SearchInput placeholder="Buscar por imóvel ou inquilino..." />
        <FilterSelect
          param="status"
          placeholder="Status"
          options={options(Object.fromEntries(Object.entries(STATUS_CONTRATO).map(([k, v]) => [k, v.label])))}
        />
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSignatureIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum contrato encontrado</EmptyTitle>
            <EmptyDescription>Ajuste os filtros ou crie o primeiro contrato.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {itens.map((contrato, index) => {
              const status = STATUS_CONTRATO[contrato.status];
              const estilo = {
                card: TONE_CARD[status.tone],
                icon: TONE_ICON[status.tone],
                valor: status.tone === "success" ? TONE_TEXT.success : "text-foreground",
              };
              const locatario = contrato.partes.find((p) => p.papel === "LOCATARIO");
              const fiador = contrato.partes.find((p) => p.papel === "FIADOR");
              return (
                <Link
                  key={contrato.id}
                  href={`/contratos/${contrato.id}`}
                  className="group block animate-fade-up rounded-xl"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Card
                    className={cn(
                      "h-full py-0 duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/40",
                      estilo.card,
                    )}
                  >
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-full",
                            estilo.icon,
                          )}
                        >
                          <FileSignatureIcon className="size-5" />
                        </span>
                        <StatusBadge label={status.label} tone={status.tone} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-base font-semibold">{contrato.imovel.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          nº {formatNumeroContrato(contrato.numero)} · {contrato.imovel.codigo}
                        </p>
                        {locatario && (
                          <p className="flex items-center gap-1.5 truncate text-sm">
                            <UserIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate font-medium">{locatario.pessoa.nome}</span>
                          </p>
                        )}
                        {fiador && (
                          <p className="truncate text-xs text-muted-foreground">
                            {PAPEL_CONTRATO.FIADOR}: {fiador.pessoa.nome}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end justify-between border-t pt-3">
                        <div>
                          <p className={cn("text-lg font-bold tabular-nums", estilo.valor)}>
                            {formatBRL(contrato.valorAluguel)}
                          </p>
                          <p className="text-xs text-muted-foreground">por mês</p>
                        </div>
                        <p className="text-right text-xs text-muted-foreground">
                          até
                          <br />
                          {formatDate(contrato.dataFim)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <Pagination page={page} pageCount={pageCount} total={total} label="contratos" />
        </>
      )}
    </div>
  );
}
