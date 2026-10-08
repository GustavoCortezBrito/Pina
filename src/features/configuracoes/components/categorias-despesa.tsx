"use client";

import { PlusIcon } from "lucide-react";
import * as React from "react";
import { useAction } from "@/components/shared/use-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { alternarCategoriaDespesa, criarCategoriaDespesa } from "../actions";

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
            <Switch
              checked={categoria.ativo}
              disabled={pending}
              onCheckedChange={(checked) => run(() => alternarCategoriaDespesa(categoria.id, checked))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
