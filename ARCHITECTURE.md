# SkillShield Architecture

## System Overview

SkillShield is a **full-stack Next.js 16 application** with a three-tier architecture: a React-based web frontend, RESTful API routes, and a modular validation engine. It also ships as a standalone GitHub Action for CI/CD integration.

```
┌─────────────────────────────────────────────────────────┐
│                     User / CI Pipeline                   │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
     Web Browser                    GitHub Actions
           │                              │
    ┌──────▼──────┐              ┌───────▼────────┐
    │  Next.js UI  │              │  Validate Skill │
    │  (React 19)  │              │  Action (Node) │
    └──────┬──────┘              └───────┬────────┘
           │                              │
    ┌──────▼─────────────────────────────▼────────┐
    │              Next.js API Routes              │
    │   POST /api/validate    GET /api/validate    │
    │   GET /api/report                            │
    └──────┬───────────────────────────────────────┘
           │
    ┌──────▼───────────────────────────────────────┐
    │            Validation Engine (lib/)           │
    │                                              │
    │  ┌──────────────┐  ┌─────────────────────┐   │
    │  │  Orchestrator │──▶ 10 Validation Axes │   │
    │  └──────────────┘  └─────────────────────┘   │
    │         │                                     │
    │    ┌────▼─────┐  ┌──────────┐  ┌──────────┐  │
    │    │ Security  │  │ Parser   │  │ Report   │  │
    │    │ Scanner   │  │          │  │ Generator│  │
    │    └───────────┘  └──────────┘  └──────────┘  │
    └────────────────────────────────────────────────┘
```

---

## Validation Pipeline

The core validation flow is orchestrated by `lib/validator/orchestrator.ts`:

```
SkillInput (JSON / File Upload / GitHub URL)
         │
         ▼
┌─────────────────────┐
│  1. Parse Input      │  lib/parser/
│  - Frontmatter (YAML)│    frontmatter.ts
│  - Content (Markdown)│    skill-parser.ts
│  - File Tree         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  2. Run Validators   │  Parallel execution
│                     │
│  ┌── Security ──────┤  lib/scanner/
│  │  ├─ Threat       │    patterns.ts (60+ regex)
│  │  │   Patterns    │    security.ts
│  │  ├─ Secrets      │    secrets.ts (14 types)
│  │  └─ Obfuscation  │    obfuscation.ts
│  ├── Frontmatter ───┤  lib/validator/frontmatter.ts
│  ├── Quality ───────┤  lib/validator/quality.ts
│  ├── Structure ─────┤  lib/validator/structure.ts
│  ├── Naming ────────┤  lib/validator/naming.ts
│  ├── Tokens ────────┤  lib/validator/tokens.ts
│  ├── Content ───────┤  lib/validator/content.ts
│  ├── Deps ──────────┤  lib/validator/dependencies.ts
│  ├── BestPractices ─┤  lib/validator/best-practices.ts
│  └── Compat ────────┤  lib/validator/compatibility.ts
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  3. Aggregate Scores │  Weighted average
│  - Per-axis scores   │  (Security: 30%, FM: 20%, 
│  - Overall score     │   Quality: 15%, Structure: 10%,
│  - Risk level        │   Naming/Tokens/Content: 5% ea.,
└─────────┬───────────┘   Deps: 3%, BestPrac: 2%)
          │
          ▼
┌─────────────────────┐
│  4. Generate Report  │  lib/report/ report-data.ts
│  - Findings          │
│  - Recommendations   │
│  - Export formats    │  PDF via lib/report/pdf.ts
└─────────┬───────────┘
          │
          ▼
    Store + Return
   (Map + localStorage)
```

---

## Security Scanner Architecture

The security scanner (`lib/scanner/`) performs three layers of analysis on every file in a skill package:

```
File Content
     │
     ▼
┌─────────────────────────────────────────────┐
│ Layer 1: Threat Pattern Matching            │
│                                             │
│  ├─ Command Injection (16 patterns)         │
│  │   exec(), spawn(), child_process,        │
│  │   rm -rf /, curl|sh, PowerShell cradle   │
│  │   DROP TABLE, diskpart, /dev/sda         │
│  │                                          │
│  ├─ Data Exfiltration (12 patterns)         │
│  │   curl/wget POST to remote, netcat,      │
│  │   FTP upload, DNS exfil, env→URL         │
│  │                                          │
│  ├─ Credential Harvesting (12 patterns)     │
│  │   SSH keys, AWS creds, GCloud, .env,     │
│  │   /etc/passwd, /etc/shadow, browser      │
│  │                                          │
│  └─ Prompt Injection (8 patterns)           │
│      "ignore previous instructions", DAN,   │
│      system prompt extraction, role-play    │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Layer 2: Hardcoded Secret Detection         │
│                                             │
│  ├─ OpenAI / Anthropic API keys             │
│  ├─ AWS Access Keys                         │
│  ├─ GitHub Tokens                           │
│  ├─ JWT Tokens                              │
│  ├─ Database URLs                           │
│  ├─ Slack / Discord / Stripe tokens         │
│  └─ Generic passwords                       │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Layer 3: Obfuscation Detection              │
│                                             │
│  ├─ Hexadecimal / Base64 encoding           │
│  ├─ Multi-layer encoding (hex→base64)       │
│  ├─ Zero-width Unicode characters           │
│  ├─ Homoglyph character substitution        │
│  ├─ String.fromCharCode() abuse             │
│  ├─ eval() with encoded input               │
│  └─ String reversal                         │
└─────────────────────────────────────────────┘
```

