"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/** Quantas telas o usuário já abriu nesta aba; o botão "Voltar" usa isso para saber se há para onde voltar. */
export const CHAVE_NAVEGACAO = "pina.telas-abertas";

/** Reinicia uma animação de entrada suave a cada troca de página e conta as telas abertas. */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  React.useEffect(() => {
    try {
      const atual = Number(sessionStorage.getItem(CHAVE_NAVEGACAO) ?? 0);
      sessionStorage.setItem(CHAVE_NAVEGACAO, String(atual + 1));
    } catch {
      // sessionStorage indisponível (modo restrito): o botão usa o caminho de reserva.
    }
  }, [pathname]);

  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
