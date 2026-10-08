"use client";

import { useAction } from "@/components/shared/use-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatusImovel } from "@/generated/prisma/enums";
import { options, STATUS_IMOVEL } from "@/lib/labels";
import { alterarStatusImovel } from "../actions";

export function ImovelStatusSelect({ id, status }: { id: string; status: StatusImovel }) {
  const { pending, run } = useAction();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(novo) => run(() => alterarStatusImovel({ id, status: novo }))}
    >
      <SelectTrigger size="sm" className="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options(Object.fromEntries(Object.entries(STATUS_IMOVEL).map(([k, v]) => [k, v.label]))).map(
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
