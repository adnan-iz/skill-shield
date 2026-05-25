export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 animate-pulse">
      <div className="mb-12">
        <div className="mb-2 h-10 w-48 rounded-lg bg-outline" />
        <div className="h-5 w-72 rounded bg-surface-secondary" />
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="mb-3 h-8 w-8 rounded bg-outline" />
            <div className="mb-1 h-8 w-20 rounded bg-outline" />
            <div className="h-4 w-28 rounded bg-surface-secondary" />
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl mb-12">
        <div className="flex border-b border-outline">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 px-4 py-3">
              <div className="mx-auto h-4 w-24 rounded bg-outline" />
            </div>
          ))}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-outline py-20">
            <div className="h-5 w-40 rounded bg-outline" />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded bg-outline" />
              <div className="mx-auto mb-1 h-5 w-20 rounded bg-outline" />
              <div className="mx-auto h-4 w-36 rounded bg-surface-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
