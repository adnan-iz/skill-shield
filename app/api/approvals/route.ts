import { NextRequest } from 'next/server'
import { listApprovals, approveScan, rejectScan, getApprovalForScan } from '@/lib/approvals'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { badRequest, serverError } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = await checkRateLimit(`approvals:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const scanId = request.nextUrl.searchParams.get('scanId')
    if (scanId) {
      const approval = await getApprovalForScan(scanId)
      return addRateLimitHeaders(Response.json(approval ? [approval] : []), rl)
    }
    const status = request.nextUrl.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null
    const limit = request.nextUrl.searchParams.get('limit')
    const approvals = await listApprovals(status ?? undefined, limit ? parseInt(limit, 10) : undefined)
    return addRateLimitHeaders(Response.json(approvals), rl)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = await checkRateLimit(`approvals:${clientIp}`)
  if (!rl.allowed) {
    return addRateLimitHeaders(
      new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      rl
    )
  }

  try {
    const body = await request.json()
    const { scanId, action, reviewer, notes } = body

    if (!scanId || !action) {
      return badRequest('scanId and action are required')
    }
    if (action !== 'approve' && action !== 'reject') {
      return badRequest('action must be "approve" or "reject"')
    }

    if (action === 'approve') {
      await approveScan(scanId, reviewer, notes)
    } else {
      await rejectScan(scanId, reviewer, notes)
    }

    const approval = await getApprovalForScan(scanId)
    return addRateLimitHeaders(Response.json(approval, { status: 200 }), rl)
  } catch {
    return serverError()
  }
}
