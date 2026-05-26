import { parse as parseYaml } from 'yaml'
import type { Finding } from '@/lib/validator/types'

export interface SemgrepRule {
  id: string
  pattern?: string
  patternRegex?: string
  patternEither?: Array<{ pattern?: string; patternRegex?: string }>
  patternNot?: Array<{ pattern?: string; patternRegex?: string }>
  message: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  languages?: string[]
  paths?: {
    include?: string[]
    exclude?: string[]
  }
  metadata?: Record<string, unknown>
}

export interface SemgrepRulesFile {
  rules: SemgrepRule[]
}

export function parseSemgrepRules(yamlContent: string): SemgrepRule[] {
  try {
    const parsed = parseYaml(yamlContent) as SemgrepRulesFile
    return parsed?.rules || []
  } catch {
    return []
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function testRule(rule: SemgrepRule, testContent: string): boolean {
  if (!testContent) return false
  if (rule.pattern) {
    return new RegExp(escapeRegex(rule.pattern), 'i').test(testContent)
  }
  if (rule.patternRegex) {
    return new RegExp(rule.patternRegex, 'i').test(testContent)
  }
  if (rule.patternEither) {
    return rule.patternEither.some(sub => {
      if (sub.pattern) {
        return new RegExp(escapeRegex(sub.pattern), 'i').test(testContent)
      }
      if (sub.patternRegex) {
        return new RegExp(sub.patternRegex, 'i').test(testContent)
      }
      return false
    })
  }
  return false
}

function isExcluded(rule: SemgrepRule, testContent: string): boolean {
  if (!rule.patternNot) return false
  return rule.patternNot.some(sub => {
    if (sub.pattern) {
      return new RegExp(escapeRegex(sub.pattern), 'i').test(testContent)
    }
    if (sub.patternRegex) {
      return new RegExp(sub.patternRegex, 'i').test(testContent)
    }
    return false
  })
}

function findMatch(rule: SemgrepRule, content: string): RegExpExecArray | null {
  if (rule.pattern) {
    return new RegExp(escapeRegex(rule.pattern), 'i').exec(content)
  }
  if (rule.patternRegex) {
    return new RegExp(rule.patternRegex, 'i').exec(content)
  }
  if (rule.patternEither) {
    for (const sub of rule.patternEither) {
      const pattern = sub.pattern || sub.patternRegex
      if (!pattern) continue
      const re = new RegExp(sub.patternRegex ? pattern : escapeRegex(pattern), 'i')
      const result = re.exec(content)
      if (result) return result
    }
  }
  return null
}

function matchesPathFilter(filter: string[], filePath: string): boolean {
  return filter.some(p => {
    if (p.startsWith('*')) return filePath.endsWith(p.slice(1))
    return filePath.includes(p)
  })
}

export function matchRule(rule: SemgrepRule, content: string, filePath: string, ruleIndex: number): Finding | null {
  const mappedSeverity: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
    CRITICAL: 'critical',
    ERROR: 'high',
    WARNING: 'medium',
    INFO: 'info',
  }

  if (rule.paths?.include && !matchesPathFilter(rule.paths.include, filePath)) return null
  if (rule.paths?.exclude && matchesPathFilter(rule.paths.exclude, filePath)) return null

  if (!testRule(rule, content)) return null
  if (isExcluded(rule, content)) return null

  const matchResult = findMatch(rule, content)
  if (!matchResult) return null

  const before = content.slice(0, matchResult.index)
  const lineNumber = (before.match(/\n/g) || []).length + 1
  const lastNewline = before.lastIndexOf('\n')
  const column = matchResult.index - lastNewline

  const start = Math.max(0, matchResult.index - 30)
  const end = Math.min(content.length, matchResult.index + matchResult[0].length + 30)
  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'

  return {
    id: `semgrep-${ruleIndex}-${lineNumber}`,
    axis: 'security',
    severity: mappedSeverity[rule.severity] || 'medium',
    category: 'semgrep-rule',
    title: rule.id,
    message: rule.message,
    filePath,
    lineNumber,
    column: column + 1,
    snippet,
    ruleId: rule.id,
  }
}

export function runSemgrepScan(content: string, filePath: string, rules?: SemgrepRule[]): Finding[] {
  const activeRules = rules || loadBuiltinRules()
  const findings: Finding[] = []

  for (let i = 0; i < activeRules.length; i++) {
    const finding = matchRule(activeRules[i], content, filePath, i)
    if (finding) findings.push(finding)
  }

  return findings
}

import { BUILTIN_RULES } from './builtin-rules'

export function loadBuiltinRules(): SemgrepRule[] {
  return [...BUILTIN_RULES]
}
