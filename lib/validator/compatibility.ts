import { AgentCompatibility, CompatibilityMatrix, SkillFile } from '@/lib/validator/types'

export interface AgentInfo {
  name: string
  id: string
  supported: boolean
  detectionPatterns: string[]
}

export const SUPPORTED_AGENTS: AgentInfo[] = [
  { name: 'Claude Code', id: 'claude-code', supported: true, detectionPatterns: ['Bash(', 'ToolUse(', 'tool_use', 'ToolResult', '.claude/'] },
  { name: 'OpenCode', id: 'opencode', supported: true, detectionPatterns: ['terminal(', 'Terminal(', 'tool_use', 'shell', '.opencode/'] },
  { name: 'Cursor', id: 'cursor', supported: true, detectionPatterns: ['@web', '@cursor', 'CursorRule', '.cursor/'] },
  { name: 'GitHub Copilot', id: 'github-copilot', supported: true, detectionPatterns: ['copilot', 'gh ', 'github.copilot'] },
  { name: 'Windsurf', id: 'windsurf', supported: true, detectionPatterns: ['Codeium', 'windsurf', 'cascade'] },
  { name: 'Codex CLI', id: 'codex', supported: true, detectionPatterns: ['codex', 'CodexCLI'] },
  { name: 'Cline', id: 'cline', supported: true, detectionPatterns: ['cline', 'ask:', 'task:'] },
  { name: 'Amp', id: 'amp', supported: true, detectionPatterns: ['amp', 'AmpConfig'] },
  { name: 'Goose', id: 'goose', supported: true, detectionPatterns: ['goose', 'goose_mode'] },
  { name: 'Manus', id: 'manus', supported: true, detectionPatterns: ['manus', 'ManusConfig'] },
  { name: 'Replit Agent', id: 'replit', supported: true, detectionPatterns: ['replit', 'nix', '.replit'] },
  { name: 'Aider', id: 'aider', supported: true, detectionPatterns: ['aider', 'AiderConfig'] },
  { name: 'Mistral Vibe', id: 'mistral-vibe', supported: true, detectionPatterns: ['vibe', 'mistral'] },
  { name: 'OpenClaw', id: 'openclaw', supported: true, detectionPatterns: ['openclaw', 'claw'] },
  { name: 'Zed AI', id: 'zed', supported: true, detectionPatterns: ['zed', 'ZedConfig', '.zed/'] },
  { name: 'JetBrains AI', id: 'jetbrains', supported: true, detectionPatterns: ['jetbrains', 'idea', 'IntelliJ'] },
  { name: 'Trae', id: 'trae', supported: true, detectionPatterns: ['trae', '.trae/'] },
  { name: 'Antigravity', id: 'antigravity', supported: true, detectionPatterns: ['antigravity', 'ag_'] },
  { name: 'Gemini CLI', id: 'gemini-cli', supported: true, detectionPatterns: ['gemini', 'gcli'] },
  { name: 'Kiro', id: 'kiro', supported: true, detectionPatterns: ['kiro', 'KiroAI'] },
  { name: 'Roo', id: 'roo', supported: true, detectionPatterns: ['roo', 'RooConfig'] },
  { name: 'Continue', id: 'continue', supported: true, detectionPatterns: ['continue', 'ContinueConfig', '.continue/'] },
  { name: 'Sourcegraph Cody', id: 'sourcegraph', supported: true, detectionPatterns: ['cody', 'sourcegraph', 'sg '] },
]

function countPatternMatches(content: string, patterns: string[]): number {
  let count = 0
  for (const pattern of patterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(escaped, 'i').test(content)) {
      count++
    }
  }
  return count
}

function findPatternMatches(content: string, patterns: string[]): string[] {
  const found: string[] = []
  for (const pattern of patterns) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(escaped, 'i').test(content)) {
      found.push(pattern)
    }
  }
  return found
}

function determineStatus(matchCount: number, fileMatchCount: number): AgentCompatibility['status'] {
  if (matchCount >= 2 || (matchCount >= 1 && fileMatchCount >= 1)) return 'full'
  if (matchCount >= 1 || fileMatchCount >= 1) return 'partial'
  return 'unknown'
}

function buildNotes(matchCount: number, fileMatchCount: number, patterns: string[], filePatterns: string[]): string {
  const parts: string[] = []
  if (matchCount > 0) parts.push(`Content matches ${matchCount} pattern${matchCount > 1 ? 's' : ''}: ${patterns.join(', ')}`)
  if (fileMatchCount > 0) parts.push(`Files match ${fileMatchCount} pattern${fileMatchCount > 1 ? 's' : ''}: ${filePatterns.join(', ')}`)
  return parts.join('; ') || ''
}

export function detectCompatibility(
  content: string,
  files: SkillFile[]
): CompatibilityMatrix {
  const filePaths = files.map(f => f.path.replace(/\\/g, '/'))
  const fullText = [content, ...files.map(f => f.content)].join('\n')

  const agents: AgentCompatibility[] = SUPPORTED_AGENTS.map(agent => {
    const contentMatches = findPatternMatches(content, agent.detectionPatterns)
    const fileMatches = findPatternMatches(filePaths.join('\n'), agent.detectionPatterns)
    const totalMatchCount = countPatternMatches(fullText, agent.detectionPatterns)

    const status = determineStatus(contentMatches.length, fileMatches.length)
    const notes = buildNotes(contentMatches.length, fileMatches.length, contentMatches, fileMatches)

    return { name: agent.name, id: agent.id, status, notes: notes || undefined }
  })

  const hasNewSpecPatterns = /allowed-tools|allowed_tools|allowedTools/i.test(content)
  if (hasNewSpecPatterns) {
    for (const agent of agents) {
      if (agent.status === 'unknown') {
        agent.status = 'partial'
        agent.notes = agent.notes
          ? `${agent.notes}; Uses allowed-tools (new spec, broad compatibility)`
          : 'Uses allowed-tools (new spec, broad compatibility)'
      }
    }
  }

  const hasMCP = /mcp|model\.context\.protocol/i.test(content)
  if (hasMCP) {
    const mcpAgentIds = ['cline', 'roo', 'continue', 'cursor', 'opencode']
    for (const agent of agents) {
      if (mcpAgentIds.includes(agent.id)) {
        agent.status = agent.status === 'full' ? 'full' : 'partial'
        agent.notes = agent.notes
          ? `${agent.notes}; MCP compatible`
          : 'MCP compatible'
      }
    }
  }

  const fullCount = agents.filter(a => a.status === 'full').length
  const partialCount = agents.filter(a => a.status === 'partial').length
  const knownCount = fullCount + partialCount
  const unknownCount = agents.filter(a => a.status === 'unknown').length

  let overallCompatibility: number
  if (fullCount >= 3) {
    overallCompatibility = 90
  } else if (fullCount >= 1) {
    overallCompatibility = 70 + Math.round((fullCount / agents.length) * 20)
  } else if (partialCount >= 3) {
    overallCompatibility = 50
  } else if (partialCount >= 1) {
    overallCompatibility = 30
  } else {
    overallCompatibility = 10
  }

  return { agents, overallCompatibility }
}
