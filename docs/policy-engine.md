# Policy Engine

## Overview

The SkillShield policy engine allows organizations to define custom security rules for scanning AI agent skills. Policies are defined in YAML format and can be used with the web app, CLI, and GitHub Action.

## Policy Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `default` | Balanced security checks | General use |
| `strict` | Aggressive blocking | High-security environments |
| `enterprise` | Full security with overrides | Enterprise compliance |
| `custom` | User-defined rules | Advanced configuration |

## Policy YAML Schema

```yaml
# Minimum severity to fail (critical, high, medium, low)
failOn: high

# Block scans with hardcoded secrets
blockSecrets: true

# Block destructive shell commands
blockDestructiveCommands: true

# Require a permission manifest in the skill
requirePermissionManifest: false

# Allowed external network domains
allowExternalDomains:
  - api.openai.com
  - api.anthropic.com

# Commands that are always blocked
blockedCommands:
  - rm -rf
  - curl | bash
  - powershell -EncodedCommand

# Max file size in MB
maxFileSizeMB: 2

# Max files per scan
maxFiles: 200

# Severity overrides (override finding severity)
severityOverrides:
  - category: "network"
    overrideSeverity: "low"
    reason: "Network calls are reviewed externally"
  - ruleId: "SS-OBF-001"
    overrideSeverity: "info"

# Allowed file extensions
allowedFileExtensions:
  - .md
  - .json
  - .yaml

# Finding titles or ruleIds to always block
blockedFindings:
  - "rm -rf /"
  - "curl pipe to shell"
```

## Policy Examples

### Strict Mode

```yaml
failOn: medium
blockSecrets: true
blockDestructiveCommands: true
requirePermissionManifest: true
blockedCommands:
  - rm -rf
  - curl | bash
  - wget | sh
  - sudo
  - chmod 777
maxFileSizeMB: 1
maxFiles: 100
```

### Enterprise Mode

```yaml
failOn: low
blockSecrets: true
requirePermissionManifest: true
severityOverrides:
  - category: "network"
    overrideSeverity: "low"
allowedFileExtensions:
  - .md
  - .json
blockedFindings:
  - "curl pipe to shell"
```

## Integration

### CLI
```bash
skillshield scan ./skill --policy ./skillshield.policy.yml
```

### API
```json
POST /api/policy
{
  "findings": [...],
  "score": 72,
  "policy": { "failOn": "high", "blockSecrets": true }
}
```

## How It Works

1. Policy YAML is parsed into a `PolicyConfig` object
2. Findings are evaluated against each policy rule
3. Severity overrides are applied to matching findings
4. Score is recalculated with overrides
5. Violations are collected and returned
