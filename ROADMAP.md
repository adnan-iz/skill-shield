# Skill-Shield Roadmap

## Current Status
**All phases completed — v0.1.0 released**

---

## Phase 1: Foundation Hardening ✅ Completed
- Expanded test coverage (unit + integration) — all tests passing
- Set up CI/CD pipeline (GitHub Actions) — automated builds and checks
- Dockerized the application — production-ready container image
- Improved documentation (README, API docs, contributing guide)
- Established code quality gates (linting, type-checking, 80% coverage threshold)

## Phase 2: Core Engine Refactor ✅ Completed
- Extracted shared scanner logic into `@skillshield/core` package
- Defined clear public API boundaries between engine and consumers
- Reduced duplication between CLI and web scanner entry points
- Added plugin hooks for custom scan rules

## Phase 3: CLI + GitHub Action ✅ Completed
- Built Node.js CLI (`npx skill-shield scan`)
- Published CLI package to npm
- Created GitHub Action wrapping the CLI
- Supported CI/CD integration with exit codes and SARIF output

## Phase 4: Web Dashboard Upgrade ✅ Completed
- Redesigned scan results UI with filtering and diff views
- Added real-time scan progress via WebSocket/SSE
- Implemented team workspaces and shared scan history
- Added role-based access control (admin, member, viewer)

## Phase 5: Persistent Storage ✅ Completed
- Replaced in-memory scan storage with SQLite (dev) / PostgreSQL (prod)
- Adopted Drizzle ORM for type-safe queries
- Stored scan results, user preferences, and API keys persistently
- Implemented data retention (30 days default) and export features

## Phase 6: Policy Engine ✅ Completed
- Defined reusable scan policies (YAML/JSON)
- Implemented policy inheritance, overrides, and severity tuning
- Added policy-as-code validation in CI
- Built dry-run mode to preview policy impact

## Phase 7: Enterprise and Runtime Security ✅ Completed
- Added SSO/SAML authentication support
- Implemented comprehensive audit logging
- Built runtime agent for live dependency scanning
- Provided self-hosted deployment Helm charts
- Implemented usage billing and rate-limit tiers
