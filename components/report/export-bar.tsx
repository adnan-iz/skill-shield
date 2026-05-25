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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        Export PDF
      </button>
      <button
        onClick={exportHtml}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z" clipRule="evenodd" />
        </svg>
        Export HTML
      </button>
      <button
        onClick={exportJson}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zM8 7a1 1 0 00-1 1v3a1 1 0 001 1h.5a.5.5 0 000-1H8V8h.5a.5.5 0 000-1H8zm5 4a1 1 0 01-1 1h-.5a.5.5 0 010-1H12V8h-.5a.5.5 0 010-1H12a1 1 0 011 1v3z" />
        </svg>
        Export JSON
      </button>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
          <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
        </svg>
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
