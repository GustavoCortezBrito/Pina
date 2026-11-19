"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type AbaTipo = { chave: string; rotulo: string; total: number; href: string; ativo: boolean };

/** Atalhos por tipo de imóvel; o fundo escuro desliza de uma aba para a outra. */
export function TipoTabs({ abas }: { abas: AbaTipo[] }) {
  return (
    <nav aria-label="Tipo de imóvel" className="no-scrollbar -mx-1 mt-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {abas.map((aba) => (
        <Link
          key={aba.chave}
          href={aba.href}
          scroll={false}
          aria-current={aba.ativo ? "page" : undefined}
          className={cn(
            "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            aba.ativo
              ? "border-transparent text-background"
              : "bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {aba.ativo && (
            <m.span
              layoutId="aba-tipo-ativa"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="absolute -inset-px rounded-full bg-foreground shadow-md"
            />
          )}
          <span className="relative">{aba.rotulo}</span>
          <span
            className={cn(
              "relative rounded-full px-1.5 text-xs tabular-nums",
              aba.ativo ? "bg-background/20" : "bg-muted text-muted-foreground",
            )}
          >
            {aba.total}
          </span>
        </Link>
      ))}
    </nav>
  );
}
