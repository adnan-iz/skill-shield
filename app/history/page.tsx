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
          <h1 className="text-2xl font-bold text-zinc-900">Validation History</h1>
          <p className="text-sm text-zinc-500">
            {validations.length} past validation{validations.length !== 1 ? 's' : ''}
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
        <div className="rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center">
          <div className="text-4xl mb-2 text-zinc-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mx-auto size-12 text-zinc-300"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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
        <div className="space-y-3">
          {validations.map((v) => (
            <button
              key={v.id}
              onClick={() => router.push(`/validate/${v.id}`)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-shield-300 hover:bg-shield-50/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-center">
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
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
