export interface SarifResult {
  $schema: string
  version: string
  runs: SarifRun[]
}

export interface SarifRun {
  tool: SarifTool
  rules: SarifRule[]
  results: SarifResultItem[]
  invocations: SarifInvocation[]
  properties?: Record<string, unknown>
}

export interface SarifTool {
  driver: SarifDriver
}

export interface SarifDriver {
  name: string
  version: string
  informationUri?: string
}

export interface SarifRule {
  id: string
  name?: string
  shortDescription?: SarifMessage
  fullDescription?: SarifMessage
  helpUri?: string
  properties?: Record<string, unknown>
}

export interface SarifResultItem {
  ruleId: string
  message: SarifMessage
  level: 'error' | 'warning' | 'note'
  locations?: SarifLocation[]
  properties?: Record<string, unknown>
}

export interface SarifMessage {
  text: string
}

export interface SarifLocation {
  physicalLocation: SarifPhysicalLocation
}

export interface SarifPhysicalLocation {
  artifactLocation?: SarifArtifactLocation
  region?: SarifRegion
}

export interface SarifArtifactLocation {
  uri: string
}

export interface SarifRegion {
  startLine: number
  startColumn?: number
}

export interface SarifInvocation {
  executionSuccessful: boolean
  startTimeUtc?: string
  endTimeUtc?: string
  properties?: Record<string, unknown>
}
