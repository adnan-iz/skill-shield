import { reviewFindings, type AiProvider } from '@/lib/ai-review'
import { serverError } from '@/lib/api-error'

export async function POST(request: Request) {
  try {
    const { findings, skillName, provider = 'openai' } = await request.json()

    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return Response.json({ error: 'No findings to review' }, { status: 400 })
    }

    const apiKey = provider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY

    if (!apiKey) {
      return Response.json({
        error: 'AI review not configured',
        message: `Set ${provider === 'anthropic' ? 'ANTHROPIC' : 'OPENAI'}_API_KEY environment variable to enable AI review`,
      }, { status: 501 })
    }

    const config = { provider: provider as AiProvider, apiKey, redactSecrets: true }
    const result = await reviewFindings(findings, skillName || 'Untitled Skill', config)

    return Response.json(result)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'AI review failed')
  }
}
