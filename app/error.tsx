"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <div className="glass-card rounded-xl px-8 py-16">
        <span className="material-symbols-outlined mb-4 inline-block text-6xl text-error">error</span>
        <h2 className="mb-2 text-xl font-semibold text-on-surface">Something went wrong</h2>
        <p className="mb-6 text-sm text-on-surface-secondary">{error.message || "An unexpected error occurred."}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => unstable_retry()}
            className="rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-outline px-5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-secondary transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
