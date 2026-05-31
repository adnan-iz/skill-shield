# GitHub Action

## Quick Start

Create `.github/workflows/skillshield.yml`:

```yaml
name: SkillShield Scan

on:
  pull_request:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan skills
        uses: ./github/actions/validate-skill
        with:
          skill-path: ./skills/my-skill
          fail-on: high
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `skill-path` | Yes | - | Path to the skill directory containing SKILL.md |
| `fail-on` | No | `high` | Minimum severity to fail: `critical`, `high`, `medium`, `low` |
| `output-format` | No | `json` | Report output format: `json`, `html` |

## Outputs

| Output | Description |
|--------|-------------|
| `score` | Overall validation score (0-100) |
| `risk-level` | Risk level: `safe`, `low`, `medium`, `high`, `critical` |
| `finding-count` | Total number of findings |

## GitHub Code Scanning (SARIF)

Upload results to GitHub Code Scanning:

```yaml
- name: Scan skills
  id: scan
  uses: ./github/actions/validate-skill
  with:
    skill-path: ./skills
    output-format: json

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

## PR Comments

The action outputs annotations that appear inline in PR diffs:

```
::error file=SKILL.md,line=24::Hardcoded API key detected
::warning file=script.sh,line=10::curl pipe to shell detected
```

## Advanced Configuration

```yaml
- name: Scan with strict policy
  uses: ./github/actions/validate-skill
  with:
    skill-path: ./skills
    fail-on: medium
    output-format: html
```
