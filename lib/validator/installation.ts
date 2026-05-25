import { AxisResult, Finding, SkillFile } from '@/lib/validator/types'

interface InstallRisk {
  filePattern: RegExp
  contentPattern: RegExp
  severity: Finding['severity']
  category: string
  title: string
  message: string
  recommendation: string
}

const INSTALL_RISKS: InstallRisk[] = [
  {
    filePattern: /package\.json$/i,
    contentPattern: /"(postinstall|preinstall|prepare|prepublish)"/i,
    severity: 'high',
    category: 'Install Script',
    title: 'Package postinstall script detected',
    message: 'package.json contains a lifecycle script (postinstall/preinstall) that runs automatically on install',
    recommendation: 'Audit the postinstall script carefully. Malicious packages often use postinstall to execute payloads.',
  },
  {
    filePattern: /package\.json$/i,
    contentPattern: /"(postinstall|preinstall|prepare|prepublish)":\s*"[^"]*(curl|wget|bash|sh|powershell|cmd|node|npx|npm)[^"]*"/i,
    severity: 'critical',
    category: 'Install Script',
    title: 'Suspicious postinstall command',
    message: 'package.json lifecycle script runs a shell or network command on install',
    recommendation: 'Lifecycle scripts should not execute network requests or shell commands. Remove or audit this script.',
  },
  {
    filePattern: /Makefile$/i,
    contentPattern: /^\s*(install|build|setup|bootstrap):[\s\S]*?(curl|wget|bash|sh\s+|eval)/im,
    severity: 'high',
    category: 'Build Script',
    title: 'Makefile install target runs shell commands',
    message: 'The Makefile install/bootstrap target executes network or shell commands',
    recommendation: 'Ensure any network downloads use HTTPS from known sources. Review the full Makefile for malicious targets.',
  },
  {
    filePattern: /install\.sh$|setup\.sh$|bootstrap\.sh$/i,
    contentPattern: /curl.*\|.*(bash|sh)|wget.*\|.*(bash|sh)|(curl|wget).*\|/i,
    severity: 'critical',
    category: 'Install Script',
    title: 'Install script pipes network to shell',
    message: 'The install script downloads and executes code from the network in one step',
    recommendation: 'Pipe-to-shell patterns (curl | sh) are a common malware vector. Verify the download URL is legitimate.',
  },
  {
    filePattern: /install\.sh$|setup\.sh$|bootstrap\.sh$/i,
    contentPattern: /(chmod\s+\+x|chown|sudo|exec\s+)/i,
    severity: 'medium',
    category: 'Install Script',
    title: 'Install script modifies system permissions',
    message: 'The install script uses chmod/chown/sudo which can modify system files',
    recommendation: 'Avoid running install scripts with elevated privileges. Review what permissions are being changed.',
  },
  {
    filePattern: /install\.sh$|setup\.sh$|bootstrap\.sh$/i,
    contentPattern: /eval\s+|`[^`]*`|\$\([^)]*\)/i,
    severity: 'high',
    category: 'Install Script',
    title: 'Install script uses dynamic code execution',
    message: 'The install script uses eval or command substitution which could execute arbitrary code',
    recommendation: 'Replace eval/substitution with explicit commands. Dynamic execution makes auditing difficult.',
  },
  {
    filePattern: /\.gitmodules$/i,
    contentPattern: /url\s*=\s*(?!https:\/\/github\.com)/i,
    severity: 'medium',
    category: 'Submodule',
    title: 'Git submodule points to non-GitHub URL',
    message: 'The git submodule URL does not point to github.com, making verification harder',
    recommendation: 'Pin submodules to GitHub URLs with commit hashes for auditability.',
  },
  {
    filePattern: /\.gitmodules$/i,
    contentPattern: /url\s*=\s*https?:\/\/(?!github\.com)/i,
    severity: 'high',
    category: 'Submodule',
    title: 'Git submodule uses HTTP or non-GitHub host',
    message: 'Git submodule points to an external host over HTTP, which is insecure',
    recommendation: 'Use HTTPS URLs pointing to github.com or a trusted git host.',
  },
  {
    filePattern: /Dockerfile$/i,
    contentPattern: /(curl|wget).*\|.*(bash|sh)/i,
    severity: 'critical',
    category: 'Dockerfile',
    title: 'Dockerfile pipes network to shell',
    message: 'The Dockerfile downloads and pipes code to shell during build',
    recommendation: 'Use ADD with checksum verification or multi-stage builds instead of pipe-to-shell.',
  },
  {
    filePattern: /Dockerfile$/i,
    contentPattern: /ADD\s+https?:\/\//i,
    severity: 'medium',
    category: 'Dockerfile',
    title: 'Dockerfile ADD from URL',
    message: 'Dockerfile uses ADD with a URL instead of COPY or a pinned download',
    recommendation: 'Use COPY for local files or ADD with checksums for remote files.',
  },
  {
    filePattern: /(\.pre-commit-config\.yaml|pre-commit)$/i,
    contentPattern: /./i,
    severity: 'info',
    category: 'Git Hook',
    title: 'Pre-commit hooks configured',
    message: 'The skill includes pre-commit or git hook configuration',
    recommendation: 'Verify hooks only run safe linting/formatting. Malicious hooks can exfiltrate data on every commit.',
  },
  {
    filePattern: /\.npmrc$/i,
    contentPattern: /registry\s*=\s*(?!https:\/\/registry\.npmjs\.org)/i,
    severity: 'high',
    category: 'Registry',
    title: 'Custom npm registry configured',
    message: '.npmrc points to a non-default npm registry',
    recommendation: 'Verify the custom registry is trusted. Attackers use custom registries to serve malicious packages.',
  },
  {
    filePattern: /requirements\.txt$/i,
    contentPattern: /^-i\s+|--index-url|--extra-index-url/i,
    severity: 'high',
    category: 'Registry',
    title: 'Custom PyPI index configured',
    message: 'requirements.txt uses a non-default PyPI index',
    recommendation: 'Custom PyPI indexes can serve typosquatted or malicious packages.',
  },
  {
    filePattern: /\.(ts|js|py|rb|go|rs|sh)$/i,
    contentPattern: /(npx|npm\s+(install|run)|pip\s+install|gem\s+install|cargo\s+install).*["'`]/i,
    severity: 'high',
    category: 'Auto-Install',
    title: 'Script auto-installs dependencies',
    message: 'A script file automatically installs packages without user consent',
    recommendation: 'Skills should not auto-install dependencies. Add warnings or make installation opt-in.',
  },
  {
    filePattern: /docker-compose\.yml$|docker-compose\.yaml$/i,
    contentPattern: /image\s*:/i,
    severity: 'medium',
    category: 'Container',
    title: 'Docker Compose references external images',
    message: 'docker-compose.yml pulls external container images',
    recommendation: 'Pin images to specific digests (image@sha256:...) to prevent supply chain attacks.',
  },
  {
    filePattern: /\.(service|timer|path|socket|mount|automount)$/i,
    contentPattern: /ExecStart\s*=.*(curl|wget|bash|sh)\s/i,
    severity: 'critical',
    category: 'System Service',
    title: 'Systemd service executes network command',
    message: 'A systemd unit file executes a network command, which could download and run payloads',
    recommendation: 'Avoid using systemd services that fetch and execute remote code.',
  },
  {
    filePattern: /\.bat$|\.ps1$|\.cmd$/i,
    contentPattern: /(Invoke-WebRequest|iwr|curl|wget|Start-Process|Invoke-Expression|iex)/i,
    severity: 'high',
    category: 'Windows Script',
    title: 'Windows script downloads or executes code',
    message: 'A .bat/.ps1 file performs network requests or code execution',
    recommendation: 'Review Windows scripts carefully. PowerShell is a common vector for malware delivery.',
  },
]

