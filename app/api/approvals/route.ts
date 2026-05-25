import { NextRequest } from 'next/server'
import { listApprovals, approveScan, rejectScan, getApprovalForScan } from '@/lib/approvals'
import { badRequest, serverError } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const scanId = request.nextUrl.searchParams.get('scanId')
    if (scanId) {
      const approval = await getApprovalForScan(scanId)
      return Response.json(approval ? [approval] : [])
    }
    const status = request.nextUrl.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null
    const limit = request.nextUrl.searchParams.get('limit')
    const approvals = await listApprovals(status ?? undefined, limit ? parseInt(limit, 10) : undefined)
    return Response.json(approvals)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
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
    return Response.json(approval, { status: 200 })
  } catch {
    return serverError()
  }
}
