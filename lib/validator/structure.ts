import { AxisResult, Finding, SkillFile } from '@/lib/validator/types'

export interface StructureValidationOptions {
  requireScriptsDir?: boolean
  requireReferencesDir?: boolean
}

const MAX_DEPTH = 3
const MAX_TOTAL_SIZE = 10 * 1024 * 1024

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.mp3', '.mp4', '.avi', '.mov', '.wav', '.ogg',
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  '.pyc', '.class', '.o', '.obj', '.lib',
  '.DS_Store', '.gitkeep', '.gitignore',
])

let findingCounter = 0

function makeId(): string {
  return `st-${Date.now()}-${++findingCounter}`
}

function getDepth(filePath: string): number {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  return parts.length - 1
}

function isBinaryByExtension(filePath: string): boolean {
  const ext = filePath.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  return BINARY_EXTENSIONS.has(ext)
}

export function validateStructure(
  files: SkillFile[],
  options?: StructureValidationOptions
): AxisResult {
  const findings: Finding[] = []
  const filePaths = files.map(f => f.path.replace(/\\/g, '/'))
  const dirs = new Set<string>()

  for (const fp of filePaths) {
    const parts = fp.split('/')
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join('/'))
    }
  }

  if (!filePaths.some(fp => fp === 'SKILL.md' || fp.endsWith('/SKILL.md'))) {
    findings.push({
      id: makeId(),
      axis: 'structure',
      severity: 'critical',
      category: 'structure',
      title: 'Missing SKILL.md',
      message: 'The skill directory must contain a SKILL.md file',
      filePath: '',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Create a SKILL.md file at the root of the skill directory following the Agent Skills specification',
      ruleId: 'structure-missing-skillmd',
    })
  }

  for (const dir of dirs) {
    const hasFiles = filePaths.some(fp => fp.startsWith(dir + '/'))
    if (!hasFiles) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'low',
        category: 'structure',
        title: 'Empty directory',
        message: `Directory "${dir}" is empty`,
        filePath: dir,
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: `Remove the empty directory "${dir}" or add files to it`,
        ruleId: 'structure-empty-dir',
      })
    }
  }

  const hasScriptsDir = Array.from(dirs).some(d => d === 'scripts')
  if (hasScriptsDir) {
    const scriptFiles = files.filter(f => f.path.replace(/\\/g, '/').startsWith('scripts/'))
    if (scriptFiles.length === 0) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'medium',
        category: 'structure',
        title: 'Scripts directory without executable files',
        message: 'The scripts/ directory exists but contains no files',
        filePath: 'scripts/',
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: 'Add executable scripts to the scripts/ directory or remove it',
        ruleId: 'structure-empty-scripts',
      })
    }
    if (options?.requireScriptsDir && scriptFiles.length === 0) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'high',
        category: 'structure',
        title: 'Required scripts directory missing files',
        message: 'A scripts/ directory is required but contains no files',
        filePath: 'scripts/',
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: 'Add executable files to the scripts/ directory',
        ruleId: 'structure-required-scripts',
      })
    }
  } else if (options?.requireScriptsDir) {
    findings.push({
      id: makeId(),
      axis: 'structure',
      severity: 'high',
      category: 'structure',
      title: 'Missing required scripts directory',
      message: 'A scripts/ directory is required but does not exist',
      filePath: '',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Create a scripts/ directory with executable files',
      ruleId: 'structure-required-scripts-missing',
    })
  }

  const hasReferencesDir = Array.from(dirs).some(d => d === 'references')
  if (hasReferencesDir) {
    const refFiles = files.filter(f => f.path.replace(/\\/g, '/').startsWith('references/'))
    const hasDocs = refFiles.some(f => {
      const ext = f.path.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
      return ['.md', '.txt', '.pdf', '.html', '.htm'].includes(ext)
    })
    if (!hasDocs) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'info',
        category: 'structure',
        title: 'References directory without documentation',
        message: 'The references/ directory contains no documentation files (.md, .txt, .pdf, .html)',
        filePath: 'references/',
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: 'Add documentation files (.md, .txt, etc.) to the references/ directory',
        ruleId: 'structure-refs-no-docs',
      })
    }
  } else if (options?.requireReferencesDir) {
    findings.push({
      id: makeId(),
      axis: 'structure',
      severity: 'high',
      category: 'structure',
      title: 'Missing required references directory',
      message: 'A references/ directory is required but does not exist',
      filePath: '',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Create a references/ directory with documentation files',
      ruleId: 'structure-required-refs-missing',
    })
  }

  for (const fp of filePaths) {
    const depth = getDepth(fp)
    if (depth > MAX_DEPTH) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'low',
        category: 'structure',
        title: 'Deeply nested file',
        message: `File "${fp}" is ${depth} levels deep (max allowed: ${MAX_DEPTH})`,
        filePath: fp,
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: `Move "${fp}" to a shallower directory (max ${MAX_DEPTH} levels deep)`,
        ruleId: 'structure-deep-nesting',
      })
    }
  }

  let totalSize = 0
  for (const f of files) {
    totalSize += f.content.length
  }
  if (totalSize > MAX_TOTAL_SIZE) {
    findings.push({
      id: makeId(),
      axis: 'structure',
      severity: 'medium',
      category: 'structure',
      title: 'Total size exceeds limit',
      message: `Total size ${(totalSize / 1024 / 1024).toFixed(1)}MB exceeds limit of ${MAX_TOTAL_SIZE / 1024 / 1024}MB`,
      filePath: '',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Reduce total file size by removing unnecessary files or compressing assets',
      ruleId: 'structure-size-exceeded',
    })
  }

  for (const f of files) {
    const normalized = f.path.replace(/\\/g, '/')
    if (!normalized.startsWith('assets/') && isBinaryByExtension(f.path)) {
      findings.push({
        id: makeId(),
        axis: 'structure',
        severity: 'low',
        category: 'structure',
        title: 'Unexpected binary file',
        message: `Binary file "${f.path}" found outside assets/ directory`,
        filePath: f.path,
        lineNumber: 0,
        column: 0,
        snippet: '',
        recommendation: `Move "${f.path}" to assets/ or remove it from the skill`,
        ruleId: 'structure-binary-outside-assets',
      })
    }
  }

  const assetFiles = files.filter(f => f.path.replace(/\\/g, '/').startsWith('assets/'))
  let assetSize = 0
  for (const f of assetFiles) {
    assetSize += f.content.length
  }
  if (assetSize > 1024 * 1024) {
    findings.push({
      id: makeId(),
      axis: 'structure',
      severity: 'info',
      category: 'structure',
      title: 'Large assets directory',
      message: `Assets directory is ${(assetSize / 1024 / 1024).toFixed(1)}MB, consider optimizing`,
      filePath: 'assets/',
      lineNumber: 0,
      column: 0,
      snippet: '',
      recommendation: 'Optimize asset files (compress images, remove unused files)',
      ruleId: 'structure-large-assets',
    })
  }

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length

  let score = 100
  score -= criticalCount * 40
  score -= highCount * 20
  score -= mediumCount * 10
  score -= findings.filter(f => f.severity === 'low').length * 5
  score = Math.max(0, Math.min(100, score))

  return {
    name: 'Directory Structure',
    key: 'structure',
    score,
    status: score === 100 ? 'pass' : score >= 60 ? 'warn' : 'fail',
    summary: `${findings.length} structural issue${findings.length !== 1 ? 's' : ''} found`,
    findings,
  }
}
