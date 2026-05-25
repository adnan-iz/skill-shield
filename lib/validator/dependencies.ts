import { AxisResult, Finding } from '@/lib/validator/types'

let findingCounter = 0

function makeId(): string {
  return `dep-${Date.now()}-${++findingCounter}`
}

export function validateDependencies(content: string): AxisResult {
  const findings: Finding[] = []

  if (content.includes('require(') || content.includes('import ')) {
    findings.push({
      id: makeId(),
      axis: 'dependencies',
      severity: 'info',
      category: 'dependencies',
      title: 'Dependencies detected',
      message: 'Content references external dependencies',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Document all dependencies and their versions in the skill metadata',
      ruleId: 'dependencies-detected',
    })
  }

  return {
    name: 'Dependency Check',
    key: 'dependencies',
    score: findings.length === 0 ? 100 : 80,
    status: 'pass',
    summary: findings.length === 0
      ? 'No external dependencies detected'
      : 'External dependencies detected, ensure they are documented',
    findings,
  }
}
