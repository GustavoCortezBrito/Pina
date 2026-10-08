import { FormSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-300">
      <FormSkeleton />
    </div>
  );
}
