# SkillShield 🔱

**Pre-flight Validation & Security Scanning for Agent Skills**

## 🚀 Live App

👉 **Try SkillShield here:** [https://ai-skill-shield.vercel.app/](https://ai-skill-shield.vercel.app/)

SkillShield is available as a live web app where you can upload a `SKILL.md`, paste a GitHub URL, or scan a skill package before running it in production.

---

SkillShield is a comprehensive validation platform for the open Agent Skills ecosystem. It analyzes `SKILL.md`-based skill packages across **11 validation axes** — security, quality, structure, compatibility, installation risk, and more — before you run them in production.

[![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **🔍 11-Axis Validation** — Security (25%), Frontmatter (18%), Quality (12%), Structure (10%), Installation Risk (7%), Naming (5%), Tokens (5%), Compatibility (5%), Content (5%), Dependencies (3%), Best Practices (2%).
- **🛡️ 100+ Threat Patterns** — 12 categories including command injection, data exfiltration, credential harvesting, prompt injection, sensitive file access, persistence, social engineering, clickfix attacks, staged malware, second-order injection, and obfuscation (hex, base64, zero-width chars, homoglyphs, multi-layer encoding).
- **🔑 Secret Scanning** — 14 types of hardcoded secrets: OpenAI, Anthropic, AWS, GitHub, JWT, private keys, database URLs, Slack, Discord, Stripe, generic passwords, and API keys.
- **⚠️ Installation Risk Analysis** — Detects dangerous install scripts (curl pipe to shell, postinstall exploits), Dockerfile risks, system services, Windows scripts, registry tampering, and auto-install patterns.
- **📊 Weighted Scoring** — Overall score (0–100) + per-axis breakdown with risk classification (critical / high / medium / low / safe).
- **🤖 23 Agent Compatibility** — Detects which AI agents a skill targets: Claude Code, OpenCode, Cursor, GitHub Copilot, Windsurf, Codex CLI, Cline, Amp, Goose, Manus, Replit Agent, Aider, Mistral Vibe, OpenClaw, Zed AI, JetBrains AI, Trae, Antigravity, Gemini CLI, Kiro, Roo, Continue, Sourcegraph Cody.
- **🌐 Web UI** — Drag-and-drop upload, GitHub URL import, paste SKILL.md directly, interactive reports with score gauge, sortable findings table, and compatibility grid.
- **📦 Export Reports** — Download as JSON, HTML, or PDF.
- **⚙️ GitHub Action** — Validate skills in CI/CD pipelines with configurable fail thresholds.
- **📜 Validation History** — localStorage-persisted history with side-by-side comparison tool.
- **🔒 Rate Limiting & Input Validation** — Server-side rate limiting (30 req/min per IP), payload size checks, path traversal prevention, and input sanitization.

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
| `/` | Upload skills via drag-and-drop, GitHub URL, or paste SKILL.md directly |
| `/validate/[id]` | View detailed validation report with score, findings, and exports |
| `/history` | Browse and manage past validations |
| `/compare` | Side-by-side comparison of two skills |

### API

```bash
# Validate a skill from JSON input
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"name":"my-skill","files":[{"path":"SKILL.md","content":"# My Skill\n..."}]}'

# Retrieve stored validation result
curl http://localhost:3000/api/validate?id=<validation-id>

# Export report (json, html, pdf)
curl http://localhost:3000/api/report?id=<validation-id>&format=json
curl http://localhost:3000/api/report?id=<validation-id>&format=html
curl http://localhost:3000/api/report?id=<validation-id>&format=pdf

# Fetch a skill from GitHub
curl -X POST http://localhost:3000/api/github \
  -H "Content-Type: application/json" \
  -d '{"owner":"user","repo":"repo","path":"main/skills/my-skill"}'
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
          fail-on: high
          output-format: html
```

**Action inputs:**

| Input | Default | Description |
|-------|---------|-------------|
| `skill-path` | `./` | Path to the skill directory |
| `fail-on` | `high` | Minimum severity to fail the build (`critical`, `high`, `medium`, `low`, `none`) |
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
├── app/                        # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── validate/           # POST/GET /api/validate
│   │   ├── report/             # GET /api/report (JSON, HTML, PDF)
│   │   └── github/             # POST /api/github (GitHub fetch)
│   ├── validate/[id]/          # Individual validation report page
│   ├── history/                # Validation history list
│   └── compare/                # Side-by-side comparison
├── components/                 # React components
│   ├── report/                 # Score gauge, findings table, compatibility grid, export bar
│   └── upload/                 # Dropzone, URL input
├── lib/                        # Core business logic
│   ├── validator/              # 11-axis validation engine
│   ├── scanner/                # Security scanner (patterns, secrets, obfuscation)
│   ├── security/               # Input validation, rate limiting
│   ├── parser/                 # SKILL.md frontmatter & content parsing
│   ├── report/                 # Report generation (data, PDF/HTML)
│   ├── state.ts                # Client-side state (localStorage)
│   └── store.ts                # Server-side in-memory store
├── public/                     # Static assets & example skills
└── .github/actions/            # GitHub Action for CI/CD validation
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Markdown | `marked` |
| YAML | `yaml` with failsafe schema |
| Validation | `zod` |
| PDF | HTML-to-PDF via print-styled inline CSS |
| CI/CD | GitHub Actions (Node 20) |
| Font | Inter (next/font/google) |

---

## Validation Axes

| Axis | Key | Weight | Description |
|------|-----|--------|-------------|
| Security | `security` | 25% | 100+ threat patterns, 14 secret types, obfuscation detection |
| Frontmatter | `frontmatter` | 18% | Required (`name`, `description`) and recommended YAML fields |
| Quality | `quality` | 12% | Readability (Flesch score), completeness, clarity, examples, accessibility |
| Structure | `structure` | 10% | Directory depth (max 3), total size (max 10MB), binary file placement |
| Installation Risk | `installation` | 7% | Dangerous install scripts, Dockerfiles, system services, registry tampering |
| Naming | `naming` | 5% | Name length (1–64), lowercase + hyphens, reserved name check, directory match |
| Tokens | `tokens` | 5% | Token estimation (~4 chars/token), 5000 token limit, section analysis |
| Compatibility | `compatibility` | 5% | 23 agent detection patterns, MCP-compatible agent marking |
| Content | `content` | 5% | Non-empty content validation |
| Dependencies | `dependencies` | 3% | Detection of `require()` / `import` usage |
| Best Practices | `bestPractices` | 2% | Version and license presence |

---

## Scoring & Risk

| Score | Label | Risk Level | Criteria |
|-------|-------|------------|----------|
| 90–100 | Excellent | Safe | No findings above `low` severity |
| 80–89 | Good | Low | No findings above `medium` |
| 60–79 | Fair | Medium | Contains `medium` findings |
| 40–59 | Poor | High | Contains `high` findings |
| 0–39 | Very Poor | Critical | Contains `critical` findings |

Findings are also counted by severity: each finding contributes severity-specific deductions per-axis.

---

## Development

```bash
npm run dev      # Start dev server with hot reload (localhost:3000)
npm run build    # Production build with TypeScript check
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

[MIT](LICENSE)
