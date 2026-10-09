import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in space-y-6 duration-300 fade-in">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  );
}
