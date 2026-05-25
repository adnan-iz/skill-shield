"use client"

import { useState } from 'react'
import { getValidation } from '@/lib/state'
import { runFullValidation } from '@/lib/validator/orchestrator'
import type { ValidationResult, SkillInput } from '@/lib/validator/types'
import ScoreGauge from '@/components/report/score-gauge'
import FindingsTable from '@/components/report/findings-table'

export default function ComparePage() {
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [leftResult, setLeftResult] = useState<ValidationResult | null>(null)
  const [rightResult, setRightResult] = useState<ValidationResult | null>(null)
  const [leftSource, setLeftSource] = useState<'paste' | 'id'>('paste')
  const [rightSource, setRightSource] = useState<'paste' | 'id'>('paste')

  function runCompare(which: 'left' | 'right') {
    const input = which === 'left' ? leftInput : rightInput
    const source = which === 'left' ? leftSource : rightSource
    const setResult = which === 'left' ? setLeftResult : setRightResult

    if (!input.trim()) return

    if (source === 'id') {
      const stored = getValidation(input.trim())
      if (stored) {
        setResult(stored)
      } else {
        setResult(null)
      }
      return
    }

    const skillInput: SkillInput = {
      files: [{ path: 'SKILL.md', content: input }],
    }
    runFullValidation(skillInput).then(result => setResult(result))
  }

  function computeDiff(
    key: string,
    left: ValidationResult | null,
    right: ValidationResult | null
  ): string {
    if (!left && !right) return ''
    if (!left) return 'N/A'
    if (!right) return 'N/A'

    if (key === 'score') return `${left.overallScore} vs ${right.overallScore} (diff: ${Math.abs(left.overallScore - right.overallScore)})`
    if (key === 'findings') return `${left.findings.length} vs ${right.findings.length}`
    if (key === 'risk') return `${left.riskLevel} vs ${right.riskLevel}`
    return ''
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-1">Compare</h1>
      <p className="text-sm text-on-surface-secondary mb-8">
        Compare two skills side by side
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-on-surface">Left</span>
            <button
              onClick={() => setLeftSource('paste')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                leftSource === 'paste'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-surface-secondary text-on-surface-secondary hover:bg-outline'
              }`}
            >
              Paste Content
            </button>
            <button
              onClick={() => setLeftSource('id')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                leftSource === 'id'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-surface-secondary text-on-surface-secondary hover:bg-outline'
              }`}
            >
              Load by ID
            </button>
          </div>
          {leftSource === 'paste' ? (
            <textarea
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste SKILL.md content here..."
              rows={10}
              className="w-full rounded-lg border border-outline bg-surface-container p-3 text-sm font-mono text-on-surface placeholder-on-surface-secondary focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          ) : (
            <input
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Enter validation ID..."
              className="w-full rounded-lg border border-outline bg-surface-container p-3 text-sm text-on-surface placeholder-on-surface-secondary focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          )}
          <button
            onClick={() => runCompare('left')}
            className="mt-3 rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Analyze
          </button>
        </div>

        <div className="glass-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-on-surface">Right</span>
            <button
              onClick={() => setRightSource('paste')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                rightSource === 'paste'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-surface-secondary text-on-surface-secondary hover:bg-outline'
              }`}
            >
              Paste Content
            </button>
            <button
              onClick={() => setRightSource('id')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                rightSource === 'id'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-surface-secondary text-on-surface-secondary hover:bg-outline'
              }`}
            >
              Load by ID
            </button>
          </div>
          {rightSource === 'paste' ? (
            <textarea
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste SKILL.md content here..."
              rows={10}
              className="w-full rounded-lg border border-outline bg-surface-container p-3 text-sm font-mono text-on-surface placeholder-on-surface-secondary focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          ) : (
            <input
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Enter validation ID..."
              className="w-full rounded-lg border border-outline bg-surface-container p-3 text-sm text-on-surface placeholder-on-surface-secondary focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          )}
          <button
            onClick={() => runCompare('right')}
            className="mt-3 rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Analyze
          </button>
        </div>
      </div>

          {(leftResult || rightResult) && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-card p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-secondary mb-1">Score diff</div>
              <div className="text-lg font-bold text-on-surface">{computeDiff('score', leftResult, rightResult)}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-secondary mb-1">Findings diff</div>
              <div className="text-lg font-bold text-on-surface">{computeDiff('findings', leftResult, rightResult)}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-secondary mb-1">Risk diff</div>
              <div className="text-lg font-bold text-on-surface">{computeDiff('risk', leftResult, rightResult)}</div>
            </div>
          </div>

          {leftResult && rightResult && (
            <div className="glass-card rounded-xl p-4 mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-secondary mb-3">Axis-by-Axis Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline text-left text-xs font-semibold uppercase text-on-surface-secondary">
                      <th className="px-3 py-2">Axis</th>
                      <th className="px-3 py-2">Left Score</th>
                      <th className="px-3 py-2">Right Score</th>
                      <th className="px-3 py-2">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leftResult.axes.map((leftAxis) => {
                      const rightAxis = rightResult.axes.find(a => a.key === leftAxis.key)
                      if (!rightAxis) return null
                      const diff = leftAxis.score - rightAxis.score
                      return (
                        <tr key={leftAxis.key} className="border-b border-outline">
                          <td className="px-3 py-2 font-medium">{leftAxis.name}</td>
                          <td className="px-3 py-2" style={{ color: leftAxis.score >= 70 ? '#16a34a' : leftAxis.score >= 50 ? '#ca8a04' : leftAxis.score >= 30 ? '#ea580c' : '#dc2626' }}>
                            {leftAxis.score}
                          </td>
                          <td className="px-3 py-2" style={{ color: rightAxis.score >= 70 ? '#16a34a' : rightAxis.score >= 50 ? '#ca8a04' : rightAxis.score >= 30 ? '#ea580c' : '#dc2626' }}>
                            {rightAxis.score}
                          </td>
                          <td className={`px-3 py-2 font-semibold ${diff > 0 ? 'text-shield-500' : diff < 0 ? 'text-red-500' : 'text-on-surface-secondary'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {leftResult && rightResult && (
            <div className="glass-card rounded-xl p-4 mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-secondary mb-3">Findings Overlap</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-outline p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Unique to Left ({leftResult.findings.filter(lf => !rightResult.findings.some(rf => rf.title === lf.title)).length})</p>
                  <ul className="space-y-1">
                    {leftResult.findings.filter(lf => !rightResult.findings.some(rf => rf.title === lf.title)).map(f => (
                      <li key={f.id} className="text-xs text-on-surface-secondary">{f.title}</li>
                    ))}
                    {leftResult.findings.filter(lf => !rightResult.findings.some(rf => rf.title === lf.title)).length === 0 && (
                      <li className="text-xs text-on-surface-secondary/50 italic">None</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-lg border border-outline p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-shield-400 mb-2">Unique to Right ({rightResult.findings.filter(rf => !leftResult.findings.some(lf => lf.title === rf.title)).length})</p>
                  <ul className="space-y-1">
                    {rightResult.findings.filter(rf => !leftResult.findings.some(lf => lf.title === rf.title)).map(f => (
                      <li key={f.id} className="text-xs text-on-surface-secondary">{f.title}</li>
                    ))}
                    {rightResult.findings.filter(rf => !leftResult.findings.some(lf => lf.title === rf.title)).length === 0 && (
                      <li className="text-xs text-on-surface-secondary/50 italic">None</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-lg border border-outline p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">In Both ({leftResult.findings.filter(lf => rightResult.findings.some(rf => rf.title === lf.title)).length})</p>
                  <ul className="space-y-1">
                    {leftResult.findings.filter(lf => rightResult.findings.some(rf => rf.title === lf.title)).map(f => (
                      <li key={f.id} className="text-xs text-on-surface-secondary">{f.title}</li>
                    ))}
                    {leftResult.findings.filter(lf => rightResult.findings.some(rf => rf.title === lf.title)).length === 0 && (
                      <li className="text-xs text-on-surface-secondary/50 italic">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              {leftResult && (
                <>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">Left: {leftResult.skillName}</h3>
                  <ScoreGauge score={leftResult.overallScore} riskLevel={leftResult.riskLevel} />
                  <div className="mt-4">
                    <FindingsTable findings={leftResult.findings} />
                  </div>
                  <div className="mt-4 rounded-lg border border-outline p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-secondary">Frontmatter</h4>
                    <pre className="overflow-auto text-xs text-on-surface-secondary">
                      {JSON.stringify(leftResult.skillPreview.frontmatter, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
            <div>
              {rightResult && (
                <>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">Right: {rightResult.skillName}</h3>
                  <ScoreGauge score={rightResult.overallScore} riskLevel={rightResult.riskLevel} />
                  <div className="mt-4">
                    <FindingsTable findings={rightResult.findings} />
                  </div>
                  <div className="mt-4 rounded-lg border border-outline p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-secondary">Frontmatter</h4>
                    <pre className="overflow-auto text-xs text-on-surface-secondary">
                      {JSON.stringify(rightResult.skillPreview.frontmatter, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {!leftResult && !rightResult && (
        <div className="glass-card p-16 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-secondary/40 mb-2 inline-block">compare_arrows</span>
          <p className="text-sm text-on-surface-secondary">
            Paste SKILL.md content or load by ID on both sides to compare
          </p>
        </div>
      )}
    </div>
  )
}
