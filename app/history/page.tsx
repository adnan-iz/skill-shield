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
    low: 'bg-lime-100 text-lime-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">History</h1>
          <p className="text-sm text-zinc-500">
            {validations.length} validation{validations.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {validations.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {validations.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <span className="material-symbols-outlined mb-3 inline-block text-5xl text-zinc-300">
            history
          </span>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">No history yet</h2>
          <p className="text-sm text-zinc-500 mb-6">
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
          <div className="divide-y divide-zinc-100">
            {validations.map((v) => (
              <button
                key={v.id}
                onClick={() => router.push(`/validate/${v.id}`)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
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
                  <div className="text-[10px] font-medium uppercase text-zinc-400">Score</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-900 truncate">{v.skillName}</div>
                  <div className="text-xs text-zinc-500">
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
