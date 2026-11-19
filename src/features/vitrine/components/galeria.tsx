"use client";

import { ChevronLeftIcon, ChevronRightIcon, GridIcon, ImageIcon, XIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Dialog } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";
import { EASE } from "./animacao";

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
            <m.button
              key={f.id}
              type="button"
              onClick={() => setAberta(i)}
              aria-label={`Ampliar foto ${i + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: EASE }}
              className={cn("group relative overflow-hidden bg-muted", span)}
            >
              <img
                src={grande(f.id)}
                alt={alt(i)}
                loading={i === 0 ? "eager" : "lazy"}
                className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
              {ultima && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 font-display text-3xl font-medium text-white backdrop-blur-[2px]">
                  +{restantes} fotos
                </span>
              )}
            </m.button>
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

      <Lightbox
        fotos={fotos}
        titulo={titulo}
        inicial={aberta}
        alt={alt}
        onFechar={() => setAberta(null)}
      />
    </>
  );
}

const variantes = {
  entra: (dir: number) => ({ x: dir > 0 ? 90 : -90, opacity: 0, scale: 0.97 }),
  centro: { x: 0, opacity: 1, scale: 1 },
  sai: (dir: number) => ({ x: dir > 0 ? -90 : 90, opacity: 0, scale: 0.97 }),
};

function Lightbox({
  fotos,
  titulo,
  inicial,
  alt,
  onFechar,
}: {
  fotos: Foto[];
  titulo: string;
  /** Índice da foto aberta; `null` mantém fechado. */
  inicial: number | null;
  alt: (i: number) => string;
  onFechar: () => void;
}) {
  return (
    <Dialog.Root open={inicial !== null} onOpenChange={(o) => !o && onFechar()}>
      <AnimatePresence>
        {inicial !== null && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[60] bg-[oklch(0.1_0.005_50/0.97)]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[61] flex flex-col text-white outline-none"
              >
                <Dialog.Title className="sr-only">Fotos de {titulo}</Dialog.Title>
                {/* O corpo nasce a cada abertura, já na foto tocada. */}
                <CorpoDoLightbox fotos={fotos} inicial={inicial} alt={alt} onFechar={onFechar} />
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function CorpoDoLightbox({
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
  const total = fotos.length;
  // [foto atual, direção da última troca] — a direção define de que lado a nova foto entra.
  const [[atual, direcao], setPagina] = React.useState<[number, number]>([inicial, 0]);
  const miniaturas = React.useRef<HTMLDivElement>(null);

  const ir = React.useCallback(
    (destino: number, dir: number) => setPagina([(destino + total) % total, dir]),
    [total],
  );

  React.useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPagina(([a]) => [(a - 1 + total) % total, -1]);
      if (e.key === "ArrowRight") setPagina(([a]) => [(a + 1) % total, 1]);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [total]);

  React.useEffect(() => {
    miniaturas.current
      ?.querySelector<HTMLElement>(`[data-i="${atual}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [atual]);

  const seta =
    "absolute top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/20";

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <span className="text-sm font-medium text-white/70 tabular-nums">
          {atual + 1} / {total}
        </span>
        <Dialog.Close
          aria-label="Fechar"
          className="flex size-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <XIcon className="size-5" />
        </Dialog.Close>
      </div>

      <div
        onClick={(e) => e.target === e.currentTarget && onFechar()}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-20"
      >
        <AnimatePresence initial={false} custom={direcao} mode="popLayout">
          <m.img
            key={fotos[atual].id}
            src={grande(fotos[atual].id)}
            alt={alt(atual)}
            draggable={false}
            custom={direcao}
            variants={variantes}
            initial="entra"
            animate="centro"
            exit="sai"
            transition={{ duration: 0.4, ease: EASE }}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, { offset, velocity }) => {
              const forca = Math.abs(offset.x) > 90 || Math.abs(velocity.x) > 500;
              if (forca && offset.x < 0) ir(atual + 1, 1);
              else if (forca && offset.x > 0) ir(atual - 1, -1);
            }}
            className="max-h-full max-w-full cursor-grab touch-pan-y rounded-xl object-contain select-none active:cursor-grabbing"
          />
        </AnimatePresence>
        {total > 1 && (
          <>
            <button type="button" onClick={() => ir(atual - 1, -1)} aria-label="Foto anterior" className={cn(seta, "left-3 sm:left-6")}>
              <ChevronLeftIcon className="size-6" />
            </button>
            <button type="button" onClick={() => ir(atual + 1, 1)} aria-label="Próxima foto" className={cn(seta, "right-3 sm:right-6")}>
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
              onClick={() => ir(i, i > atual ? 1 : -1)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity sm:h-16 sm:w-24",
                i === atual ? "opacity-100" : "opacity-45 hover:opacity-80",
              )}
            >
              <img src={pequena(f.id)} alt="" loading="lazy" className="size-full object-cover" />
              {i === atual && (
                <m.span
                  layoutId="miniatura-ativa"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                  className="absolute inset-0 rounded-lg ring-2 ring-primary ring-inset"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
