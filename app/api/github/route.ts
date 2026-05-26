import { NextRequest } from 'next/server'
import { validateOwnerRepo, validateBranch, validateCommitSha } from '@/lib/security/input-validation'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { addRateLimitHeaders } from '@/lib/security/rate-limit-headers'
import { badRequest, tooManyRequests, notFound, serverError } from '@/lib/api-error'

interface GitHubTreeNode {
  path: string
  type: 'tree' | 'blob'
  sha?: string
  mode?: string
  size?: number
  url?: string
}

const GITHUB_API_HOST = 'api.github.com'
const RAW_GITHUB_HOST = 'raw.githubusercontent.com'
const FETCH_TIMEOUT = 15_000
const DEFAULT_IGNORE_PATHS = ['.git', 'node_modules', '.next', 'dist', 'build', 'vendor', 'coverage', '.cache', 'venv', '__pycache__']

function shouldIgnore(path: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some(pattern => {
    if (pattern.startsWith('*')) return path.endsWith(pattern.slice(1))
    if (pattern.endsWith('/')) return path.startsWith(pattern) || path.includes('/' + pattern)
    return path === pattern || path.startsWith(pattern + '/')
  })
}

function ipFromRequest(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(request: NextRequest) {
  const clientIp = ipFromRequest(request)

  const rl = await checkRateLimit(`github:${clientIp}`, { maxRequests: 30, windowMs: 60_000 })
  if (!rl.allowed) {
    return addRateLimitHeaders(tooManyRequests(rl.resetAt), rl)
  }

  try {
    const { owner, repo, path, branch, sha, includeExtensions, excludeExtensions, ignorePaths } = await request.json()

    const validationError = validateOwnerRepo(owner, repo)
    if (validationError) {
      return badRequest(validationError)
    }

    let resolvedBranch: string
    let treePath: string

    if (branch) {
      const branchError = validateBranch(branch)
      if (branchError) return badRequest(branchError)
      resolvedBranch = branch
      treePath = path || ''
    } else {
      const resolved = await resolvePath(owner, repo, path || '')
      resolvedBranch = resolved.branch
      treePath = resolved.treePath
    }

    if (sha) {
      const shaError = validateCommitSha(sha)
      if (shaError) return badRequest(shaError)
    }

    const treeRef = sha || resolvedBranch
    const apiUrl = `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/trees/${treeRef}${treePath ? ':' + treePath : ''}?recursive=1`
    const treeRes = await fetchWithTimeout(apiUrl)

    if (!treeRes.ok) {
      return notFound('Skill path not found in repository')
    }

    const data = await treeRes.json()
    return addRateLimitHeaders(await fetchFiles(owner, repo, resolvedBranch, treePath, data, { sha, includeExtensions, excludeExtensions, ignorePaths }), rl)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return serverError('Request timed out')
    }
    return serverError()
  }
}

async function resolvePath(owner: string, repo: string, path: string): Promise<{ branch: string; treePath: string }> {
  if (!path) {
    const branch = await getDefaultBranch(owner, repo)
    return { branch, treePath: '' }
  }

  const segments = path.split('/')
  const first = segments[0]
  const rest = segments.slice(1).join('/')

  if (rest) {
    const testUrl = `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/refs/heads/${first}`
    const testRes = await fetchWithTimeout(testUrl, { headers: { 'User-Agent': 'skillshield/1.0' } })
    if (testRes.ok) {
      return { branch: first, treePath: rest }
    }
    const defaultBranch = await getDefaultBranch(owner, repo)
    return { branch: defaultBranch, treePath: path }
  }

  const defaultBranch = await getDefaultBranch(owner, repo)

  const discovered = await findSkillDirectory(owner, repo, defaultBranch, first)
  if (discovered) {
    return { branch: defaultBranch, treePath: discovered }
  }

  const testUrl = `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/refs/heads/${first}`
  const testRes = await fetchWithTimeout(testUrl, { headers: { 'User-Agent': 'skillshield/1.0' } })
  if (testRes.ok) {
    return { branch: first, treePath: '' }
  }

  return { branch: defaultBranch, treePath: first }
}

