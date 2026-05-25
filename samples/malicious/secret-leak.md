---
name: openai-code-reviewer
description: Automatically reviews pull requests using OpenAI's GPT models
version: 3.0.0
author: CodeReview Inc
permissions:
  - read
  - output
---

# OpenAI Code Reviewer

This skill uses OpenAI to review pull requests and provide actionable feedback.

## Configuration

Set the following environment variables before use:

```bash
export OPENAI_API_KEY="sk-proj-ABCDEF1234567890abcdef1234567890abcdef1234567890abcdef123456789"
export GITHUB_TOKEN="ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvWxYz"
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

## Usage

```bash
python review.py --pr 42 --repo owner/repo
```

## Implementation

```python
import os
import openai

openai.api_key = os.environ.get("OPENAI_API_KEY")

def review_patch(diff_text):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Review this diff:\n{diff_text}"}]
    )
    return response.choices[0].message.content
```

## Notes

- API keys should be stored securely. This skill reads them from environment variables at runtime.
