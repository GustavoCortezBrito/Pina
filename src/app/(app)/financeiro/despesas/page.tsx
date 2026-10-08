import { PencilIcon, Trash2Icon, WalletIcon } from "lucide-react";
import type { Metadata } from "next";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { FilterBar, FilterSelect, MonthFilter } from "@/components/shared/filters";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DespesaDialog } from "@/features/financeiro/despesas/components/despesa-dialog";
import { excluirDespesa } from "@/features/financeiro/despesas/actions";
import { categoriasAtivas, listarDespesas } from "@/features/financeiro/despesas/queries";
import { opcoesImoveis } from "@/features/imoveis/queries";
import { formatDate } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

export const metadata: Metadata = { title: "Despesas" };

export default async function DespesasPage(props: PageProps<"/financeiro/despesas">) {
  const params = await props.searchParams;
  const lerParam = (nome: string) => (typeof params[nome] === "string" ? params[nome] : undefined);

  const [{ itens, total, page, pageCount, somaValor }, categorias, imoveis] = await Promise.all([
    listarDespesas({
      imovelId: lerParam("imovel"),
      categoriaId: lerParam("categoria"),
      mes: lerParam("mes"),
      page: Number(lerParam("page") ?? 1),
    }),
    categoriasAtivas(),
    opcoesImoveis(),
  ]);

  const categoriasOptions = categorias.map((c) => ({ value: c.id, label: c.nome }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despesas"
        description="Gastos por imóvel: manutenção, IPTU, condomínio e outros."
        actions={<DespesaDialog imoveis={imoveis} categorias={categoriasOptions} />}
      />

      <FilterBar>
        <MonthFilter param="mes" />
        <FilterSelect param="categoria" placeholder="Categoria" options={categoriasOptions} />
        <FilterSelect param="imovel" placeholder="Imóvel" options={imoveis} />
      </FilterBar>

      {itens.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma despesa encontrada</EmptyTitle>
            <EmptyDescription>Ajuste os filtros ou registre uma nova despesa.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="space-y-4">
            {itens.map((despesa, index) => (
              <Card
                key={despesa.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <CardContent className="flex flex-wrap items-center gap-4 p-5 sm:flex-nowrap sm:p-6">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <WalletIcon className="size-6" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-lg font-semibold">{despesa.categoria.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(despesa.data)}
                      {despesa.imovel && ` · ${despesa.imovel.codigo}`}
                      {despesa.fornecedor && ` · ${despesa.fornecedor}`}
                    </p>
                  </div>

                  <p className="shrink-0 text-xl font-bold tabular-nums">{formatBRL(despesa.valor)}</p>

                  <div className="flex shrink-0 gap-1">
                    <DespesaDialog
                      imoveis={imoveis}
                      categorias={categoriasOptions}
                      despesa={{
                        id: despesa.id,
                        imovelId: despesa.imovelId,
                        categoriaId: despesa.categoriaId,
                        data: formatDate(despesa.data).split("/").reverse().join("-"),
                        valor: despesa.valor,
                        fornecedor: despesa.fornecedor ?? "",
                        descricao: despesa.descricao ?? "",
                        pago: despesa.pago,
                      }}
                      trigger={
                        <Button variant="outline" size="icon" aria-label="Editar despesa">
                          <PencilIcon />
                        </Button>
                      }
                    />
                    <ConfirmAction
                      trigger={
                        <Button variant="outline" size="icon" aria-label="Excluir despesa">
                          <Trash2Icon />
                        </Button>
                      }
                      titulo="Excluir despesa?"
                      descricao="Esta ação não pode ser desfeita."
                      confirmLabel="Excluir"
                      action={excluirDespesa.bind(null, despesa.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Pagination page={page} pageCount={pageCount} total={total} label="despesas" />
            <p className="text-sm font-medium">Total: {formatBRL(somaValor)}</p>
          </div>
        </>
      )}
    </div>
  );
}
