export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type ThreatCategory =
  | 'prompt-injection'
  | 'command-injection'
  | 'data-exfiltration'
  | 'credential-harvesting'
  | 'obfuscation'
  | 'sensitive-file-access'
  | 'external-calls'
  | 'persistence'
  | 'social-engineering'
  | 'clickfix-attack'
  | 'staged-malware'
  | 'second-order-injection'

export interface Finding {
  id: string
  axis: string
  severity: Severity
  category: string
  title: string
  message: string
  filePath?: string
  lineNumber?: number
  column?: number
  snippet?: string
  recommendation?: string
  ruleId?: string
}

export interface ThreatPattern {
  id: string
  category: ThreatCategory
  severity: Severity
  name: string
  description: string
  detect: (content: string, filePath: string) => Finding | null
}

export type SecretType =
  | 'api-key'
  | 'aws-access-key'
  | 'aws-secret-key'
  | 'github-token'
  | 'jwt-token'
  | 'private-key'
  | 'database-url'
  | 'slack-token'
  | 'discord-token'
  | 'stripe-key'
  | 'openai-key'
  | 'anthropic-key'
  | 'generic-secret'
  | 'password'

export interface SecretFinding {
  type: SecretType
  value: string
  lineNumber: number
  column: number
  context: string
}

export interface ScanResult {
  findings: Finding[]
  score: number
  summary: string
}
