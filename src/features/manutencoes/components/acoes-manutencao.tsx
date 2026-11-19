"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import type { ComboboxOption } from "@/components/shared/combobox";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Button } from "@/components/ui/button";
import { excluirManutencao } from "../actions";
import type { ManutencaoInput } from "../schemas";
import { ManutencaoDialog } from "./manutencao-dialog";

/** Editar (quem acessa o módulo) e excluir (só administrador) no card da manutenção. */
export function AcoesManutencao({
  imoveis,
  manutencao,
  despesas,
  podeExcluir,
}: {
  imoveis: ComboboxOption[];
  manutencao: ManutencaoInput & { id: string };
  despesas: number;
  podeExcluir: boolean;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <ManutencaoDialog
        imoveis={imoveis}
        manutencao={manutencao}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Editar manutenção">
            <PencilIcon />
          </Button>
        }
      />
      {podeExcluir && (
        <ConfirmAction
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label="Excluir manutenção">
              <Trash2Icon />
            </Button>
          }
          titulo="Excluir manutenção?"
          descricao={
            <>
              O chamado &quot;{manutencao.titulo}&quot; será apagado.
              {despesas > 0 &&
                ` ${despesas === 1 ? "A despesa vinculada continua registrada" : `As ${despesas} despesas vinculadas continuam registradas`} em Despesas, só sem o vínculo com a manutenção.`}{" "}
              Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          action={() => excluirManutencao(manutencao.id)}
        />
      )}
    </div>
  );
}
