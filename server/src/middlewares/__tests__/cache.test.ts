import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { cacheMiddleware, cacheClear } from '../cache.js'

const createReq = (overrides: Partial<{
  method: string
  originalUrl: string
  url: string
  path: string
  headers: Record<string, string>
}> = {}) =>
  ({
    method: 'GET',
    originalUrl: '/api/photos',
    url: '/api/photos',
    path: '/api/photos',
    headers: {},
    ...overrides,
  }) as any

const createRes = () => {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200,
    status: jest.fn((code: number) => {
      res.statusCode = code
      return res
    }),
    setHeader: jest.fn((name: string, value: string) => {
      headers[name.toLowerCase()] = value
      return res
    }),
    getHeaders: jest.fn(() => ({ ...headers })),
    end: jest.fn((chunk?: unknown, encodingOrCb?: BufferEncoding | (() => void), cb?: () => void) => {
      const callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb
      callback?.()
      return res
    }),
  } as any
  return res
}

describe('cache middleware', () => {
  beforeEach(() => {
    cacheClear()
    jest.clearAllMocks()
  })

  describe('non-GET requests', () => {
    it('passes through POST requests without caching', () => {
      const middleware = cacheMiddleware('1m')
      const req = createReq({ method: 'POST' })
      const res = createRes()
      const next = jest.fn()

      middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.end).not.toHaveBeenCalled()
    })

    it('passes through PUT requests without caching', () => {
      const middleware = cacheMiddleware('1m')
      const req = createReq({ method: 'PUT' })
      const next = jest.fn()

      middleware(req, createRes(), next)

      expect(next).toHaveBeenCalledTimes(1)
    })

    it('passes through DELETE requests without caching', () => {
      const middleware = cacheMiddleware('1m')
      const req = createReq({ method: 'DELETE' })
      const next = jest.fn()

      middleware(req, createRes(), next)

      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET requests - cache miss', () => {
    it('calls next on first request and caches successful response', () => {
      const middleware = cacheMiddleware('1m')
      const req = createReq()
      const res = createRes()
      const next = jest.fn()

      middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)

      res.end('cached body')

      const req2 = createReq()
      const res2 = createRes()
      const next2 = jest.fn()
      middleware(req2, res2, next2)
      expect(next2).not.toHaveBeenCalled()
      expect(res2.end).toHaveBeenCalledWith('cached body')
    })

    it('caches response with 200 status', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '/test' })
      const res = createRes()
      res.statusCode = 200
      const next = jest.fn()

      middleware(req, res, next)
      res.end('hello')

      const req2 = createReq({ originalUrl: '/test' })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).not.toHaveBeenCalled()
      expect(res2.status).toHaveBeenCalledWith(200)
      expect(res2.setHeader).toHaveBeenCalledWith('cache-control', expect.stringMatching(/max-age=\d+/))
      expect(res2.end).toHaveBeenCalledWith('hello')
    })

    it('does not cache response with 4xx status', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '/not-found' })
      const res = createRes()
      res.statusCode = 404
      const next = jest.fn()

      middleware(req, res, next)
      res.end('Not Found')

      const req2 = createReq({ originalUrl: '/not-found' })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).toHaveBeenCalledTimes(1)
    })

    it('does not cache response with 5xx status', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '/error' })
      const res = createRes()
      res.statusCode = 500
      const next = jest.fn()

      middleware(req, res, next)
      res.end('Internal Error')

      const req2 = createReq({ originalUrl: '/error' })
      const next2 = jest.fn()

      middleware(req2, createRes(), next2)

      expect(next2).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET requests - cache hit', () => {
    it('returns cached response on second request with same URL', () => {
      const middleware = cacheMiddleware('5m')
      const req1 = createReq({ originalUrl: '/api/data' })
      const res1 = createRes()
      const next1 = jest.fn()

      middleware(req1, res1, next1)
      res1.setHeader('content-type', 'application/json')
      res1.end(JSON.stringify({ id: 1 }))

      const req2 = createReq({ originalUrl: '/api/data' })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).not.toHaveBeenCalled()
      expect(res2.status).toHaveBeenCalledWith(200)
      expect(res2.setHeader).toHaveBeenCalledWith('content-type', 'application/json')
      expect(res2.setHeader).toHaveBeenCalledWith('cache-control', expect.stringMatching(/max-age=\d+/))
      expect(res2.end).toHaveBeenCalledWith(JSON.stringify({ id: 1 }))
    })

    it('uses different cache entries for different URLs', () => {
      const middleware = cacheMiddleware('5m')
      const res1 = createRes()
      const res2 = createRes()

      middleware(createReq({ originalUrl: '/a' }), res1, jest.fn())
      res1.end('body-a')

      middleware(createReq({ originalUrl: '/b' }), res2, jest.fn())
      res2.end('body-b')

      const resA = createRes()
      const resB = createRes()
      middleware(createReq({ originalUrl: '/a' }), resA, jest.fn())
      middleware(createReq({ originalUrl: '/b' }), resB, jest.fn())

      expect(resA.end).toHaveBeenCalledWith('body-a')
      expect(resB.end).toHaveBeenCalledWith('body-b')
    })

    it('uses req.url when originalUrl is empty', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '', url: '/fallback-url', path: '' })
      const res = createRes()
      const next = jest.fn()

      middleware(req, res, next)
      res.end('from-url')

      const req2 = createReq({ originalUrl: '', url: '/fallback-url', path: '' })
      const res2 = createRes()

      middleware(req2, res2, jest.fn())
      expect(res2.end).toHaveBeenCalledWith('from-url')
    })

    it('uses req.path when originalUrl and url are empty', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '', url: '', path: '/path-only' })
      const res = createRes()

      middleware(req, res, jest.fn())
      res.end('from-path')

      const req2 = createReq({ originalUrl: '', url: '', path: '/path-only' })
      const res2 = createRes()

      middleware(req2, res2, jest.fn())
      expect(res2.end).toHaveBeenCalledWith('from-path')
    })
  })

  describe('conditional requests (If-None-Match / 304)', () => {
    it('returns 304 when If-None-Match matches cached ETag', () => {
      const middleware = cacheMiddleware('5m')
      const req1 = createReq({ originalUrl: '/api/data' })
      const res1 = createRes()

      middleware(req1, res1, jest.fn())
      res1.setHeader('etag', '"abc123"')
      res1.end(JSON.stringify({ id: 1 }))

      const req2 = createReq({
        originalUrl: '/api/data',
        headers: { 'if-none-match': '"abc123"' },
      })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).not.toHaveBeenCalled()
      expect(res2.status).toHaveBeenCalledWith(304)
      expect(res2.end).toHaveBeenCalledWith()
    })

    it('returns full response when If-None-Match does not match', () => {
      const middleware = cacheMiddleware('5m')
      const req1 = createReq({ originalUrl: '/api/data' })
      const res1 = createRes()

      middleware(req1, res1, jest.fn())
      res1.setHeader('etag', '"abc123"')
      res1.end(JSON.stringify({ id: 1 }))

      const req2 = createReq({
        originalUrl: '/api/data',
        headers: { 'if-none-match': '"different"' },
      })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).not.toHaveBeenCalled()
      expect(res2.status).toHaveBeenCalledWith(200)
      expect(res2.end).toHaveBeenCalledWith(JSON.stringify({ id: 1 }))
    })

    it('returns full response when no If-None-Match header is sent', () => {
      const middleware = cacheMiddleware('5m')
      const req1 = createReq({ originalUrl: '/api/data' })
      const res1 = createRes()

      middleware(req1, res1, jest.fn())
      res1.setHeader('etag', '"abc123"')
      res1.end('body')

      const req2 = createReq({ originalUrl: '/api/data' })
      const res2 = createRes()

      middleware(req2, res2, jest.fn())

      expect(res2.status).toHaveBeenCalledWith(200)
      expect(res2.end).toHaveBeenCalledWith('body')
    })

    it('returns full response when cached entry has no ETag', () => {
      const middleware = cacheMiddleware('5m')
      const req1 = createReq({ originalUrl: '/no-etag' })
      const res1 = createRes()

      middleware(req1, res1, jest.fn())
      res1.end('no etag body')

      const req2 = createReq({
        originalUrl: '/no-etag',
        headers: { 'if-none-match': '"something"' },
      })
      const res2 = createRes()

      middleware(req2, res2, jest.fn())

      expect(res2.status).toHaveBeenCalledWith(200)
      expect(res2.end).toHaveBeenCalledWith('no etag body')
    })
  })

  describe('cache expiration', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('serves expired entry as cache miss and allows re-caching', () => {
      const middleware = cacheMiddleware(60_000)
      const req = createReq({ originalUrl: '/expiring' })
      const res = createRes()
      const next = jest.fn()

      middleware(req, res, next)
      res.end('original')

      jest.advanceTimersByTime(61_000)

      const req2 = createReq({ originalUrl: '/expiring' })
      const res2 = createRes()
      const next2 = jest.fn()

      middleware(req2, res2, next2)

      expect(next2).toHaveBeenCalledTimes(1)

      res2.end('updated')
      jest.advanceTimersByTime(1000)

      const req3 = createReq({ originalUrl: '/expiring' })
      const res3 = createRes()

      middleware(req3, res3, jest.fn())
      expect(res3.end).toHaveBeenCalledWith('updated')
    })
  })

  describe('cacheClear', () => {
    it('clears all entries when called without argument', () => {
      const middleware = cacheMiddleware('5m')
      const res = createRes()

      middleware(createReq({ originalUrl: '/x' }), res, jest.fn())
      res.end('data')

      cacheClear()

      const res2 = createRes()
      const next2 = jest.fn()
      middleware(createReq({ originalUrl: '/x' }), res2, next2)

      expect(next2).toHaveBeenCalledTimes(1)
    })

    it('clears entries by group when target is a group name', () => {
      const middleware = cacheMiddleware('5m', 'photos')
      const res = createRes()

      middleware(createReq({ originalUrl: '/photos/1' }), res, jest.fn())
      res.end('photo')

      cacheClear('photos')

      const res2 = createRes()
      const next2 = jest.fn()
      middleware(createReq({ originalUrl: '/photos/1' }), res2, next2)

      expect(next2).toHaveBeenCalledTimes(1)
    })

    it('clears single entry when target is a cache key', () => {
      const middleware = cacheMiddleware('5m')
      const res1 = createRes()
      const res2 = createRes()

      middleware(createReq({ originalUrl: '/key-a' }), res1, jest.fn())
      res1.end('a')
      middleware(createReq({ originalUrl: '/key-b' }), res2, jest.fn())
      res2.end('b')

      cacheClear('/key-a')

      const resA = createRes()
      const resB = createRes()
      const nextA = jest.fn()
      const nextB = jest.fn()
      middleware(createReq({ originalUrl: '/key-a' }), resA, nextA)
      middleware(createReq({ originalUrl: '/key-b' }), resB, nextB)

      expect(nextA).toHaveBeenCalledTimes(1)
      expect(nextB).not.toHaveBeenCalled()
      expect(resB.end).toHaveBeenCalledWith('b')
    })
  })

  describe('duration parsing', () => {
    it('accepts numeric duration in milliseconds', () => {
      const middleware = cacheMiddleware(30_000)
      const req = createReq({ originalUrl: '/num' })
      const res = createRes()

      middleware(req, res, jest.fn())
      res.end('ok')

      const req2 = createReq({ originalUrl: '/num' })
      const res2 = createRes()
      middleware(req2, res2, jest.fn())

      expect(res2.end).toHaveBeenCalledWith('ok')
    })

    it('parses duration string "5m"', () => {
      const middleware = cacheMiddleware('5m')
      const req = createReq({ originalUrl: '/dur' })
      const res = createRes()

      middleware(req, res, jest.fn())
      res.end('ok')

      const req2 = createReq({ originalUrl: '/dur' })
      const res2 = createRes()
      middleware(req2, res2, jest.fn())

      expect(res2.end).toHaveBeenCalledWith('ok')
    })

    it('parses duration string "1h"', () => {
      const middleware = cacheMiddleware('1h')
      const req = createReq({ originalUrl: '/hour' })
      const res = createRes()

      middleware(req, res, jest.fn())
      res.end('ok')

      const req2 = createReq({ originalUrl: '/hour' })
      const res2 = createRes()
      middleware(req2, res2, jest.fn())

      expect(res2.end).toHaveBeenCalledWith('ok')
    })
  })

  describe('body types', () => {
    it('caches string body', () => {
      const middleware = cacheMiddleware('5m')
      const res = createRes()

      middleware(createReq({ originalUrl: '/str' }), res, jest.fn())
      res.end('plain text')

      const res2 = createRes()
      middleware(createReq({ originalUrl: '/str' }), res2, jest.fn())
      expect(res2.end).toHaveBeenCalledWith('plain text')
    })

    it('caches Buffer body', () => {
      const middleware = cacheMiddleware('5m')
      const buf = Buffer.from('binary')
      const res = createRes()

      middleware(createReq({ originalUrl: '/buf' }), res, jest.fn())
      res.end(buf)

      const res2 = createRes()
      middleware(createReq({ originalUrl: '/buf' }), res2, jest.fn())
      expect(res2.end).toHaveBeenCalledWith(buf)
    })

    it('stringifies object body', () => {
      const middleware = cacheMiddleware('5m')
      const res = createRes()

      middleware(createReq({ originalUrl: '/obj' }), res, jest.fn())
      res.end({ foo: 'bar' })

      const res2 = createRes()
      middleware(createReq({ originalUrl: '/obj' }), res2, jest.fn())
      expect(res2.end).toHaveBeenCalledWith('{"foo":"bar"}')
    })
  })
})
