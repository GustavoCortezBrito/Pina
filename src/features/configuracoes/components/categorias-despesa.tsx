"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { useAction } from "@/components/shared/use-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { alternarCategoriaDespesa, criarCategoriaDespesa, excluirCategoriaDespesa } from "../actions";

export type Categoria = { id: string; nome: string; ativo: boolean };

export function CategoriasDespesa({ categorias }: { categorias: Categoria[] }) {
  const { pending, run } = useAction();
  const [nome, setNome] = React.useState("");

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await run(() => criarCategoriaDespesa({ nome }));
          if (result.ok) setNome("");
        }}
      >
        <Input
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Nova categoria"
          className="max-w-xs"
        />
        <Button type="submit" variant="outline" disabled={pending || !nome.trim()}>
          <PlusIcon /> Adicionar
        </Button>
      </form>

      <ul className="divide-y rounded-lg border">
        {categorias.map((categoria) => (
          <li key={categoria.id} className="flex items-center justify-between gap-3 p-3">
            <span className="flex items-center gap-2 text-sm">
              {categoria.nome}
              {!categoria.ativo && <Badge variant="secondary">Inativa</Badge>}
            </span>
            <span className="flex items-center gap-3">
              <Switch
                checked={categoria.ativo}
                disabled={pending}
                aria-label={categoria.ativo ? "Desativar categoria" : "Ativar categoria"}
                onCheckedChange={(checked) =>
                  run(() => alternarCategoriaDespesa(categoria.id, checked))
                }
              />
              <ConfirmAction
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${categoria.nome}`} title="Excluir">
                    <Trash2Icon className="text-danger" />
                  </Button>
                }
                titulo={`Excluir "${categoria.nome}"?`}
                descricao="Só é possível excluir categorias que nunca foram usadas em despesas. Se já foi usada, desative-a."
                confirmLabel="Excluir"
                action={excluirCategoriaDespesa.bind(null, categoria.id)}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
