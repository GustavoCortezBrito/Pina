"use client";

import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type Foto = { id: string; legenda: string | null };

export function GaleriaVitrine({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [atual, setAtual] = React.useState(0);
  const total = fotos.length;
  const ir = React.useCallback((i: number) => setAtual((i + total) % total), [total]);

  React.useEffect(() => {
    if (total < 2) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") ir(atual - 1);
      if (e.key === "ArrowRight") ir(atual + 1);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [atual, ir, total]);

  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <ImageIcon className="size-10" />
      </div>
    );
  }

  const foto = fotos[atual];
  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-lg">
        <img
          key={foto.id}
          src={`/api/vitrine/foto/${foto.id}?grande=1`}
          alt={foto.legenda ?? `${titulo} — foto ${atual + 1}`}
          className="size-full animate-scale-in object-cover"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(atual - 1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:scale-110 hover:bg-black/75"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => ir(atual + 1)}
              aria-label="Próxima foto"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:scale-110 hover:bg-black/75"
            >
              <ChevronRightIcon />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white tabular-nums backdrop-blur">
              {atual + 1} / {total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition sm:h-20 sm:w-28",
                i === atual ? "ring-primary" : "opacity-70 hover:opacity-100",
              )}
            >
              <img src={`/api/vitrine/foto/${f.id}`} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
