import { FormSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-in duration-300 fade-in">
      <FormSkeleton />
    </div>
  );
}
