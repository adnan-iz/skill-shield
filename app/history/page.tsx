"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllValidations, clearHistory } from '@/lib/state'
import type { ValidationResult } from '@/lib/validator/types'

export default function HistoryPage() {
  const router = useRouter()
  const [validations, setValidations] = useState<ValidationResult[]>(() =>
    getAllValidations()
  )

  function handleClear() {
    if (confirm('Clear all validation history?')) {
      clearHistory()
      setValidations([])
    }
  }

  const riskBadgeColor: Record<string, string> = {
    safe: 'bg-shield-100 text-shield-800',
    low: 'bg-threat-low/10 text-threat-low',
    medium: 'bg-threat-medium/10 text-threat-medium',
    high: 'bg-threat-high/10 text-threat-high',
    critical: 'bg-threat-critical/10 text-threat-critical',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">History</h1>
          <p className="text-sm text-on-surface-secondary">
            {validations.length} validation{validations.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {validations.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-lg border border-error/20 bg-error-container px-4 py-2 text-sm font-semibold text-error hover:bg-error-container/80 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {validations.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <span className="material-symbols-outlined mb-3 inline-block text-5xl text-on-surface-secondary/40">
            history
          </span>
          <h2 className="text-lg font-semibold text-on-surface mb-1">No history yet</h2>
          <p className="text-sm text-on-surface-secondary mb-6">
            Validate your first skill to see results here
          </p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-shield-600 px-5 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Validate a Skill
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="divide-y divide-outline">
            {validations.map((v) => (
              <button
                key={v.id}
                onClick={() => router.push(`/validate/${v.id}`)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-secondary"
              >
                <div className="flex-shrink-0 text-center w-14">
                  <div
                    className={`text-xl font-bold ${
                      v.overallScore >= 70
                        ? 'text-shield-600'
                        : v.overallScore >= 50
                        ? 'text-yellow-600'
                        : v.overallScore >= 30
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {v.overallScore}
                  </div>
                  <div className="text-[10px] font-medium uppercase text-on-surface-secondary/60">Score</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-on-surface truncate">{v.skillName}</div>
                  <div className="text-xs text-on-surface-secondary">
                    {new Date(v.timestamp).toLocaleString()} &middot; {v.findings.length} finding{v.findings.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                    riskBadgeColor[v.riskLevel]
                  }`}
                >
                  {v.riskLevel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
