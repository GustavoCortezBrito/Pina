import { Skeleton } from "@/components/ui/skeleton";
import { FilterBarSkeleton, InfoCardGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <FilterBarSkeleton />
      <InfoCardGridSkeleton />
    </div>
  );
}
