import { NextRequest } from 'next/server'
import { listWebhooks, registerWebhook, deleteWebhook } from '@/lib/webhooks'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { badRequest, serverError } from '@/lib/api-error'

function ipFromRequest(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function GET(request: NextRequest) {
  const clientIp = ipFromRequest(request)
  const rl = await checkRateLimit(`webhooks:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const hooks = await listWebhooks()
    return addRateLimitHeaders(Response.json(hooks), rl)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  const clientIp = ipFromRequest(request)
  const rl = await checkRateLimit(`webhooks:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const body = await request.json()
    const { url, events, secret } = body

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return addRateLimitHeaders(badRequest('url and events (non-empty array) are required'), rl)
    }

    await registerWebhook(url, events, secret)
    return addRateLimitHeaders(Response.json({ success: true }, { status: 201 }), rl)
  } catch {
    return serverError()
  }
}

export async function DELETE(request: NextRequest) {
  const clientIp = ipFromRequest(request)
  const rl = await checkRateLimit(`webhooks:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return addRateLimitHeaders(badRequest('Missing id query parameter'), rl)
    }

    await deleteWebhook(id)
    return addRateLimitHeaders(Response.json({ success: true }), rl)
  } catch {
    return serverError()
  }
}