async function findSkillDirectory(owner: string, repo: string, branch: string, skillName: string): Promise<string | null> {
  const rootRes = await fetchWithTimeout(
    `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: { 'User-Agent': 'skillshield/1.0' } }
  )
  if (!rootRes.ok) return null

  const root = await rootRes.json()
  const items = root.tree || []

  const matches = items.filter((item: GitHubTreeNode) =>
    item.type === 'tree' &&
    (item.path === skillName || item.path.endsWith(`/${skillName}`)) &&
    items.some((i: GitHubTreeNode) => i.path === `${item.path}/SKILL.md`)
  )

  if (matches.length === 0) return null

  matches.sort((a: GitHubTreeNode, b: GitHubTreeNode) => a.path.split('/').length - b.path.split('/').length)

  return matches[0].path
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const repoRes = await fetchWithTimeout(`https://${GITHUB_API_HOST}/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skillshield/1.0' },
  })
  if (repoRes.ok) {
    const repoData = await repoRes.json()
    return repoData.default_branch || 'main'
  }

  for (const candidate of ['main', 'master']) {
    const headRes = await fetchWithTimeout(
      `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/refs/heads/${candidate}`,
      { headers: { 'User-Agent': 'skillshield/1.0' } }
    )
    if (headRes.ok) return candidate
  }

  return 'main'
}

async function fetchFiles(
  owner: string,
  repo: string,
  branch: string,
  treePath: string,
  treeData: { tree: GitHubTreeNode[] },
  options?: {
    sha?: string
    includeExtensions?: string[]
    excludeExtensions?: string[]
    ignorePaths?: string[]
  }
) {
  const { sha, includeExtensions, excludeExtensions, ignorePaths = DEFAULT_IGNORE_PATHS } = options || {}

  const textExtensions = new Set([
    '.md', '.json', '.yaml', '.yml', '.txt', '.ts', '.tsx', '.js', '.jsx',
    '.py', '.rb', '.go', '.rs', '.java', '.c', '.h', '.cpp', '.hpp',
    '.css', '.html', '.sh', '.bash', '.zsh', '.toml', '.ini', '.cfg',
    '.env', '.env.example', '.gitignore', '.dockerfile', '.sql',
    '.xml', '.svg', '.proto', '.gradle', '.lock',
  ])

  let extensions = textExtensions
  if (includeExtensions && includeExtensions.length > 0) {
    extensions = new Set(includeExtensions.map(e => e.startsWith('.') ? e.toLowerCase() : '.' + e.toLowerCase()))
  }
  if (excludeExtensions && excludeExtensions.length > 0) {
    const excluded = new Set(excludeExtensions.map(e => e.startsWith('.') ? e.toLowerCase() : '.' + e.toLowerCase()))
    extensions = new Set([...extensions].filter(e => !excluded.has(e)))
  }

  const blobs = (treeData.tree || []).filter((item: GitHubTreeNode) => item.type === 'blob')
  const filtered = blobs.filter(item => !shouldIgnore(item.path, ignorePaths))

  const maxFiles = 200
  const MAX_TOTAL_SIZE = 10 * 1024 * 1024
  const ref = sha || branch

  const relevant = filtered.slice(0, maxFiles)

  const results = await Promise.allSettled(
    relevant.map(async (blob: GitHubTreeNode) => {
      const ext = '.' + blob.path.split('.').pop()?.toLowerCase()
      if (!extensions.has(ext) && !blob.path.endsWith('SKILL.md')) return null

      const fullPath = treePath ? `${treePath}/${blob.path}` : blob.path
      const rawRes = await fetchWithTimeout(
        `https://${RAW_GITHUB_HOST}/${owner}/${repo}/${ref}/${fullPath}`,
        { headers: { 'User-Agent': 'skillshield/1.0' } }
      )
      if (!rawRes.ok) return null
      const text = await rawRes.text()
      if (text.length > 3 * 1024 * 1024) return null
      return { path: fullPath, content: text }
    })
  )

  let totalSize = 0
  let sizeTruncated = false

  const files = results
    .filter((r): r is PromiseFulfilledResult<{ path: string; content: string }> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
    .filter(file => {
      if (totalSize + file.content.length > MAX_TOTAL_SIZE) {
        sizeTruncated = true
        return false
      }
      totalSize += file.content.length
      return true
    })

  const truncated = blobs.length > maxFiles || sizeTruncated
  const response: Record<string, unknown> = { files, owner, repo, branch, truncated }
  if (sizeTruncated) {
    response.warning = 'Response truncated: total content exceeded 10MB limit'
  }

  return Response.json(response)
}
