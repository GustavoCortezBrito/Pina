"use client";

import * as React from "react";

const FORMATOS = {
  brl: (centavos: number) =>
    (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
  int: (n: number) => Math.round(n).toLocaleString("pt-BR"),
  percent: (n: number) => `${Math.round(n)}%`,
};

/** Número que "conta" do zero até o valor ao aparecer na tela. */
export function AnimatedNumber({
  value,
  format = "int",
  duration = 900,
}: {
  value: number;
  format?: keyof typeof FORMATOS;
  duration?: number;
}) {
  const [atual, setAtual] = React.useState(0);
  const inicio = React.useRef<number | null>(null);

  React.useEffect(() => {
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) {
      frame = requestAnimationFrame(() => setAtual(value));
      return () => cancelAnimationFrame(frame);
    }
    inicio.current = null;
    const passo = (agora: number) => {
      inicio.current ??= agora;
      const t = Math.min(1, (agora - inicio.current) / duration);
      const suave = 1 - Math.pow(1 - t, 3);
      setAtual(value * suave);
      if (t < 1) frame = requestAnimationFrame(passo);
    };
    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const texto = FORMATOS[format](format === "brl" ? Math.round(atual) : atual);
  return (
    <span className="tabular-nums" aria-label={FORMATOS[format](value)}>
      {texto}
    </span>
  );
}
