import { buildSearchParams } from '../buildSearchParams'

describe('buildSearchParams', () => {
  it('returns empty string when no params provided', () => {
    expect(buildSearchParams()).toBe('')
    expect(buildSearchParams(undefined)).toBe('')
    expect(buildSearchParams({})).toBe('')
  })

  it('adds page param when pageParam is provided', () => {
    expect(buildSearchParams(undefined, 1)).toBe('page=1')
    expect(buildSearchParams(undefined, 5)).toBe('page=5')
  })

  it('adds dateFrom when provided', () => {
    expect(buildSearchParams({ dateFrom: '2024-01-01' })).toBe('dateFrom=2024-01-01')
  })

  it('adds dateTo when provided', () => {
    expect(buildSearchParams({ dateTo: '2024-12-31' })).toBe('dateTo=2024-12-31')
  })

  it('adds order when provided', () => {
    expect(buildSearchParams({ order: 'orderDownByTakenAt' })).toBe('order=orderDownByTakenAt')
    expect(buildSearchParams({ order: 'orderUpByTakenAt' })).toBe('order=orderUpByTakenAt')
  })

  it('adds tags as comma-separated when provided', () => {
    expect(buildSearchParams({ tags: ['nature', 'portrait'] })).toBe('tags=nature%2Cportrait')
  })

  it('does not add tags when array is empty', () => {
    expect(buildSearchParams({ tags: [] })).toBe('')
  })

  it('adds country when provided', () => {
    expect(buildSearchParams({ country: ['Russia'] })).toBe('country=Russia')
  })

  it('adds city when provided', () => {
    expect(buildSearchParams({ city: ['Moscow'] })).toBe('city=Moscow')
  })

  it('adds multiple countries and cities as comma-separated', () => {
    expect(buildSearchParams({ country: ['Russia', 'France'], city: ['Moscow', 'Paris'] })).toContain(
      'country=Russia%2CFrance',
    )
    expect(buildSearchParams({ country: ['Russia', 'France'], city: ['Moscow', 'Paris'] })).toContain(
      'city=Moscow%2CParis',
    )
  })

  it('combines all params when multiple provided', () => {
    const result = buildSearchParams(
      {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        order: 'orderDownByTakenAt',
        tags: ['a', 'b'],
        country: ['Russia'],
        city: ['Moscow'],
      },
      2,
    )
    expect(result).toContain('page=2')
    expect(result).toContain('dateFrom=2024-01-01')
    expect(result).toContain('dateTo=2024-12-31')
    expect(result).toContain('order=orderDownByTakenAt')
    expect(result).toContain('tags=a%2Cb')
    expect(result).toContain('country=Russia')
    expect(result).toContain('city=Moscow')
  })

  it('ignores null/undefined dateFrom and dateTo', () => {
    expect(buildSearchParams({ dateFrom: undefined, dateTo: undefined })).toBe('')
  })

  it('handles search as void', () => {
    expect(buildSearchParams(undefined, 1)).toBe('page=1')
  })
})
