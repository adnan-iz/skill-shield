import { describe, it, expect } from 'vitest'
import { evaluatePolicy } from '@/lib/policy/engine'
import type { PolicyConfig } from '@/lib/policy/types'
import type { ValidationResult, Finding } from '@/lib/validator/types'

function makeFinding(overrides: Partial<Finding> & { severity: Finding['severity'] }): Finding {
  return {
    id: overrides.id ?? 'f-001',
    axis: overrides.axis ?? 'security',
    severity: overrides.severity,
    category: overrides.category ?? 'general',
    title: overrides.title ?? 'test finding',
    message: overrides.message ?? 'test message',
    filePath: overrides.filePath,
    lineNumber: overrides.lineNumber,
    snippet: overrides.snippet,
    ruleId: overrides.ruleId,
  }
}

function makeResult(findings: Finding[], score = 85): ValidationResult {
  return {
    id: 'test-1',
    timestamp: new Date().toISOString(),
    skillName: 'test-skill',
    overallScore: score,
    riskLevel: 'medium',
    summary: {
      totalChecks: 10,
      passed: 8,
      warnings: 1,
      failed: 1,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 1,
      lowCount: 0,
      infoCount: 0,
    },
    axes: [],
    findings,
    compatibility: {
      agents: [],
      overallCompatibility: 1,
    },
    tokenAnalysis: {
      totalTokens: 100,
      frontmatterTokens: 10,
      bodyTokens: 90,
      isUnderLimit: true,
      limit: 8000,
      breakdown: [],
    },
    skillPreview: {
      frontmatter: {},
      body: '',
      fileTree: [],
    },
  }
}

const basePolicy: PolicyConfig = {
  mode: 'default',
  failOn: 'high',
  blockSecrets: false,
  blockDestructiveCommands: false,
  requirePermissionManifest: false,
  allowExternalDomains: [],
  blockedCommands: [],
  maxFileSizeMB: 10,
  maxFiles: 100,
  severityOverrides: [],
  allowedFileExtensions: [],
  blockedFindings: [],
}

