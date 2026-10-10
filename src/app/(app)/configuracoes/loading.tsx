import { FormSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in duration-300 fade-in">
      <FormSkeleton />
    </div>
  );
}
