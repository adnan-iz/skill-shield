import { describe, it, expect } from 'vitest'
import { parseSemgrepRules, runSemgrepScan, loadBuiltinRules } from '@/lib/semgrep'

const testYaml = `
rules:
  - id: test-rm-rf
    pattern-regex: rm\\s+-(?:rf|fr)\\s+/
    message: Dangerous rm -rf /
    severity: CRITICAL
    languages: [bash]
`

describe('semgrep parser', () => {
  it('parses valid YAML rules', () => {
    const rules = parseSemgrepRules(testYaml)
    expect(rules.length).toBe(1)
    expect(rules[0].id).toBe('test-rm-rf')
  })

  it('returns empty for invalid YAML', () => {
    const rules = parseSemgrepRules('not: { yaml: [')
    expect(rules.length).toBe(0)
  })
})

describe('semgrep matching', () => {
  it('detects rm -rf /', () => {
    const findings = runSemgrepScan('rm -rf /', 'script.sh')
    const matched = findings.filter(f => f.ruleId === 'SS-SHELL-001')
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('detects OpenAI API key', () => {
    const key = 'sk-' + 'a'.repeat(30)
    const findings = runSemgrepScan(`const key = "${key}"`, 'config.ts')
    const matched = findings.filter(f => f.ruleId === 'SS-SECRET-001')
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('detects eval with encoded input', () => {
    const findings = runSemgrepScan('eval(atob("c29tZSBjb2Rl"))', 'script.js')
    const matched = findings.filter(f => f.ruleId === 'SS-OBF-001')
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('safe content has no semgrep shell findings', () => {
    const content = 'console.log("hello world")'
    const findings = runSemgrepScan(content, 'app.ts')
    const shellFindings = findings.filter(f => f.ruleId?.startsWith('SS-SHELL'))
    expect(shellFindings.length).toBe(0)
  })

  it('detects private key', () => {
    const findings = runSemgrepScan('-----BEGIN PRIVATE KEY-----\nabc123\n-----END PRIVATE KEY-----', 'key.pem')
    const matched = findings.filter(f => f.ruleId === 'SS-SECRET-003')
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('detects child_process.exec', () => {
    const findings = runSemgrepScan('child_process.exec("rm -rf /")', 'app.js')
    const matched = findings.filter(f => f.ruleId === 'SS-EXEC-001')
    expect(matched.length).toBeGreaterThanOrEqual(1)
  })

  it('loads builtin rules', () => {
    const rules = loadBuiltinRules()
    expect(rules.length).toBeGreaterThanOrEqual(15)
  })

  it('pattern matching works', () => {
    const rules = parseSemgrepRules(`
rules:
  - id: test-eval
    pattern: eval(
    message: eval usage
    severity: HIGH
    languages: [javascript]
`)
    const findings = runSemgrepScan('eval("danger")', 'test.js', rules)
    expect(findings.length).toBe(1)
    expect(findings[0].ruleId).toBe('test-eval')
  })
})
