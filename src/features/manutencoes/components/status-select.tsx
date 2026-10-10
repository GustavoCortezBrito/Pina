"use client";

import { useAction } from "@/components/shared/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusManutencao } from "@/generated/prisma/enums";
import { options, STATUS_MANUTENCAO } from "@/lib/labels";
import { alterarStatusManutencao } from "../actions";

export function ManutencaoStatusSelect({ id, status }: { id: string; status: StatusManutencao }) {
  const { pending, run } = useAction();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(novo) => run(() => alterarStatusManutencao({ id, status: novo }))}
    >
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options(Object.fromEntries(Object.entries(STATUS_MANUTENCAO).map(([k, v]) => [k, v.label]))).map(
          (opcao) => (
            <SelectItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
