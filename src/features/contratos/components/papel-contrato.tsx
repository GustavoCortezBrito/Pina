import * as React from "react";
import { cn } from "@/lib/utils";

function linha(texto: string, chave: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    const negrito = /^\*\*([^*]+)\*\*$/.exec(parte);
    return negrito ? <strong key={`${chave}-${i}`}>{negrito[1]}</strong> : <React.Fragment key={`${chave}-${i}`}>{parte}</React.Fragment>;
  });
}

/** Contrato como folha de papel: títulos, cláusulas, negrito e linhas de assinatura, igual ao PDF. */
export function PapelContrato({
  titulo,
  locadorNome,
  conteudo,
  className,
}: {
  titulo: string;
  locadorNome?: string;
  conteudo: string;
  className?: string;
}) {
  const blocos = conteudo.trim().split(/\n{2,}/);
  return (
    <article
      aria-label={titulo}
      className={cn(
        "mx-auto w-full max-w-3xl rounded-lg bg-white p-6 font-serif text-[14px] leading-relaxed text-zinc-900 shadow-lg ring-1 ring-black/10 sm:p-12",
        className,
      )}
    >
      <header className="mb-6 flex items-end justify-between gap-3 border-b-2 border-[#E8862F] pb-3 font-sans">
        <span className="text-sm font-bold text-[#b8520c]">{locadorNome || "Contrato de Locação"}</span>
        <span className="text-xs text-zinc-500">{titulo}</span>
      </header>
      <div className="space-y-3">
        {blocos.map((bloco, b) => (
          <div key={b}>
            {bloco.split("\n").map((l, i) => {
              const k = `${b}-${i}`;
              if (l.startsWith("## "))
                return (
                  <h3 key={k} className="mt-3 text-[15px] font-bold">
                    {linha(l.slice(3), k)}
                  </h3>
                );
              if (l.startsWith("# "))
                return (
                  <h2 key={k} className="mb-3 text-center text-lg font-bold">
                    {linha(l.slice(2), k)}
                  </h2>
                );
              if (/^_{5,}$/.test(l.trim())) return <hr key={k} className="mt-8 mb-1 w-64 border-zinc-800" />;
              return (
                <p key={k} className="text-justify">
                  {linha(l, k)}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </article>
  );
}
