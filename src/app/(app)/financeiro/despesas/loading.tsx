import { FilterBarSkeleton, PageHeaderSkeleton, TableSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton cols={5} />
    </div>
  );
}
