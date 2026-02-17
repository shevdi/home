import type { NextFunction, Request, Response } from 'express'

interface CacheEntry {
  status: number
  headers: Record<string, string>
  body: string | Buffer
  encoding?: BufferEncoding
}

interface CacheStore {
  entries: Map<string, { data: CacheEntry; expiresAt: number }>
  groups: Map<string, Set<string>>
}

const store: CacheStore = {
  entries: new Map(),
  groups: new Map(),
}

const DURATION_UNITS: Record<string, number> = {
  s: 1000,
  sec: 1000,
  second: 1000,
  seconds: 1000,
  m: 60_000,
  min: 60_000,
  minute: 60_000,
  minutes: 60_000,
  h: 3_600_000,
  hr: 3_600_000,
  hour: 3_600_000,
  hours: 3_600_000,
  d: 86_400_000,
  day: 86_400_000,
  days: 86_400_000,
}

function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') return duration
  const match = duration.trim().match(/^([\d.]+)\s*(\w+)$/i)
  if (!match) return 60_000 // default 1 min
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase().replace(/s$/, '') // "mins" -> "min"
  const ms = DURATION_UNITS[unit] ?? DURATION_UNITS[unit + 's'] ?? 60_000
  return value * ms
}

function getCacheKey(req: Request): string {
  return req.originalUrl || req.url || req.path || '/'
}

function addToGroup(key: string, group: string): void {
  let keys = store.groups.get(group)
  if (!keys) {
    keys = new Set()
    store.groups.set(group, keys)
  }
  keys.add(key)
}

function sendCached(res: Response, entry: CacheEntry, ttlSeconds: number): void {
  res.status(entry.status)
  const headers = { ...entry.headers }
  headers['cache-control'] = `max-age=${Math.floor(ttlSeconds)}`
  Object.entries(headers).forEach(([name, value]) => {
    res.setHeader(name, value)
  })
  entry.encoding
    ? res.end(entry.body, entry.encoding)
    : res.end(entry.body)
}

export function cacheClear(target?: string): void {
  if (!target) {
    store.entries.clear()
    store.groups.clear()
    return
  }
  const groupKeys = store.groups.get(target)
  if (groupKeys) {
    groupKeys.forEach((key) => store.entries.delete(key))
    store.groups.delete(target)
  } else {
    store.entries.delete(target)
    store.groups.forEach((keys) => keys.delete(target))
  }
}

export function cacheMiddleware(
  duration: string | number,
  group?: string
): (req: Request, res: Response, next: NextFunction) => void {
  const ttlMs = parseDuration(duration)

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next()

    const key = getCacheKey(req)
    const cached = store.entries.get(key)

    if (cached && cached.expiresAt > Date.now()) {
      const ttlSeconds = Math.max(0, (cached.expiresAt - Date.now()) / 1000)
      return sendCached(res, cached.data, ttlSeconds)
    }

    const originalEnd = res.end.bind(res)

    const wrappedEnd = (
      chunk?: unknown,
      encodingOrCb?: BufferEncoding | (() => void),
      cb?: () => void
    ): Response => {
      const encoding = typeof encodingOrCb === 'string' ? encodingOrCb : undefined
      const callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const headers: Record<string, string> = {}
        const rawHeaders = res.getHeaders()
        for (const [name, value] of Object.entries(rawHeaders)) {
          if (value !== undefined) {
            headers[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value)
          }
        }

        let body: string | Buffer = ''
        if (chunk !== undefined && chunk !== null) {
          body =
            typeof chunk === 'string'
              ? chunk
              : Buffer.isBuffer(chunk)
                ? chunk
                : JSON.stringify(chunk)
        }

        const entry: CacheEntry = {
          status: res.statusCode,
          headers,
          body,
          encoding,
        }
        const expiresAt = Date.now() + ttlMs
        store.entries.set(key, { data: entry, expiresAt })
        if (group) addToGroup(key, group)
      }
      return encoding
        ? originalEnd(chunk, encoding, callback)
        : (callback ? originalEnd(chunk, callback) : originalEnd(chunk))
    }
    res.end = wrappedEnd as typeof res.end

    next()
  }
}
