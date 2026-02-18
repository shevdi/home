/**
 * Universal in-memory cache for API call results (id -> url).
 * Uses Factory pattern for configurable, isolated instances.
 */

import { logError } from '../db/services/logs'

export interface UrlSource {
  listIds: (page?: number) => Promise<{
    data?: Array<{ id: number }>
    last_page?: number
    next_page?: number
    per_page?: number
    prev_page?: number | null
    to?: number
    total?: number
  }>
  fetchUrlById: (id: string) => Promise<string>
}

export interface UrlCacheOptions {
  /** TTL in ms; URLs typically expire in ~30 min. Default: 25 min */
  ttlMs?: number
  /** Max concurrent fetches during preload. Default: 5 */
  concurrency?: number
  /** Refresh interval in ms. Default: 20 min */
  refreshIntervalMs?: number
  /** Optional logger; uses console if omitted */
  logger?: {
    info?: (msg: string) => void
    warn?: (msg: string, err?: unknown) => void
  }
}

export interface UrlCache {
  getUrl: (
    source: UrlSource,
    entryId: string | null | undefined
  ) => Promise<string>
  setUrl: (entryId: string, url: string) => void
  clear: () => void
  remove: (entryIds: string[]) => void
  preload: (source: UrlSource) => Promise<void>
  /** Returns stop function to clear the refresh interval */
  startRefresh: (source: UrlSource) => () => void
}

type CacheEntry = { url: string; expiresAt: number }

function isExpired(entry: CacheEntry): boolean {
  return entry.expiresAt <= Date.now()
}

async function pLimit<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const executing: Promise<void>[] = []
  for (const item of items) {
    const p = fn(item).then(() => {
      executing.splice(executing.indexOf(p), 1)
    })
    executing.push(p)
    if (executing.length >= concurrency) {
      await Promise.race(executing)
    }
  }
  await Promise.all(executing)
}

export function createUrlCache(options: UrlCacheOptions = {}): UrlCache {
  const ttlMs = options.ttlMs ?? 25 * 60 * 1000
  const concurrency = options.concurrency ?? 5
  const refreshIntervalMs = options.refreshIntervalMs ?? 20 * 60 * 1000
  const log = options.logger ?? {
    info: (msg: string) => console.info(msg),
    warn: (msg: string, err?: unknown) => console.warn(msg, err),
  }

  const store = new Map<string, CacheEntry>()

  function getCached(entryId: string): string | null {
    const entry = store.get(entryId)
    if (!entry || isExpired(entry)) return null
    return entry.url
  }

  function setUrl(entryId: string, url: string): void {
    store.set(entryId, { url, expiresAt: Date.now() + ttlMs })
  }

  function clear(): void {
    store.clear()
  }

  function remove(entryIds: string[]): void {
    for (const id of entryIds) store.delete(id)
  }

  async function getUrl(
    source: UrlSource,
    entryId: string | null | undefined
  ): Promise<string> {
    if (entryId == null || entryId === '') return ''
    const cached = getCached(entryId)
    if (cached) return cached
    const url = await source.fetchUrlById(entryId)
    if (url) setUrl(entryId, url)
    return url
  }

  async function preload(source: UrlSource): Promise<void> {
    const entryIds: number[] = []
    let page = 1
    let lastPage = 1

    do {
      const res = await source.listIds(page)
      const data = res.data ?? []
      lastPage = res.last_page ?? 1

      for (const entry of data) {
        if (entry?.id != null) entryIds.push(entry.id)
      }
      if (data.length === 0) break
      page += 1
    } while (page <= lastPage)

    await pLimit(entryIds, concurrency, async (id) => {
      try {
        const url = await source.fetchUrlById(String(id))
        if (url) setUrl(String(id), url)
      } catch (err) {
        logError(err, { source: 'urlCache', action: 'preloadFetch', entryId: id })
        log.warn?.(`urlCache: failed to fetch for entry ${id}:`, err)
      }
    })

    log.info?.(`urlCache: preloaded ${store.size} entries`)
  }

  function startRefresh(source: UrlSource): () => void {
    const id = setInterval(() => {
      preload(source).catch((err) => {
        logError(err, { source: 'urlCache', action: 'refresh' })
        log.warn?.('urlCache refresh failed:', err)
      })
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }

  return {
    getUrl,
    setUrl,
    clear,
    remove,
    preload,
    startRefresh,
  }
}
