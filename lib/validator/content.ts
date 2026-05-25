import { AxisResult, Finding } from '@/lib/validator/types'

let findingCounter = 0

function makeId(): string {
  return `ct-${Date.now()}-${++findingCounter}`
}

export function validateContent(content: string): AxisResult {
  const findings: Finding[] = []

  if (!content || content.trim().length === 0) {
    findings.push({
      id: makeId(),
      axis: 'content',
      severity: 'critical',
      category: 'content',
      title: 'Empty content',
      message: 'Skill has no content',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Add content describing the skill functionality',
      ruleId: 'content-empty',
    })
  }

  return {
    name: 'Content Review',
    key: 'content',
    score: findings.length === 0 ? 100 : 0,
    status: findings.length === 0 ? 'pass' : 'fail',
    summary: findings.length === 0 ? 'Skill content is present' : 'Skill content is empty',
    findings,
  }
}