describe('evaluatePolicy - severity overrides', () => {
  it('applies override by category', () => {
    const findings = [
      makeFinding({
        id: 'f-1',
        category: 'command-injection',
        severity: 'critical',
        title: 'shell injection',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      severityOverrides: [
        { category: 'command-injection', overrideSeverity: 'low', reason: 'external validation' },
      ],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    expect(evalResult.overridesApplied).toBe(1)
    expect(evalResult.originalScore).toBe(85)
  })

  it('applies override by ruleId', () => {
    const findings = [
      makeFinding({
        id: 'f-2',
        ruleId: 'SS-OBF-001',
        severity: 'high',
        title: 'obfuscated code',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      severityOverrides: [
        { ruleId: 'SS-OBF-001', overrideSeverity: 'info' },
      ],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    expect(evalResult.overridesApplied).toBe(1)
  })

  it('applies no override when no ruleId or category matches', () => {
    const findings = [
      makeFinding({
        id: 'f-3',
        severity: 'high',
        title: 'some issue',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      severityOverrides: [
        { ruleId: 'SS-SHELL-001', overrideSeverity: 'info' },
        { category: 'command-injection', overrideSeverity: 'low' },
      ],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    expect(evalResult.overridesApplied).toBe(0)
  })
})

describe('evaluatePolicy - requirePermissionManifest', () => {
  it('adds manifest_required violation when permission-violation findings exist', () => {
    const findings = [
      makeFinding({
        id: 'f-p1',
        category: 'permission-violation',
        severity: 'high',
        title: 'undeclared network access',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      requirePermissionManifest: true,
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const manifestViolations = evalResult.violations.filter(
      (v) => v.type === 'manifest_required'
    )
    expect(manifestViolations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not add violation when no permission-violation findings exist', () => {
    const findings = [
      makeFinding({
        id: 'f-p2',
        category: 'other',
        severity: 'low',
        title: 'minor issue',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      requirePermissionManifest: true,
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const manifestViolations = evalResult.violations.filter(
      (v) => v.type === 'manifest_required'
    )
    expect(manifestViolations.length).toBe(0)
  })

  it('does not add violation when requirePermissionManifest is false', () => {
    const findings = [
      makeFinding({
        id: 'f-p3',
        category: 'permission-violation',
        severity: 'medium',
        title: 'undeclared shell access',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      requirePermissionManifest: false,
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const manifestViolations = evalResult.violations.filter(
      (v) => v.type === 'manifest_required'
    )
    expect(manifestViolations.length).toBe(0)
  })
})

describe('evaluatePolicy - blockedFindings', () => {
  it('adds blocked_finding violation when title matches', () => {
    const findings = [
      makeFinding({
        id: 'f-b1',
        severity: 'high',
        title: 'rm -rf /',
        snippet: 'rm -rf /important',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      blockedFindings: ['rm -rf /', 'curl pipe to shell'],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const blockedViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_finding'
    )
    expect(blockedViolations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not add violation when no blocked findings match', () => {
    const findings = [
      makeFinding({
        id: 'f-b2',
        severity: 'low',
        title: 'safe operation',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      blockedFindings: ['rm -rf /', 'curl pipe to shell'],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const blockedViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_finding'
    )
    expect(blockedViolations.length).toBe(0)
  })
})

describe('evaluatePolicy - allowedFileExtensions', () => {
  it('adds blocked_extension violation for disallowed extensions', () => {
    const findings = [
      makeFinding({
        id: 'f-e1',
        severity: 'medium',
        title: '.exe file found',
        filePath: 'scripts/deploy.exe',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      allowedFileExtensions: ['.md', '.json', '.yaml'],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const extViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_extension'
    )
    expect(extViolations.length).toBeGreaterThanOrEqual(1)
  })

  it('does not add violation for allowed extensions', () => {
    const findings = [
      makeFinding({
        id: 'f-e2',
        severity: 'info',
        title: 'readme file',
        filePath: 'README.md',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      allowedFileExtensions: ['.md', '.json', '.yaml'],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const extViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_extension'
    )
    expect(extViolations.length).toBe(0)
  })

  it('does not add violation when allowedFileExtensions is empty', () => {
    const findings = [
      makeFinding({
        id: 'f-e3',
        severity: 'low',
        title: 'binary file',
        filePath: 'bin/ tool.exe',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      allowedFileExtensions: [],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const extViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_extension'
    )
    expect(extViolations.length).toBe(0)
  })

  it('does not crash when finding has no filePath', () => {
    const findings = [
      makeFinding({
        id: 'f-e4',
        severity: 'info',
        title: 'no file path',
      }),
    ]
    const policy: PolicyConfig = {
      ...basePolicy,
      allowedFileExtensions: ['.md'],
    }
    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const extViolations = evalResult.violations.filter(
      (v) => v.type === 'blocked_extension'
    )
    expect(extViolations.length).toBe(0)
  })
})

describe('evaluatePolicy - combined policy', () => {
  it('applies multiple rules simultaneously', () => {
    const findings = [
      makeFinding({
        id: 'f-c1',
        category: 'command-injection',
        severity: 'critical',
        title: 'shell injection via exec',
        snippet: 'exec("rm -rf /tmp")',
        filePath: 'scripts/deploy.exe',
        ruleId: 'SS-SHELL-001',
      }),
      makeFinding({
        id: 'f-c2',
        category: 'permission-violation',
        severity: 'high',
        title: 'undeclared network access',
      }),
      makeFinding({
        id: 'f-c3',
        severity: 'low',
        title: 'safe operation',
        filePath: 'README.md',
      }),
    ]

    const policy: PolicyConfig = {
      ...basePolicy,
      failOn: 'medium',
      blockSecrets: false,
      blockDestructiveCommands: true,
      requirePermissionManifest: true,
      severityOverrides: [
        { category: 'command-injection', overrideSeverity: 'low' },
      ],
      blockedFindings: ['rm -rf'],
      allowedFileExtensions: ['.md', '.json', '.yaml'],
    }

    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)

    const types = evalResult.violations.map((v) => v.type)
    expect(types).toContain('destructive_command_blocked')
    expect(types).toContain('manifest_required')
    expect(types).toContain('blocked_extension')
    expect(evalResult.overridesApplied).toBe(1)
    expect(evalResult.adjustedScore).toBeLessThan(evalResult.originalScore)
  })

  it('returns passed=true when no violations exceed failOn threshold', () => {
    const findings = [
      makeFinding({
        id: 'f-c4',
        severity: 'low',
        title: 'minor issue',
      }),
    ]

    const policy: PolicyConfig = {
      ...basePolicy,
      failOn: 'high',
    }

    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)
    expect(evalResult.passed).toBe(true)
    expect(evalResult.failReason).toBeNull()
  })

  it('returns passed=false when violation exceeds failOn threshold', () => {
    const findings = [
      makeFinding({
        id: 'f-c5',
        severity: 'critical',
        title: 'critical API key secret',
        axis: 'security',
        category: 'general',
      }),
    ]

    const policy: PolicyConfig = {
      ...basePolicy,
      failOn: 'high',
      blockSecrets: true,
    }

    const result = makeResult(findings)
    const evalResult = evaluatePolicy(result, policy)
    expect(evalResult.passed).toBe(false)
    expect(evalResult.failReason).not.toBeNull()
  })
})
