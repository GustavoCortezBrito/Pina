"use client";

import * as m from "motion/react-m";
import { EASE } from "./animacao";
import { WhatsappIcon } from "./whatsapp-icon";

/** Barra fixa no rodapé do celular com o valor e o botão de contato; sobe suavemente depois que a página abre. */
export function BarraContatoMobile({ whats, preco }: { whats: string; preco: string | null }) {
  return (
    <m.div
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs text-muted-foreground">Aluguel</p>
          <p className="truncate font-display text-xl font-medium tabular-nums">
            {preco ?? "Consulte"}
            {preco && <span className="font-sans text-sm text-muted-foreground">/mês</span>}
          </p>
        </div>
        <m.a
          href={whats}
          target="_blank"
          rel="noreferrer"
          whileTap={{ scale: 0.95 }}
          className="btn-whatsapp flex h-12 shrink-0 items-center gap-2 rounded-full px-6 font-semibold"
        >
          <WhatsappIcon /> Tenho interesse
        </m.a>
      </div>
    </m.div>
  );
}
