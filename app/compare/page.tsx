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
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Compare Validation Results</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Compare two skills side by side to see differences in scores, findings, and compatibility.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-700">Left</span>
            <button
              onClick={() => setLeftSource('paste')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                leftSource === 'paste'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              Paste Content
            </button>
            <button
              onClick={() => setLeftSource('id')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                leftSource === 'id'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
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
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm font-mono text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          ) : (
            <input
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Enter validation ID..."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          )}
          <button
            onClick={() => runCompare('left')}
            className="mt-2 rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Analyze
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-700">Right</span>
            <button
              onClick={() => setRightSource('paste')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                rightSource === 'paste'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              Paste Content
            </button>
            <button
              onClick={() => setRightSource('id')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                rightSource === 'id'
                  ? 'bg-shield-100 text-shield-700'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
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
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm font-mono text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          ) : (
            <input
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Enter validation ID..."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700 placeholder-zinc-400 focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
            />
          )}
          <button
            onClick={() => runCompare('right')}
            className="mt-2 rounded-lg bg-shield-600 px-4 py-2 text-sm font-semibold text-white hover:bg-shield-700 transition-colors"
          >
            Analyze
          </button>
        </div>
      </div>

      {(leftResult || rightResult) && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Score</div>
              <div className="text-lg font-bold text-zinc-900">{computeDiff('score', leftResult, rightResult)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Findings</div>
              <div className="text-lg font-bold text-zinc-900">{computeDiff('findings', leftResult, rightResult)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Risk Level</div>
              <div className="text-lg font-bold text-zinc-900">{computeDiff('risk', leftResult, rightResult)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              {leftResult && (
                <>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Left: {leftResult.skillName}</h3>
                  <ScoreGauge score={leftResult.overallScore} riskLevel={leftResult.riskLevel} />
                  <div className="mt-4">
                    <FindingsTable findings={leftResult.findings} />
                  </div>
                  <div className="mt-4 rounded-lg border border-zinc-200 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Frontmatter</h4>
                    <pre className="overflow-auto text-xs text-zinc-600">
                      {JSON.stringify(leftResult.skillPreview.frontmatter, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
            <div>
              {rightResult && (
                <>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Right: {rightResult.skillName}</h3>
                  <ScoreGauge score={rightResult.overallScore} riskLevel={rightResult.riskLevel} />
                  <div className="mt-4">
                    <FindingsTable findings={rightResult.findings} />
                  </div>
                  <div className="mt-4 rounded-lg border border-zinc-200 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Frontmatter</h4>
                    <pre className="overflow-auto text-xs text-zinc-600">
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
        <div className="rounded-xl border-2 border-dashed border-zinc-200 p-16 text-center">
          <div className="text-4xl mb-2 text-zinc-300">&lt; &rarr; &gt;</div>
          <p className="text-sm text-zinc-500">
            Paste SKILL.md content or load by ID on both sides to compare
          </p>
        </div>
      )}
    </div>
  )
}
