import { describe, it, expect } from '@jest/globals'
import { queryBuilder } from '../queryBuilder.js'

describe('queryBuilder', () => {
  describe('excludeWhere', () => {
    it('adds a single exclusion to $nor', () => {
      const filter = queryBuilder()
        .excludeWhere('status', 'draft')
        .build()

      expect(filter).toEqual({ $nor: [{ status: 'draft' }] })
    })

    it('adds multiple exclusions to $nor', () => {
      const filter = queryBuilder()
        .excludeWhere('status', 'draft')
        .excludeWhere('deleted', true)
        .build()

      expect(filter).toEqual({
        $nor: [{ status: 'draft' }, { deleted: true }],
      })
    })

    it('returns this for chaining', () => {
      const q = queryBuilder()
      expect(q.excludeWhere('a', 1)).toBe(q)
    })
  })

  describe('dateRange', () => {
    it('adds $gte when only dateFrom provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', '2024-01-01', undefined)
        .build()

      expect(filter).toEqual({ createdAt: { $gte: '2024-01-01' } })
    })

    it('adds $lte when only dateTo provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', undefined, '2024-12-31')
        .build()

      expect(filter).toEqual({ createdAt: { $lte: '2024-12-31' } })
    })

    it('adds both $gte and $lte when both provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', '2024-01-01', '2024-12-31')
        .build()

      expect(filter).toEqual({
        createdAt: { $gte: '2024-01-01', $lte: '2024-12-31' },
      })
    })

    it('does not add field when neither dateFrom nor dateTo provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt')
        .build()

      expect(filter).toEqual({})
    })

    it('trims whitespace from dateFrom and dateTo', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', '  2024-01-01  ', '  2024-12-31  ')
        .build()

      expect(filter).toEqual({
        createdAt: { $gte: '2024-01-01', $lte: '2024-12-31' },
      })
    })

    it('does not add field when both are empty after trim', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', '  ', '')
        .build()

      expect(filter).toEqual({})
    })

    it('returns this for chaining', () => {
      const q = queryBuilder()
      expect(q.dateRange('createdAt', '2024-01-01')).toBe(q)
    })
  })

  describe('allIn', () => {
    it('adds $all filter with array of strings', () => {
      const filter = queryBuilder()
        .allIn('tags', ['a', 'b', 'c'])
        .build()

      expect(filter).toEqual({ tags: { $all: ['a', 'b', 'c'] } })
    })

    it('converts array elements to strings with default normalizer', () => {
      const filter = queryBuilder()
        .allIn('ids', [1, 2, 3])
        .build()

      expect(filter).toEqual({ ids: { $all: ['1', '2', '3'] } })
    })

    it('filters out empty strings with default normalizer', () => {
      const filter = queryBuilder()
        .allIn('tags', ['a', '', 'b'])
        .build()

      expect(filter).toEqual({ tags: { $all: ['a', 'b'] } })
    })

    it('does not add field when normalizer returns undefined', () => {
      const filter = queryBuilder()
        .allIn('tags', 42)
        .build()

      expect(filter).toEqual({})
    })

    it('does not add field when normalizer returns empty array', () => {
      const filter = queryBuilder()
        .allIn('tags', [])
        .build()

      expect(filter).toEqual({})
    })

    it('uses custom normalizer when provided', () => {
      const customNormalizer = (v: unknown) =>
        typeof v === 'string' ? v.split(',').map((s) => s.trim()) : undefined

      const filter = queryBuilder()
        .allIn('tags', 'a, b, c', customNormalizer)
        .build()

      expect(filter).toEqual({ tags: { $all: ['a', 'b', 'c'] } })
    })

    it('does not add field when custom normalizer returns undefined', () => {
      const customNormalizer = () => undefined

      const filter = queryBuilder()
        .allIn('tags', 'anything', customNormalizer)
        .build()

      expect(filter).toEqual({})
    })

    it('returns this for chaining', () => {
      const q = queryBuilder()
      expect(q.allIn('tags', ['a'])).toBe(q)
    })
  })

  describe('build', () => {
    it('returns empty object when no methods called', () => {
      const filter = queryBuilder().build()
      expect(filter).toEqual({})
    })

    it('returns the same object reference on repeated calls', () => {
      const q = queryBuilder().excludeWhere('a', 1)
      const f1 = q.build()
      const f2 = q.build()
      expect(f1).toEqual(f2)
      expect(f1).toBe(f2)
    })
  })

  describe('chaining', () => {
    it('chains all methods together', () => {
      const filter = queryBuilder()
        .excludeWhere('status', 'draft')
        .dateRange('createdAt', '2024-01-01', '2024-12-31')
        .allIn('tags', ['a', 'b'])
        .build()

      expect(filter).toEqual({
        $nor: [{ status: 'draft' }],
        createdAt: { $gte: '2024-01-01', $lte: '2024-12-31' },
        tags: { $all: ['a', 'b'] },
      })
    })
  })
})
