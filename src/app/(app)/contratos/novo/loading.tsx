import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in mx-auto max-w-3xl space-y-6 duration-300">
      <PageHeaderSkeleton withActions={false} />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
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
