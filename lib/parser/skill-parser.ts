import { extractFrontmatter } from '@/lib/parser/frontmatter'
import type { FileTreeItem } from '@/lib/validator/types'

export interface ParsedSkill {
  frontmatter: Record<string, unknown>
  body: string
  raw: string
  isValid: boolean
  errors: string[]
}

export function parseSkillContent(content: string): ParsedSkill {
  const errors: string[] = []
  const frontmatterResult = extractFrontmatter(content)

  if (!frontmatterResult) {
    return {
      frontmatter: {},
      body: content,
      raw: content,
      isValid: false,
      errors: ['No valid frontmatter found: content must start with --- markers'],
    }
  }

  if (frontmatterResult.error) {
    errors.push(`Frontmatter parse error: ${frontmatterResult.error}`)
  }

  return {
    frontmatter: frontmatterResult.data,
    body: content.slice(frontmatterResult.bodyStart).trimStart(),
    raw: content,
    isValid: errors.length === 0,
    errors,
  }
}

function sanitizePath(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  const clean = parts.filter(p => p !== '..')
  if (clean.length !== parts.length) {
    return clean.join('/')
  }
  return normalized
}

export function buildFileTree(files: { path: string; content: string }[]): FileTreeItem[] {
  const root: FileTreeItem[] = []

  for (const file of files) {
    const normalizedPath = sanitizePath(file.path)
    const parts = normalizedPath.split('/').filter(Boolean)
    const segments: string[] = []

    for (let i = 0; i < parts.length; i++) {
      segments.push(parts[i])
      const segmentPath = segments.join('/')
      const isLeaf = i === parts.length - 1

      if (isLeaf) {
        root.push({
          path: segmentPath,
          type: 'file',
          size: file.content.length,
        })
      } else {
        let existing = findInTree(root, segmentPath)

        if (!existing) {
          existing = {
            path: segmentPath,
            type: 'directory',
            size: 0,
            children: [],
          }
          root.push(existing)
        } else if (!existing.children) {
          existing.children = []
        }
      }
    }
  }

  return mergeTree(root)
}

function findInTree(items: FileTreeItem[], path: string): FileTreeItem | undefined {
  for (const item of items) {
    if (item.path === path && item.type === 'directory') {
      return item
    }
    if (item.children) {
      return findInTree(item.children, path)
    }
  }
  return undefined
}

function mergeTree(items: FileTreeItem[]): FileTreeItem[] {
  const directoryMap = new Map<string, FileTreeItem>()

  for (const item of items) {
    if (item.type === 'directory') {
      const existing = directoryMap.get(item.path)
      if (existing && existing.children && item.children) {
        existing.children.push(...item.children)
      } else if (!existing) {
        directoryMap.set(item.path, item)
      }
    }
  }

  const result: FileTreeItem[] = []

  for (const item of items) {
    if (item.type === 'file') {
      const parentDir = item.path.includes('/')
        ? item.path.substring(0, item.path.lastIndexOf('/'))
        : ''

      if (parentDir) {
        const parent = directoryMap.get(parentDir)
        if (parent) {
          if (!parent.children) parent.children = []
          if (!parent.children.some((c) => c.path === item.path)) {
            parent.children.push(item)
          }
          continue
        }
      }
    }
    result.push(item)
  }

  for (const dir of directoryMap.values()) {
    if (dir.children) {
      dir.children = mergeTree(dir.children)
    }
  }

  for (const dir of directoryMap.values()) {
    if (!result.some((r) => r.path === dir.path)) {
      result.push(dir)
    }
  }

  return result.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.path.localeCompare(b.path)
  })
}
