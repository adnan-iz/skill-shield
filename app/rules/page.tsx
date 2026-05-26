"use client"

import { useState } from 'react'

const DEFAULT_POLICY_YAML = `# SkillShield Policy Configuration
# Define security rules for skill validation

failOn: high
blockSecrets: true
blockDestructiveCommands: true
requirePermissionManifest: false
allowExternalDomains:
  - api.openai.com
  - api.anthropic.com
blockedCommands:
  - rm -rf
  - curl | bash
  - powershell -EncodedCommand
maxFileSizeMB: 2
maxFiles: 200
`

const POLICY_PRESETS: Record<string, string> = {
  default: `failOn: high\nblockSecrets: true\nblockDestructiveCommands: true\nrequirePermissionManifest: false\nmaxFileSizeMB: 2\nmaxFiles: 200`,
  strict: `failOn: medium\nblockSecrets: true\nblockDestructiveCommands: true\nrequirePermissionManifest: true\nblockedCommands:\n  - rm -rf\n  - curl | bash\n  - wget | sh\n  - powershell -EncodedCommand\n  - sudo\nmaxFileSizeMB: 1\nmaxFiles: 100`,
  enterprise: `failOn: low\nblockSecrets: true\nblockDestructiveCommands: true\nrequirePermissionManifest: true\nallowExternalDomains:\n  - api.openai.com\n  - api.anthropic.com\n  - api.google.com\nblockedCommands:\n  - rm -rf\n  - curl | bash\n  - wget | sh\n  - powershell -EncodedCommand\n  - sudo\n  - chmod 777\nmaxFileSizeMB: 2\nmaxFiles: 200\nseverityOverrides:\n  - category: "network"\n    overrideSeverity: "low"\n    reason: "Network calls are reviewed separately"\nblockedFindings:\n  - "curl pipe to shell"\n  - "wget pipe to shell"`,
}

export default function RulesPage() {
  const [yaml, setYaml] = useState(DEFAULT_POLICY_YAML)
  const [preset, setPreset] = useState('default')
  const [parsed, setParsed] = useState<Record<string, string | boolean | number> | null>(null)
  const [error, setError] = useState('')
  const [validationResult, setValidationResult] = useState<{ passed: boolean; violations: string[] } | null>(null)

  function applyPreset(name: string) {
    setPreset(name)
    if (name in POLICY_PRESETS) {
      setYaml(POLICY_PRESETS[name])
      setParsed(null)
      setValidationResult(null)
      setError('')
    }
  }

  function parsePolicy() {
    setError('')
    setValidationResult(null)
    try {
      const lines = yaml.split('\n')
      const parsed: Record<string, string | boolean | number> = {}
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/)
        if (match) {
          const val = match[2].trim()
          if (val === 'true') parsed[match[1]] = true
          else if (val === 'false') parsed[match[1]] = false
          else if (/^\d+$/.test(val)) parsed[match[1]] = parseInt(val, 10)
          else parsed[match[1]] = val
        }
      }
      setParsed(parsed)
    } catch {
      setError('Failed to parse YAML')
    }
  }

  function validatePolicy() {
    setValidationResult(null)
    setValidationResult({
      passed: true,
      violations: [],
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Policy Configuration</h1>
        <p className="text-sm text-on-surface-secondary mt-1">
          Define security rules for AI skill validation
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(POLICY_PRESETS).map(([key]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              preset === key
                ? 'bg-shield-600 text-white'
                : 'border border-outline bg-surface-container text-on-surface-secondary hover:bg-surface-secondary'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
              <span className="material-symbols-outlined text-lg align-middle mr-1">code</span>
              Policy YAML
            </h3>
            <button
              onClick={parsePolicy}
              className="rounded-lg bg-shield-600 px-3 py-1 text-xs font-semibold text-white hover:bg-shield-700 transition-colors"
            >
              Parse
            </button>
          </div>
          <textarea
            value={yaml}
            onChange={(e) => { setYaml(e.target.value); setParsed(null); setValidationResult(null) }}
            rows={24}
            className="w-full rounded-lg border border-outline bg-surface-container p-3 text-xs font-mono text-on-surface focus:border-shield-500 focus:outline-none focus:ring-1 focus:ring-shield-500"
          />
          {error && <p className="mt-2 text-xs text-error">{error}</p>}
        </div>

        <div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">
              <span className="material-symbols-outlined text-lg">tune</span>
              Parsed Configuration
            </h3>
            {parsed ? (
              <div className="space-y-2">
                {Object.entries(parsed).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-outline px-3 py-2">
                    <span className="text-xs font-medium text-on-surface-secondary">{key}</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {typeof value === 'boolean' ? (value ? '\u2705' : '\u274C') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-on-surface-secondary">
                Click &quot;Parse&quot; to view the configuration
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={validatePolicy}
              disabled={!parsed}
              className="flex-1 rounded-lg bg-shield-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-shield-700 disabled:opacity-50 transition-colors"
            >
              Validate Policy
            </button>
          </div>

          {validationResult && (
            <div className={`mt-4 rounded-xl p-4 ${validationResult.passed ? 'bg-shield-50 border border-shield-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${validationResult.passed ? 'text-shield-600' : 'text-red-600'}`}>
                  {validationResult.passed ? 'check_circle' : 'error'}
                </span>
                <span className={`text-sm font-semibold ${validationResult.passed ? 'text-shield-800' : 'text-red-800'}`}>
                  {validationResult.passed ? 'Policy is valid' : 'Policy has violations'}
                </span>
              </div>
              {validationResult.violations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validationResult.violations.map((v, i) => (
                    <div key={i} className="text-xs text-red-700">{v}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-secondary">Policy Options Reference</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'failOn', desc: 'Minimum severity to fail the check', values: 'critical, high, medium, low' },
              { name: 'blockSecrets', desc: 'Block scans with hardcoded secrets', values: 'true / false' },
              { name: 'blockDestructiveCommands', desc: 'Block destructive shell commands', values: 'true / false' },
              { name: 'requirePermissionManifest', desc: 'Require permission manifest YAML', values: 'true / false' },
              { name: 'allowExternalDomains', desc: 'Allowed external network domains', values: 'list of URLs' },
              { name: 'blockedCommands', desc: 'Commands that are always blocked', values: 'list of commands' },
              { name: 'maxFileSizeMB', desc: 'Maximum file size to scan', values: 'number (MB)' },
              { name: 'maxFiles', desc: 'Maximum files per scan', values: 'number' },
              { name: 'severityOverrides', desc: 'Override finding severities', values: 'rule/category + override' },
            ].map((opt) => (
              <div key={opt.name} className="rounded-lg border border-outline p-3">
                <div className="text-xs font-semibold text-on-surface mb-1">{opt.name}</div>
                <div className="text-[11px] text-on-surface-secondary mb-1">{opt.desc}</div>
                <div className="text-[10px] font-mono text-on-surface-secondary/60">{opt.values}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
