"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {total} {label}
        {pageCount > 1 && ` · página ${page} de ${pageCount}`}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
            {page > 1 ? (
              <Link href={href(page - 1)} scroll={false}>
                <ChevronLeftIcon /> Anterior
              </Link>
            ) : (
              <span>
                <ChevronLeftIcon /> Anterior
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild={page < pageCount} disabled={page >= pageCount}>
            {page < pageCount ? (
              <Link href={href(page + 1)} scroll={false}>
                Próxima <ChevronRightIcon />
              </Link>
            ) : (
              <span>
                Próxima <ChevronRightIcon />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
