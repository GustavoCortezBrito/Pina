"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";
import { EASE, Revelar } from "./animacao";
import { WhatsappIcon } from "./whatsapp-icon";

/** Faixa final convidando a chamar no WhatsApp, com a foto deslizando levemente ao rolar. */
export function ChamadaFinal({ whats }: { whats: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yFoto = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <Revelar y={40}>
        <div ref={ref} className="surface-brand relative isolate overflow-hidden rounded-[2rem] px-6 py-14 sm:px-14 sm:py-20">
          <m.img
            src="/site/hero.webp"
            alt=""
            aria-hidden
            loading="lazy"
            style={{ y: yFoto }}
            className="absolute inset-y-[-10%] right-0 -z-10 hidden h-[120%] w-1/2 object-cover opacity-45 [mask-image:linear-gradient(to_right,transparent,black_60%)] md:block"
          />
          <span aria-hidden className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay" />
          <m.span
            aria-hidden
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-5xl">
              Não encontrou o que procura?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Conte pelo WhatsApp o que você precisa — tipo, bairro e valor — e a gente te ajuda a encontrar.
            </p>
            <m.a
              href={whats}
              target="_blank"
              rel="noreferrer"
              id="cta-whatsapp"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="btn-whatsapp mt-8 inline-flex h-14 items-center gap-2.5 rounded-full px-7 text-base font-semibold"
            >
              <WhatsappIcon /> Conversar agora
            </m.a>
          </div>
        </div>
      </Revelar>
    </section>
  );
}
