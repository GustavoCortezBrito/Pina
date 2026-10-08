import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PageHeaderSkeleton withActions={false} />
      <Card>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
