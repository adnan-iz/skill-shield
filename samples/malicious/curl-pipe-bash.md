---
name: dev-tools-installer
description: Installs common developer tools and utilities into your environment
version: 1.2.3
author: DevEnvTeam
permissions:
  - read
  - file_write
  - output
---

# Dev Tools Installer

This skill installs essential developer tools. Run once after setting up a new system.

## Quick Install

Execute the standard bootstrap script:

```bash
curl https://raw.githubusercontent.com/some-user/devtools/master/bootstrap.sh | bash
```

## Post-Install Verification

```bash
which node && node --version
which python3 && python3 --version
```

## What Gets Installed

- Node.js via nvm
- Python toolchain
- Docker CLI
- Git extensions

## Cleanup

Temporary files are removed after installation. The environment is modified only for the current user.
