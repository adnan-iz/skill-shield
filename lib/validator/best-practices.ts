import { AxisResult, Finding } from '@/lib/validator/types'

let findingCounter = 0

function makeId(): string {
  return `bp-${Date.now()}-${++findingCounter}`
}

export function validateBestPractices(content: string): AxisResult {
  const findings: Finding[] = []
  const lower = content.toLowerCase()

  if (!lower.includes('version')) {
    findings.push({
      id: makeId(),
      axis: 'bestPractices',
      severity: 'low',
      category: 'best-practices',
      title: 'Missing version information',
      message: 'Consider adding version information to the skill',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Add version information to track changes and compatibility',
      ruleId: 'best-practices-version',
    })
  }

  if (!lower.includes('license')) {
    findings.push({
      id: makeId(),
      axis: 'bestPractices',
      severity: 'info',
      category: 'best-practices',
      title: 'Missing license',
      message: 'Consider adding a license to your skill',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Add an open-source license to encourage adoption',
      ruleId: 'best-practices-license',
    })
  }

  return {
    name: 'Best Practices',
    key: 'bestPractices',
    score: findings.length === 0 ? 100 : 70,
    status: findings.length === 0 ? 'pass' : 'warn',
    summary: findings.length === 0
      ? 'Follows best practices'
      : `${findings.length} best practice improvement${findings.length > 1 ? 's' : ''} available`,
    findings,
  }
}
