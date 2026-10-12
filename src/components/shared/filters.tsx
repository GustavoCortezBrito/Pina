"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Combobox } from "@/components/shared/combobox";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TODOS = "__todos__";

function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}

export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid animate-fade-up grid-cols-2 items-center gap-2 [animation-delay:60ms] sm:flex sm:flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SearchInput({
  param = "q",
  placeholder = "Buscar...",
  className,
}: {
  param?: string;
  placeholder?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const update = useParamUpdater();
  const [value, setValue] = React.useState(searchParams.get(param) ?? "");
  const current = searchParams.get(param) ?? "";

  // Sincroniza com a URL quando ela muda por fora (voltar/avançar do navegador, "Limpar filtros").
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setValue(current), [current]);

  React.useEffect(() => {
    if (value === current) return;
    const timer = setTimeout(() => update({ [param]: value || null }), 350);
    return () => clearTimeout(timer);
  }, [value, current, param, update]);

  return (
    <InputGroup className={cn("col-span-2 w-full bg-card sm:w-72", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Limpar busca"
            onClick={() => setValue("")}
          >
            <XIcon />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export function FilterSelect({
  param,
  options,
  placeholder,
  allLabel = "Todos",
  className,
}: {
  param: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  allLabel?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const update = useParamUpdater();
  const value = searchParams.get(param) ?? TODOS;

  return (
    <Select
      value={value}
      onValueChange={(next) => update({ [param]: next === TODOS ? null : next })}
    >
      <SelectTrigger
        className={cn("w-full min-w-0 bg-card sm:w-auto sm:min-w-44", value !== TODOS && "border-primary/50 bg-primary/8", className)}
        aria-label={placeholder}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span className="text-muted-foreground">{placeholder}:</span>
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Filtro por mês (input nativo, bom no celular). */
export function MonthFilter({ param = "mes", className }: { param?: string; className?: string }) {
  const searchParams = useSearchParams();
  const update = useParamUpdater();
  const value = searchParams.get(param) ?? "";

  return (
    <input
      type="month"
      aria-label="Mês"
      value={value}
      onChange={(event) => update({ [param]: event.target.value || null })}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs sm:w-auto outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className,
      )}
    />
  );
}

export function ClearFilters({ keep = [] as string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasFilters = [...searchParams.keys()].some((key) => !keep.includes(key));

  if (!hasFilters) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const params = new URLSearchParams();
        for (const key of keep) {
          const value = searchParams.get(key);
          if (value) params.set(key, value);
        }
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }}
    >
      <XIcon /> Limpar filtros
    </Button>
  );
}

/** Filtro com busca digitável (digite para achar, depois selecione). Bom para listas longas, como usuários. */
export function FilterCombobox({
  param,
  options,
  placeholder,
  allLabel = "Todos",
  buscaPlaceholder = "Digite para buscar...",
  className,
}: {
  param: string;
  options: Array<{ value: string; label: string; description?: string }>;
  placeholder: string;
  allLabel?: string;
  buscaPlaceholder?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const update = useParamUpdater();
  const value = searchParams.get(param);
  const selecionado = options.find((o) => o.value === value);

  return (
    <div className={cn("min-w-0 sm:w-56", className)}>
      <Combobox
        value={value}
        onChange={(next) => update({ [param]: next })}
        options={options}
        placeholder={`${placeholder}: ${allLabel}`}
        buscaPlaceholder={buscaPlaceholder}
        limpar={allLabel}
        className={cn("h-10 bg-card", selecionado && "border-primary/50 bg-primary/8 font-medium text-foreground")}
      />
    </div>
  );
}

/** Intervalo de datas (de/até) guardado na URL. */
export function DateRangeFilter({
  deParam = "de",
  ateParam = "ate",
  className,
}: {
  deParam?: string;
  ateParam?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const update = useParamUpdater();
  const de = searchParams.get(deParam) ?? "";
  const ate = searchParams.get(ateParam) ?? "";
  const campo =
    "h-10 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-36 sm:flex-none";

  return (
    <div className={cn("col-span-2 flex items-center gap-2 rounded-lg sm:col-span-1", className)}>
      <label className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex-none">
        De
        <input
          type="date"
          value={de}
          max={ate || undefined}
          onChange={(e) => update({ [deParam]: e.target.value || null })}
          className={campo}
          aria-label="Data inicial"
        />
      </label>
      <label className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground sm:flex-none">
        até
        <input
          type="date"
          value={ate}
          min={de || undefined}
          onChange={(e) => update({ [ateParam]: e.target.value || null })}
          className={campo}
          aria-label="Data final"
        />
      </label>
    </div>
  );
}
