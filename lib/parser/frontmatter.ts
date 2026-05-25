import { parse } from 'yaml'

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
    const parsed = parse(match[1].trim())
    frontmatter = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
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
    const parsed = parse(match[1].trim())
    data = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to parse frontmatter'
  }

  const bodyStart = match[0].length - match[2].length

  return { data, bodyStart, error }
}
