"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PERIODOS_GRAFICO } from "../periodos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Escolha do período do gráfico: atalhos (3 a 36 meses, este ano) ou intervalo personalizado de meses. */
export function PeriodoFilter({ className, semPersonalizado = false }: { className?: string; semPersonalizado?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periodo = searchParams.get("periodo") ?? "12";
  const de = searchParams.get("de") ?? "";
  const ate = searchParams.get("ate") ?? "";
  const opcoes = semPersonalizado ? PERIODOS_GRAFICO.filter((p) => p.value !== "custom") : PERIODOS_GRAFICO;

  function atualizar(mudancas: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor) params.set(chave, valor);
      else params.delete(chave);
    }
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const campoMes =
    "h-9 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-36 sm:flex-none";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Select
        value={periodo}
        onValueChange={(valor) => atualizar({ periodo: valor === "12" ? null : valor, de: null, ate: null })}
      >
        <SelectTrigger size="sm" className="w-full min-w-44 bg-card sm:w-auto" aria-label="Período do gráfico">
          <span className="text-muted-foreground">Período:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {opcoes.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {periodo === "custom" && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex-none">
            De
            <input
              type="month"
              value={de}
              max={ate || undefined}
              onChange={(e) => atualizar({ de: e.target.value || null })}
              className={campoMes}
              aria-label="Mês inicial"
            />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex-none">
            até
            <input
              type="month"
              value={ate}
              min={de || undefined}
              onChange={(e) => atualizar({ ate: e.target.value || null })}
              className={campoMes}
              aria-label="Mês final"
            />
          </label>
        </div>
      )}
    </div>
  );
}
