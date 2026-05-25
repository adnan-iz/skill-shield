import type { ValidationResult, Finding, Severity } from '@/lib/validator/types'
import type { PolicyConfig, SeverityOverride } from './types'

export interface PolicyViolation {
  type: 'blocked_finding' | 'severity_override' | 'manifest_required' | 'blocked_extension' | 'secrets_blocked' | 'destructive_command_blocked'
  ruleId?: string
  message: string
  severity: Severity
}

export interface PolicyEvaluation {
  passed: boolean
  violations: PolicyViolation[]
  originalScore: number
  adjustedScore: number
  failReason: string | null
  overridesApplied: number
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

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

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

function applySeverityOverrides(findings: Finding[], overrides: SeverityOverride[]): Finding[] {
  if (!overrides || overrides.length === 0) return findings

  return findings.map((finding) => {
    for (const override of overrides) {
      const matchRule = override.ruleId && finding.ruleId === override.ruleId
      const matchCategory = override.category && finding.category === override.category
      if (matchRule || matchCategory) {
        return { ...finding, severity: override.overrideSeverity }
      }
    }
    return finding
  })
}

function getFileExtension(filePath: string | undefined): string | null {
  if (!filePath) return null
  const idx = filePath.lastIndexOf('.')
  if (idx === -1) return null
  return filePath.slice(idx).toLowerCase()
}

export function evaluatePolicy(result: ValidationResult, policy: PolicyConfig): PolicyEvaluation {
  const violations: PolicyViolation[] = []
  let overridesApplied = 0

  const effectiveFindings = applySeverityOverrides(result.findings, policy.severityOverrides || [])
  overridesApplied = effectiveFindings.filter(
    (f, i) => f.severity !== result.findings[i].severity
  ).length

  for (const finding of effectiveFindings) {
    const _originalFinding = result.findings.find((f) => f.id === finding.id)

    if (policy.blockSecrets && isSecretFinding(finding)) {
      violations.push({
        type: 'secrets_blocked',
        ruleId: finding.ruleId,
        message: `Secret/credential detected: ${finding.title}`,
        severity: finding.severity,
      })
    }

    if (policy.blockDestructiveCommands) {
      if (finding.snippet && isDestructiveCommand(finding.snippet)) {
        violations.push({
          type: 'destructive_command_blocked',
          ruleId: finding.ruleId,
          message: `Destructive command detected: ${finding.title}`,
          severity: finding.severity,
        })
      }
      if (isDestructiveCommand(finding.title)) {
        violations.push({
          type: 'destructive_command_blocked',
          ruleId: finding.ruleId,
          message: `Destructive command detected: ${finding.title}`,
          severity: finding.severity,
        })
      }
    }

    if (policy.blockedCommands.length > 0) {
      if (finding.snippet && matchesBlockedCommand(finding.snippet, policy.blockedCommands)) {
        violations.push({
          type: 'destructive_command_blocked',
          ruleId: finding.ruleId,
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
            type: 'blocked_finding',
            ruleId: finding.ruleId,
            message: `External domain not in allowlist: ${domain}`,
            severity: finding.severity,
          })
        }
      }
    }

    if (policy.blockedFindings && policy.blockedFindings.length > 0) {
      const blocked = policy.blockedFindings.some(
        (b) =>
          finding.title.toLowerCase().includes(b.toLowerCase()) ||
          (finding.ruleId && finding.ruleId.toLowerCase() === b.toLowerCase())
      )
      if (blocked) {
        violations.push({
          type: 'blocked_finding',
          ruleId: finding.ruleId,
          message: `Blocked finding matched: ${finding.title}`,
          severity: finding.severity,
        })
      }
    }

    if (policy.allowedFileExtensions && policy.allowedFileExtensions.length > 0) {
      const ext = getFileExtension(finding.filePath)
      if (ext && !policy.allowedFileExtensions.includes(ext)) {
        violations.push({
          type: 'blocked_extension',
          ruleId: finding.ruleId,
          message: `File extension not allowed: ${ext} (${finding.filePath})`,
          severity: finding.severity,
        })
      }
    }
  }

  if (policy.requirePermissionManifest) {
    const hasPermissionViolations = result.findings.some(
      (f) => f.category === 'permission-violation'
    )
    if (hasPermissionViolations) {
      violations.push({
        type: 'manifest_required',
        message: 'Permission manifest violations detected; a valid manifest is required',
        severity: 'high',
      })
    }
  }

  const failThreshold = SEVERITY_ORDER[policy.failOn] ?? 1
  const hasFailingViolation = violations.some(
    (v) => SEVERITY_ORDER[v.severity] <= failThreshold
  )

  const violationPenalty = violations.length * 5
  const adjustedScore = Math.max(0, result.overallScore - violationPenalty)

  const evaluation: PolicyEvaluation = {
    passed: !hasFailingViolation,
    violations,
    originalScore: result.overallScore,
    adjustedScore,
    failReason: hasFailingViolation
      ? `Policy violations found at '${policy.failOn}' severity or higher`
      : null,
    overridesApplied,
  }

  return evaluation
}
