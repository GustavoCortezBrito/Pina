"use client";

import {
  ArrowUpRightIcon,
  BedDoubleIcon,
  CarIcon,
  ImageIcon,
  MapPinIcon,
  PawPrintIcon,
  RulerIcon,
  ShowerHeadIcon,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import * as React from "react";
import { TIPO_IMOVEL } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ImovelVitrine } from "../queries";
import { Revelar } from "./animacao";

/**
 * Card do imóvel. Ao passar o mouse (ou focar com o teclado) as fotos se alternam como uma prévia;
 * as fotos extras só são baixadas nesse momento.
 */
export function VitrineCard({ imovel, index = 0 }: { imovel: ImovelVitrine; index?: number }) {
  const fotos = imovel.arquivos.map((a) => a.id);
  const [ativo, setAtivo] = React.useState(false);
  const [i, setI] = React.useState(0);
  const atual = ativo ? i : 0;

  React.useEffect(() => {
    if (!ativo || fotos.length < 2) return;
    const timer = setInterval(() => setI((v) => (v + 1) % fotos.length), 1400);
    return () => clearInterval(timer);
  }, [ativo, fotos.length]);

  const fatos = [
    { icon: BedDoubleIcon, valor: imovel.quartos, rotulo: imovel.quartos === 1 ? "quarto" : "quartos" },
    { icon: ShowerHeadIcon, valor: imovel.banheiros, rotulo: imovel.banheiros === 1 ? "banheiro" : "banheiros" },
    { icon: CarIcon, valor: imovel.vagas, rotulo: imovel.vagas === 1 ? "vaga" : "vagas" },
    ...(imovel.areaM2 != null ? [{ icon: RulerIcon, valor: imovel.areaM2, rotulo: "m²" }] : []),
  ];

  return (
    <Revelar atraso={(index % 3) * 0.09} y={36}>
      <Link
        href={`/imovel/${imovel.id}`}
        id={`imovel-${imovel.codigo}`}
        onPointerEnter={() => {
          setI(0);
          setAtivo(true);
        }}
        onPointerLeave={() => setAtivo(false)}
        onFocus={() => setAtivo(true)}
        onBlur={() => setAtivo(false)}
        className="group relative block rounded-[1.75rem] focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {/* brilho laranja atrás do card no hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.8rem] bg-gradient-to-br from-primary/60 via-transparent to-brand-deep/50 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
        />
        <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-card shadow-[0_2px_20px_-8px_rgb(0_0_0/0.12)] ring-1 ring-border transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_50px_-20px_rgb(0_0_0/0.35)]">
          <div className="relative m-2 aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-muted">
            {fotos.length > 0 ? (
              <div className="absolute inset-0 transition-transform duration-[1.4s] ease-out group-hover:scale-110">
                <AnimatePresence initial={false}>
                  <m.img
                    key={fotos[atual]}
                    src={`/api/vitrine/foto/${fotos[atual]}`}
                    alt={atual === 0 ? imovel.titulo : `${imovel.titulo} — foto ${atual + 1}`}
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 size-full object-cover"
                  />
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-accent text-muted-foreground">
                <ImageIcon className="size-10 opacity-50" />
              </div>
            )}
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20" />

            <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              <span className="glass-dark rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white">
                {TIPO_IMOVEL[imovel.tipo]}
              </span>
              {imovel.aceitaPet && (
                <span
                  className="glass-dark flex size-8 items-center justify-center rounded-full text-white"
                  title="Aceita pet"
                  aria-label="Aceita pet"
                >
                  <PawPrintIcon className="size-4" />
                </span>
              )}
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
              {imovel.valorAluguel != null ? (
                <p className="leading-none">
                  <span className="block text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase">Aluguel</span>
                  <span className="mt-1 block font-display text-[1.7rem] font-semibold tabular-nums">
                    {formatBRL(imovel.valorAluguel)}
                    <span className="ml-1 font-sans text-sm font-medium text-white/70">/mês</span>
                  </span>
                </p>
              ) : (
                <p className="font-display text-xl font-semibold">Consulte o valor</p>
              )}
              <span className="flex size-10 shrink-0 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg shadow-primary/40 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRightIcon className="size-5" />
              </span>
            </div>

            {fotos.length > 1 && (
              <span aria-hidden className="absolute inset-x-4 bottom-1.5 flex gap-1">
                {fotos.map((f, n) => (
                  <span
                    key={f}
                    className={cn(
                      "h-[3px] flex-1 rounded-full transition-colors duration-500",
                      ativo && n === atual ? "bg-white" : "bg-white/25",
                    )}
                  />
                ))}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-5">
            <div className="space-y-1">
              <h3 className="line-clamp-1 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary-ink">
                {imovel.titulo}
              </h3>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5 shrink-0 text-primary-ink" />
                {[imovel.bairro, imovel.cidade].filter(Boolean).join(" · ")}
              </p>
            </div>
            <ul className="mt-auto flex flex-wrap gap-1.5">
              {fatos.map(({ icon: Icon, valor, rotulo }) => (
                <li
                  key={rotulo}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80"
                >
                  <Icon className="size-3.5 text-primary-ink" />
                  <span className="tabular-nums">{valor}</span> {rotulo}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </Link>
    </Revelar>
  );
}
