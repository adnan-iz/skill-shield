import { db } from '@/lib/db'
import { validationResults } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import type { ValidationResult } from '@/lib/validator/types'

export async function saveResult(result: ValidationResult): Promise<void> {
  await db.insert(validationResults).values({
    id: result.id,
    result: JSON.stringify(result),
    createdAt: Date.now(),
  })
}

export async function getResult(id: string): Promise<ValidationResult | undefined> {
  const row = await db.select().from(validationResults).where(eq(validationResults.id, id)).limit(1)
  const found = row[0]
  if (!found) return undefined
  return JSON.parse(found.result) as ValidationResult
}

export async function getResultCount(): Promise<number> {
  const rows = await db.select({ count: count() }).from(validationResults)
  return rows[0].count
}
