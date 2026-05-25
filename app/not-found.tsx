import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <div className="glass-card rounded-xl px-8 py-16">
        <span className="material-symbols-outlined mb-4 inline-block text-6xl text-on-surface-secondary">search</span>
        <h2 className="mb-2 text-xl font-semibold text-on-surface">Page not found</h2>
        <p className="mb-6 text-sm text-on-surface-secondary">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
