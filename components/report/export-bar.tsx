"use client"

import type { ValidationResult } from '@/lib/validator/types'

interface ExportBarProps {
  result: ValidationResult
}

export default function ExportBar({ result }: ExportBarProps) {
  function exportJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `skillshield-${result.id}.json`)
  }

  function exportHtml() {
    const html = generateHtml(result)
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, `skillshield-${result.id}.html`)
  }

  function exportPdf() {
    const html = generateHtml(result)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/validate/${result.id}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={exportPdf}
        className="inline-flex items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
        Export PDF
      </button>
      <button
        onClick={exportHtml}
        className="inline-flex items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">code</span>
        Export HTML
      </button>
      <button
        onClick={exportJson}
        className="inline-flex items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">data_object</span>
        Export JSON
      </button>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-outline bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-secondary transition-colors"
      >
        <span className="material-symbols-outlined text-lg">link</span>
        Copy Link
      </button>
    </div>
  )
}

function generateHtml(result: ValidationResult): string {
  const findingRows = result.findings
    .map(
      (f) => `
    <tr>
      <td><span class="sev sev-${f.severity}">${f.severity.toUpperCase()}</span></td>
      <td>${f.category}</td>
      <td>${f.title}</td>
      <td>${f.filePath || 'SKILL.md'}:${f.lineNumber || '-'}</td>
      <td>${f.recommendation || '-'}</td>
    </tr>`
    )
    .join('')

  const compatCards = result.compatibility.agents
    .map((c) => `<span class="compat ${c.status}">${c.name}</span>`)
    .join('')

  const scoreColor =
    result.overallScore >= 70
      ? '#16a34a'
      : result.overallScore >= 50
      ? '#ca8a04'
      : result.overallScore >= 30
      ? '#ea580c'
      : '#dc2626'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillShield Report - ${result.skillName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 960px; margin: 0 auto; padding: 2rem; color: #18181b; background: #fff; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.125rem; margin: 1.5rem 0 0.75rem; }
    .score { font-size: 3rem; font-weight: 700; color: ${scoreColor}; }
    .meta { color: #71717a; font-size: 0.875rem; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e4e4e7; font-size: 0.875rem; }
    th { font-weight: 600; color: #71717a; background: #fafafa; }
    .sev { font-weight: 600; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 999px; }
    .sev-critical { background: #fef2f2; color: #dc2626; }
    .sev-high { background: #fff7ed; color: #ea580c; }
    .sev-medium { background: #fefce8; color: #ca8a04; }
    .sev-low { background: #f7fee7; color: #65a30d; }
    .sev-info { background: #eff6ff; color: #2563eb; }
    .compat { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; margin: 0.25rem; }
    .full { background: #f0fdf4; color: #166534; }
    .partial { background: #fff7ed; color: #9a3412; }
    .unknown { background: #fafafa; color: #71717a; }
    .incompatible { background: #fef2f2; color: #991b1b; }
    .axis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; }
    .axis-card { padding: 0.75rem; border: 1px solid #e4e4e7; border-radius: 0.5rem; }
    .axis-name { font-weight: 500; font-size: 0.875rem; }
    .axis-score { font-weight: 700; font-size: 1.125rem; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e4e4e7; font-size: 0.75rem; color: #a1a1aa; }
  </style>
</head>
<body>
  <h1>${result.skillName}</h1>
  <div class="score">${result.overallScore}/100</div>
  <div class="meta">
    Risk Level: ${result.riskLevel.toUpperCase()} &middot;
    ${result.findings.length} findings &middot;
    ${new Date(result.timestamp).toLocaleString()}
  </div>

  <h2>Axis Assessment</h2>
  <div class="axis-grid">
    ${result.axes.map((a) => {
      const ac = a.score >= 70 ? '#16a34a' : a.score >= 50 ? '#ca8a04' : a.score >= 30 ? '#ea580c' : '#dc2626'
      return `<div class="axis-card"><div class="axis-name">${a.name}</div><div class="axis-score" style="color: ${ac}">${a.score}</div><div style="font-size:0.75rem;color:#71717a">${a.status}</div></div>`
    }).join('')}
  </div>

  <h2>Findings (${result.findings.length})</h2>
  ${result.findings.length === 0 ? '<p>No issues found.</p>' : `<table><thead><tr><th>Severity</th><th>Category</th><th>Title</th><th>File:Line</th><th>Recommendation</th></tr></thead><tbody>${findingRows}</tbody></table>`}

  <h2>Agent Compatibility</h2>
  <div>${compatCards}</div>

  <h2>Frontmatter</h2>
  <pre style="background:#fafafa;padding:0.75rem;border-radius:0.5rem;font-size:0.75rem;overflow:auto;max-height:200px">${JSON.stringify(result.skillPreview.frontmatter, null, 2)}</pre>

  <div class="footer">Generated by SkillShield &mdash; Agent Skills Validator</div>
</body>
</html>`
}
