"use client";

import { animate, LazyMotion, MotionConfig, useInView, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import * as React from "react";

/** Curva de entrada usada em todo o site: sai rápido e assenta devagar. */
export const EASE = [0.22, 1, 0.36, 1] as const;

const carregarRecursos = () => import("./animacao-recursos").then((mod) => mod.default);

/**
 * Liga o motor de animação do site (carregado sob demanda) e respeita a preferência do sistema
 * "reduzir movimento": quem a ativa vê só os esmaecimentos, sem deslocamentos.
 */
export function AnimacaoProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={carregarRecursos} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/**
 * Aparece suavemente (subindo) quando entra na tela, uma única vez. Com `aoCarregar`, aparece assim
 * que a página abre (para o que já está na primeira tela, como a busca sobre o topo).
 */
export function Revelar({
  children,
  className,
  atraso = 0,
  y = 28,
  x = 0,
  duracao = 0.8,
  aoCarregar = false,
}: {
  children: React.ReactNode;
  className?: string;
  atraso?: number;
  y?: number;
  x?: number;
  duracao?: number;
  aoCarregar?: boolean;
}) {
  const aparecer = { opacity: 1, y: 0, x: 0 };
  return (
    <m.div
      data-revelar
      className={className}
      initial={{ opacity: 0, y, x }}
      {...(aoCarregar
        ? { animate: aparecer }
        : { whileInView: aparecer, viewport: { once: true, margin: "0px 0px -12% 0px" } })}
      transition={{ duration: duracao, delay: atraso, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

/**
 * Número que sobe de 0 até o valor quando aparece na tela. O HTML já traz o valor final
 * (para buscadores e para quem está sem JavaScript).
 */
export function Contador({
  valor,
  className,
  duracao = 1.4,
}: {
  valor: number;
  className?: string;
  duracao?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduzir = useReducedMotion();

  // Depois de hidratar, zera o texto para a contagem começar do zero sem piscar o valor final.
  React.useEffect(() => {
    if (!reduzir && ref.current) ref.current.textContent = "0";
  }, [reduzir]);

  React.useEffect(() => {
    const el = ref.current;
    if (!emVista || reduzir || !el) return;
    const controle = animate(0, valor, {
      duration: duracao,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("pt-BR");
      },
    });
    return () => controle.stop();
  }, [emVista, reduzir, valor, duracao]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {valor.toLocaleString("pt-BR")}
    </span>
  );
}
