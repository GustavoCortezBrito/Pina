import { ChevronRightIcon, FileSignatureIcon, PlusIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { FilterBar, FilterSelect, SearchInput } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { StatusContrato } from "@/generated/prisma/enums";
import { listarContratos } from "@/features/contratos/queries";
import { formatDate } from "@/lib/dates";
import { formatNumeroContrato } from "@/lib/format";
import { options, PAPEL_CONTRATO, STATUS_CONTRATO } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contratos" };

const TONE_ICON_BG: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  info: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:text-red-300",
  primary: "bg-primary/15 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

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
          <div className="space-y-4">
            {itens.map((contrato, index) => {
              const status = STATUS_CONTRATO[contrato.status];
              const locatario = contrato.partes.find((p) => p.papel === "LOCATARIO");
              const outrasPartes = contrato.partes.filter((p) => p !== locatario);
              return (
                <Link
                  key={contrato.id}
                  href={`/contratos/${contrato.id}`}
                  className="animate-in fade-in slide-in-from-bottom-2 block rounded-2xl duration-500 fill-mode-both"
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap sm:p-6">
                      <span
                        className={cn(
                          "flex size-14 shrink-0 items-center justify-center rounded-full",
                          TONE_ICON_BG[status.tone],
                        )}
                      >
                        <FileSignatureIcon className="size-6" />
                      </span>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-semibold">{contrato.imovel.titulo}</p>
                          <StatusBadge label={status.label} tone={status.tone} className="text-xs" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Contrato nº {formatNumeroContrato(contrato.numero)} · {contrato.imovel.codigo}
                        </p>
                        {locatario && (
                          <p className="flex items-center gap-1.5 text-sm">
                            <UserIcon className="size-4 text-muted-foreground" />
                            <span className="font-medium">{locatario.pessoa.nome}</span>
                            {outrasPartes.length > 0 && (
                              <span className="text-muted-foreground">
                                · {outrasPartes.map((p) => `${PAPEL_CONTRATO[p.papel]}: ${p.pessoa.nome}`).join(", ")}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold tabular-nums">{formatBRL(contrato.valorAluguel)}</p>
                        <p className="text-sm text-muted-foreground">por mês</p>
                      </div>

                      <div className="hidden shrink-0 border-l pl-4 text-right text-sm text-muted-foreground md:block">
                        <p>Início {formatDate(contrato.dataInicio)}</p>
                        <p>Fim {formatDate(contrato.dataFim)}</p>
                      </div>

                      <ChevronRightIcon className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
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
