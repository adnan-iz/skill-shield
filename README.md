# SkillShield 🔱

**Pre-flight Validation & Security Scanning for Agent Skills**

SkillShield is a comprehensive validation platform for the open Agent Skills ecosystem. It analyzes `SKILL.md`-based skill packages across 10 axes — security, quality, structure, compatibility, and more — before you run them in production.

[![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **🔍 10-Axis Validation** — Security (30%), Frontmatter (20%), Quality (15%), Structure (10%), Naming (5%), Tokens (5%), Content (5%), Dependencies (3%), Best Practices (2%), Compatibility.
- **🛡️ 60+ Threat Patterns** — Command injection, data exfiltration, credential harvesting, prompt injection, and obfuscation detection (hex, base64, zero-width chars, homoglyphs, multi-layer encoding).
- **🔑 Secret Scanning** — Hardcoded API keys (OpenAI, Anthropic, AWS, GitHub, Stripe, Slack, Discord), JWTs, database URLs, and private keys.
- **📊 Weighted Scoring** — Overall score + per-axis breakdown with severity classification (critical, high, medium, low, info).
- **🤖 23+ Agent Compatibility** — Detects which AI agents (Claude Code, Cursor, Windsurf, Copilot, etc.) a skill targets.
- **🌐 Web UI** — Drag-and-drop upload, GitHub URL import, interactive reports with score gauge, sortable findings table, and compatibility grid.
- **📦 Export Reports** — Download as JSON, HTML, or PDF.
- **⚙️ GitHub Action** — Validate skills in CI/CD pipelines with configurable fail thresholds.
- **📜 Validation History** — localStorage-persisted history with comparison tool.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/skill-shield.git
cd skill-shield

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the web UI.

---

## Usage

### Web UI

| Route | Description |
|-------|-------------|
| `/` | Upload skills via drag-and-drop, file picker, or GitHub URL |
| `/validate/[id]` | View detailed validation report with score, findings, and exports |
| `/history` | Browse and manage past validations |
| `/compare` | Side-by-side comparison of two skills |

### API

```bash
# Validate a skill from JSON input
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"name": "my-skill", "content": "# My Skill\n..."}'

# Retrieve stored validation result
curl http://localhost:3000/api/validate?id=<validation-id>

# Export report
curl http://localhost:3000/api/report?id=<validation-id>&format=json
curl http://localhost:3000/api/report?id=<validation-id>&format=html
curl http://localhost:3000/api/report?id=<validation-id>&format=pdf
```

### GitHub Action

```yaml
# .github/workflows/validate-skill.yml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/validate-skill
        with:
          skill-path: ./skills/my-skill
          fail-on: high       # fail pipeline if high+ severity found
          output-format: html
```

**Action inputs:**

| Input | Default | Description |
|-------|---------|-------------|
| `skill-path` | `./` | Path to the skill directory |
| `fail-on` | `critical` | Minimum severity to fail the build (`critical`, `high`, `medium`, `low`, `none`) |
| `output-format` | `json` | Report format (`json` or `html`) |

**Action outputs:**

| Output | Description |
|--------|-------------|
| `score` | Overall validation score (0–100) |
| `risk-level` | Risk classification (`safe`, `low`, `medium`, `high`, `critical`) |
| `finding-count` | Total number of findings |

---

## Project Structure

```
skill-shield/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── validate/       # POST/GET /api/validate
│   │   └── report/         # GET /api/report (JSON, HTML, PDF)
│   ├── validate/[id]/      # Individual validation report page
│   ├── history/            # Validation history list
│   └── compare/            # Side-by-side comparison
├── components/             # React components
│   ├── report/             # Score gauge, findings table, compatibility grid, export bar
│   └── upload/             # Dropzone, URL input
├── lib/                    # Core business logic
│   ├── validator/          # 10-axis validation engine
│   ├── scanner/            # Security scanner (patterns, secrets, obfuscation)
│   ├── parser/             # SKILL.md frontmatter & content parsing
│   ├── report/             # Report generation (data, PDF)
│   ├── state.ts            # Client-side state (localStorage)
│   └── store.ts            # Server-side in-memory store
├── public/                 # Static assets & example skills
└── .github/actions/        # GitHub Action for CI/CD validation
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Markdown | `marked` |
| YAML | `yaml` |
| Validation | `zod` |
| PDF | Custom HTML-to-PDF via puppeteer-style inline styles |
| CI/CD | GitHub Actions (Node 20) |

---

## Validation Axes

| Axis | Weight | Description |
|------|--------|-------------|
| Security | 30% | Threat pattern matching, secret detection, obfuscation analysis |
| Frontmatter | 20% | Required and recommended YAML field validation |
| Quality | 15% | Readability (Flesch score), completeness, clarity, examples, accessibility |
| Structure | 10% | Directory depth, file size, binary files, SKILL.md presence |
| Naming | 5% | Name length, character restrictions, reserved names, directory mismatch |
| Tokens | 5% | Token estimation and limit enforcement (4 chars ≈ 1 token, 5000 limit) |
| Content | 5% | Non-empty content validation |
| Dependencies | 3% | Detection of `require()` / `import` usage |
| Best Practices | 2% | Version and license presence |
| Compatibility | — | 23 agent detection patterns (informational, not scored) |

---

## Development

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

[MIT](LICENSE)
