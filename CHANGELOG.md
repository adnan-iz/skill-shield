# Changelog

## [0.1.0] — 2026-05-26

### Added
- Initial release of SkillShield MVP
- 11-axis validation engine (security, frontmatter, quality, structure, installation, naming, tokens, compatibility, content, dependencies, best practices)
- Web UI with drag-and-drop upload, GitHub URL import, and paste input
- Security scanner with 72 threat patterns across 12 categories
- Secret detection for 14 secret types (OpenAI, AWS, GitHub, JWT, etc.)
- Obfuscation detection (base64, hex, zero-width, homoglyphs, etc.)
- Risk scoring (0-100) with severity levels
- SARIF 2.1.0 export for GitHub Code Scanning integration
- CLI tool (`skillshield scan`) with JSON/HTML/SARIF/Markdown output
- GitHub Action with fail-on severity thresholds
- Policy engine with configurable rules (YAML-based)
- Permission manifest system (detect undeclared capabilities)
- Semgrep-compatible rule engine (Level 4 scanner, 15 built-in rules)
- AI-assisted review (OpenAI/Anthropic integration)
- Webhook integration system (Slack/Teams ready)
- Audit logging with query API
- Approval workflow (auto-create for low scores, approve/reject)
- Dark mode support
- Persistent storage (Drizzle ORM + SQLite with retention)
- GitHub import with branch selection, SHA pinning, file filters
- Multi-format export (JSON, HTML, PDF, SARIF, CSV, Markdown)
- Docker support (multi-stage build + docker-compose)
- CI/CD pipeline (lint → typecheck → test → build)
- 70+ unit tests across 7 test suites
- Sample skills (safe, suspicious, malicious, false-positive)
- Rate limiting and input validation
- Dashboard with score gauge, axis assessment, and interactive findings table

### Architecture
- Monorepo structure with shared core package (`packages/core/`)
- Next.js 16 App Router with TypeScript strict mode
- Tailwind CSS v4 with custom design tokens
