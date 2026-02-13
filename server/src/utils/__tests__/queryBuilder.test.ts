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

      expect(filter).toEqual({ createdAt: { $gte: '2024-01-01T00:00:00Z' } })
    })

    it('adds $lte when only dateTo provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', undefined, '2024-12-31')
        .build()

      expect(filter).toEqual({ createdAt: { $lte: '2024-12-31T59:59:59Z' } })
    })

    it('adds both $gte and $lte when both provided', () => {
      const filter = queryBuilder()
        .dateRange('createdAt', '2024-01-01', '2024-12-31')
        .build()

      expect(filter).toEqual({
        createdAt: { $gte: '2024-01-01T00:00:00Z', $lte: '2024-12-31T59:59:59Z' },
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
        createdAt: { $gte: '2024-01-01T00:00:00Z', $lte: '2024-12-31T59:59:59Z' },
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

  describe('locationMatch', () => {
    it('does not add filter when neither country nor city provided', () => {
      const filter = queryBuilder().locationMatch().build()
      expect(filter).toEqual({})
    })

    it('adds $and with country $or when only country provided', () => {
      const filter = queryBuilder().locationMatch(['Russia']).build()
      const and = filter.$and as Array<{ $or: unknown[] }>
      expect(and).toHaveLength(1)
      expect(and[0].$or).toHaveLength(4)
      expect(and[0].$or[0]).toEqual({
        'location.dadata.country': { $regex: 'Russia', $options: 'i' },
      })
    })

    it('adds $and with city $or when only city provided', () => {
      const filter = queryBuilder().locationMatch(undefined, ['Moscow']).build()
      const and = filter.$and as Array<{ $or: unknown[] }>
      expect(and).toHaveLength(1)
      expect(and[0].$or).toHaveLength(6)
      expect(and[0].$or[0]).toEqual({
        'location.dadata.city': { $regex: 'Moscow', $options: 'i' },
      })
    })

    it('adds both country and city conditions when both provided', () => {
      const filter = queryBuilder().locationMatch(['Russia'], ['Moscow']).build()
      const and = filter.$and as Array<{ $or: unknown[] }>
      expect(and).toHaveLength(2)
      expect(and[0].$or[0]).toEqual({
        'location.dadata.country': { $regex: 'Russia', $options: 'i' },
      })
      expect(and[1].$or[0]).toEqual({
        'location.dadata.city': { $regex: 'Moscow', $options: 'i' },
      })
    })

    it('adds multiple countries and cities with expanded $or conditions', () => {
      const filter = queryBuilder().locationMatch(['Russia', 'France'], ['Moscow', 'Paris']).build()
      const and = filter.$and as Array<{ $or: unknown[] }>
      expect(and).toHaveLength(2)
      expect(and[0].$or).toHaveLength(8) // 4 fields × 2 countries
      expect(and[1].$or).toHaveLength(12) // 6 fields × 2 cities
    })

    it('trims whitespace from country and city', () => {
      const filter = queryBuilder().locationMatch(['  Russia  '], ['  Moscow  ']).build()
      const and = filter.$and as Array<{ $or: Array<Record<string, { $regex: string }>> }>
      expect(and[0].$or[0]['location.dadata.country'].$regex).toBe('Russia')
      expect(and[1].$or[0]['location.dadata.city'].$regex).toBe('Moscow')
    })

    it('returns this for chaining', () => {
      const q = queryBuilder()
      expect(q.locationMatch(['Russia'])).toBe(q)
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
        createdAt: { $gte: '2024-01-01T00:00:00Z', $lte: '2024-12-31T59:59:59Z' },
        tags: { $all: ['a', 'b'] },
      })
    })
  })
})