export function validateInstallation(files: SkillFile[]): AxisResult {
  const findings: Finding[] = []
  let criticalCount = 0
  let highCount = 0
  let mediumCount = 0

  for (const file of files) {
    const normalizedPath = file.path.replace(/\\/g, '/')
    const fileName = normalizedPath.split('/').pop() || ''

    for (const risk of INSTALL_RISKS) {
      if (risk.filePattern.test(fileName)) {
        const lines = file.content.split('\n')
        let lineNumber = 0

        for (let i = 0; i < lines.length; i++) {
          if (risk.contentPattern.test(lines[i])) {
            lineNumber = i + 1
            break
          }
        }

        const finding: Finding = {
          id: `install-${fileName}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          axis: 'installation',
          severity: risk.severity,
          category: risk.category,
          title: `${fileName}: ${risk.title}`,
          message: risk.message,
          filePath: normalizedPath,
          lineNumber: lineNumber || undefined,
          recommendation: risk.recommendation,
        }

        findings.push(finding)

        if (risk.severity === 'critical') criticalCount++
        if (risk.severity === 'high') highCount++
        if (risk.severity === 'medium') mediumCount++
      }
    }
  }

  let score: number
  let status: AxisResult['status']

  if (criticalCount > 0) {
    score = Math.max(0, 20 - criticalCount * 15)
    status = 'fail'
  } else if (highCount > 0) {
    score = Math.max(10, 40 - highCount * 10)
    status = 'fail'
  } else if (mediumCount > 0) {
    score = Math.max(40, 70 - mediumCount * 10)
    status = 'warn'
  } else if (findings.length > 0) {
    score = 80
    status = 'warn'
  } else {
    score = 100
    status = 'pass'
  }

  const summary = findings.length === 0
    ? 'No installation risks detected'
    : `${findings.length} installation risk${findings.length > 1 ? 's' : ''} found (${criticalCount} critical, ${highCount} high, ${mediumCount} medium)`

  return { name: 'Installation Risk', key: 'installation', score, status, summary, findings }
}
