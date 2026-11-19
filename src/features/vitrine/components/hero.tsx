"use client";

import { ArrowDownIcon, ArrowUpRightIcon, BedDoubleIcon, CameraIcon, MapPinIcon, RulerIcon, ShowerHeadIcon } from "lucide-react";
import { useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import * as React from "react";
import { TIPO_IMOVEL } from "@/lib/labels";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ImovelVitrine } from "../queries";
import { Contador, EASE } from "./animacao";
import { WhatsappIcon } from "./whatsapp-icon";

const TITULO: Array<{ texto: string; destaque?: boolean }> = [
  { texto: "O" },
  { texto: "lugar" },
  { texto: "certo" },
  { texto: "para" },
  { texto: "viver", destaque: true },
  { texto: "e" },
  { texto: "trabalhar", destaque: true },
];

/** Sublinhado desenhado à mão sob as palavras em destaque. */
function Sublinhado({ atraso }: { atraso: number }) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-[0.06em] h-[0.2em] w-full overflow-visible"
    >
      <m.path
        d="M2 8 C 34 2, 70 11, 104 6 S 168 3, 198 7"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: atraso, duration: 0.9, ease: EASE }}
      />
    </svg>
  );
}

function Palavra({ texto, destaque, i }: { texto: string; destaque?: boolean; i: number }) {
  const atraso = 0.3 + i * 0.08;
  return (
    <span className="relative inline-block">
      <span className="inline-block overflow-hidden pb-[0.16em] align-bottom [margin-bottom:-0.16em]">
        <m.span
          className={cn("inline-block", destaque && "text-gradient-brand pr-[0.08em] font-normal italic")}
          initial={{ y: "118%", rotate: 5 }}
          animate={{ y: "0%", rotate: 0 }}
          transition={{ delay: atraso, duration: 0.95, ease: EASE }}
        >
          {texto}
        </m.span>
      </span>
      {destaque && <Sublinhado atraso={atraso + 0.7} />}
    </span>
  );
}

