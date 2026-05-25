import type { ValidationResult, Finding } from '@/lib/validator/types'
import type { PolicyConfig } from './types'

export interface PolicyViolation {
  findingId: string
  rule: string
  message: string
  severity: string
}

export interface PolicyEvaluation {
  passed: boolean
  violations: PolicyViolation[]
  originalScore: number
  adjustedScore: number
  failReason?: string
}

const DESTRUCTIVE_PATTERNS = [
  /rm\s+-rf/i,
  /rm\s+--recursive/i,
  /chmod\s+777/i,
  /chmod\s+-R\s+777/i,
  /dd\s+if=/i,
  /:\(\)\s*\{/,
  />\s*\/dev\/sda/i,
  /mkfs\./i,
  /fdisk/i,
  /format/i,
  /del\s+\/f/i,
  /rd\s+\/s/i,
]

function isDestructiveCommand(cmd: string): boolean {
  return DESTRUCTIVE_PATTERNS.some((p) => p.test(cmd))
}

function matchesBlockedCommand(cmd: string, blockedCommands: string[]): boolean {
  return blockedCommands.some((blocked) => cmd.toLowerCase().includes(blocked.toLowerCase()))
}

function isSecretFinding(finding: Finding): boolean {
  return (
    finding.category === 'secrets' ||
    finding.category === 'credentials' ||
    finding.axis === 'security' &&
      /secret|token|password|api.?key|credential|auth.?token/i.test(finding.title)
  )
}

function isNetworkFinding(finding: Finding): boolean {
  return (
    finding.category === 'network' ||
    finding.category === 'external' ||
    finding.axis === 'security' &&
      /url|http|fetch|request|curl|wget|domain|external/i.test(finding.title)
  )
}

function extractDomainsFromFinding(finding: Finding): string[] {
  const domains: string[] = []
  const urlPattern = /https?:\/\/([a-zA-Z0-9.-]+)/g
  let match: RegExpExecArray | null

  if (finding.snippet) {
    while ((match = urlPattern.exec(finding.snippet)) !== null) {
      domains.push(match[1])
    }
  }

  if (finding.message) {
    while ((match = urlPattern.exec(finding.message)) !== null) {
      domains.push(match[1])
    }
  }

  return [...new Set(domains)]
}

export function evaluatePolicy(result: ValidationResult, policy: PolicyConfig): PolicyEvaluation {
  const violations: PolicyViolation[] = []

  for (const finding of result.findings) {
    if (policy.blockSecrets && isSecretFinding(finding)) {
      violations.push({
        findingId: finding.id,
        rule: 'block-secrets',
        message: `Secret/credential detected: ${finding.title}`,
        severity: finding.severity,
      })
    }

    if (policy.blockDestructiveCommands) {
      if (finding.snippet && isDestructiveCommand(finding.snippet)) {
        violations.push({
          findingId: finding.id,
          rule: 'block-destructive-commands',
          message: `Destructive command detected: ${finding.title}`,
          severity: finding.severity,
        })
      }
      if (isDestructiveCommand(finding.title)) {
        violations.push({
          findingId: finding.id,
          rule: 'block-destructive-commands',
          message: `Destructive command detected: ${finding.title}`,
          severity: finding.severity,
        })
      }
    }

    if (policy.blockedCommands.length > 0) {
      if (finding.snippet && matchesBlockedCommand(finding.snippet, policy.blockedCommands)) {
        violations.push({
          findingId: finding.id,
          rule: 'blocked-command',
          message: `Blocked command found: ${finding.title}`,
          severity: finding.severity,
        })
      }
    }

    if (policy.allowExternalDomains.length > 0 && isNetworkFinding(finding)) {
      const domains = extractDomainsFromFinding(finding)
      for (const domain of domains) {
        const isAllowed = policy.allowExternalDomains.some(
          (allowed) => domain === allowed || domain.endsWith('.' + allowed)
        )
        if (!isAllowed) {
          violations.push({
            findingId: finding.id,
            rule: 'external-domain',
            message: `External domain not in allowlist: ${domain}`,
            severity: finding.severity,
          })
        }
      }
    }
  }

  if (policy.requirePermissionManifest) {
    const hasManifest = result.findings.some(
      (f) =>
        f.category === 'permissions' ||
        f.axis === 'permissions' ||
        f.filePath?.toLowerCase().includes('permissions')
    )
    if (!hasManifest) {
      violations.push({
        findingId: 'permission-manifest',
        rule: 'require-permission-manifest',
        message: 'No permission manifest found in the skill',
        severity: 'high',
      })
    }
  }

  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  const failThreshold = severityOrder[policy.failOn] ?? 1
  const hasFailingViolation = violations.some(
    (v) => severityOrder[v.severity] <= failThreshold
  )

  const violationPenalty = violations.length * 5
  const adjustedScore = Math.max(0, result.overallScore - violationPenalty)

  const evaluation: PolicyEvaluation = {
    passed: !hasFailingViolation,
    violations,
    originalScore: result.overallScore,
    adjustedScore,
  }

  if (!evaluation.passed) {
    evaluation.failReason = `Policy violations found at '${policy.failOn}' severity or higher`
  }

  return evaluation
}
