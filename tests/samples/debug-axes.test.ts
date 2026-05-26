import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { runFullValidation } from '@/lib/validator/orchestrator'

test('debug axes', async () => {
  const mdPath = path.resolve(__dirname, '../../samples/false-positive/documented-command-example.md')
  const mdContent = fs.readFileSync(mdPath, 'utf-8')
  const result = await runFullValidation({
    name: 'documented-command-example',
    files: [{ path: 'SKILL.md', content: mdContent }],
  })
  const axisInfo = result.axes.map(a => `${a.key}=${a.score}`).join(', ')
  expect(result.overallScore).toBeGreaterThanOrEqual(0)
})
