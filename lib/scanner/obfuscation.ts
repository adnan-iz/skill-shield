import type { Finding } from '@/lib/validator/types'

let findingCounter = 0

function locateLine(content: string, idx: number): { line: number; col: number } {
  const before = content.slice(0, idx)
  const line = (before.match(/\n/g) || []).length + 1
  const lastNewline = before.lastIndexOf('\n')
  const col = idx - lastNewline
  return { line, col }
}

function snippetAround(content: string, idx: number, length: number = 40): string {
  const start = Math.max(0, idx - length)
  const end = Math.min(content.length, idx + length)
  let result = content.slice(start, end)
  if (start > 0) result = '...' + result
  if (end < content.length) result = result + '...'
  return result
}

function makeFinding(
  severity: Finding['severity'],
  category: string,
  title: string,
  message: string,
  filePath: string,
  lineNumber: number,
  column: number,
  snippet: string,
  recommendation: string,
): Finding {
  return {
    id: `obf-finding-${++findingCounter}`,
    axis: 'security',
    severity,
    category,
    title,
    message,
    filePath,
    lineNumber,
    column,
    snippet,
    recommendation,
  }
}

export function decodeContent(encoded: string): string | null {
  try {
    const base64Re = /^[A-Za-z0-9+/]*={0,2}$/
    if (encoded.length > 20 && base64Re.test(encoded)) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8')
      if (decoded.length > 0 && /[a-zA-Z0-9]{2,}/.test(decoded)) return decoded
    }
  } catch {}

  try {
    const hexRe = /^(?:[0-9a-fA-F]{2})+$/
    if (hexRe.test(encoded.replace(/\\x/g, ''))) {
      const cleaned = encoded.replace(/\\x/g, '')
      const decoded = Buffer.from(cleaned, 'hex').toString('utf8')
      if (decoded.length > 0 && /[a-zA-Z0-9]{2,}/.test(decoded)) return decoded
    }
  } catch {}

  try {
    if (encoded.startsWith('\\x')) {
      const cleaned = encoded.replace(/\\x/g, '')
      if (/^[0-9a-fA-F]+$/.test(cleaned)) {
        const decoded = Buffer.from(cleaned, 'hex').toString('utf8')
        if (decoded.length > 0) return decoded
      }
    }
  } catch {}

  try {
    if (encoded.startsWith('%')) {
      const decoded = decodeURIComponent(encoded)
      if (decoded !== encoded && /[a-zA-Z0-9]{2,}/.test(decoded)) return decoded
    }
  } catch {}

  try {
    if (/^u[0-9a-fA-F]{4}/.test(encoded) || encoded.includes('\\u')) {
      const decoded = encoded
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/^u([0-9a-fA-F]{4})/, (_, code) => String.fromCharCode(parseInt(code, 16)))
      if (decoded !== encoded && /[a-zA-Z0-9]{2,}/.test(decoded)) return decoded
    }
  } catch {}

  return null
}

