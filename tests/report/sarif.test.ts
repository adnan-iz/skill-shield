import { describe, it, expect } from 'vitest'

interface SarifResult {
  ruleId: string
  level: string
  message: { text: string }
  locations: { physicalLocation: { artifactLocation: { uri: string }; region: { startLine: number } } }[]
}

interface SarifRun {
  tool: { driver: { name: string; version?: string } }
  results: SarifResult[]
}

interface SarifLog {
  version: string
  runs: SarifRun[]
}

function generateMinimalSarif(findings: { ruleId: string; level: string; message: string; file: string; line: number }[]): SarifLog {
  return {
    version: '2.1.0',
    runs: [
      {
        tool: { driver: { name: 'Skill-Shield', version: '0.1.0' } },
        results: findings.map(f => ({
          ruleId: f.ruleId,
          level: f.level,
          message: { text: f.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: f.file },
                region: { startLine: f.line },
              },
            },
          ],
        })),
      },
    ],
  }
}

describe('SARIF export', () => {
  it('produces valid output structure', () => {
    const sarif = generateMinimalSarif([
      { ruleId: 'CMD-001', level: 'error', message: 'test', file: 'test.sh', line: 1 },
    ])

    expect(sarif.version).toBe('2.1.0')
    expect(sarif.runs).toHaveLength(1)
    expect(sarif.runs[0].tool.driver.name).toBe('Skill-Shield')
    expect(sarif.runs[0].results).toHaveLength(1)
  })

  it('maps properties correctly', () => {
    const findings = [
      { ruleId: 'SEC-001', level: 'error', message: 'Hardcoded secret', file: '.env', line: 5 },
      { ruleId: 'CMD-003', level: 'warning', message: 'Dangerous command', file: 'deploy.sh', line: 10 },
    ]

    const sarif = generateMinimalSarif(findings)

    expect(sarif.runs[0].results).toHaveLength(2)

    const result = sarif.runs[0].results[0]
    expect(result.ruleId).toBe('SEC-001')
    expect(result.level).toBe('error')
    expect(result.message.text).toBe('Hardcoded secret')
    expect(result.locations[0].physicalLocation.artifactLocation.uri).toBe('.env')
    expect(result.locations[0].physicalLocation.region.startLine).toBe(5)
  })

  it('conforms to SARIF schema requirements', () => {
    const sarif = generateMinimalSarif([
      { ruleId: 'TEST-001', level: 'error', message: 'schema test', file: 'test.js', line: 1 },
    ])

    expect(sarif.version).toMatch(/^2\.\d+\.\d+$/)
    expect(sarif.runs[0].results[0].message).toHaveProperty('text')
    expect(sarif.runs[0].results[0].locations[0].physicalLocation).toHaveProperty('artifactLocation')
    expect(sarif.runs[0].results[0].locations[0].physicalLocation).toHaveProperty('region')
    expect(sarif.runs[0].results[0].locations[0].physicalLocation.region).toHaveProperty('startLine')
  })
})
