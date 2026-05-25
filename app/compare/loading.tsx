export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="mb-1 h-7 w-28 rounded bg-outline" />
      <div className="mb-8 h-4 w-48 rounded bg-surface-secondary" />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-10 rounded bg-outline" />
            <div className="h-6 w-24 rounded bg-outline" />
            <div className="h-6 w-20 rounded bg-outline" />
          </div>
          <div className="h-48 w-full rounded-lg bg-outline" />
          <div className="mt-3 h-9 w-20 rounded-lg bg-outline" />
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-10 rounded bg-outline" />
            <div className="h-6 w-24 rounded bg-outline" />
            <div className="h-6 w-20 rounded bg-outline" />
          </div>
          <div className="h-48 w-full rounded-lg bg-outline" />
          <div className="mt-3 h-9 w-20 rounded-lg bg-outline" />
        </div>
      </div>

      <div className="glass-card rounded-xl p-16 text-center">
        <div className="mx-auto mb-2 h-8 w-8 rounded bg-outline" />
        <div className="mx-auto h-4 w-64 rounded bg-surface-secondary" />
      </div>
    </div>
  )
}