export function hasMultipleEncodingLayers(content: string): boolean {
  let score = 0

  const hexCount = (content.match(/(?:\\x[0-9a-fA-F]{2}){3,}/g) || []).length
  if (hexCount > 0) score++

  const b64Count = (content.match(/[A-Za-z0-9+/]{30,}={0,2}/g) || []).length
  if (b64Count > 0) score++

  const uriCount = (content.match(/(?:%[0-9a-fA-F]{2}){3,}/g) || []).length
  if (uriCount > 0) score++

  const unicodeCount = (content.match(/(?:\\u[0-9a-fA-F]{4}){2,}/g) || []).length
  if (unicodeCount > 0) score++

  const charcodeCount = (content.match(/(?:String\.fromCharCode|fromCodePoint)\s*\(/g) || []).length
  if (charcodeCount > 0) score++

  const decodeCount = (content.match(/\b(?:atob|btoa|decodeURIComponent|unescape|escape)\s*\(/g) || []).length
  if (decodeCount > 0) score++

  if (score >= 2) {
    const allHex = content.replace(/\\x[0-9a-fA-F]{2}/g, '')
    const b64Matches = allHex.match(/[A-Za-z0-9+/]{30,}={0,2}/g)
    if (b64Matches) {
      for (const match of b64Matches) {
        try {
          const decoded = Buffer.from(match, 'base64').toString('utf8')
          if (/[a-zA-Z0-9]{4,}/.test(decoded) && (decoded.includes('\\x') || /[A-Za-z0-9+/]{20,}/.test(decoded))) {
            score++
            break
          }
        } catch {}
      }
    }

    const allB64 = content.replace(/[A-Za-z0-9+/]{30,}={0,2}/g, '')
    const hexMatches = allB64.match(/(?:\\x[0-9a-fA-F]{2}){3,}/g)
    if (hexMatches) {
      score++
    }
  }

  return score >= 2
}

const ZERO_WIDTH_CHARS = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060\u2061\u2062\u2063\u2064\u180E\u200E\u200F\u202A\u202B\u202C\u202D\u202E]/

const HOMOGLYPH_RANGES = [
  { range: /[\u0430\u0435\u043E\u0440\u0441\u0445]/u, desc: 'Cyrillic' },
  { range: /[\u0456]/u, desc: 'Cyrillic Byelorussian i' },
  { range: /[\u0491]/u, desc: 'Cyrillic ghe' },
  { range: /[\u0432\u043A\u043D\u0442\u0443\u044F]/u, desc: 'Cyrillic' },
  { range: /[\u0405\u0454\u0456\u0458]/u, desc: 'Cyrillic' },
  { range: /[\uFF41-\uFF5A]/u, desc: 'Fullwidth Latin' },
  { range: /[\uFF21-\uFF3A]/u, desc: 'Fullwidth Latin capitals' },
]

export function scanObfuscation(content: string, filePath: string): Finding[] {
  const findings: Finding[] = []

  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const hexMatches = line.matchAll(/(\\x[0-9a-fA-F]{2}){4,}/g)
    for (const match of hexMatches) {
      if (typeof match.index !== 'number') continue
      const fullMatch = match[0]
      const cleaned = fullMatch.replace(/\\x/g, '')
      try {
        const decoded = Buffer.from(cleaned, 'hex').toString('utf8')
        if (/[a-zA-Z]{4,}/.test(decoded)) {
          findings.push(makeFinding(
            'medium', 'obfuscation', 'Hex-encoded string',
            `Hex-encoded string decodes to: "${decoded.slice(0, 50)}"`,
            filePath, lineNum, match.index + 1, snippetAround(line, match.index, 50),
            'Review the decoded content. Hex encoding can hide malicious intent.',
          ))
        }
      } catch {}
    }

    const b64LongMatches = line.matchAll(/['"`]([A-Za-z0-9+/]{30,}={0,2})['"`]/g)
    for (const match of b64LongMatches) {
      if (typeof match.index !== 'number') continue
      const candidate = match[1]
      try {
        const decoded = Buffer.from(candidate, 'base64').toString('utf8')
        if (/[a-zA-Z]{4,}/.test(decoded) && !decoded.includes('\\u')) {
          const isLikelyBoring = /^[\x00-\x1F\x80-\xFF]+$/.test(decoded)
          if (!isLikelyBoring) {
            findings.push(makeFinding(
              'info', 'obfuscation', 'Base64 encoded string',
              `String may be base64 encoded content. First 40 chars decoded: "${decoded.slice(0, 40)}"`,
              filePath, lineNum, match.index + 1, snippetAround(line, match.index, 40),
              'Verify this is intended base64 usage, not obfuscated content.',
            ))
          }
        }
      } catch {}
    }

    const zeroMatch = line.match(ZERO_WIDTH_CHARS)
    if (zeroMatch && typeof zeroMatch.index === 'number') {
      const chars: string[] = []
      for (const ch of line) {
        if (
          ch === '\u200B' || ch === '\u200C' || ch === '\u200D' || ch === '\uFEFF' ||
          ch === '\u00AD' || ch === '\u2060' || ch === '\u2061' || ch === '\u2062' ||
          ch === '\u2063' || ch === '\u2064' || ch === '\u180E' || ch === '\u200E' ||
          ch === '\u200F' || ch === '\u202A' || ch === '\u202B' || ch === '\u202C' ||
          ch === '\u202D' || ch === '\u202E'
        ) {
          chars.push(`U+${ch.charCodeAt(0).toString(16).toUpperCase()}`)
        }
      }
      if (chars.length > 0) {
        findings.push(makeFinding(
          'info', 'obfuscation', 'Hidden Unicode characters',
          `Found ${chars.length} zero-width/invisible character(s): ${chars.join(', ')}`,
          filePath, lineNum, zeroMatch.index + 1, snippetAround(line, zeroMatch.index, 30),
          'Inspect with a hex editor. Zero-width chars can hide code from reviewers.',
        ))
      }
    }

    for (const hrange of HOMOGLYPH_RANGES) {
      const match = line.match(hrange.range)
      if (match && typeof match.index === 'number') {
        findings.push(makeFinding(
          'info', 'obfuscation', 'Homoglyph characters detected',
          `${hrange.desc} homoglyph characters found that visually resemble Latin letters`,
          filePath, lineNum, match.index + 1, snippetAround(line, match.index, 30),
          'Normalize text to NFC and verify identifiers use correct characters.',
        ))
        break
      }
    }

    const reversalMatch = line.match(/\.split\([''`]?\s*[''`]?\)\s*\.reverse\(\)\s*\.join\([''`]?\s*[''`]?\)/)
    if (reversalMatch && typeof reversalMatch.index === 'number') {
      const fullLine = line
      const strMatch = fullLine.match(/[''`][^''`]{3,}[''`]/)
      let reversedContent = ''
      if (strMatch) {
        reversedContent = strMatch[0].slice(1, -1).split('').reverse().join('')
      }
      findings.push(makeFinding(
        'medium', 'obfuscation', 'String reversal obfuscation',
        reversedContent
          ? `Reversed string detected. Unreversed content: "${reversedContent.slice(0, 60)}"`
          : 'String reversal pattern detected',
        filePath, lineNum, reversalMatch.index + 1, snippetAround(line, reversalMatch.index, 40),
        'Review what the reversed string represents. It may hide malicious commands.',
      ))
    }

    const charCodeMatch = line.match(/String\.fromCharCode\s*\(/g)
    if (charCodeMatch) {
      const codeMatches = line.matchAll(/(\d{2,3})/g)
      const codes: number[] = []
      for (const cm of codeMatches) {
        codes.push(parseInt(cm[1], 10))
      }
      if (codes.length >= 4) {
        const decoded = String.fromCharCode(...codes)
        findings.push(makeFinding(
          'medium', 'obfuscation', 'String.fromCharCode obfuscation',
          `Character codes decode to: "${decoded.slice(0, 60)}"`,
          filePath, lineNum, line.indexOf('String.fromCharCode') + 1,
          snippetAround(line, line.indexOf('String.fromCharCode'), 50),
          'Avoid using fromCharCode to build strings. Review the decoded string.',
        ))
      }
    }
  }

  if (hasMultipleEncodingLayers(content)) {
    findings.push(makeFinding(
      'high', 'obfuscation', 'Multiple encoding layers detected',
      'Content has multiple encoding layers, strongly suggesting obfuscated malicious content.',
      filePath, 1, 1, content.slice(0, 100),
      'Fully decode all layers and review the resulting plaintext content.',
    ))
  }

  const execPatterns = [
    { pattern: /\beval\s*\(\s*(?:atob|Buffer\.from|unescape|decodeURIComponent|String\.fromCharCode)/, title: 'eval with encoded input', sev: 'high' as const },
    { pattern: /\bsetTimeout\s*\(\s*(?:atob|Buffer\.from|unescape|decodeURIComponent)/, title: 'setTimeout with encoded input', sev: 'high' as const },
    { pattern: /\bsetInterval\s*\(\s*(?:atob|Buffer\.from|unescape|decodeURIComponent)/, title: 'setInterval with encoded input', sev: 'high' as const },
    { pattern: /\bFunction\s*\(\s*(?:atob|Buffer\.from|unescape|decodeURIComponent)/, title: 'Function constructor with encoded input', sev: 'high' as const },
    { pattern: /\[['"`][^'"`]{0,5}['"`\]\s*\]\s*\+\s*['"`][^'"`]{0,5}['"`\]?\s*\+\s*['"`]/, title: 'Broken string concatenation', sev: 'medium' as const },
  ]

  for (const ep of execPatterns) {
    const match = content.match(ep.pattern)
    if (match && typeof match.index === 'number') {
      const loc = locateLine(content, match.index)
      findings.push(makeFinding(
        ep.sev, 'obfuscation', ep.title,
        `${ep.title} detected. This is a common obfuscation technique to hide code.`,
        filePath, loc.line, loc.col + 1, snippetAround(content, match.index, 50),
        'Remove obfuscated execution patterns. Use clear, readable code.',
      ))
    }
  }

  const encodeCount = (content.match(/\b(?:atob|btoa|decodeURIComponent|unescape|escape)\s*\(/g) || []).length +
    (content.match(/(?:\\x[0-9a-fA-F]{2}){3,}/g) || []).length
  if (encodeCount >= 3 && findings.length === 0) {
    findings.push(makeFinding(
      'info', 'obfuscation', 'Suspicious encoding density',
      `High density of encoding functions/escapes found (${encodeCount} occurrences).`,
      filePath, 1, 1, content.slice(0, 100),
      'Review file for obfuscation. Legitimate files rarely use multiple encoding methods.',
    ))
  }

  return findings
}

export const OBFUSCATION_CHECKS = [
  { check: 'Hex-encoded strings', description: 'Strings using hex escape sequences to hide content' },
  { check: 'Base64 encoded strings', description: 'Long base64 strings that may hide content' },
  { check: 'Hidden Unicode characters', description: 'Zero-width and invisible Unicode characters detected' },
  { check: 'Homoglyph characters', description: 'Visually similar Unicode characters (homoglyphs) that resemble Latin letters' },
  { check: 'String reversal obfuscation', description: 'Using string reversal to obfuscate commands' },
  { check: 'String.fromCharCode obfuscation', description: 'Building strings from character codes and executing them' },
  { check: 'Multiple encoding layers', description: 'Content with multiple layers of encoding' },
  { check: 'eval with encoded input', description: 'eval() called with encoded or obscured arguments' },
  { check: 'setTimeout with encoded input', description: 'setTimeout with encoded string arguments' },
  { check: 'setInterval with encoded input', description: 'setInterval with encoded string arguments' },
  { check: 'Function constructor with encoded input', description: 'Function constructor with encoded arguments' },
  { check: 'Broken string concatenation', description: 'Suspicious string splitting and joining to hide intent' },
  { check: 'Suspicious encoding density', description: 'High density of encoding functions/escapes found' },
]
