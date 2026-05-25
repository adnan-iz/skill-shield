import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, path } = await request.json()

    if (!owner || !repo) {
      return Response.json({ error: 'owner and repo are required' }, { status: 400 })
    }

    const branch = await resolveBranch(owner, repo, path)

    const treePath = path ? path.split('/').slice(1).join('/') : ''
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}${treePath ? ':' + treePath : ''}?recursive=1`
    const treeRes = await fetch(apiUrl, { headers: { 'User-Agent': 'skillshield/1.0' } })

    if (!treeRes.ok) {
      const msg = treeRes.status === 404
        ? `Path not found in branch '${branch}'`
        : `GitHub API error: ${treeRes.status}`
      return Response.json({ error: msg }, { status: treeRes.status })
    }

    const data = await treeRes.json()
    return await fetchFiles(owner, repo, branch, treePath || undefined, data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch from GitHub'
    return Response.json({ error: message }, { status: 500 })
  }
}

async function resolveBranch(owner: string, repo: string, path?: string): Promise<string> {
  if (path) return path.split('/')[0]

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { 'User-Agent': 'skillshield/1.0' },
  })
  if (repoRes.ok) {
    const repoData = await repoRes.json()
    return repoData.default_branch || 'main'
  }

  for (const candidate of ['main', 'master']) {
    const headRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${candidate}`,
      { headers: { 'User-Agent': 'skillshield/1.0' } }
    )
    if (headRes.ok) return candidate
  }

  return 'main'
}

async function fetchFiles(owner: string, repo: string, branch: string, treePath: string | undefined, treeData: any) {
  const blobs = (treeData.tree || []).filter((item: any) => item.type === 'blob')

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
    relevant.map(async (blob: any) => {
      const ext = '.' + blob.path.split('.').pop()?.toLowerCase()
      if (!textExtensions.has(ext) && !blob.path.endsWith('SKILL.md')) return null

      const rawRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${blob.path}`,
        { headers: { 'User-Agent': 'skillshield/1.0' } }
      )
      if (!rawRes.ok) return null
      return { path: blob.path, content: await rawRes.text() }
    })
  )

  const files = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  return Response.json({ files, owner, repo, branch, truncated: blobs.length > maxFiles })
}
