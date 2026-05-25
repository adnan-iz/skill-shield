"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getValidation } from '@/lib/state'
import ScoreGauge from '@/components/report/score-gauge'
import FindingsTable from '@/components/report/findings-table'
import CompatibilityGrid from '@/components/report/compatibility-grid'
import ExportBar from '@/components/report/export-bar'
import DashboardCards from '@/components/report/dashboard-cards'
import FileTree from '@/components/report/file-tree'
import type { ValidationResult } from '@/lib/validator/types'

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [result, setResult] = useState<ValidationResult | null | undefined>(() => getValidation(id))

  useEffect(() => {
    function handleStorage() {
      setResult(getValidation(id))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [id])

  const [approval, setApproval] = useState<{ id: string; scanId: string; status: string; reviewedBy: string | null; reviewNotes: string | null; createdAt: number; reviewedAt: number | null } | null>(null)

  useEffect(() => {
    fetch(`/api/approvals?scanId=${id}`)
      .then(r => r.json())
      .then(data => setApproval(data.length > 0 ? data[0] : null))
      .catch(() => {})
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
        <div className="glass-card rounded-xl px-8 py-16">
          <span className="material-symbols-outlined text-6xl text-on-surface-secondary/40 mb-4">error</span>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Report Not Found</h2>
          <p className="text-sm text-on-surface-secondary mb-6">
            This validation result could not be found. It may have been cleared from history.
          </p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Validate a Skill
          </button>
        </div>
      </div>
    )
  }

  const riskBadgeColor: Record<string, string> = {
    safe: 'bg-shield-100 text-shield-800',
    low: 'bg-threat-low/10 text-threat-low',
    medium: 'bg-threat-medium/10 text-threat-medium',
    high: 'bg-threat-high/10 text-threat-high',
    critical: 'bg-threat-critical/10 text-threat-critical',
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="glass-card mb-8 flex items-center justify-between rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-shield-600">description</span>
          <div>
            <h1 className="text-xl font-bold text-on-surface">{result.skillName}</h1>
            <p className="flex items-center gap-1 text-xs text-on-surface-secondary">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Validated {new Date(result.timestamp).toLocaleString()}
              <span className="mx-1">&middot;</span>
              <span className="material-symbols-outlined text-[14px]">cloud</span>
              {result.source?.type || 'direct'}
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
            riskBadgeColor[result.riskLevel]
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">shield</span>
          {result.riskLevel}
        </span>
      </div>

      {approval && (
        <div className="mb-6 glass-card rounded-xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">verified</span>
            <span className="text-sm font-medium">Approval Status:</span>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${
              approval.status === 'approved' ? 'bg-shield-100 text-shield-800' :
              approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {approval.status}
            </span>
          </div>
          {approval.status === 'pending' && (
            <div className="flex gap-2">
              <button className="rounded-lg bg-shield-600 px-4 py-1.5 text-xs font-semibold text-white">Approve</button>
              <button className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white">Reject</button>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <DashboardCards result={result} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card rounded-xl p-6">
            <ScoreGauge score={result.overallScore} riskLevel={result.riskLevel} />
          </div>
          <FileTree result={result} />
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
              <span className="material-symbols-outlined text-lg">donut_small</span>
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
                  <div key={axis.key} className="rounded-lg border border-outline bg-surface-secondary/50 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                      <span className="text-sm font-medium text-on-surface">{axis.name}</span>
                      <span className="ml-auto text-sm font-semibold text-on-surface">{axis.score}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-outline">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-on-surface-secondary">{axis.summary}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="glass-card rounded-xl">
          <div className="border-b border-outline/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
              <span className="material-symbols-outlined text-lg">list_alt</span>
              Security Findings ({result.findings.length})
            </h3>
            {result.findings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-on-surface-secondary">
                {Object.entries(
                  result.findings.reduce<Record<string, number>>((acc, f) => {
                    acc[f.category] = (acc[f.category] || 0) + 1
                    return acc
                  }, {})
                ).map(([cat, count]) => (
                  <span key={cat} className="rounded-full bg-surface-secondary px-2 py-0.5">
                    {cat}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
          <FindingsTable findings={result.findings} />
        </div>
      </div>

      <div className="mb-8">
        <div className="glass-card rounded-xl p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
            <span className="material-symbols-outlined text-lg">device_hub</span>
            Agent Compatibility
          </h3>
          <CompatibilityGrid agents={result.compatibility.agents} />
        </div>
      </div>

      <div className="mb-8">
        <div className="glass-card rounded-xl p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
            <span className="material-symbols-outlined text-lg">code</span>
            SKILL.md Preview
          </h3>
          <pre className="max-h-80 overflow-auto rounded-lg bg-surface-secondary p-4 text-xs leading-relaxed text-on-surface">
            {result.skillPreview.body || 'No content'}
          </pre>
        </div>
      </div>

      <ExportBar result={result} />

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 rounded-lg border border-outline px-5 py-2 text-sm font-semibold text-on-surface hover:bg-surface-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Validate Another Skill
        </button>
      </div>
    </div>
  )
}
