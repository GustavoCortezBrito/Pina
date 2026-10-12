"use client";

import { PlusIcon } from "lucide-react";
import type { ComboboxOption } from "@/components/shared/combobox";
import { Button } from "@/components/ui/button";
import { DespesaDialog } from "@/features/financeiro/despesas/components/despesa-dialog";

/** Botão "+ Despesa" do card de manutenção; o gatilho nasce no cliente (evita passar elementos do servidor). */
export function DespesaDaManutencao({
  imoveis,
  categorias,
  manutencao,
}: {
  imoveis: ComboboxOption[];
  categorias: ComboboxOption[];
  manutencao: { id: string; titulo: string; imovelId: string };
}) {
  return (
    <DespesaDialog
      imoveis={imoveis}
      categorias={categorias}
      manutencao={manutencao}
      trigger={
        <Button variant="outline" size="sm" className="shrink-0">
          <PlusIcon /> Despesa
        </Button>
      }
    />
  );
}
