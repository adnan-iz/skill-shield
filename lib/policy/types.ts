export type PolicyMode = 'default' | 'strict' | 'enterprise' | 'custom'

export interface SeverityOverride {
  ruleId?: string
  category?: string
  originalSeverity?: string
  overrideSeverity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  reason?: string
}

export interface PolicyConfig {
  mode: PolicyMode
  failOn: 'critical' | 'high' | 'medium' | 'low' | 'info'
  blockSecrets: boolean
  blockDestructiveCommands: boolean
  requirePermissionManifest: boolean
  allowExternalDomains: string[]
  blockedCommands: string[]
  maxFileSizeMB: number
  maxFiles: number
  severityOverrides?: SeverityOverride[]
  allowedFileExtensions?: string[]
  blockedFindings?: string[]
}
