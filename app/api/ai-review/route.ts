import { reviewFindings, type AiProvider } from '@/lib/ai-review'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { serverError } from '@/lib/api-error'

export async function POST(request: Request) {
  const clientIp = (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) || 'unknown'
  const rl = await checkRateLimit(`ai-review:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const { findings, skillName, provider = 'openai' } = await request.json()

    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return addRateLimitHeaders(Response.json({ error: 'No findings to review' }, { status: 400 }), rl)
    }

    const apiKey = provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY

    if (!apiKey) {
      return addRateLimitHeaders(Response.json({
        error: 'AI review not configured',
        message: `Set ${provider === 'anthropic' ? 'ANTHROPIC' : 'OPENAI'}_API_KEY environment variable to enable AI review`,
      }, { status: 501 }), rl)
    }

    const config = { provider: provider as AiProvider, apiKey, redactSecrets: true }
    const result = await reviewFindings(findings, skillName || 'Untitled Skill', config)

    return addRateLimitHeaders(Response.json(result), rl)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'AI review failed')
  }
}
