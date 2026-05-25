"use client"

import React from 'react'
import type { ValidationResult, FileTreeItem } from '@/lib/validator/types'

interface FileTreeProps {
  result: ValidationResult
}

export default function FileTree({ result }: FileTreeProps) {
  const filesWithFindings = new Set(result.findings.map(f => f.filePath).filter(Boolean))

  function renderTree(items: FileTreeItem[], depth: number = 0): React.ReactNode[] {
    return items.flatMap((item) => {
      const hasFindings = item.type === 'file' && filesWithFindings.has(item.path)
      const elements: React.ReactNode[] = []

      elements.push(
        <div
          key={item.path}
          className="flex items-center gap-1.5 whitespace-nowrap"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <span className={`material-symbols-outlined text-[14px] ${hasFindings ? 'text-red-500' : 'text-on-surface-secondary/60'}`}>
            {item.type === 'directory' ? 'folder' : hasFindings ? 'description' : 'description'}
          </span>
          <span className={hasFindings ? 'font-semibold text-red-500' : 'text-on-surface-secondary'}>
            {item.path.split('/').pop()}
          </span>
          {item.type === 'file' && item.size > 0 && (
            <span className="text-[10px] text-on-surface-secondary/50">
              {item.size} B
            </span>
          )}
        </div>
      )

      if (item.children) {
        elements.push(...renderTree(item.children, depth + 1))
      }

      return elements
    })
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary mb-3">
        <span className="material-symbols-outlined text-lg">folder</span>
        File Tree
      </h3>
      <div className="max-h-60 overflow-auto font-mono text-xs">
        {result.skillPreview.fileTree.length > 0 ? renderTree(result.skillPreview.fileTree) : (
          <div className="text-center text-on-surface-secondary/60 py-4">No file tree available</div>
        )}
      </div>
    </div>
  )
}
