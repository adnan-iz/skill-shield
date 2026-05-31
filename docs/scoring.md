# Scoring Model

SkillShield scores every skill on 11 weighted axes. The overall score determines the risk level and whether a skill requires approval before deployment.

---

## 11-Axis Scoring

| Axis | Weight | Description |
|------|--------|-------------|
| Security | 25% | Presence of threats, vulnerabilities, and malicious patterns |
| Frontmatter | 18% | Validity and completeness of YAML frontmatter |
| Quality | 12% | Writing clarity, grammar, and instructional quality |
| Structure | 10% | Logical organization and heading hierarchy |
| Installation Risk | 7% | Safety of installation commands and scripts |
| Naming | 5% | Consistency and descriptiveness of file and skill names |
| Tokens | 5% | Estimated token count and complexity |
| Compatibility | 5% | Cross-platform and cross-agent support |
| Content | 5% | Accuracy and usefulness of skill content |
| Dependencies | 3% | Safety and necessity of external dependencies |
| Best Practices | 2% | Adherence to skill authoring guidelines |

---

## Formula

The overall score is a weighted sum rounded to the nearest integer:

```javascript
overallScore = Math.round(
  (security.score        * 0.25) +
  (frontmatter.score     * 0.18) +
  (quality.score         * 0.12) +
  (structure.score       * 0.10) +
  (installationRisk.score * 0.07) +
  (naming.score          * 0.05) +
  (tokens.score          * 0.05) +
  (compatibility.score   * 0.05) +
  (content.score         * 0.05) +
  (dependencies.score    * 0.03) +
  (bestPractices.score   * 0.02)
)
```

---

## Risk Levels

| Range | Level | Action |
|-------|-------|--------|
| 90–100 | Safe | Approve automatically |
| 80–89 | Low | Approve with optional review |
| 60–79 | Medium | Require review before approval |
| 40–59 | High | Block deployment; requires manual override |
| 0–39 | Critical | Block deployment; escalate to security team |

---

## Severity Penalties

Each finding applies a flat penalty to the **Security** axis (and can affect the overall score):

| Severity | Penalty |
|----------|---------|
| Critical | -30 per finding |
| High | -15 per finding |
| Medium | -7 per finding |
| Low | -2 per finding |

Penalties are cumulative. For example, two Critical findings reduce the Security score by 60 points.

---

## Score Caps

Certain findings place a hard ceiling on the overall score, regardless of other axis performance:

| Finding Type | Maximum Score |
|--------------|---------------|
| Secrets found | 40 |
| Destructive command detected | 35 |
| Obfuscated shell code detected | 30 |

If multiple caps apply, the lowest cap wins.

---

## Example Calculation

```javascript
const axes = {
  security:        { score: 80,  weight: 0.25 },
  frontmatter:     { score: 90,  weight: 0.18 },
  quality:         { score: 85,  weight: 0.12 },
  structure:       { score: 90,  weight: 0.10 },
  installationRisk:{ score: 100, weight: 0.07 },
  naming:          { score: 95,  weight: 0.05 },
  tokens:          { score: 80,  weight: 0.05 },
  compatibility:   { score: 90,  weight: 0.05 },
  content:         { score: 85,  weight: 0.05 },
  dependencies:    { score: 100, weight: 0.03 },
  bestPractices:   { score: 90,  weight: 0.02 }
};

const raw = Object.values(axes).reduce((sum, a) => sum + a.score * a.weight, 0);
// raw = 84.7
const overallScore = Math.round(raw);
// overallScore = 85 → Risk Level: Low
```

---

## CI/CD Integration

Use the overall score and risk level to gate deployments in CI pipelines:

```yaml
# GitHub Actions example
- name: Validate skill score
  run: |
    SCORE=$(jq '.overallScore' scan-result.json)
    if [ "$SCORE" -lt 70 ]; then
      echo "Skill score $SCORE is below threshold. Blocking deployment."
      exit 1
    fi
```
