import { NextRequest } from 'next/server'
import { loadBuiltinRules } from '@/lib/semgrep'
import { stringify } from 'yaml'

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') || 'json'
  const rules = loadBuiltinRules()

  if (format === 'yaml') {
    const yaml = stringify({ rules })
    return new Response(yaml, {
      headers: { 'Content-Type': 'text/yaml' },
    })
  }

  return Response.json({ rules })
}
