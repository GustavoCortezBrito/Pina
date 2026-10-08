"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAction } from "@/components/shared/use-action";
import type { ActionResult } from "@/lib/action-types";

export function ConfirmAction({
  trigger,
  titulo,
  descricao,
  confirmLabel = "Confirmar",
  action,
  onDone,
}: {
  trigger: React.ReactNode;
  titulo: string;
  descricao: React.ReactNode;
  confirmLabel?: string;
  action: () => Promise<ActionResult<unknown>>;
  onDone?: () => void;
}) {
  const { pending, run } = useAction();
  const [aberto, setAberto] = React.useState(false);

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={async (event) => {
              event.preventDefault();
              const result = await run(action);
              if (result.ok) {
                setAberto(false);
                onDone?.();
              }
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
