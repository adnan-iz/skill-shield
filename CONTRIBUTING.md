# Contributing to Skill-Shield

## How to Contribute

- Report bugs or suggest features via GitHub Issues.
- Discuss major changes in a GitHub Issue before opening a PR.
- Read the ROADMAP.md to align with project priorities.

## Development Setup

1. Clone the repository.
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Copy `.env.example` to `.env.local` and fill in required values.
4. Start the dev server:
   ```sh
   pnpm dev
   ```

## Pull Request Process

1. Fork the repo and create a feature branch from `main`.
2. Write or update tests for your changes.
3. Ensure all checks pass locally:
   ```sh
   pnpm typecheck
   pnpm lint
   pnpm test
   ```
4. Keep PRs focused — one feature or fix per PR.
5. Title must follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`).

## Code Style

- **Language**: TypeScript with strict mode enabled.
- **Formatting**: Prettier (default config).
- **Linting**: ESLint with `@typescript-eslint/recommended`.
- **Imports**: Use `import type` for type-only imports; group by external -> internal.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/classes, `kebab-case` for files.

## Testing Requirements

- All new features must include unit tests (Vitest).
- Integration tests are required for API endpoints and CLI commands.
- Run the full suite before pushing:
  ```sh
  pnpm test
  pnpm test:e2e   # if applicable
  ```
- Minimum coverage threshold: 80% (branches and lines).
