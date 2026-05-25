import { readFile } from 'fs/promises'
import { parse as parseYaml } from 'yaml'
import type { PolicyConfig, PolicyMode, SeverityOverride } from './types'

const ALLOWED_MODES: PolicyMode[] = ['default', 'strict', 'enterprise', 'custom']
const ALLOWED_FAILON: PolicyConfig['failOn'][] = ['critical', 'high', 'medium', 'low', 'info']

const DEFAULT_POLICY: PolicyConfig = {
  mode: 'default',
  failOn: 'high',
  blockSecrets: true,
  blockDestructiveCommands: true,
  requirePermissionManifest: false,
  allowExternalDomains: [],
  blockedCommands: [],
  maxFileSizeMB: 10,
  maxFiles: 100,
  severityOverrides: [],
  allowedFileExtensions: [],
  blockedFindings: [],
}

const STRICT_POLICY: Partial<PolicyConfig> = {
  mode: 'strict',
  failOn: 'medium',
  blockSecrets: true,
  blockDestructiveCommands: true,
  requirePermissionManifest: true,
  blockedCommands: ['curl', 'wget', 'sudo', 'chmod', 'chown', 'rm -rf', 'eval'],
  maxFileSizeMB: 5,
  maxFiles: 50,
}

const ENTERPRISE_POLICY: Partial<PolicyConfig> = {
  mode: 'enterprise',
  failOn: 'low',
  blockSecrets: true,
  blockDestructiveCommands: true,
  requirePermissionManifest: true,
  blockedCommands: ['curl', 'wget', 'sudo', 'chmod', 'chown', 'rm -rf', 'eval', 'ssh', 'telnet', 'nc', 'nmap'],
  maxFileSizeMB: 3,
  maxFiles: 30,
}

function mergeWithDefaults(partial: Partial<PolicyConfig>): PolicyConfig {
  return { ...DEFAULT_POLICY, ...partial }
}

function getModeDefaults(mode: PolicyMode): Partial<PolicyConfig> {
  switch (mode) {
    case 'strict':
      return STRICT_POLICY
    case 'enterprise':
      return ENTERPRISE_POLICY
    default:
      return {}
  }
}

const ALLOWED_SEVERITIES: SeverityOverride['overrideSeverity'][] = ['critical', 'high', 'medium', 'low', 'info']

function validateConfig(config: Partial<PolicyConfig>): string[] {
  const errors: string[] = []

  if (config.mode && !ALLOWED_MODES.includes(config.mode)) {
    errors.push(`Invalid mode: ${config.mode}. Allowed: ${ALLOWED_MODES.join(', ')}`)
  }

  if (config.failOn && !ALLOWED_FAILON.includes(config.failOn)) {
    errors.push(`Invalid failOn: ${config.failOn}. Allowed: ${ALLOWED_FAILON.join(', ')}`)
  }

  if (config.maxFileSizeMB != null && config.maxFileSizeMB < 0) {
    errors.push('maxFileSizeMB must be non-negative')
  }

  if (config.maxFiles != null && config.maxFiles < 0) {
    errors.push('maxFiles must be non-negative')
  }

  if (config.severityOverrides) {
    if (!Array.isArray(config.severityOverrides)) {
      errors.push('severityOverrides must be an array')
    } else {
      for (let i = 0; i < config.severityOverrides.length; i++) {
        const o = config.severityOverrides[i]
        if (!o.ruleId && !o.category) {
          errors.push(`severityOverrides[${i}]: must specify ruleId or category`)
        }
        if (o.overrideSeverity && !ALLOWED_SEVERITIES.includes(o.overrideSeverity)) {
          errors.push(`severityOverrides[${i}]: invalid overrideSeverity "${o.overrideSeverity}"`)
        }
      }
    }
  }

  if (config.allowedFileExtensions != null && !Array.isArray(config.allowedFileExtensions)) {
    errors.push('allowedFileExtensions must be an array')
  }

  if (config.blockedFindings != null && !Array.isArray(config.blockedFindings)) {
    errors.push('blockedFindings must be an array')
  }

  return errors
}

export function parsePolicy(content: string): PolicyConfig {
  const parsed = parseYaml(content)

  if (!parsed || typeof parsed !== 'object') {
    return { ...DEFAULT_POLICY }
  }

  const partial = parsed as Partial<PolicyConfig>
  const errors = validateConfig(partial)

  if (errors.length > 0) {
    throw new Error(`Invalid policy configuration:\n${errors.join('\n')}`)
  }

  const mode = partial.mode || 'default'
  const modeDefaults = getModeDefaults(mode)
  const merged = mergeWithDefaults({ ...modeDefaults, ...partial })
  merged.mode = mode

  return merged
}

export async function loadPolicy(path: string): Promise<PolicyConfig> {
  const content = await readFile(path, 'utf-8')
  return parsePolicy(content)
}
