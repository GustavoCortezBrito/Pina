"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
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
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
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
    <InputGroup className={cn("w-full sm:w-72", className)}>
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
      <SelectTrigger className={cn("w-auto min-w-40", className)} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
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
        "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
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
