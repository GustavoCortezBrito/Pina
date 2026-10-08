"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-types";

/**
 * Chama uma Server Action mostrando o resultado em toast e atualizando a tela.
 * `run` devolve o resultado para quem precisar tratar erros de campo.
 */
export function useAction() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const run = React.useCallback(
    <T,>(
      action: () => Promise<ActionResult<T>>,
      options: { success?: string; onSuccess?: (data: T) => void; refresh?: boolean } = {},
    ) =>
      new Promise<ActionResult<T>>((resolve) => {
        startTransition(async () => {
          const result = await action();
          if (!result.ok) {
            toast.error(result.error);
          } else {
            const mensagem = options.success ?? result.message;
            if (mensagem) toast.success(mensagem);
            options.onSuccess?.(result.data);
            if (options.refresh !== false) router.refresh();
          }
          resolve(result);
        });
      }),
    [router],
  );

  return { pending, run };
}
