import { FormSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="animate-in fade-in mx-auto max-w-3xl duration-300">
      <FormSkeleton />
    </div>
  );
}
