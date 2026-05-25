# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please do **not** open a public issue. Instead, send a private report to **security@skill-shield.dev** (or open a GitHub Security Advisory via the "Report a vulnerability" link under the Security tab).

We aim to acknowledge receipt within 48 hours and provide a timeline for a fix within 7 days.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

Only the latest stable release receives security patches.

## Security Practices

- All dependencies are scanned with `npm audit` and Socket.dev on every CI run.
- SBOM generation is enabled for each release.
- Secrets and tokens are never logged; audit logs redact sensitive fields.
- Minimum required Node.js version is published in `engines` in `package.json`.

## Data Handling

- Scan results are stored in-memory by default and never persisted unless explicitly configured.
- When persistent storage is enabled (Phase 5), data is encrypted at rest.
- API keys and tokens are masked in all logs and error messages.
- User-uploaded files are analyzed in a sandboxed environment and deleted after scan completion.

## Rate Limiting

- Public API endpoints are rate-limited to **100 requests per minute** per IP.
- Authenticated users receive **1000 requests per minute** per token.
- File uploads are limited to **50 MB per file** and **10 files per scan**.
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are returned on all API responses.
