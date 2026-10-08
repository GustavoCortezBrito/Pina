import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withActions && <Skeleton className="h-9 w-36" />}
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function StatGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-2 p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-16" />
        </Card>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden p-0">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex gap-4 border-b bg-muted/40 p-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 border-b p-3 last:border-b-0">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} className={cn("h-4", col === 0 ? "w-36" : "w-16")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListCardsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="flex gap-2 border-b pb-px">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withActions={false} />
      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
