import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  code: string
  details?: string
}

export function apiError(message: string, status: number, code?: string, details?: string): NextResponse {
  return NextResponse.json(
    { error: message, code: code || 'ERROR', ...(details ? { details } : {}) } satisfies ApiError,
    { status }
  )
}

export function badRequest(message: string, details?: string): NextResponse {
  return apiError(message, 400, 'BAD_REQUEST', details)
}

export function notFound(message?: string): NextResponse {
  return apiError(message || 'Resource not found', 404, 'NOT_FOUND')
}

export function tooManyRequests(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
    }
  )
}

export function serverError(message?: string): NextResponse {
  return apiError(message || 'Internal server error', 500, 'INTERNAL_ERROR')
}
