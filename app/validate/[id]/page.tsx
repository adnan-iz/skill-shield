"use client"

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getValidation } from '@/lib/state'
import ScoreGauge from '@/components/report/score-gauge'
import FindingsTable from '@/components/report/findings-table'
import CompatibilityGrid from '@/components/report/compatibility-grid'
import ExportBar from '@/components/report/export-bar'
import type { ValidationResult } from '@/lib/validator/types'

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [result, setResult] = useState<ValidationResult | null | undefined>(undefined)

  useEffect(() => {
    setResult(getValidation(id))
    function handleStorage() {
      setResult(getValidation(id))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [id])

  const loading = result === undefined

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-shield-200 border-t-shield-600" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <div className="text-6xl mb-4 text-zinc-300">404</div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Report Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">
          This validation result could not be found. It may have been cleared from history.
        </p>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
        >
          Validate a Skill
        </button>
      </div>
    )
  }

  const riskBadgeColor: Record<string, string> = {
    safe: 'bg-shield-100 text-shield-800',
    low: 'bg-lime-100 text-lime-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{result.skillName}</h1>
          <p className="text-sm text-zinc-500">
            Validated {new Date(result.timestamp).toLocaleString()} &middot; {result.source?.type || 'direct'}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
            riskBadgeColor[result.riskLevel]
          }`}
        >
          {result.riskLevel}
        </span>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ScoreGauge score={result.overallScore} riskLevel={result.riskLevel} />
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              10-Axis Assessment
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.axes.map((axis) => {
                const pct = axis.score
                const barColor =
                  pct >= 70
                    ? 'bg-shield-500'
                    : pct >= 50
                    ? 'bg-yellow-500'
                    : pct >= 30
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                const statusDot =
                  axis.status === 'pass'
                    ? 'bg-shield-500'
                    : axis.status === 'warn'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                return (
                  <div key={axis.key} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                      <span className="text-sm font-medium text-zinc-900">{axis.name}</span>
                      <span className="ml-auto text-sm font-semibold text-zinc-700">{axis.score}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{axis.summary}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="rounded-xl border border-zinc-200">
          <div className="border-b border-zinc-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Security Findings ({result.findings.length})
            </h3>
          </div>
          <FindingsTable findings={result.findings} />
        </div>
      </div>

      <div className="mb-8">
        <div className="rounded-xl border border-zinc-200 p-4">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Agent Compatibility
          </h3>
          <CompatibilityGrid agents={result.compatibility.agents} />
        </div>
      </div>

      <div className="mb-8">
        <div className="rounded-xl border border-zinc-200 p-4">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            SKILL.md Preview
          </h3>
          <pre className="max-h-80 overflow-auto rounded-lg bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700">
            {result.skillPreview.body || 'No content'}
          </pre>
        </div>
      </div>

      <ExportBar result={result} />

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Validate Another Skill
        </button>
      </div>
    </div>
  )
}
