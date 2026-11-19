"use client";

import { CheckIcon, Share2Icon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";

/** Compartilha o imóvel: abre o menu do celular (WhatsApp, etc.) ou copia o link no computador. */
export function CompartilharBotao({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = React.useState(false);

  async function compartilhar() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sem permissão para copiar: não há o que fazer sem atrapalhar a pessoa.
    }
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      id="imovel-compartilhar"
      className="inline-flex h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/60"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={copiado ? "ok" : "share"}
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {copiado ? <CheckIcon className="size-4 text-success" /> : <Share2Icon className="size-4 text-primary-ink" />}
        </m.span>
      </AnimatePresence>
      {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
