import { renderHook, waitFor } from '@testing-library/react'
import { useReverseGeocode } from '../useReverseGeocode'

const mockFetch = jest.fn()

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch
})

describe('useReverseGeocode', () => {
  it('returns null when disabled', () => {
    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62, false))

    expect(result.current).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when lat is invalid', () => {
    const { result } = renderHook(() => useReverseGeocode(NaN, 37.62))

    expect(result.current).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when lon is invalid', () => {
    const { result } = renderHook(() => useReverseGeocode(55.75, Infinity))

    expect(result.current).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when both coords are invalid', () => {
    const { result } = renderHook(() => useReverseGeocode(NaN, NaN))

    expect(result.current).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches and returns formatted address from address fields', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          address: {
            country: 'Russia',
            city: 'Moscow',
            street: 'Red Square',
            house_number: '1',
          },
        }),
    })

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    expect(result.current).toBe(null)

    await waitFor(() => {
      expect(result.current).toBe('Russia, Moscow, Red Square, 1')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('nominatim.openstreetmap.org/reverse')
    expect(calledUrl).toContain('lat=55.75')
    expect(calledUrl).toContain('lon=37.62')
  })

  it('uses town/village/hamlet fallback when city is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          address: {
            country: 'Russia',
            town: 'Pushkino',
            road: 'Lenina',
          },
        }),
    })

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(result.current).toBe('Russia, Pushkino, Lenina')
    })
  })

  it('uses display_name when address is empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          display_name: 'Red Square, Moscow, Russia',
        }),
    })

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(result.current).toBe('Red Square, Moscow, Russia')
    })
  })

  it('uses name when display_name and address are empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          name: 'Red Square',
        }),
    })

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(result.current).toBe('Red Square')
    })
  })

  it('returns null when fetch response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })

  it('returns null when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })

  it('ignores AbortError and does not update label', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    mockFetch.mockRejectedValue(abortError)

    const { result } = renderHook(() => useReverseGeocode(55.75, 37.62))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    expect(result.current).toBe(null)
  })

  it('aborts fetch on unmount', async () => {
    let resolvePromise: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockFetch.mockReturnValue(fetchPromise)

    const { unmount } = renderHook(() => useReverseGeocode(55.75, 37.62))

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const fetchOptions = mockFetch.mock.calls[0][1]
    expect(fetchOptions?.signal).toBeDefined()

    unmount()

    resolvePromise!({ ok: true, json: () => Promise.resolve({}) })
  })

  it('sets label to null when disabled after being enabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          address: { country: 'Russia', city: 'Moscow' },
        }),
    })

    const { result, rerender } = renderHook(
      ({ enabled }) => useReverseGeocode(55.75, 37.62, enabled),
      { initialProps: { enabled: true } },
    )

    await waitFor(() => {
      expect(result.current).toBe('Russia, Moscow')
    })

    rerender({ enabled: false })

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })
})
