import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, path } = await request.json()

    if (!owner || !repo) {
      return Response.json({ error: 'owner and repo are required' }, { status: 400 })
    }

    const branch = path ? path.split('/')[0] : 'main'

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: { 'User-Agent': 'skillshield/1.0' } }
    )

    if (treeRes.status === 404) {
      const altBranch = branch === 'main' ? 'master' : 'main'
      const altRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${altBranch}?recursive=1`,
        { headers: { 'User-Agent': 'skillshield/1.0' } }
      )
      if (!altRes.ok) {
        return Response.json({ error: `Branch not found. Tried '${branch}' and '${altBranch}'` }, { status: 404 })
      }
      const altData = await altRes.json()
      return await fetchFiles(owner, repo, altBranch, altData)
    }

    if (!treeRes.ok) {
      return Response.json({ error: `GitHub API error: ${treeRes.status}` }, { status: treeRes.status })
    }

    const data = await treeRes.json()
    return await fetchFiles(owner, repo, branch, data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch from GitHub'
    return Response.json({ error: message }, { status: 500 })
  }
}

async function fetchFiles(owner: string, repo: string, branch: string, treeData: any) {
  const blobs = (treeData.tree || []).filter((item: any) => item.type === 'blob')

  const textExtensions = new Set([
    '.md', '.json', '.yaml', '.yml', '.txt', '.ts', '.tsx', '.js', '.jsx',
    '.py', '.rb', '.go', '.rs', '.java', '.c', '.h', '.cpp', '.hpp',
    '.css', '.html', '.sh', '.bash', '.zsh', '.toml', '.ini', '.cfg',
    '.env', '.env.example', '.gitignore', '.dockerfile', '.sql',
  ])

  const files = await Promise.all(
    blobs.map(async (blob: any) => {
      const ext = '.' + blob.path.split('.').pop()?.toLowerCase()
      if (!textExtensions.has(ext)) return null

      try {
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${blob.path}`,
          { headers: { 'User-Agent': 'skillshield/1.0' } }
        )
        if (!rawRes.ok) return null
        return { path: blob.path, content: await rawRes.text() }
      } catch {
        return null
      }
    })
  )

  const validFiles = files.filter(Boolean)

  return Response.json({ files: validFiles, owner, repo, branch })
}
