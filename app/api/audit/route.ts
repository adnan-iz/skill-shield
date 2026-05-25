import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { serverError } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const event = request.nextUrl.searchParams.get('event')
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 200)

    const conditions: ReturnType<typeof eq>[] = []
    if (event) {
      conditions.push(eq(auditLogs.event, event))
    }

    const logs = await db.select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)

    const parsed = logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }))

    return Response.json(parsed)
  } catch {
    return serverError()
  }
}
