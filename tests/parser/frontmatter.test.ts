import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from '@/lib/parser/frontmatter'

describe('parseFrontmatter', () => {
  it('parses valid frontmatter with name, description, version', () => {
    const content = `---
name: test-skill
description: A test skill
version: 1.0.0
---
# Skill Body
Some content here`
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({
      name: 'test-skill',
      description: 'A test skill',
      version: '1.0.0',
    })
    expect(result.body).toBe('# Skill Body\nSome content here')
  })

  it('returns empty frontmatter when missing frontmatter delimiter', () => {
    const content = '# Just a skill\nNo frontmatter here'
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({})
    expect(result.body).toBe(content.trim())
  })

  it('returns empty frontmatter for empty frontmatter block', () => {
    const content = `---
---
Body content`
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({})
    expect(result.body).toBe('Body content')
  })

  it('returns empty frontmatter when only dashes present', () => {
    const content = `---
---
`
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({})
  })

  it('parses partial frontmatter with missing fields', () => {
    const content = `---
name: partial-skill
---
Only name provided`
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({ name: 'partial-skill' })
    expect(result.body).toBe('Only name provided')
  })

  it('handles frontmatter with no body', () => {
    const content = `---
name: no-body
---
`
    const result = parseFrontmatter(content)
    expect(result.frontmatter).toEqual({ name: 'no-body' })
    expect(result.body).toBe('')
  })
})
