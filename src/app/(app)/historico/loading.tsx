import { FilterBarSkeleton, ListCardsSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PageHeaderSkeleton withActions={false} />
      <FilterBarSkeleton />
      <ListCardsSkeleton rows={8} />
    </div>
  );
}
