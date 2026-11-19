"use client";

import { CalendarCheckIcon, SearchIcon, SparklesIcon } from "lucide-react";
import * as m from "motion/react-m";
import { EASE, Revelar } from "./animacao";
import { WhatsappIcon } from "./whatsapp-icon";

const PASSOS = [
  {
    icon: SearchIcon,
    titulo: "Escolha o imóvel",
    texto: "Veja fotos reais, valores e todas as características de cada imóvel disponível.",
  },
  {
    icon: WhatsappIcon,
    titulo: "Chame no WhatsApp",
    texto: "Toque em “Tenho interesse” e a mensagem já vai pronta, com o código do imóvel.",
  },
  {
    icon: CalendarCheckIcon,
    titulo: "Agende sua visita",
    texto: "Combine o melhor horário para conhecer o imóvel pessoalmente, sem complicação.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="mx-auto mt-28 max-w-7xl scroll-mt-24 px-4 sm:px-6">
      <Revelar className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary-ink uppercase">
          <SparklesIcon className="size-3.5" /> Simples e rápido
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-balance sm:text-5xl">
          Do clique à chave na mão em <em className="text-gradient-brand pr-1 italic">três passos</em>
        </h2>
      </Revelar>

      <ol className="relative mt-14 grid gap-5 md:grid-cols-3">
        {/* linha que se desenha ligando os três passos */}
        <m.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
          className="absolute top-12 right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block"
        />
        {PASSOS.map(({ icon: Icon, titulo, texto }, i) => (
          <li key={titulo}>
            <Revelar atraso={i * 0.14} y={36}>
              <div className="group relative h-full rounded-[1.75rem] bg-card p-7 ring-1 ring-border transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(0_0_0/0.3)] hover:ring-primary/40">
                <div className="flex items-center justify-between">
                  <m.span
                    initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.25 + i * 0.14 }}
                    className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-deep text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                  >
                    <Icon className="size-6" />
                  </m.span>
                  <span className="font-display text-5xl font-medium text-muted-foreground/25 tabular-nums italic">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{titulo}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{texto}</p>
              </div>
            </Revelar>
          </li>
        ))}
      </ol>
    </section>
  );
}
