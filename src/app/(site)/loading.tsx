export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-in px-4 pt-8 duration-300 fade-in sm:px-6">
      <div className="h-[22rem] animate-shimmer rounded-[2rem] bg-[linear-gradient(90deg,var(--muted)_25%,var(--accent)_50%,var(--muted)_75%)] bg-[length:200%_100%]" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.75rem] bg-card p-2 ring-1 ring-border">
            <div className="aspect-[4/3] animate-shimmer rounded-[1.35rem] bg-[linear-gradient(90deg,var(--muted)_25%,var(--accent)_50%,var(--muted)_75%)] bg-[length:200%_100%]" />
            <div className="space-y-2.5 px-3 pt-4 pb-3">
              <div className="h-5 w-3/4 rounded-full bg-muted" />
              <div className="h-4 w-1/2 rounded-full bg-muted" />
              <div className="flex gap-1.5 pt-2">
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="h-6 w-16 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
