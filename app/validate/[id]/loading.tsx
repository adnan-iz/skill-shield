export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-pulse">
      <div className="glass-card mb-8 rounded-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-outline" />
            <div>
              <div className="mb-1 h-5 w-48 rounded bg-outline" />
              <div className="h-3 w-56 rounded bg-surface-secondary" />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full bg-outline" />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6">
            <div className="mx-auto h-32 w-32 rounded-full bg-outline" />
            <div className="mx-auto mt-3 h-4 w-20 rounded bg-surface-secondary" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 h-4 w-36 rounded bg-outline" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg border border-outline bg-surface-secondary/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-outline" />
                    <div className="h-4 w-24 rounded bg-outline" />
                    <div className="ml-auto h-4 w-8 rounded bg-outline" />
                  </div>
                  <div className="mb-1 h-2 w-full rounded-full bg-outline" />
                  <div className="h-3 w-36 rounded bg-surface-secondary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl mb-8">
        <div className="border-b border-outline/60 p-4">
          <div className="h-4 w-40 rounded bg-outline" />
        </div>
        <div className="divide-y divide-outline">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <div className="h-4 w-4 rounded bg-outline" />
              <div className="h-4 w-32 rounded bg-outline" />
              <div className="ml-auto h-5 w-16 rounded-full bg-outline" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
