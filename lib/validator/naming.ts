import { AxisResult, Finding } from '@/lib/validator/types'

export interface NamingValidationOptions {
  directoryName?: string
}

const RESERVED_NAMES = new Set([
  'claude', 'opencode', 'cursor', 'github-copilot', 'copilot',
  'windsurf', 'codex', 'cline', 'amp', 'goose', 'manus',
  'replit', 'aider', 'antigravity', 'gemini', 'gemini-cli',
  'zed', 'jetbrains', 'jetbrains-ai', 'continue', 'sourcegraph',
  'trae', 'mistral-vibe', 'openclaw', 'kiro', 'roo',
  'cody', 'aide', 'warp', 'tabnine', 'supermaven', 'codeium',
  'skills', 'agent', 'template', 'skill-template', 'example',
])

let findingCounter = 0

function makeId(): string {
  return `nm-${Date.now()}-${++findingCounter}`
}

export function validateNaming(
  name: string,
  options?: NamingValidationOptions
): AxisResult {
  const findings: Finding[] = []

  if (name.length < 1 || name.length > 64) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'high',
      category: 'naming',
      title: 'Invalid name length',
      message: `Skill name must be between 1 and 64 characters (got ${name.length})`,
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: name,
      recommendation: 'Shorten or expand the name to be between 1 and 64 characters',
      ruleId: 'naming-length',
    })
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'high',
      category: 'naming',
      title: 'Invalid characters in name',
      message: 'Skill name must contain only lowercase letters, numbers, and hyphens',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: name,
      recommendation: 'Use only lowercase letters, numbers, and hyphens',
      ruleId: 'naming-characters',
    })
  }

  if (/--/.test(name)) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'medium',
      category: 'naming',
      title: 'Consecutive hyphens',
      message: 'Skill name must not contain consecutive hyphens',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: name,
      recommendation: 'Replace consecutive hyphens with a single hyphen',
      ruleId: 'naming-consecutive-hyphens',
    })
  }

  if (name.startsWith('-') || name.endsWith('-')) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'medium',
      category: 'naming',
      title: 'Leading or trailing hyphen',
      message: 'Skill name must not start or end with a hyphen',
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: name,
      recommendation: 'Remove leading or trailing hyphens from the name',
      ruleId: 'naming-edge-hyphens',
    })
  }

  if (RESERVED_NAMES.has(name.toLowerCase())) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'critical',
      category: 'naming',
      title: 'Reserved name',
      message: `"${name}" is a reserved name and cannot be used as a skill name`,
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: name,
      recommendation: 'Choose a different name that is not on the reserved list',
      ruleId: 'naming-reserved',
    })
  }

  if (options?.directoryName && options.directoryName !== name) {
    findings.push({
      id: makeId(),
      axis: 'naming',
      severity: 'low',
      category: 'naming',
      title: 'Name-directory mismatch',
      message: `Skill name "${name}" does not match directory name "${options.directoryName}"`,
      filePath: 'SKILL.md',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: `Rename the directory to "${name}" or update the skill name to "${options.directoryName}"`,
      ruleId: 'naming-directory-mismatch',
    })
  }

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high')
  const score = hasCriticalOrHigh ? 0 : findings.length > 0 ? 50 : 100

  return {
    name: 'Naming Convention',
    key: 'naming',
    score,
    status: score === 100 ? 'pass' : score >= 50 ? 'warn' : 'fail',
    summary: findings.length === 0
      ? 'Skill name follows Agent Skills naming conventions'
      : `${findings.length} naming issue${findings.length > 1 ? 's' : ''} found`,
    findings,
  }
}
