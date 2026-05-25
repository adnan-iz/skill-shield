import type { ValidationResult } from '@/lib/validator/types'

const resultsMap = new Map<string, ValidationResult>()

export function saveResult(result: ValidationResult): void {
  resultsMap.set(result.id, result)
}

export function getResult(id: string): ValidationResult | undefined {
  return resultsMap.get(id)
}
