"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string; description?: string };

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  buscaPlaceholder = "Buscar...",
  vazio = "Nada encontrado.",
  limpar,
  rodape,
  className,
  id,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  buscaPlaceholder?: string;
  vazio?: string;
  limpar?: string;
  rodape?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const selecionado = options.find((option) => option.value === value);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className={cn(
            "w-full justify-between font-normal",
            !selecionado && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selecionado?.label ?? placeholder}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={buscaPlaceholder} />
          <CommandList>
            <CommandEmpty>{vazio}</CommandEmpty>
            <CommandGroup>
              {limpar && (
                <CommandItem
                  value="__limpar__"
                  onSelect={() => {
                    onChange(null);
                    setAberto(false);
                  }}
                >
                  <CheckIcon className={cn(value ? "opacity-0" : "opacity-100")} />
                  {limpar}
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.description ?? ""}`}
                  onSelect={() => {
                    onChange(option.value);
                    setAberto(false);
                  }}
                >
                  <CheckIcon className={cn(value === option.value ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {rodape && <div className="border-t p-1">{rodape}</div>}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
