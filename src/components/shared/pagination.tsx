"use client";

import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Páginas a mostrar: primeira, última e uma janela ao redor da atual, com reticências. */
function janela(atual: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = new Set([1, total, atual - 1, atual, atual + 1]);
  if (atual <= 3) [2, 3, 4].forEach((p) => paginas.add(p));
  if (atual >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => paginas.add(p));
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado: Array<number | "…"> = [];
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push("…");
    resultado.push(p);
  });
  return resultado;
}

export function Pagination({
  page,
  pageCount,
  total,
  label = "registros",
  porPagina,
  tamanhos,
}: {
  page: number;
  pageCount: number;
  total: number;
  label?: string;
  /** Quando informado junto com `tamanhos`, mostra o seletor "por página". */
  porPagina?: number;
  tamanhos?: readonly number[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const href = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  function trocarTamanho(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("porPagina", valor);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      {pageCount > 1 && (
        <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-1.5">
          <PagerButton href={href(1)} disabled={page <= 1} label="Primeira página">
            <ChevronsLeftIcon />
          </PagerButton>
          <PagerButton href={href(page - 1)} disabled={page <= 1} label="Página anterior">
            <ChevronLeftIcon />
          </PagerButton>
          {janela(page, pageCount).map((item, i) =>
            item === "…" ? (
              <span key={`e${i}`} className="px-1 text-muted-foreground" aria-hidden>
                …
              </span>
            ) : (
              <Button
                key={item}
                asChild
                size="icon"
                variant={item === page ? "default" : "outline"}
                className={cn("tabular-nums", item === page && "pointer-events-none")}
              >
                <Link href={href(item)} scroll={false} aria-label={`Página ${item}`} aria-current={item === page ? "page" : undefined}>
                  {item}
                </Link>
              </Button>
            ),
          )}
          <PagerButton href={href(page + 1)} disabled={page >= pageCount} label="Próxima página">
            <ChevronRightIcon />
          </PagerButton>
          <PagerButton href={href(pageCount)} disabled={page >= pageCount} label="Última página">
            <ChevronsRightIcon />
          </PagerButton>
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <span>
          {total} {label}
        </span>
        {porPagina && tamanhos && (
          <label className="flex items-center gap-2">
            Por página
            <Select value={String(porPagina)} onValueChange={trocarTamanho}>
              <SelectTrigger size="sm" className="w-20" aria-label="Itens por página">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tamanhos.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      </div>
    </div>
  );
}

function PagerButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="outline" size="icon" asChild aria-label={label}>
      <Link href={href} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}
