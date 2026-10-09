import { DetailSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in duration-300 fade-in">
      <DetailSkeleton />
    </div>
  );
}
