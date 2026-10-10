"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  total,
  label = "registros",
}: {
  page: number;
  pageCount: number;
  total: number;
  label?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const href = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      {pageCount > 1 && (
        <div className="flex items-center gap-3">
          <PagerButton href={href(page - 1)} disabled={page <= 1} label="Página anterior">
            <ChevronLeftIcon />
          </PagerButton>
          <span className="min-w-16 text-center text-sm font-medium tabular-nums">
            {page} <span className="font-normal text-muted-foreground">de {pageCount}</span>
          </span>
          <PagerButton href={href(page + 1)} disabled={page >= pageCount} label="Próxima página">
            <ChevronRightIcon />
          </PagerButton>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {total} {label}
      </p>
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
