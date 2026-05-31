import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <div className="glass-card rounded-xl px-8 py-16">
        <span className="material-symbols-outlined mb-4 inline-block text-6xl text-shield-500">shield</span>
        <h1 className="mb-2 text-6xl font-bold text-on-surface">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-on-surface">Skill Not Found</h2>
        <p className="mb-6 text-sm text-on-surface-secondary">
          The page or skill you&apos;re looking for doesn&apos;t exist. It may have been removed or the link is invalid.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Validate a Skill
          </Link>
          <Link
            href="/history"
            className="rounded-lg border border-outline px-5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-secondary transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  )
}
