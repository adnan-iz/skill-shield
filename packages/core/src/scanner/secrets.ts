import type { Finding } from './types'
import type { SecretType } from './types'

let secretFindingCounter = 0

interface SecretRule {
  type: SecretType
  pattern: RegExp
  severity: Finding['severity']
  name: string
  message: string
  recommendation: string
}

const secrets: SecretRule[] = [
  {
    type: 'openai-key',
    pattern: /(?:sk-[a-zA-Z0-9]{20,}|sk-[a-zA-Z0-9]{20,}T3BlbkFJ[a-zA-Z0-9]{20,})/g,
    severity: 'critical',
    name: 'OpenAI API Key',
    message: 'Hardcoded OpenAI API key detected. This grants access to OpenAI API with costs and potential abuse.',
    recommendation: 'Use environment variables for API keys. Never commit them to version control.',
  },
  {
    type: 'anthropic-key',
    pattern: /sk-ant-[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    name: 'Anthropic API Key',
    message: 'Hardcoded Anthropic API key detected. This could lead to unauthorized API usage.',
    recommendation: 'Store Anthropic API keys in environment variables or a secrets manager.',
  },
  {
    type: 'aws-access-key',
    pattern: /(?:AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16})/g,
    severity: 'critical',
    name: 'AWS Access Key ID',
    message: 'Hardcoded AWS Access Key ID detected. This compromises cloud infrastructure security.',
    recommendation: 'Use IAM roles with temporary credentials. Never hardcode access keys.',
  },
  {
    type: 'aws-secret-key',
    pattern: /(?:['"][0-9a-zA-Z\/+]{40}['"])/g,
    severity: 'critical',
    name: 'AWS Secret Access Key',
    message: 'Potential AWS Secret Access Key detected. Must be kept confidential.',
    recommendation: 'Use AWS IAM roles and temporary credentials instead of long-term access keys.',
  },
  {
    type: 'github-token',
    pattern: /(?:ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22,})/g,
    severity: 'critical',
    name: 'GitHub Token',
    message: 'Hardcoded GitHub token detected. This grants access to repositories and actions.',
    recommendation: 'Use GitHub Actions secrets or environment variables for tokens.',
  },
  {
    type: 'jwt-token',
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    severity: 'high',
    name: 'JWT Token',
    message: 'Hardcoded JWT token detected. Could grant authenticated access to services.',
    recommendation: 'Use short-lived tokens from environment variables. Never commit JWTs.',
  },
  {
    type: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    name: 'Private Key',
    message: 'Private key detected. This is a critical credential that grants access to systems.',
    recommendation: 'Remove private keys from code. Use SSH agent or keychain instead.',
  },
  {
    type: 'database-url',
    pattern: /(?:postgres(?:ql)?:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@|mysql:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@|mongodb(?:\+srv)?:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@|redis:\/\/:[a-zA-Z0-9]+@)/g,
    severity: 'critical',
    name: 'Database Connection URL',
    message: 'Hardcoded database connection string detected. Contains credentials for database access.',
    recommendation: 'Store database URLs in environment variables. Use connection pooling and secrets management.',
  },
  {
    type: 'slack-token',
    pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g,
    severity: 'critical',
    name: 'Slack Token',
    message: 'Hardcoded Slack API token detected. Grants access to Slack workspace.',
    recommendation: 'Use Slack app with granular permissions. Store tokens in environment variables.',
  },
  {
    type: 'discord-token',
    pattern: /[MN][A-Za-z\d]{23}\.[A-Za-z\d]{6}\.[A-Za-z\d_-]{27}/g,
    severity: 'critical',
    name: 'Discord Bot Token',
    message: 'Hardcoded Discord token detected. Grants access to Discord bot or user account.',
    recommendation: 'Store Discord tokens in environment variables. Never commit them.',
  },
  {
    type: 'stripe-key',
    pattern: /(?:sk_live_[0-9a-zA-Z]{24,}|pk_live_[0-9a-zA-Z]{24,}|rk_live_[0-9a-zA-Z]{24,})/g,
    severity: 'critical',
    name: 'Stripe API Key',
    message: 'Hardcoded Stripe (live) API key detected. This processes real payments.',
    recommendation: 'Use Stripe test keys in development. Store live keys in secrets manager.',
  },
  {
    type: 'api-key',
    pattern: /(?:['"`])(?:api[_-]?key|apikey|api_secret|api_secret_key|app_secret|app_key)[=:@"'\s]*([a-zA-Z0-9_\-]{16,64})['"`]/gi,
    severity: 'high',
    name: 'API Key',
    message: 'Potential hardcoded API key detected in variable assignment.',
    recommendation: 'Use environment variables for all API keys.',
  },
  {
    type: 'password',
    pattern: /(?:password|passwd|pwd|secret)\s*[=:]\s*['"`][^'"`\s]{6,}['"`]/gi,
    severity: 'critical',
    name: 'Password',
    message: 'Hardcoded password or secret detected.',
    recommendation: 'Use environment variables or vault services for passwords.',
  },
  {
    type: 'generic-secret',
    pattern: /(?:secret|token|credential)\s*[=:]\s*['"`][^'"`\s]{8,}['"`]/gi,
    severity: 'high',
    name: 'Generic Secret',
    message: 'Potential hardcoded secret or token detected.',
    recommendation: 'Store secrets in environment variables or a vault service.',
  },
]

function _getContextLines(content: string, lineNumber: number, radius: number = 1): string {
  const lines = content.split('\n')
  const start = Math.max(0, lineNumber - 1 - radius)
  const end = Math.min(lines.length, lineNumber + radius)
  return lines.slice(start, end).join('\n').slice(0, 150)
}

const IGNORE_EXTENSIONS = new Set([
  '.lock', '.sum', '.mod', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz',
])

export function scanForSecrets(content: string, filePath: string): Finding[] {
  const findings: Finding[] = []

  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.'))
  if (IGNORE_EXTENSIONS.has(ext)) return findings

  const fileKeyTerms = ['test', 'spec', '.md', 'readme', 'changelog', 'license']
  const shouldExclude = fileKeyTerms.some((term) => filePath.toLowerCase().includes(term))
  if (shouldExclude) {
    const extCheck = filePath.toLowerCase()
    if (extCheck.endsWith('.md') || extCheck.endsWith('.txt')) return findings
  }

  const lines = content.split('\n')

  for (const rule of secrets) {
    const matches = content.matchAll(rule.pattern)
    for (const match of matches) {
      if (typeof match.index !== 'number') continue

      const before = content.slice(0, match.index)
      const lineNumber = (before.match(/\n/g) || []).length + 1
      const lastNewline = before.lastIndexOf('\n')
      const column = match.index - lastNewline

      if (lineNumber < 1 || lineNumber > lines.length) continue
      const lineContent = lines[lineNumber - 1]

      const isExample = /example|sample|placeholder|changeme|your-|dummy|test|demo/i.test(lineContent)
      if (isExample) continue

      const isComment =
        lineContent.trim().startsWith('#') ||
        lineContent.trim().startsWith('//') ||
        lineContent.trim().startsWith('/*') ||
        lineContent.trim().startsWith('*')

      const start = Math.max(0, match.index - 30)
      const end = Math.min(content.length, match.index + match[0].length + 30)
      let snippet = content.slice(start, end)
      if (start > 0) snippet = '...' + snippet
      if (end < content.length) snippet = snippet + '...'

      if (rule.type === 'database-url' && isComment) continue

      findings.push({
        id: `secret-${++secretFindingCounter}`,
        axis: 'security',
        severity: rule.severity,
        category: 'secret-detection',
        title: rule.name,
        message: rule.message,
        filePath,
        lineNumber,
        column: column + 1,
        snippet,
        recommendation: rule.recommendation,
      })
    }
  }

  return findings
}
