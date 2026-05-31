# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker (optional, for containerized deployment)
- PostgreSQL or SQLite (SQLite used by default)

## Quick Start with Docker

```bash
# Clone and enter the project
git clone https://github.com/skill-shield/skill-shield.git
cd skill-shield

# Start with Docker Compose
docker compose up -d

# Open http://localhost:3000
```

## Manual Deployment

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `file:./data/skillshield.db` | SQLite/Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL for sharing links |
| `OPENAI_API_KEY` | No | - | Required for AI review (OpenAI) |
| `ANTHROPIC_API_KEY` | No | - | Required for AI review (Anthropic) |
| `GITHUB_TOKEN` | No | - | For private repo scanning |
| `AI_REVIEW_ENABLED` | No | `false` | Enable AI review feature |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Max file upload size |
| `MAX_FILES_PER_SCAN` | No | `200` | Max files per scan |
| `SCAN_RETENTION_DAYS` | No | `30` | Days to retain scan results |

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard.

## Self-Hosted Enterprise

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

## Database

By default, SkillShield uses SQLite (`data/skillshield.db`). For production:

```env
DATABASE_URL=postgresql://user:password@host:5432/skillshield
```

## Security

- Enable HTTPS in production
- Set strong `DB_PASSWORD` and use a secrets manager
- Configure rate limiting in environment
- Regular database backups
- Keep Node.js and dependencies updated
