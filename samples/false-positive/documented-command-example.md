---
name: documented-command-example
description: A security tutorial showing dangerous commands with proper warnings
version: 1.0.0
author: SkillShield
permissions:
  - read
  - output
---

# Security Awareness Tutorial

This skill teaches users about dangerous shell commands.

## Dangerous Commands to Avoid

The following command is dangerous and should never be run:

```bash
# WARNING: This command would delete all files!
# rm -rf /
```

## Safe Alternatives

Always use safe alternatives:

```bash
# Use trash-cli instead of rm:
trash file.txt
```

## External Resources

Learn more at https://docs.example.com/security
