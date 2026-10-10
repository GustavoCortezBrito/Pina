import { FilterBarSkeleton, InfoCardGridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <InfoCardGridSkeleton />
    </div>
  );
}
