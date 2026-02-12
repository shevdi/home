import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useQueryParams } from '../useQueryParams'

function createWrapper(initialSearch = '') {
  const initialEntries = initialSearch ? [`/photos${initialSearch}`] : ['/photos']
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  }
}

describe('useQueryParams', () => {
  it('returns empty queryParams when URL has no search params', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper(),
    })

    expect(result.current.queryParams).toEqual({})
    expect(result.current.stringSearchParams).toBe('')
  })

  it('parses dateFrom and dateTo from URL', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01&dateTo=2024-12'),
    })

    expect(result.current.queryParams).toEqual({
      dateFrom: '2024-01',
      dateTo: '2024-12',
    })
    expect(result.current.stringSearchParams).toBe('dateFrom=2024-01&dateTo=2024-12')
  })

  it('parses order from URL', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?order=orderDownByTakenAt'),
    })

    expect(result.current.queryParams).toEqual({
      order: 'orderDownByTakenAt',
    })
  })

  it('parses tags as array from comma-separated value', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?tags=foo,bar,baz'),
    })

    expect(result.current.queryParams).toEqual({
      tags: ['foo', 'bar', 'baz'],
    })
  })

  it('parses single tag', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?tags=only'),
    })

    expect(result.current.queryParams).toEqual({
      tags: ['only'],
    })
  })

  it('parses multiple params including tags', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01&tags=a,b&order=orderUpByTakenAt'),
    })

    expect(result.current.queryParams).toEqual({
      dateFrom: '2024-01',
      tags: ['a', 'b'],
      order: 'orderUpByTakenAt',
    })
  })

  it('setQueryParams adds new params', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setQueryParams({ dateFrom: '2024-01', dateTo: '2024-12' })
    })

    expect(result.current.queryParams).toEqual({
      dateFrom: '2024-01',
      dateTo: '2024-12',
    })
    expect(result.current.stringSearchParams).toContain('dateFrom=2024-01')
    expect(result.current.stringSearchParams).toContain('dateTo=2024-12')
  })

  it('setQueryParams adds array values as comma-separated', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.setQueryParams({ tags: ['foo', 'bar'] })
    })

    expect(result.current.queryParams).toEqual({
      tags: ['foo', 'bar'],
    })
    expect(result.current.stringSearchParams).toBe('tags=foo%2Cbar')
  })

  it('setQueryParams removes param when value is null', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01&dateTo=2024-12'),
    })

    act(() => {
      result.current.setQueryParams({ dateFrom: null })
    })

    expect(result.current.queryParams).toEqual({
      dateTo: '2024-12',
    })
    expect(result.current.stringSearchParams).not.toContain('dateFrom')
  })

  it('setQueryParams removes param when value is undefined', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01'),
    })

    act(() => {
      result.current.setQueryParams({ dateFrom: undefined })
    })

    expect(result.current.queryParams).toEqual({})
  })

  it('setQueryParams removes param when value is empty string', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01'),
    })

    act(() => {
      result.current.setQueryParams({ dateFrom: '' })
    })

    expect(result.current.queryParams).toEqual({})
  })

  it('setQueryParams removes param when value is empty array', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?tags=foo,bar'),
    })

    act(() => {
      result.current.setQueryParams({ tags: [] })
    })

    expect(result.current.queryParams).toEqual({})
  })

  it('setQueryParams updates existing params', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01'),
    })

    act(() => {
      result.current.setQueryParams({ dateFrom: '2024-06' })
    })

    expect(result.current.queryParams).toEqual({
      dateFrom: '2024-06',
    })
  })

  it('setQueryParams can update multiple params at once', () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: createWrapper('?dateFrom=2024-01'),
    })

    act(() => {
      result.current.setQueryParams({
        dateFrom: '2024-06',
        dateTo: '2024-12',
        order: 'orderDownByTakenAt',
      })
    })

    expect(result.current.queryParams).toEqual({
      dateFrom: '2024-06',
      dateTo: '2024-12',
      order: 'orderDownByTakenAt',
    })
  })
})
