import type { Finding, Severity } from '../scanner/types'

export interface SkillInput {
  name?: string
  files: SkillFile[]
  directoryName?: string
  source?: { type: 'github' | 'upload' | 'paste' | 'url'; url?: string }
}

export interface SkillFile {
  path: string
  content: string
}

export interface ValidationResult {
  id: string
  timestamp: string
  skillName: string
  overallScore: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe'
  summary: ValidationSummary
  axes: AxisResult[]
  findings: Finding[]
  compatibility: CompatibilityMatrix
  tokenAnalysis: TokenAnalysis
  skillPreview: SkillPreview
  source?: SkillInput['source']
}

export interface ValidationSummary {
  totalChecks: number
  passed: number
  warnings: number
  failed: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
}

export interface AxisResult {
  name: string
  key: string
  score: number
  status: 'pass' | 'warn' | 'fail'
  summary: string
  findings: Finding[]
}

export interface CompatibilityMatrix {
  agents: AgentCompatibility[]
  overallCompatibility: number
}

export interface AgentCompatibility {
  name: string
  id: string
  status: 'full' | 'partial' | 'unknown' | 'incompatible'
  notes?: string
}

export interface TokenAnalysis {
  totalTokens: number
  frontmatterTokens: number
  bodyTokens: number
  isUnderLimit: boolean
  limit: number
  breakdown: TokenBreakdownItem[]
}

export interface TokenBreakdownItem {
  section: string
  tokens: number
}

export interface SkillPreview {
  frontmatter: Record<string, unknown>
  body: string
  renderedHtml?: string
  fileTree: FileTreeItem[]
}

export interface FileTreeItem {
  path: string
  type: 'file' | 'directory'
  size: number
  children?: FileTreeItem[]
}

export type ValidationAxis =
  | 'frontmatter'
  | 'structure'
  | 'naming'
  | 'security'
  | 'quality'
  | 'content'
  | 'tokens'
  | 'compatibility'
  | 'dependencies'
  | 'installation'
  | 'bestPractices'
