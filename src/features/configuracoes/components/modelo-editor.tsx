"use client";

import {
  BoldIcon,
  BracesIcon,
  EyeIcon,
  Heading1Icon,
  Heading2Icon,
  MinusIcon,
  PencilIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAPA_VARIAVEIS, VARIAVEIS } from "@/features/contratos/variaveis";
import { cn } from "@/lib/utils";

function destacarTexto(texto: string, chave: string) {
  const partes = texto.split(/(\{\{[^}]+\}\}|\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    const variavel = /^\{\{([^}]+)\}\}$/.exec(parte);
    if (variavel) {
      const info = MAPA_VARIAVEIS.get(variavel[1].trim());
      return (
        <mark
          key={`${chave}-${i}`}
          title={info ? `Será preenchido: ${info.rotulo}` : "Variável desconhecida"}
          className={cn(
            "rounded px-1 font-medium",
            info ? "bg-primary/20 text-primary-ink" : "bg-danger/15 text-danger line-through",
          )}
        >
          {info ? info.exemplo : parte}
        </mark>
      );
    }
    const negrito = /^\*\*([^*]+)\*\*$/.exec(parte);
    if (negrito) return <strong key={`${chave}-${i}`}>{negrito[1]}</strong>;
    return <React.Fragment key={`${chave}-${i}`}>{parte}</React.Fragment>;
  });
}

/** Prévia aproximada do PDF: títulos, parágrafos, negrito e as variáveis já com um exemplo. */
function Previa({ texto }: { texto: string }) {
  const blocos = texto.trim() ? texto.trim().split(/\n{2,}/) : [];
  if (blocos.length === 0) {
    return <p className="text-sm text-zinc-500">A prévia do contrato aparece aqui enquanto você escreve.</p>;
  }
  return (
    <div className="space-y-3 font-serif text-[13px] leading-relaxed text-zinc-900">
      {blocos.map((bloco, b) => (
        <div key={b}>
          {bloco.split("\n").map((linha, l) => {
            const k = `${b}-${l}`;
            if (linha.startsWith("## "))
              return (
                <h3 key={k} className="mt-2 text-sm font-bold">
                  {destacarTexto(linha.slice(3), k)}
                </h3>
              );
            if (linha.startsWith("# "))
              return (
                <h2 key={k} className="mb-2 text-center text-base font-bold">
                  {destacarTexto(linha.slice(2), k)}
                </h2>
              );
            if (/^_{5,}$/.test(linha.trim())) return <hr key={k} className="mt-6 mb-1 w-64 border-zinc-800" />;
            return <p key={k}>{destacarTexto(linha, k)}</p>;
          })}
        </div>
      ))}
    </div>
  );
}

export function ModeloEditor({ value, onChange }: { value: string; onChange: (valor: string) => void }) {
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const [varAberto, setVarAberto] = React.useState(false);

  function aplicar(
    transformar: (antes: string, selecionado: string, depois: string) => { texto: string; ini: number; fim: number },
  ) {
    const el = areaRef.current;
    const ini = el?.selectionStart ?? value.length;
    const fim = el?.selectionEnd ?? value.length;
    const r = transformar(value.slice(0, ini), value.slice(ini, fim), value.slice(fim));
    onChange(r.texto);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(r.ini, r.fim);
    });
  }

  const envolver = (marca: string) =>
    aplicar((antes, sel, depois) => {
      const miolo = sel || "texto";
      return {
        texto: `${antes}${marca}${miolo}${marca}${depois}`,
        ini: antes.length + marca.length,
        fim: antes.length + marca.length + miolo.length,
      };
    });

  const prefixoLinha = (prefixo: string) =>
    aplicar((antes, sel, depois) => {
      const inicioLinha = antes.lastIndexOf("\n") + 1;
      const resto = antes.slice(inicioLinha).replace(/^#{1,2} /, "");
      const pos = inicioLinha + prefixo.length + resto.length + sel.length;
      return { texto: `${antes.slice(0, inicioLinha)}${prefixo}${resto}${sel}${depois}`, ini: pos, fim: pos };
    });

  const inserir = (trecho: string) =>
    aplicar((antes, _sel, depois) => ({
      texto: `${antes}${trecho}${depois}`,
      ini: antes.length + trecho.length,
      fim: antes.length + trecho.length,
    }));

  const desconhecidas = React.useMemo(() => {
    const achadas = [...value.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim());
    return [...new Set(achadas.filter((c) => !MAPA_VARIAVEIS.has(c)))];
  }, [value]);

  const barra = (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-1">
      <Button type="button" variant="ghost" size="sm" onClick={() => prefixoLinha("# ")} title="Título centralizado">
        <Heading1Icon /> Título
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => prefixoLinha("## ")} title="Título de cláusula">
        <Heading2Icon /> Cláusula
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => envolver("**")} title="Negrito">
        <BoldIcon /> Negrito
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inserir("\n\n______________________________\n")}
        title="Linha de assinatura"
      >
        <MinusIcon /> Assinatura
      </Button>
      <Popover open={varAberto} onOpenChange={setVarAberto}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" className="ml-auto">
            <BracesIcon /> Inserir variável
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Buscar: nome, valor, endereço..." />
            <CommandList className="max-h-72">
              <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
              {VARIAVEIS.map((g) => (
                <CommandGroup key={g.grupo} heading={g.grupo}>
                  {g.itens.map((v) => (
                    <CommandItem
                      key={v.chave}
                      value={`${g.grupo} ${v.rotulo} ${v.chave}`}
                      onSelect={() => {
                        inserir(`{{${v.chave}}}`);
                        setVarAberto(false);
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{v.rotulo}</span>
                        <span className="block truncate text-xs text-muted-foreground">ex.: {v.exemplo}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const area = (
    <textarea
      ref={areaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck
      className="h-[46vh] min-h-64 w-full resize-none overflow-y-auto rounded-lg border bg-card p-3 font-mono text-[13px] leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 lg:h-[52vh]"
      placeholder="# CONTRATO DE LOCAÇÃO..."
    />
  );

  const papel = (
    <div className="h-[46vh] min-h-64 overflow-y-auto rounded-lg border bg-white p-5 shadow-inner lg:h-[52vh]">
      <Previa texto={value} />
    </div>
  );

  return (
    <div className="space-y-2">
      {barra}
      <div className="hidden gap-3 lg:grid lg:grid-cols-2">
        {area}
        {papel}
      </div>
      <Tabs defaultValue="editar" className="lg:hidden">
        <TabsList>
          <TabsTrigger value="editar">
            <PencilIcon /> Editar
          </TabsTrigger>
          <TabsTrigger value="previa">
            <EyeIcon /> Prévia
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editar">{area}</TabsContent>
        <TabsContent value="previa">{papel}</TabsContent>
      </Tabs>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          <code>#</code> título · <code>##</code> cláusula · <code>**negrito**</code> · variáveis em laranja são
          preenchidas automaticamente no PDF
        </span>
        <span className="tabular-nums">{value.length} caracteres</span>
      </div>
      {desconhecidas.length > 0 && (
        <p className="flex items-start gap-2 rounded-lg bg-danger/10 p-2.5 text-sm text-danger">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            Variável(is) desconhecida(s), não serão preenchidas: {desconhecidas.map((c) => `{{${c}}}`).join(", ")}
          </span>
        </p>
      )}
    </div>
  );
}
