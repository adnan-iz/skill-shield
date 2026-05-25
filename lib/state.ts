import type { ValidationResult } from './validator/types'

const STORAGE_KEY = 'skillshield_history'

export function saveValidation(result: ValidationResult): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const list: ValidationResult[] = stored ? JSON.parse(stored) : []
    const existingIndex = list.findIndex((r) => r.id === result.id)
    if (existingIndex >= 0) {
      list[existingIndex] = result
    } else {
      list.unshift(result)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getValidation(id: string): ValidationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const list: ValidationResult[] = JSON.parse(stored)
    return list.find((r) => r.id === id) ?? null
  } catch {
    return null
  }
}

export function getAllValidations(): ValidationResult[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
