export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 h-7 w-20 rounded bg-outline" />
          <div className="h-4 w-32 rounded bg-surface-secondary" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-outline" />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-outline">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-shrink-0 w-14 text-center">
              <div className="mx-auto h-6 w-10 rounded bg-outline" />
              <div className="mx-auto mt-1 h-3 w-8 rounded bg-surface-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1 h-4 w-44 rounded bg-outline" />
              <div className="h-3 w-56 rounded bg-surface-secondary" />
            </div>
            <div className="h-5 w-16 rounded-full bg-outline" />
          </div>
        ))}
      </div>
    </div>
  )
}
