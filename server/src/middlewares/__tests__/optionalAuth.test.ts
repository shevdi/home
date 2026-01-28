import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}))

let optionalAuth: typeof import('../optionalAuth.js').optionalAuth

const jwtMock = (await import('jsonwebtoken')).default as unknown as {
  verify: jest.Mock
}

beforeAll(async () => {
  ;({ optionalAuth } = await import('../optionalAuth.js'))
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
})

describe('optionalAuth middleware', () => {
  it('calls next when authorization header missing', () => {
    const req = { headers: {} } as any
    const res = {} as any
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(jwtMock.verify).not.toHaveBeenCalled()
  })

  it('calls next when authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Token abc' } } as any
    const res = {} as any
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(jwtMock.verify).not.toHaveBeenCalled()
  })

  it('calls next when jwt verification fails', () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as (err: Error | null, decoded: any) => void
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as any
    const res = {} as any
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(jwtMock.verify).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.username).toBeUndefined()
    expect(req.roles).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('sets user info and calls next when jwt valid', () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as (err: Error | null, decoded: any) => void
      cb(null, { UserInfo: { username: 'user', roles: ['admin'] } })
    })
    const req = { headers: { Authorization: 'Bearer token' } } as any
    const res = {} as any
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(jwtMock.verify).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.username).toBe('user')
    expect(req.roles).toEqual(['admin'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
