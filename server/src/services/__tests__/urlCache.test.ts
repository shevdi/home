import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { createUrlCache, type UrlSource } from '../urlCache.js'

const mockListIds = (impl?: UrlSource['listIds']) =>
  impl
    ? jest.fn<UrlSource['listIds']>(impl)
    : jest.fn<UrlSource['listIds']>().mockResolvedValue({
        data: [] as Array<{ id: number }>,
        last_page: 1,
      })

const mockFetchUrlById = (impl?: UrlSource['fetchUrlById']) =>
  impl
    ? jest.fn<UrlSource['fetchUrlById']>(impl)
    : jest.fn<UrlSource['fetchUrlById']>().mockResolvedValue('')

const createMockSource = (overrides?: Partial<UrlSource>): UrlSource =>
  ({
    listIds: mockListIds(),
    fetchUrlById: mockFetchUrlById(),
    ...overrides,
  }) as UrlSource

describe('urlCache', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getUrl', () => {
    it('returns empty string for null entryId', async () => {
      const cache = createUrlCache()
      const source = createMockSource()
      expect(await cache.getUrl(source, null)).toBe('')
      expect(source.fetchUrlById).not.toHaveBeenCalled()
    })

    it('returns empty string for undefined entryId', async () => {
      const cache = createUrlCache()
      const source = createMockSource()
      expect(await cache.getUrl(source, undefined)).toBe('')
      expect(source.fetchUrlById).not.toHaveBeenCalled()
    })

    it('returns empty string for empty string entryId', async () => {
      const cache = createUrlCache()
      const source = createMockSource()
      expect(await cache.getUrl(source, '')).toBe('')
      expect(source.fetchUrlById).not.toHaveBeenCalled()
    })

    it('fetches from source and caches when not cached', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById().mockResolvedValue('https://example.com/1'),
      })

      const url = await cache.getUrl(source, '1')
      expect(url).toBe('https://example.com/1')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(1)
      expect(source.fetchUrlById).toHaveBeenCalledWith('1')
    })

    it('returns cached url without calling source on second get', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById().mockResolvedValue('https://example.com/1'),
      })

      const url1 = await cache.getUrl(source, '1')
      const url2 = await cache.getUrl(source, '1')

      expect(url1).toBe('https://example.com/1')
      expect(url2).toBe('https://example.com/1')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(1)
    })

    it('does not cache empty url from fetch', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById().mockResolvedValue(''),
      })

      const url1 = await cache.getUrl(source, '1')
      expect(url1).toBe('')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(1)

      const url2 = await cache.getUrl(source, '1')
      expect(url2).toBe('')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(2)
    })

    it('refetches when entry has expired', async () => {
      const cache = createUrlCache({ ttlMs: 1000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById()
          .mockResolvedValueOnce('https://example.com/1')
          .mockResolvedValueOnce('https://example.com/1-refreshed'),
      })

      const url1 = await cache.getUrl(source, '1')
      expect(url1).toBe('https://example.com/1')

      jest.advanceTimersByTime(1500)

      const url2 = await cache.getUrl(source, '1')
      expect(url2).toBe('https://example.com/1-refreshed')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(2)
    })
  })

  describe('setUrl', () => {
    it('stores url and makes it available via getUrl', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource()

      cache.setUrl('42', 'https://example.com/42')
      const url = await cache.getUrl(source, '42')

      expect(url).toBe('https://example.com/42')
      expect(source.fetchUrlById).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('removes all cached entries', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById().mockResolvedValue('https://example.com/1'),
      })

      await cache.getUrl(source, '1')
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')

      cache.clear()
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(2)
    })
  })

  describe('remove', () => {
    it('removes specified entry ids', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById((id: string) =>
          Promise.resolve(`https://example.com/${id}`)
        ),
      })

      await cache.getUrl(source, '1')
      await cache.getUrl(source, '2')
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(await cache.getUrl(source, '2')).toBe('https://example.com/2')

      cache.remove(['1'])
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(await cache.getUrl(source, '2')).toBe('https://example.com/2')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(3)
    })

    it('removes multiple ids', async () => {
      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById((id: string) =>
          Promise.resolve(`https://example.com/${id}`)
        ),
      })

      await cache.getUrl(source, '1')
      await cache.getUrl(source, '2')
      await cache.getUrl(source, '3')
      cache.remove(['1', '3'])

      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(await cache.getUrl(source, '2')).toBe('https://example.com/2')
      expect(await cache.getUrl(source, '3')).toBe('https://example.com/3')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(5)
    })
  })

  describe('preload', () => {
    it('fetches all pages and preloads urls', async () => {
      const listIds = mockListIds()
        .mockResolvedValueOnce({
          data: [{ id: 1 }, { id: 2 }],
          last_page: 2,
        })
        .mockResolvedValueOnce({
          data: [{ id: 3 }],
          last_page: 2,
        })
      const fetchUrlById = mockFetchUrlById((id: string) =>
        Promise.resolve(`https://example.com/${id}`)
      )

      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({ listIds, fetchUrlById })

      await cache.preload(source)

      expect(listIds).toHaveBeenCalledWith(1)
      expect(listIds).toHaveBeenCalledWith(2)
      expect(fetchUrlById).toHaveBeenCalledWith('1')
      expect(fetchUrlById).toHaveBeenCalledWith('2')
      expect(fetchUrlById).toHaveBeenCalledWith('3')

      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(await cache.getUrl(source, '2')).toBe('https://example.com/2')
      expect(await cache.getUrl(source, '3')).toBe('https://example.com/3')
      expect(fetchUrlById).toHaveBeenCalledTimes(3)
    })

    it('stops when data is empty', async () => {
      const listIds = mockListIds()
        .mockResolvedValueOnce({
          data: [{ id: 1 }],
          last_page: 5,
        })
        .mockResolvedValueOnce({ data: [] as Array<{ id: number }>, last_page: 5 })

      const fetchUrlById = mockFetchUrlById((id: string) =>
        Promise.resolve(`https://example.com/${id}`)
      )

      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({ listIds, fetchUrlById })

      await cache.preload(source)

      expect(listIds).toHaveBeenCalledTimes(2)
      expect(fetchUrlById).toHaveBeenCalledTimes(1)
    })

    it('respects concurrency limit', async () => {
      const listIds = mockListIds().mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
        last_page: 1,
      })

      let concurrent = 0
      let maxConcurrent = 0
      const fetchUrlById = mockFetchUrlById(async (id: string) => {
        concurrent++
        maxConcurrent = Math.max(maxConcurrent, concurrent)
        await new Promise((r) => setTimeout(r, 10))
        concurrent--
        return `https://example.com/${id}`
      })

      const cache = createUrlCache({ concurrency: 2, ttlMs: 60_000 })
      const source = createMockSource({ listIds, fetchUrlById })

      const preloadPromise = cache.preload(source)
      await jest.advanceTimersByTimeAsync(100)
      await preloadPromise

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('logs warn on fetch failure and continues', async () => {
      const listIds = mockListIds().mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }],
        last_page: 1,
      })
      const fetchUrlById = mockFetchUrlById()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce('https://example.com/2')

      const log = {
        info: jest.fn(),
        warn: jest.fn(),
      }

      const cache = createUrlCache({ ttlMs: 60_000, logger: log })
      const source = createMockSource({ listIds, fetchUrlById })

      await cache.preload(source)

      expect(log.warn).toHaveBeenCalledWith(
        'urlCache: failed to fetch for entry 1:',
        expect.any(Error)
      )
      expect(log.info).toHaveBeenCalledWith('urlCache: preloaded 1 entries')
      expect(await cache.getUrl(source, '2')).toBe('https://example.com/2')
    })

    it('skips entries with null/undefined id', async () => {
      const listIds = mockListIds().mockResolvedValue({
        data: [{ id: 1 }, { id: null }, { id: undefined }, { id: 2 }] as Array<{
          id: number
        }>,
        last_page: 1,
      })
      const fetchUrlById = mockFetchUrlById((id: string) =>
        Promise.resolve(`https://example.com/${id}`)
      )

      const cache = createUrlCache({ ttlMs: 60_000 })
      const source = createMockSource({ listIds, fetchUrlById })

      await cache.preload(source)

      expect(fetchUrlById).toHaveBeenCalledWith('1')
      expect(fetchUrlById).toHaveBeenCalledWith('2')
      expect(fetchUrlById).not.toHaveBeenCalledWith('null')
      expect(fetchUrlById).not.toHaveBeenCalledWith('undefined')
    })
  })

  describe('startRefresh', () => {
    it('returns stop function that clears the interval', async () => {
      const listIds = mockListIds().mockResolvedValue({
        data: [{ id: 1 }],
        last_page: 1,
      })
      const fetchUrlById = mockFetchUrlById((id: string) =>
        Promise.resolve(`https://example.com/${id}`)
      )

      const cache = createUrlCache({
        ttlMs: 60_000,
        refreshIntervalMs: 10_000,
      })
      const source = createMockSource({ listIds, fetchUrlById })

      const stop = cache.startRefresh(source)

      await jest.advanceTimersByTimeAsync(10_000)
      expect(listIds).toHaveBeenCalledTimes(1)

      stop()
      await jest.advanceTimersByTimeAsync(20_000)
      expect(listIds).toHaveBeenCalledTimes(1)
    })

    it('calls preload at configured interval', async () => {
      const listIds = mockListIds().mockResolvedValue({
        data: [{ id: 1 }],
        last_page: 1,
      })
      const fetchUrlById = mockFetchUrlById((id: string) =>
        Promise.resolve(`https://example.com/${id}`)
      )

      const cache = createUrlCache({
        ttlMs: 60_000,
        refreshIntervalMs: 5_000,
      })
      const source = createMockSource({ listIds, fetchUrlById })

      cache.startRefresh(source)

      await jest.advanceTimersByTimeAsync(5_000)
      expect(listIds).toHaveBeenCalledTimes(1)

      await jest.advanceTimersByTimeAsync(5_000)
      expect(listIds).toHaveBeenCalledTimes(2)
    })

    it('logs warn when refresh preload fails', async () => {
      const listIds = mockListIds().mockRejectedValue(new Error('refresh fail'))
      const fetchUrlById = mockFetchUrlById()

      const log = { info: jest.fn(), warn: jest.fn() }
      const cache = createUrlCache({
        ttlMs: 60_000,
        refreshIntervalMs: 100,
        logger: log,
      })
      const source = createMockSource({ listIds, fetchUrlById })

      cache.startRefresh(source)
      await jest.advanceTimersByTimeAsync(100)

      expect(log.warn).toHaveBeenCalledWith(
        'urlCache refresh failed:',
        expect.any(Error)
      )
    })
  })

  describe('options', () => {
    it('uses custom ttlMs', async () => {
      const cache = createUrlCache({ ttlMs: 500 })
      const source = createMockSource({
        fetchUrlById: mockFetchUrlById().mockResolvedValue('https://example.com/1'),
      })

      await cache.getUrl(source, '1')
      jest.advanceTimersByTime(400)
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(200)
      expect(await cache.getUrl(source, '1')).toBe('https://example.com/1')
      expect(source.fetchUrlById).toHaveBeenCalledTimes(2)
    })
  })
})
