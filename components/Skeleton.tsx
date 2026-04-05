export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--border-color)] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function DateCardSkeleton() {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5">
      <Skeleton className="h-6 w-1/2 mb-3" />
      <Skeleton className="h-4 w-1/3 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}
