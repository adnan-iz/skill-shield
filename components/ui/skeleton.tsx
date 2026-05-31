export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-outline/60 ${className}`}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CardSkeleton />
        </div>
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
      </div>
      <TableSkeleton rows={4} />
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-2 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function CompareSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
