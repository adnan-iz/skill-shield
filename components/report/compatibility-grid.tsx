"use client"

import { useState } from 'react'
import type { AgentCompatibility } from '@/lib/validator/types'

interface CompatibilityGridProps {
  agents: AgentCompatibility[]
}

const statusConfig: Record<
  AgentCompatibility['status'],
  { icon: string; color: string; label: string }
> = {
  full: {
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    label: 'Full compatibility',
  },
  partial: {
    icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    color: 'text-lime-700 bg-lime-50 border-lime-200',
    label: 'Partial compatibility',
  },
  unknown: {
    icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
    color: 'text-zinc-500 bg-zinc-50 border-zinc-200',
    label: 'Unknown compatibility',
  },
  incompatible: {
    icon: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-red-600 bg-red-50 border-red-200',
    label: 'Incompatible',
  },
}

export default function CompatibilityGrid({ agents }: CompatibilityGridProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {agents.map((agent) => {
        const config = statusConfig[agent.status]
        const isHovered = hovered === agent.name
        return (
          <div
            key={agent.id}
            onMouseEnter={() => setHovered(agent.name)}
            onMouseLeave={() => setHovered(null)}
            className={`relative flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${config.color} ${
              isHovered ? 'shadow-sm scale-[1.02]' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="size-4 flex-shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
            </svg>
            <span className="truncate text-xs font-medium">{agent.name}</span>
            {isHovered && agent.notes && (
              <div className="absolute -bottom-1 left-1/2 z-10 w-48 -translate-x-1/2 translate-y-full rounded-md border border-outline bg-surface-container px-3 py-2 text-xs text-on-surface-secondary shadow-lg">
                {agent.notes}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