---

## Data Flow

### Upload → Validation → Report

```
User Action              Server                     Client
───────────              ──────                     ──────
Upload skill
  │
  ├─ Drag & drop ─────── ▶  api/validate POST
  │                        │
  ├─ GitHub URL ───────── ▶  Fetch SKILL.md
  │                        │
  ├─ File picker ──────── ▶  Parse & validate
  │                        │
  │                        ├─ Generate ID (uuid)
  │                        ├─ Store result (Map)
  │                        └─ Return JSON ──────── ▶  Render report page
  │                                                                
  │                                                  ┌──────────┐
  │                                                  │ Score    │
  │                                                  │ Gauge    │
  │                                                  ├──────────┤
  │                                                  │ Findings │
  │                                                  │ Table    │
  │                                                  ├──────────┤
  │                                                  │ Compat   │
  │                                                  │ Grid     │
  │                                                  ├──────────┤
  │                                                  │ Export   │
  │                                                  │ Buttons  │
  │                                                  └──────────┘
  │
  │  Export ─────────────────────────────────────── ▶  api/report?format=
  │                                                    pdf | html | json
  │
  └─ Save to history (localStorage)
```

---

## Component Architecture (Frontend)

```
layout.tsx (RootLayout)
├── Header / Nav
├── page.tsx (Home)
│   ├── StatsBar
│   ├── StepsSection
│   └── CTASection
├── validate/[id]/page.tsx (Report)
│   ├── ScoreGauge         (components/report/score-gauge.tsx)
│   ├── FindingsTable      (components/report/findings-table.tsx)
│   ├── CompatibilityGrid  (components/report/compatibility-grid.tsx)
│   │   └── ExportBar      (components/report/export-bar.tsx)
├── history/page.tsx
│   └── ValidationHistoryList
├── compare/page.tsx
│   ├── SkillInput A
│   └── SkillInput B
└── upload/
    ├── Dropzone           (components/upload/dropzone.tsx)
    └── URLInput           (components/upload/url-input.tsx)
```

---

## State Management

| Layer | Strategy | File |
|-------|----------|------|
| Server (in-memory) | `Map<string, ValidationResult>` | `lib/store.ts` |
| Client (persistent) | `localStorage` key `skillshield_history` | `lib/state.ts` |

Validation results are ephemeral on the server (in-memory Map) and persisted
client-side via localStorage for history and comparison features.

---

## API Reference

### `POST /api/validate`

Validate a skill from JSON payload.

**Request body:**
```json
{
  "name": "my-skill",
  "content": "# My Skill\n...",
  "files": { "SKILL.md": "...", "script.sh": "..." }
}
```

**Response:**
```json
{
  "id": "uuid",
  "score": 87,
  "riskLevel": "low",
  "findings": [...],
  "axes": { "security": { "score": 92, ... }, ... }
}
```

### `GET /api/validate?id=<id>`

Retrieve a previously validated result.

### `GET /api/report?id=<id>&format=json|html|pdf`

Export a validation report in the requested format.

---

## GitHub Action Architecture

```
.github/actions/validate-skill/
├── action.yml          # Action metadata + input/output schema
├── index.js            # Node.js 20 entry point
└── package.json        # Dependencies (minimal)
```

The action:
1. Reads the skill directory from the filesystem
2. Validates SKILL.md presence and frontmatter
3. Scans for dangerous patterns (subset of full engine)
4. Outputs `score`, `risk-level`, and `finding-count`
5. Optionally generates an HTML report artifact
6. Fails the pipeline if findings exceed the `fail-on` threshold

---

## Deployment

```
                   ┌──────────────┐
                   │  Vercel /    │
                   │  Docker /    │
                   │  Self-Host   │
                   └──────┬───────┘
                          │
              ┌───────────▼───────────┐
              │   Next.js Server      │
              │                       │
              │  API Routes   Pages   │
              │  (REST)       (SSR)   │
              └───────────────────────┘
```

- **Recommended**: Deploy on Vercel (zero-config for Next.js)
- **Alternative**: Docker container via `next start`
- **CI/CD**: GitHub Action runs in any Actions-enabled repository

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **In-memory store** (no DB) | Ephemeral validation results; persistence delegated to client. Simplifies deployment and keeps the focus on validation logic. |
| **10 parallel validators** | Each axis runs independently via `Promise.all()`. Easy to add, remove, or rebalance axes by editing one orchestrator file. |
| **Regex-based scanning** | Chosen over AST parsing for broad coverage across shell scripts, Python, JS, and markdown with minimal dependencies. |
| **Weighted scoring** | Security gets 30% weight because it's the primary value proposition. Quality and frontmatter follow as secondary concerns. |
| **localStorage history** | Zero server-side state for user history. The comparison feature reads directly from the client store. |
| **Standalone GitHub Action** | The action has its own minimal `index.js` rather than invoking the Next.js API, so it works without a running server. |
