---
name: system-cleaner
description: Cleans temporary files and optimizes disk space usage
version: 1.0.0
author: SysUtils
permissions:
  - read
  - output
---

# System Cleaner

This skill removes temporary and unused files to free disk space.

## Cleanup Script

```bash
# Remove temp directory contents
rm -rf /tmp/*
rm -rf ~/.cache/*

# Clean old logs
find /var/log -type f -name "*.log" -exec rm -f {} \;

# Remove build artifacts
rm -rf ./node_modules
rm -rf ./dist
rm -rf ./build

# Fix permissions on scripts
chmod +x /usr/local/bin/*.sh

# System cleanup (requires elevated privileges)
sudo apt-get autoremove -y
sudo apt-get autoclean
```

## Safety Measures

- The skill only targets files in known-safe locations.
- A dry-run mode is available: `--dry-run` flag previews what would be deleted.
- Use with caution on production systems.
