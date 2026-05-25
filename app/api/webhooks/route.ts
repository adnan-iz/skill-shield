import { NextRequest } from 'next/server'
import { listWebhooks, registerWebhook, deleteWebhook } from '@/lib/webhooks'
import { badRequest, serverError } from '@/lib/api-error'

export async function GET() {
  try {
    const hooks = await listWebhooks()
    return Response.json(hooks)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, events, secret } = body

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return badRequest('url and events (non-empty array) are required')
    }

    await registerWebhook(url, events, secret)
    return Response.json({ success: true }, { status: 201 })
  } catch {
    return serverError()
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return badRequest('Missing id query parameter')
    }

    await deleteWebhook(id)
    return Response.json({ success: true })
  } catch {
    return serverError()
  }
}
