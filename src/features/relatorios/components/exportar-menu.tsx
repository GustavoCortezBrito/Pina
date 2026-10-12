"use client";

import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TIPOS = [
  { slug: "resultado", titulo: "Resultado financeiro", descricao: "Receita × despesa por mês e imóvel" },
  { slug: "cobrancas", titulo: "Cobranças em aberto", descricao: "Pendentes, parciais e atrasadas" },
  { slug: "contratos", titulo: "Contratos ativos", descricao: "Valores, prazos e reajuste" },
  { slug: "despesas", titulo: "Despesas do período", descricao: "Gastos por categoria e imóvel" },
];

/** Exporta com os mesmos filtros (período, ano, imóvel) que estão na tela. */
export function ExportarMenu() {
  const searchParams = useSearchParams();
  const filtros = new URLSearchParams();
  for (const chave of ["periodo", "de", "ate", "ano", "imovel"]) {
    const valor = searchParams.get(chave);
    if (valor) filtros.set(chave, valor);
  }
  const link = (slug: string, formato: "xlsx" | "pdf") => {
    const params = new URLSearchParams(filtros);
    params.set("formato", formato);
    return `/api/relatorios/${slug}?${params.toString()}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg">
          <DownloadIcon /> Exportar relatório
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Usa os filtros que estão na tela
        </DropdownMenuLabel>
        {TIPOS.map((tipo, i) => (
          <DropdownMenuGroup key={tipo.slug}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="grid gap-0.5 py-1">
              <span className="font-semibold">{tipo.titulo}</span>
              <span className="text-xs font-normal text-muted-foreground">{tipo.descricao}</span>
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href={link(tipo.slug, "xlsx")}>
                <FileSpreadsheetIcon className="text-success" /> Baixar Excel (.xlsx)
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={link(tipo.slug, "pdf")} target="_blank" rel="noreferrer">
                <FileTextIcon className="text-danger" /> Abrir PDF
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
