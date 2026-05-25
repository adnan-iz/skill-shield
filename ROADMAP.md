# Skill-Shield Roadmap

## Current Status
**Phase 1: Foundation Hardening — In Progress**

---

## Phase 1: Foundation Hardening
- Expand test coverage (unit + integration)
- Set up CI/CD pipeline (GitHub Actions)
- Dockerize the application
- Improve documentation (README, API docs, contributing guide)
- Establish code quality gates (linting, type-checking)

## Phase 2: Core Engine Refactor
- Extract shared scanner logic into a standalone `@skill-shield/scanner` package
- Define clear public API boundaries
- Reduce duplication between CLI and web scanner entry points
- Add plugin hooks for custom scan rules

## Phase 3: CLI + GitHub Action
- Build a Node.js CLI (`npx skill-shield scan`)
- Publish CLI package to npm
- Create a GitHub Action wrapping the CLI
- Support CI/CD integration with exit codes and SARIF output

## Phase 4: Web Dashboard Upgrade
- Redesign scan results UI with filtering and diff views
- Add real-time scan progress (WebSocket or SSE)
- Team workspaces and shared scan history
- Role-based access control (admin, member, viewer)

## Phase 5: Persistent Storage
- Replace in-memory scan storage with SQLite (dev) / PostgreSQL (prod)
- Introduce Prisma ORM for type-safe queries
- Store scan results, user preferences, and API keys
- Data retention and export features

## Phase 6: Policy Engine
- Define reusable scan policies (YAML/JSON)
- Policy inheritance, overrides, and severity tuning
- Policy-as-code: validate policies in CI
- Dry-run mode to preview policy impact

## Phase 7: Enterprise and Runtime Security
- SSO/SAML authentication
- Audit logging
- Runtime agent for live dependency scanning
- Self-hosted deployment Helm charts
- Usage billing and rate-limit tiers
