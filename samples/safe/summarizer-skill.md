---
name: text-summarizer
description: A safe skill that summarizes long text passages into concise summaries
version: 1.0.0
author: Skill-Shield Team
permissions:
  - read
  - output
---

# Text Summarizer

This skill takes long text input and produces a concise summary using extractive and abstractive techniques.

## Usage

```
/summarize --max-length 200 --format bullet
```

## Implementation

```python
def summarize(text, max_length=200):
    sentences = text.split('.')
    scores = {}
    for i, sentence in enumerate(sentences):
        scores[i] = len(sentence.strip())
    ranked = sorted(scores, key=scores.get, reverse=True)
    selected = ' '.join(sentences[j] for j in ranked[:5])
    return selected[:max_length]
```

## Notes

- Only processes text provided at runtime.
- No external dependencies or network calls.
- Output is returned directly to the caller.
