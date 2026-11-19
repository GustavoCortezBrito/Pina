"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import type { ComboboxOption } from "@/components/shared/combobox";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Button } from "@/components/ui/button";
import { excluirDespesa } from "@/features/financeiro/despesas/actions";
import { DespesaDialog } from "@/features/financeiro/despesas/components/despesa-dialog";
import { formatBRL } from "@/lib/money";

export type DespesaDaLista = {
  id: string;
  imovelId: string | null;
  manutencaoId: string | null;
  categoriaId: string;
  categoriaNome: string;
  /** AAAA-MM-DD (o formulário usa esse formato). */
  data: string;
  dataLabel: string;
  valor: number;
  fornecedor: string | null;
  descricao: string | null;
  pago: boolean;
};

/** Despesas lançadas na manutenção, cada uma com editar e (administrador) excluir. */
export function DespesasDaManutencaoLista({
  despesas,
  imoveis,
  categorias,
  podeExcluir,
}: {
  despesas: DespesaDaLista[];
  imoveis: ComboboxOption[];
  categorias: ComboboxOption[];
  podeExcluir: boolean;
}) {
  return (
    <ul className="divide-y rounded-lg bg-background/70 ring-1 ring-border">
      {despesas.map((despesa) => (
        <li key={despesa.id} className="flex items-center gap-2 px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {despesa.categoriaNome}
              {despesa.fornecedor ? ` · ${despesa.fornecedor}` : ""}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {despesa.dataLabel}
              {!despesa.pago && " · a pagar"}
            </p>
          </div>
          <span className="shrink-0 font-bold tabular-nums">{formatBRL(despesa.valor)}</span>
          <DespesaDialog
            imoveis={imoveis}
            categorias={categorias}
            despesa={{
              id: despesa.id,
              imovelId: despesa.imovelId,
              manutencaoId: despesa.manutencaoId,
              categoriaId: despesa.categoriaId,
              data: despesa.data,
              valor: despesa.valor,
              fornecedor: despesa.fornecedor ?? "",
              descricao: despesa.descricao ?? "",
              pago: despesa.pago,
            }}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Editar despesa">
                <PencilIcon />
              </Button>
            }
          />
          {podeExcluir && (
            <ConfirmAction
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Excluir despesa">
                  <Trash2Icon />
                </Button>
              }
              titulo="Excluir despesa?"
              descricao="Esta ação não pode ser desfeita."
              confirmLabel="Excluir"
              action={() => excluirDespesa(despesa.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
