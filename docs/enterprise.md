# Enterprise Features

SkillShield includes a suite of enterprise-grade features for policy enforcement, audit compliance, and team collaboration.

---

## Policy Engine

The policy engine lets organizations enforce security baselines across all skills.

| Mode | Description |
|------|-------------|
| Default | Standard rules; balanced security and flexibility |
| Strict | All High and Critical findings block deployment |
| Enterprise | Strict mode + mandatory approval workflow + audit logging |
| Custom | Load your own `skillshield.policy.yml` with overrides |

```yaml
# skillshield.policy.yml
mode: enterprise
failOn: high
blockSecrets: true
blockDestructiveCommands: true
maxFileSizeMB: 2
maxFiles: 200
requireApprovalBelow: 70
```

---

## Approval Workflow

When a scan scores below the configured threshold (default 70), SkillShield auto-creates an approval request.

```json
// Approval record
{
  "scanId": "scan_abc123",
  "status": "pending",
  "requester": "ci-bot",
  "reviewer": null,
  "score": 65,
  "riskLevel": "high",
  "notes": "Awaiting security team review"
}
```

Reviewers can approve or reject via the web UI or API:

```bash
# Approve a deployment
curl -X POST /api/approvals \
  -d '{"scanId":"scan_abc123","action":"approve","reviewer":"admin","notes":"Looks safe"}'
```

---

## Audit Logging

All scan events, policy evaluations, approvals, and webhook deliveries are written to the audit log.

| Event | Description |
|-------|-------------|
| `scan.completed` | A scan finished and produced a score |
| `policy.violation` | A policy rule was violated |
| `approval.created` | An approval request was generated |
| `approval.resolved` | An approval was approved or rejected |
| `webhook.delivered` | A webhook payload was sent |
| `webhook.failed` | A webhook delivery failed |

Query audit logs via the API:

```bash
curl /api/audit?event=scan.completed&limit=50
```

---

## Webhooks

Webhooks are ready for Slack and Microsoft Teams integration.

```json
// Register a webhook
{
  "url": "https://hooks.slack.com/services/T00/B00/XXXX",
  "events": ["scan.completed", "approval.created"],
  "secret": "whs_xxxxxxxx"
}
```

Supported events:

- `scan.completed`
- `approval.created`
- `approval.resolved`
- `policy.violation`

---

## Permission Manifest System

Skills can declare required permissions in a `manifest.yml` file. SkillShield validates these declarations against the policy engine.

```yaml
# manifest.yml
permissions:
  - filesystem:read
  - network:outbound
  - env:access
scope: restricted
```

Undeclared permissions detected at scan time are flagged as policy violations.

---

## AI-Assisted Review

SkillShield can send findings to OpenAI or Anthropic for natural-language remediation guidance.

```bash
# Enable AI review
export OPENAI_API_KEY=sk-...
export AI_REVIEW_ENABLED=true
```

The AI review produces:

- Executive summary of findings
- Per-finding explanations
- Remediation steps

```json
// AI review response
{
  "executiveSummary": "This skill contains a high-risk external call...",
  "findingExplanations": [...],
  "remediationSteps": "Replace the dynamic import with a static, vetted dependency."
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Response headers include current quota status:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

---

## Persistent Storage

SkillShield supports both SQLite (default) and PostgreSQL for production deployments.

| Storage | Use Case |
|---------|----------|
| SQLite | Local development and small teams |
| PostgreSQL | Production and enterprise workloads |

Configure via environment variable:

```env
# SQLite (default)
DATABASE_URL=file:./data/skillshield.db

# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/skillshield
```

---

## Docker Deployment

Enterprise deployments can use the provided Docker Compose configuration:

```yaml
# docker-compose.yml
services:
  skillshield:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: skillshield
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: skillshield
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
    restart: unless-stopped

volumes:
  pgdata:
```

---

## Future Capabilities

The following enterprise features are planned or available as placeholders:

| Feature | Status | Description |
|---------|--------|-------------|
| SAML / SSO | Future | Single sign-on via SAML 2.0 and OIDC providers |
| RBAC | Future | Role-based access control for teams and namespaces |
| Runtime Sandbox | Future | Isolated execution environment for untrusted skills |

---

## Security Checklist for Enterprise Admins

- [ ] Enable HTTPS in production
- [ ] Use PostgreSQL with encrypted connections
- [ ] Set strong `DB_PASSWORD` and rotate regularly
- [ ] Configure rate limits appropriate to your load
- [ ] Enable audit logging and back up logs
- [ ] Restrict webhook URLs to internal or approved endpoints
- [ ] Review and customize the policy file quarterly
