export type PolicyMode = 'default' | 'strict' | 'enterprise' | 'custom'

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
}
