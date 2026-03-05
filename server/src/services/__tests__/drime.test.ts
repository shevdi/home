import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios'

jest.unstable_mockModule('sharp', () => ({
  default: () => ({
    rotate: () => ({
      resize: () => ({
        toBuffer: async () => Buffer.from('mock')
      })
    })
  })
}))

let createDrimeService: typeof import('../drime').createDrimeService

const createMock = (): jest.Mock<(...args: []) => never> => jest.fn()

beforeAll(async () => {
  ({ createDrimeService } = await import('../drime'))
})

const createAxiosError = (status?: number, code?: string) => {
  const error = new AxiosError('request failed')
  if (status) {
    error.response = {
      status,
      statusText: 'error',
      headers: {},
      config: {}
    } as unknown as AxiosResponse
  }
  if (code) {
    error.code = code
  }
  return error
}

describe('drime service', () => {
  beforeEach(() => {
    process.env.DRIME_EMAIL = 'test@example.com'
    process.env.DRIME_PASS = 'secret'
  })

  it('caches token within TTL to avoid repeated logins', async () => {
    const post = createMock()
    post.mockResolvedValue({
      data: { user: { access_token: 'access-token' } }
    })
    const client = { post } as unknown as AxiosInstance

    const service = createDrimeService({
      client,
      tokenConfig: { token: 'base-token', ttlMs: 1000 },
      now: () => 1000
    })

    const token1 = await service.getToken()
    const token2 = await service.getToken()

    expect(token1).toEqual(token2)
    expect(client.post).toHaveBeenCalledTimes(1)
    expect(client.post).toHaveBeenCalledWith(
      '/auth/login',
      {
        email: 'test@example.com',
        password: 'secret',
        token_name: 'base-token'
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer base-token'
        })
      })
    )
  })

  it('retries getFiles on retryable status codes', async () => {
    const request = createMock()
    request
      .mockRejectedValueOnce(createAxiosError(503))
      .mockResolvedValueOnce({
        request: { res: { responseUrl: 'https://drime.test/file-1' } }
      })

    const post = createMock()
    post.mockResolvedValue({
      data: { user: { access_token: 'access-token' } }
    })
    const client = { post, request } as unknown as AxiosInstance

    const sleepMock = createMock()
    sleepMock.mockResolvedValue(undefined)
    const sleep = sleepMock as unknown as (ms: number) => Promise<void>
    const service = createDrimeService({
      client,
      retryConfig: { maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0 },
      sleep
    })

    const result = await service.getFiles('/file-entries/1')

    expect(result.url).toBe('https://drime.test/file-1')
    expect(request).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })

  it('retries uploadFile for transient failures when non-idempotent is allowed', async () => {
    const postForm = createMock()
    postForm
      .mockRejectedValueOnce(createAxiosError(503))
      .mockResolvedValueOnce({
        data: { fileEntry: { id: 123 } }
      })

    const post = createMock()
    post.mockResolvedValue({
      data: { user: { access_token: 'access-token' } }
    })
    const client = { post, postForm } as unknown as AxiosInstance

    const sleepMock = createMock()
    sleepMock.mockResolvedValue(undefined)
    const sleep = sleepMock as unknown as (ms: number) => Promise<void>
    const service = createDrimeService({
      client,
      retryConfig: { maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0 },
      sleep
    })

    const result = await service.uploadFile(Buffer.from('file'), {
      fileName: 'file.jpg',
      mimetype: 'image/jpeg'
    })

    expect(result).toEqual({ id: 123 })
    expect(postForm).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })
})
