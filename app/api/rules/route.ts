import { NextRequest } from 'next/server'
import { ALL_PATTERNS } from '@/lib/scanner/patterns'
import { secrets } from '@/lib/scanner/secrets'
import { OBFUSCATION_CHECKS } from '@/lib/scanner/obfuscation'
import { loadBuiltinRules } from '@/lib/semgrep'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { tooManyRequests } from '@/lib/api-error'

function ipFromRequest(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function GET(request: NextRequest) {
  const clientIp = ipFromRequest(request)

  const rl = await checkRateLimit(`rules:${clientIp}`, { maxRequests: 30, windowMs: 60_000 })
  if (!rl.allowed) {
    return addRateLimitHeaders(tooManyRequests(rl.resetAt), rl)
  }

  const categoryMap = new Map<string, { category: string; count: number; examples: string[] }>()
  for (const p of ALL_PATTERNS) {
    const existing = categoryMap.get(p.category)
    if (existing) {
      existing.count++
      if (existing.examples.length < 3) {
        existing.examples.push(p.name)
      }
    } else {
      categoryMap.set(p.category, { category: p.category, count: 1, examples: [p.name] })
    }
  }
  const patterns = Array.from(categoryMap.values())

  const secretsData = secrets.map((s) => ({
    type: s.type,
    severity: s.severity,
    pattern: s.pattern.toString(),
  }))

  const semgrepRules = loadBuiltinRules().map((r) => ({
    id: r.id,
    severity: r.severity,
    description: r.message,
  }))

  return addRateLimitHeaders(
    Response.json({
      patterns,
      secrets: secretsData,
      obfuscation: OBFUSCATION_CHECKS,
      semgrep: semgrepRules,
    }),
    rl
  )
}
