import {
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in space-y-6 duration-300 fade-in">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton />
    </div>
  );
}
