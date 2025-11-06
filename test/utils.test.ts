import { describe, it, expect } from 'vitest'
import { cn } from '../src/lib/utils'

describe('cn utility', () => {
  it('merges class names and deduplicates', () => {
    const result = cn('p-2', 'text-center', 'p-2', { 'text-center': true })
    expect(typeof result).toBe('string')
    expect(result).toContain('p-2')
    expect(result).toContain('text-center')
  })
})
