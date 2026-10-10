import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="animate-in space-y-6 duration-300 fade-in">
      <PageHeaderSkeleton />
      <Skeleton className="h-5 w-32" />
      <CardGridSkeleton count={4} />
    </div>
  );
}
