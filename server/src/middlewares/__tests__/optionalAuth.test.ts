import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals'
import type { Response } from 'express'
import type { RequestWithAuth } from '@/types'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void

let optionalAuth: typeof import('../optionalAuth.js').optionalAuth
let jwtModule: Awaited<typeof import('jsonwebtoken')>

beforeAll(async () => {
  const mod = await import('jsonwebtoken')
  jwtModule = mod
  ;({ optionalAuth } = await import('../optionalAuth.js'))
})

const getJwt = () => (jwtModule as { default?: typeof jwtModule }).default ?? jwtModule

beforeEach(() => {
  jest.restoreAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('optionalAuth middleware', () => {
  it('calls next when authorization header missing', () => {
    const verifySpy = jest.spyOn(getJwt(), 'verify')
    const req = { headers: {} } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(verifySpy).not.toHaveBeenCalled()
  })

  it('calls next when authorization header is not Bearer', () => {
    const verifySpy = jest.spyOn(getJwt(), 'verify')
    const req = { headers: { authorization: 'Token abc' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(verifySpy).not.toHaveBeenCalled()
  })

  it('calls next when jwt verification fails', () => {
    const verifySpy = jest.spyOn(getJwt(), 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(verifySpy).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.auth).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('sets user info and calls next when jwt valid', () => {
    const verifySpy = jest.spyOn(getJwt(), 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { UserInfo: { username: 'user', roles: ['admin'] } })
    })
    const req = { headers: { Authorization: 'Bearer token' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(verifySpy).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.auth?.username).toBe('user')
    expect(req.auth?.roles).toEqual(['admin'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
