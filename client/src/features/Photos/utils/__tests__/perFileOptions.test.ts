import { computeMergedView, defaultPerFileOptions, getTargetIds } from '../perFileOptions'
import type { PerFileOptions } from '../perFileOptions'

const opts = (overrides: Partial<PerFileOptions> = {}): PerFileOptions => ({
  ...defaultPerFileOptions,
  ...overrides,
})

describe('computeMergedView', () => {
  it('returns defaults when map is empty', () => {
    const result = computeMergedView(new Map(), new Set())
    expect(result).toEqual({
      title: '',
      priority: 0,
      private: false,
      country: [],
      city: [],
      tags: [],
      accessedBy: [],
    })
  })

  it('returns values when all files have the same scalar values', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset', priority: 5 })],
      ['b', opts({ title: 'sunset', priority: 5 })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.title).toBe('sunset')
    expect(result.priority).toBe(5)
  })

  it('returns undefined for scalars when values differ', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset', priority: 5 })],
      ['b', opts({ title: 'beach', priority: 3 })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.title).toBeUndefined()
    expect(result.priority).toBeUndefined()
  })

  it('returns intersection for tag arrays', () => {
    const map = new Map([
      ['a', opts({ tags: ['travel', 'city'], country: ['France'] })],
      ['b', opts({ tags: ['travel', 'food'], country: ['France'] })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.tags).toEqual(['travel'])
    expect(result.country).toEqual(['France'])
  })

  it('returns empty array when tag arrays have no intersection', () => {
    const map = new Map([
      ['a', opts({ tags: ['city'] })],
      ['b', opts({ tags: ['food'] })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.tags).toEqual([])
  })

  it('uses only selected files when selection is non-empty', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset', priority: 5 })],
      ['b', opts({ title: 'beach', priority: 3 })],
      ['c', opts({ title: 'sunset', priority: 5 })],
    ])
    const result = computeMergedView(map, new Set(['a', 'c']))
    expect(result.title).toBe('sunset')
    expect(result.priority).toBe(5)
  })

  it('uses all files when selection is empty', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset' })],
      ['b', opts({ title: 'beach' })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.title).toBeUndefined()
  })

  it('handles single file in selection', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset', priority: 5, tags: ['travel', 'city'] })],
      ['b', opts({ title: 'beach', priority: 3, tags: ['food'] })],
    ])
    const result = computeMergedView(map, new Set(['a']))
    expect(result.title).toBe('sunset')
    expect(result.priority).toBe(5)
    expect(result.tags).toEqual(['travel', 'city'])
  })

  it('ignores selection ids not present in map', () => {
    const map = new Map([
      ['a', opts({ title: 'sunset' })],
    ])
    const result = computeMergedView(map, new Set(['a', 'missing']))
    expect(result.title).toBe('sunset')
  })

  it('returns same private when all files match', () => {
    const map = new Map([
      ['a', opts({ private: true })],
      ['b', opts({ private: true })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.private).toBe(true)
  })

  it('returns undefined private when files differ', () => {
    const map = new Map([
      ['a', opts({ private: true })],
      ['b', opts({ private: false })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.private).toBeUndefined()
  })

  it('returns intersection for accessedBy arrays', () => {
    const map = new Map([
      ['a', opts({ accessedBy: ['user1', 'user2'] })],
      ['b', opts({ accessedBy: ['user1', 'user3'] })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.accessedBy).toEqual(['user1'])
  })

  it('returns empty accessedBy when no intersection', () => {
    const map = new Map([
      ['a', opts({ accessedBy: ['user1'] })],
      ['b', opts({ accessedBy: ['user2'] })],
    ])
    const result = computeMergedView(map, new Set())
    expect(result.accessedBy).toEqual([])
  })
})

describe('getTargetIds', () => {
  it('returns selection when non-empty', () => {
    const map = new Map([
      ['a', opts()],
      ['b', opts()],
    ])
    const result = getTargetIds(map, new Set(['b']))
    expect(result).toEqual(['b'])
  })

  it('returns all keys when selection is empty', () => {
    const map = new Map([
      ['a', opts()],
      ['b', opts()],
    ])
    const result = getTargetIds(map, new Set())
    expect(result).toEqual(['a', 'b'])
  })
})
