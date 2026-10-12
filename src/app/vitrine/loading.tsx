import { CardGridSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-in fade-in space-y-6 px-4 py-8 duration-300">
      <CardGridSkeleton count={6} />
    </div>
  );
}
