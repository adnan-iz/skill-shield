import { NextRequest } from 'next/server'
import { validateOwnerRepo } from '@/lib/security/input-validation'
import { checkRateLimit } from '@/lib/security/rate-limit'
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
    return tooManyRequests(rl.resetAt)
  }

  try {
    const { owner, repo, path } = await request.json()

    const validationError = validateOwnerRepo(owner, repo)
    if (validationError) {
      return badRequest(validationError)
    }

    const { branch, treePath } = await resolvePath(owner, repo, path || '')

    const apiUrl = `https://${GITHUB_API_HOST}/repos/${owner}/${repo}/git/trees/${branch}${treePath ? ':' + treePath : ''}?recursive=1`
    const treeRes = await fetchWithTimeout(apiUrl)

    if (!treeRes.ok) {
      return notFound('Skill path not found in repository')
    }

    const data = await treeRes.json()
    return await fetchFiles(owner, repo, branch, treePath, data)
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

async function fetchFiles(owner: string, repo: string, branch: string, treePath: string, treeData: { tree: GitHubTreeNode[] }) {
  const blobs = (treeData.tree || []).filter((item: GitHubTreeNode) => item.type === 'blob')

  const textExtensions = new Set([
    '.md', '.json', '.yaml', '.yml', '.txt', '.ts', '.tsx', '.js', '.jsx',
    '.py', '.rb', '.go', '.rs', '.java', '.c', '.h', '.cpp', '.hpp',
    '.css', '.html', '.sh', '.bash', '.zsh', '.toml', '.ini', '.cfg',
    '.env', '.env.example', '.gitignore', '.dockerfile', '.sql',
    '.xml', '.svg', '.proto', '.gradle', '.lock',
  ])

  const maxFiles = 200
  const relevant = blobs.slice(0, maxFiles)

  const results = await Promise.allSettled(
    relevant.map(async (blob: GitHubTreeNode) => {
      const ext = '.' + blob.path.split('.').pop()?.toLowerCase()
      if (!textExtensions.has(ext) && !blob.path.endsWith('SKILL.md')) return null

      const fullPath = treePath ? `${treePath}/${blob.path}` : blob.path
      const rawRes = await fetchWithTimeout(
        `https://${RAW_GITHUB_HOST}/${owner}/${repo}/${branch}/${fullPath}`,
        { headers: { 'User-Agent': 'skillshield/1.0' } }
      )
      if (!rawRes.ok) return null
      const text = await rawRes.text()
      if (text.length > 3 * 1024 * 1024) return null
      return { path: fullPath, content: text }
    })
  )

  const files = results
    .filter((r): r is PromiseFulfilledResult<{ path: string; content: string }> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  return Response.json({ files, owner, repo, branch, truncated: blobs.length > maxFiles })
}
