import { NextRequest } from 'next/server'
import { runFullValidation } from '@/lib/validator/orchestrator'
import { saveResult } from '@/lib/store'
import { validateFiles, validatePayloadSize } from '@/lib/security/input-validation'
import { checkRateLimit } from '@/lib/security/rate-limit'
import type { SkillInput } from '@/lib/validator/types'

function ipFromRequest(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(request: NextRequest) {
  const clientIp = ipFromRequest(request)

  const rl = checkRateLimit(`validate:${clientIp}`, { maxRequests: 30, windowMs: 60_000 })
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    })
  }

  try {
    const raw = await request.text()

    const sizeError = validatePayloadSize(raw)
    if (sizeError) {
      return Response.json({ error: sizeError }, { status: 413 })
    }

    const body: SkillInput = JSON.parse(raw)

    const filesError = validateFiles(body.files)
    if (filesError) {
      return Response.json({ error: filesError }, { status: 400 })
    }

    const result = await runFullValidation(body)
    saveResult(result)

    return Response.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    return Response.json({ error: 'Validation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const { getResult } = await import('@/lib/store')
  const result = getResult(id)
  if (!result) {
    return Response.json({ error: 'Result not found' }, { status: 404 })
  }

  return Response.json(result)
}
