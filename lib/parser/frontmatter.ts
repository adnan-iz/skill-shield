import { parse } from 'yaml'

function stripProto(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripProto)
  if (obj && typeof obj === 'object') {
    const clean: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
      clean[key] = stripProto(val)
    }
    return clean
  }
  return obj
}

export interface ParsedSkill {
  frontmatter: Record<string, unknown>
  body: string
  content: string
}

export function parseFrontmatter(content: string): ParsedSkill {
  const match = content.match(/^---\n([\s\S]*?)\n?^---\n?([\s\S]*)$/m)
  if (!match) {
    return { frontmatter: {}, body: content.trim(), content }
  }
  let frontmatter: Record<string, unknown> = {}
  try {
    const parsed = parse(match[1].trim(), { schema: 'failsafe' })
    frontmatter = parsed && typeof parsed === 'object' ? stripProto(parsed) as Record<string, unknown> : {}
  } catch {
    frontmatter = {}
  }
  const body = match[2] ? match[2].trim() : ''
  return { frontmatter, body, content }
}

export interface ExtractResult {
  data: Record<string, unknown>
  bodyStart: number
  error?: string
}

export function extractFrontmatter(content: string): ExtractResult | null {
  const match = content.match(/^---\n([\s\S]*?)\n?^---\n?([\s\S]*)$/m)
  if (!match) return null

  let data: Record<string, unknown> = {}
  let error: string | undefined
  try {
    const parsed = parse(match[1].trim(), { schema: 'failsafe' })
    data = parsed && typeof parsed === 'object' ? stripProto(parsed) as Record<string, unknown> : {}
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to parse frontmatter'
  }

  const bodyStart = match[0].length - match[2].length

  return { data, bodyStart, error }
}
