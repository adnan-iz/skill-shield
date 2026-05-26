import { NextRequest } from 'next/server'
import { loadBuiltinRules } from '@/lib/semgrep'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { stringify } from 'yaml'

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = await checkRateLimit(`semgrep-rules:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  const format = request.nextUrl.searchParams.get('format') || 'json'
  const rules = loadBuiltinRules()

  if (format === 'yaml') {
    const yaml = stringify({ rules })
    return addRateLimitHeaders(new Response(yaml, {
      headers: { 'Content-Type': 'text/yaml' },
    }), rl)
  }

  return addRateLimitHeaders(Response.json({ rules }), rl)
}
