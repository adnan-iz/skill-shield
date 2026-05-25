"use client"

import { useEffect, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  riskLevel: string
}

export default function ScoreGauge({ score, riskLevel }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const color =
    score >= 70
      ? 'text-shield-600'
      : score >= 50
      ? 'text-yellow-600'
      : score >= 30
      ? 'text-orange-600'
      : 'text-red-600'

  const strokeColor =
    score >= 70
      ? '#16a34a'
      : score >= 50
      ? '#ca8a04'
      : score >= 30
      ? '#ea580c'
      : '#dc2626'

  const radius = 72
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const riskLabel: Record<string, string> = {
    safe: 'Safe',
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical',
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 p-6">
      <div className="relative flex items-center justify-center">
        <svg width="180" height="180" className="-rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-5xl font-bold ${color} transition-colors duration-500`}>
            {animatedScore}
          </span>
          <span className="text-xs font-medium text-zinc-400">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold text-zinc-700 uppercase">
        {riskLabel[riskLevel] || riskLevel}
      </span>
    </div>
  )
}