export function Hero({
  total,
  cidade,
  chamada,
  whats,
  destaque,
}: {
  total: number;
  cidade: string;
  chamada: string;
  whats: string | null;
  destaque: ImovelVitrine | null;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFundo = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const escalaFundo = useTransform(scrollYProgress, [0, 1], [1.06, 1.2]);
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const yDestaque = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);

  // Holofote laranja que segue o mouse (só faz efeito em telas com mouse).
  const px = useMotionValue(74);
  const py = useMotionValue(28);
  const sx = useSpring(px, { stiffness: 45, damping: 18 });
  const sy = useSpring(py, { stiffness: 45, damping: 18 });
  const holofote = useMotionTemplate`radial-gradient(560px circle at ${sx}% ${sy}%, color-mix(in oklch, var(--brand) 24%, transparent), transparent 62%)`;

  function aoMover(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 100);
    py.set(((e.clientY - r.top) / r.height) * 100);
  }

  const foto = destaque?.arquivos[0]?.id;

  return (
    <m.section
      ref={ref}
      onPointerMove={aoMover}
      className="relative isolate -mt-20 flex min-h-[min(60rem,94svh)] items-center overflow-hidden bg-surface-strong text-white"
    >
      <m.div aria-hidden style={{ y: yFundo, scale: escalaFundo }} className="absolute inset-0 -z-10">
        <img
          src="/site/hero.webp"
          alt=""
          fetchPriority="high"
          className="size-full object-cover object-[70%_center]"
        />
      </m.div>
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.12_0.01_50)] via-[oklch(0.12_0.01_50/0.78)] to-[oklch(0.12_0.01_50/0.25)]" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0.12_0.01_50)] via-transparent to-black/45" />
      <m.span aria-hidden style={{ backgroundImage: holofote }} className="pointer-events-none absolute inset-0 -z-10 hidden mix-blend-screen md:block" />
      <span aria-hidden className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay" />
      <m.span
        aria-hidden
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[30rem] rounded-full bg-primary/25 blur-[110px]"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pt-36 pb-56 sm:px-6 sm:pt-40 lg:grid-cols-[1.3fr_0.7fr] lg:pb-60">
        <m.div style={{ y: yTexto }} className="max-w-3xl">
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="glass-dark inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-sm font-medium text-white/90"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/15">
              <span className="size-2 animate-pulse-dot rounded-full bg-emerald-400 text-emerald-400" />
            </span>
            {total > 0 ? (
              <span>
                <Contador valor={total} className="font-semibold tabular-nums" />{" "}
                {total === 1 ? "imóvel disponível agora" : "imóveis disponíveis agora"}
              </span>
            ) : (
              "Novas vagas em breve"
            )}
            <span className="text-white/40">·</span>
            <span className="text-white/70">{cidade}</span>
          </m.p>

          <h1
            aria-label="O lugar certo para viver e trabalhar"
            className="mt-7 font-display text-[2.8rem] leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            <span aria-hidden>
              {TITULO.map((p, i) => (
                <React.Fragment key={p.texto + i}>
                  {i > 0 && " "}
                  <Palavra texto={p.texto} destaque={p.destaque} i={i} />
                </React.Fragment>
              ))}
            </span>
          </h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl"
          >
            {chamada}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <m.a
              href="#imoveis"
              id="hero-ver-imoveis"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_14px_40px_-12px_color-mix(in_oklch,var(--primary)_75%,transparent)]"
            >
              Ver imóveis
              <ArrowDownIcon className="size-5 transition-transform group-hover:translate-y-0.5" />
            </m.a>
            {whats && (
              <m.a
                href={whats}
                target="_blank"
                rel="noreferrer"
                id="hero-whatsapp"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="glass-dark inline-flex h-14 items-center gap-2.5 rounded-full px-7 text-base font-semibold text-white hover:bg-white/15"
              >
                <WhatsappIcon className="text-[#25D366]" /> Falar no WhatsApp
              </m.a>
            )}
          </m.div>

          <m.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.9 }}
            className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70"
          >
            <li className="flex items-center gap-2">
              <CameraIcon className="size-4 text-primary" /> Fotos reais dos imóveis
            </li>
            <li className="flex items-center gap-2">
              <WhatsappIcon className="size-4 text-primary" /> Atendimento pelo WhatsApp
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4 text-primary" /> {cidade}
            </li>
          </m.ul>
        </m.div>

        {destaque && foto && (
          <m.aside
            style={{ y: yDestaque }}
            initial={{ opacity: 0, x: 48, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.8, duration: 1.1, ease: EASE }}
            className="relative hidden justify-self-end lg:block lg:w-full lg:max-w-sm"
          >
            <m.span
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 rounded-full border border-dashed border-primary/30"
            />
            <m.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Link
                href={`/imovel/${destaque.id}`}
                id="hero-destaque"
                className="group glass-dark block overflow-hidden rounded-[2rem] p-2.5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] transition-colors hover:bg-white/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <img
                    src={`/api/vitrine/foto/${foto}`}
                    alt={destaque.titulo}
                    className="size-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground">
                    Em destaque
                  </span>
                </div>
                <div className="space-y-3 px-3 pt-4 pb-3">
                  <div>
                    <p className="text-xs font-medium tracking-[0.18em] text-white/60 uppercase">{TIPO_IMOVEL[destaque.tipo]}</p>
                    <h2 className="mt-1 line-clamp-1 text-lg font-semibold">{destaque.titulo}</h2>
                    <p className="flex items-center gap-1.5 truncate text-sm text-white/65">
                      <MapPinIcon className="size-3.5 shrink-0 text-primary" />
                      {[destaque.bairro, destaque.cidade].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <p className="font-display text-2xl leading-none font-semibold tabular-nums">
                      {destaque.valorAluguel != null ? formatBRL(destaque.valorAluguel) : "Consulte"}
                      {destaque.valorAluguel != null && <span className="ml-1 font-sans text-sm font-medium text-white/60">/mês</span>}
                    </p>
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRightIcon className="size-5" />
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-white/70">
                    <li className="flex items-center gap-1.5">
                      <BedDoubleIcon className="size-3.5 text-primary" /> {destaque.quartos}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <ShowerHeadIcon className="size-3.5 text-primary" /> {destaque.banheiros}
                    </li>
                    {destaque.areaM2 != null && (
                      <li className="flex items-center gap-1.5">
                        <RulerIcon className="size-3.5 text-primary" /> {destaque.areaM2} m²
                      </li>
                    )}
                  </ul>
                </div>
              </Link>
            </m.div>
          </m.aside>
        )}
      </div>
    </m.section>
  );
}
