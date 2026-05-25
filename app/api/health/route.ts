import { logger } from '@/lib/logger'

export async function GET() {
  let dbStatus: string

  try {
    const { client } = await import('@/lib/db')
    await client.execute('SELECT 1')
    dbStatus = 'ok'
  } catch (err) {
    logger.warn('Health check DB connection failed', { error: String(err) })
    dbStatus = 'error'
  }

  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0',
    dependencies: {
      database: dbStatus,
    },
  })
}
