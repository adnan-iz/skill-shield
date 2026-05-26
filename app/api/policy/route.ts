import { NextRequest } from 'next/server'
import { evaluatePolicy } from '@/lib/policy/engine'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { badRequest, serverError } from '@/lib/api-error'
import type { PolicyConfig } from '@/lib/policy/types'
import type { Finding } from '@/lib/validator/types'

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = await checkRateLimit(`policy:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const body = await request.json()

    if (!body.findings || !Array.isArray(body.findings)) {
      return badRequest('Missing or invalid "findings" array')
    }
    if (typeof body.score !== 'number') {
      return badRequest('Missing or invalid "score" (must be a number)')
    }
    if (!body.policy || typeof body.policy !== 'object') {
      return badRequest('Missing or invalid "policy" configuration')
    }

    const result = {
      id: 'policy-eval',
      timestamp: new Date().toISOString(),
      skillName: 'policy-evaluation',
      overallScore: body.score,
      riskLevel: 'low' as const,
      summary: {
        totalChecks: 0, passed: 0, warnings: 0, failed: 0,
        criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, infoCount: 0,
      },
      axes: [],
      findings: body.findings as Finding[],
      compatibility: { agents: [], overallCompatibility: 0 },
      tokenAnalysis: { totalTokens: 0, frontmatterTokens: 0, bodyTokens: 0, isUnderLimit: true, limit: 0, breakdown: [] },
      skillPreview: { frontmatter: {}, body: '', fileTree: [] },
    }

    const evaluation = evaluatePolicy(result, body.policy as PolicyConfig)

    return addRateLimitHeaders(Response.json(evaluation, { status: 200 }), rl)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return badRequest('Invalid JSON')
    }
    return serverError()
  }
}
