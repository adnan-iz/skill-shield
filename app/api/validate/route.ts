import { NextRequest } from 'next/server'
import { runFullValidation } from '@/lib/validator/orchestrator'
import { saveResult } from '@/lib/store'
import type { SkillInput } from '@/lib/validator/types'

export async function POST(request: NextRequest) {
  try {
    const body: SkillInput = await request.json()

    if (!body.files || body.files.length === 0) {
      return Response.json(
        { error: 'Provide at least one file to validate' },
        { status: 400 }
      )
    }

    const result = await runFullValidation(body)
    saveResult(result)

    return Response.json(result, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    return Response.json({ error: message }, { status: 500 })
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
