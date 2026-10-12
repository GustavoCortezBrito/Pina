"use client";

import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ImageIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type Foto = { id: string; legenda: string | null };

const grande = (id: string) => `/api/vitrine/foto/${id}?grande=1`;
const pequena = (id: string) => `/api/vitrine/foto/${id}`;

/**
 * Mosaico de fotos (computador) / carrossel deslizável (celular). Tocar em qualquer foto
 * abre a visualização em tela cheia, com setas, teclado e arrastar para o lado.
 */
export function GaleriaVitrine({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [aberta, setAberta] = React.useState<number | null>(null);
  const [slide, setSlide] = React.useState(0);
  const total = fotos.length;

  if (total === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-[2rem] bg-gradient-to-br from-muted to-accent text-muted-foreground">
        <ImageIcon className="size-12 opacity-50" />
      </div>
    );
  }

  const alt = (i: number) => fotos[i].legenda ?? `${titulo} — foto ${i + 1}`;
  const visiveis = fotos.slice(0, 5);
  const restantes = total - visiveis.length;

  return (
    <>
      {/* Celular: carrossel com encaixe */}
      <div className="relative -mx-4 sm:mx-0 md:hidden">
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-[1.75rem]"
        >
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setAberta(i)}
              className="aspect-[4/3] w-full shrink-0 snap-center bg-muted"
              aria-label={`Ampliar foto ${i + 1}`}
            >
              <img
                src={i === 0 ? grande(f.id) : pequena(f.id)}
                alt={alt(i)}
                loading={i === 0 ? "eager" : "lazy"}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
        {total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {fotos.slice(0, 10).map((f, i) => (
              <span
                key={f.id}
                className={cn(
                  "h-1.5 rounded-full bg-white/60 shadow transition-all duration-300",
                  i === Math.min(slide, 9) ? "w-6 bg-white" : "w-1.5",
                )}
              />
            ))}
          </div>
        )}
        <span className="glass-dark absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold text-white tabular-nums sm:right-4">
          {slide + 1} / {total}
        </span>
      </div>

      {/* Computador: mosaico */}
      <div
        className={cn(
          "relative hidden h-[30rem] gap-2.5 overflow-hidden rounded-[2rem] md:grid lg:h-[34rem]",
          visiveis.length === 1 ? "grid-cols-1" : "grid-cols-4 grid-rows-2",
        )}
      >
        {visiveis.map((f, i) => {
          const n = visiveis.length;
          const span =
            i === 0
              ? n === 1
                ? ""
                : "col-span-2 row-span-2"
              : n === 2
                ? "col-span-2 row-span-2"
                : n === 3 || (n === 4 && i === 1)
                  ? "col-span-2"
                  : "";
          const ultima = i === n - 1 && restantes > 0;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setAberta(i)}
              aria-label={`Ampliar foto ${i + 1}`}
              className={cn("group relative overflow-hidden bg-muted", span)}
            >
              <img
                src={grande(f.id)}
                alt={alt(i)}
                loading={i === 0 ? "eager" : "lazy"}
                className="size-full animate-fade-in object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              {ultima && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-3xl font-medium text-white backdrop-blur-[2px]">
                  +{restantes} fotos
                </span>
              )}
            </button>
          );
        })}
        {total > 1 && (
          <button
            type="button"
            onClick={() => setAberta(0)}
            id="galeria-ver-todas"
            className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <GridIcon className="size-4" /> Ver todas as {total} fotos
          </button>
        )}
      </div>

      {aberta !== null && <Lightbox fotos={fotos} inicial={aberta} alt={alt} onFechar={() => setAberta(null)} />}
    </>
  );
}

function Lightbox({
  fotos,
  inicial,
  alt,
  onFechar,
}: {
  fotos: Foto[];
  inicial: number;
  alt: (i: number) => string;
  onFechar: () => void;
}) {
  const [atual, setAtual] = React.useState(inicial);
  const total = fotos.length;
  const ir = React.useCallback((i: number) => setAtual((i + total) % total), [total]);
  const toqueX = React.useRef<number | null>(null);
  const miniaturas = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowLeft") setAtual((a) => (a - 1 + total) % total);
      if (e.key === "ArrowRight") setAtual((a) => (a + 1) % total);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [onFechar, total]);

  React.useEffect(() => {
    miniaturas.current
      ?.querySelector<HTMLElement>(`[data-i="${atual}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [atual]);

  const seta =
    "absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fotos do imóvel"
      className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-[oklch(0.1_0.005_50/0.97)] text-white"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <span className="text-sm font-medium text-white/70 tabular-nums">
          {atual + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="flex size-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20"
        onPointerDown={(e) => (toqueX.current = e.clientX)}
        onPointerUp={(e) => {
          if (toqueX.current == null) return;
          const dx = e.clientX - toqueX.current;
          toqueX.current = null;
          if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
        }}
      >
        <img
          key={fotos[atual].id}
          src={grande(fotos[atual].id)}
          alt={alt(atual)}
          draggable={false}
          className="max-h-full max-w-full animate-scale-in rounded-xl object-contain select-none"
        />
        {total > 1 && (
          <>
            <button type="button" onClick={() => ir(atual - 1)} aria-label="Foto anterior" className={cn(seta, "left-3 sm:left-6")}>
              <ChevronLeftIcon className="size-6" />
            </button>
            <button type="button" onClick={() => ir(atual + 1)} aria-label="Próxima foto" className={cn(seta, "right-3 sm:right-6")}>
              <ChevronRightIcon className="size-6" />
            </button>
          </>
        )}
      </div>

      {fotos[atual].legenda && <p className="px-6 pt-3 text-center text-sm text-white/70">{fotos[atual].legenda}</p>}

      {total > 1 && (
        <div ref={miniaturas} className="no-scrollbar flex shrink-0 justify-start gap-2 overflow-x-auto px-4 py-4 sm:justify-center">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              data-i={i}
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition sm:h-16 sm:w-24",
                i === atual ? "opacity-100 ring-primary" : "opacity-45 ring-transparent hover:opacity-80",
              )}
            >
              <img src={pequena(f.id)} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
