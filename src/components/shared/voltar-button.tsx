"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { CHAVE_NAVEGACAO } from "@/components/layout/route-transition";
import { Button } from "@/components/ui/button";

/**
 * Volta para a tela anterior do sistema. Se a página foi aberta direto (link, favorito, nova aba)
 * não há tela anterior, então vai para o caminho de reserva.
 */
export function VoltarButton({ fallback, label = "Voltar" }: { fallback: string; label?: string }) {
  const router = useRouter();

  function voltar() {
    let telas = 0;
    try {
      telas = Number(sessionStorage.getItem(CHAVE_NAVEGACAO) ?? 0);
    } catch {
      telas = 0;
    }
    if (telas > 1 && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 text-muted-foreground">
      <ArrowLeftIcon /> {label}
    </Button>
  );
}
