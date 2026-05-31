# CLI Reference

## Installation

```bash
# Run directly with npx
npx skillshield-cli scan ./path/to/skill

# Or install globally
npm install -g skillshield-cli
skillshield scan ./path/to/skill
```

## Commands

### `scan`

Scan a skill directory for security issues.

```bash
skillshield scan <path> [options]
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `path` | Path to the skill directory containing SKILL.md |

**Options:**
| Option | Default | Description |
|--------|---------|-------------|
| `--format` | `json` | Output format: `json`, `html`, `sarif`, `markdown` |
| `--fail-on` | `high` | Exit code 1 if risk exceeds: `critical`, `high`, `medium`, `low` |
| `--output` | stdout | Write output to file instead of stdout |
| `--policy` | - | Path to `skillshield.policy.yml` |

**Examples:**

```bash
# Basic scan
skillshield scan ./my-skill

# JSON output
skillshield scan ./my-skill --format json

# HTML report
skillshield scan ./my-skill --format html --output report.html

# SARIF for GitHub Code Scanning
skillshield scan ./my-skill --format sarif --output results.sarif

# Fail on medium severity
skillshield scan ./my-skill --fail-on medium

# With custom policy
skillshield scan ./my-skill --policy ./skillshield.policy.yml
```

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Scan passed (no issues or all below threshold) |
| `1` | Scan failed (risk exceeds `--fail-on` threshold) |

## CI/CD Integration

```yaml
# GitHub Actions
- name: Scan skills
  run: npx skillshield-cli scan ./skills --fail-on high
```

## Policy File

```yaml
# skillshield.policy.yml
failOn: high
blockSecrets: true
blockDestructiveCommands: true
maxFileSizeMB: 2
maxFiles: 200
```
