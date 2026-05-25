import type { ValidationResult } from '@/lib/validator/types'

const resultsMap = new Map<string, ValidationResult>()
const insertionOrder: string[] = []
const MAX_ENTRIES = 200

export function saveResult(result: ValidationResult): void {
  if (resultsMap.size >= MAX_ENTRIES) {
    const oldest = insertionOrder.shift()
    if (oldest) resultsMap.delete(oldest)
  }

  resultsMap.set(result.id, result)
  insertionOrder.push(result.id)
}

export function getResult(id: string): ValidationResult | undefined {
  return resultsMap.get(id)
}

export function getResultCount(): number {
  return resultsMap.size
}
