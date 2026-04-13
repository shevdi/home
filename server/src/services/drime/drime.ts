import sharp from 'sharp'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { folderNames } from '../../config'
import { env } from '../../config/env.js'
import { logError } from '../../db/services/logs'
import {
  type DrimeFileEntry,
  type DrimeFileEntriesListResponse,
  type DrimeService,
  type DrimeServiceDeps,
  type DrimeTokenApiResponse,
  type UploadPhotoInput
} from './drime.types.js'
import { createDrimeClient } from './drimeClient'

const DEFAULT_TOKEN = env.DRIME_TOKEN
const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000
const DEFAULT_RETRY_MAX_ATTEMPTS = 3
const DEFAULT_RETRY_BASE_DELAY_MS = 300
const DEFAULT_RETRY_MAX_DELAY_MS = 2000

const getPhotoFolder = (size?: number) =>
  size ? (size < 500 ? folderNames.dev.sm : folderNames.dev.md) : folderNames.dev.full

export { createDrimeClient } from './drimeClient'
export type { DrimeClientDeps } from './drime.types'

export const createDrimeService = (deps: DrimeServiceDeps = {}): DrimeService => {
  const {
    client: injectedClient,
    clientDeps = {},
    retryConfig = {},
    tokenConfig = {},
    now = () => Date.now(),
    sleep: sleepFn = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  } = deps

  const token = tokenConfig.token ?? DEFAULT_TOKEN
  const tokenTtlMs = tokenConfig.ttlMs ?? DEFAULT_TOKEN_TTL_MS
  const retryMaxAttempts = retryConfig.maxAttempts ?? DEFAULT_RETRY_MAX_ATTEMPTS
  const retryBaseDelayMs = retryConfig.baseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS
  const retryMaxDelayMs = retryConfig.maxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS

  let cachedToken: DrimeTokenApiResponse | null = null
  let cachedTokenExpiresAt = 0
  let tokenRequestInFlight: Promise<DrimeTokenApiResponse> | null = null

  const client = injectedClient ?? createDrimeClient({
    ...clientDeps,
    getAccessToken: clientDeps.getAccessToken ?? (() => cachedToken?.user?.access_token)
  })

  const cropPhotoAndUpload = async (file: Express.Multer.File, size?: number) => {
    const folder = getPhotoFolder(size)
    const cropped = !size
      ? file.buffer
      : await sharp(file.buffer)
        .rotate()
        .resize(size, null, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer()
    const photoData = await uploadFile(cropped, {
      fileName: `${file.originalname}`,
      mimetype: file.mimetype,
      folder
    })
    const { url } = await getFiles(`/file-entries/${photoData.id}`)
    return { url, photoData }
  }

  const getToken = async () => {
    const currentTime = now()
    if (cachedToken && cachedTokenExpiresAt > currentTime) {
      return cachedToken
    }

    if (tokenRequestInFlight) {
      return tokenRequestInFlight
    }

    const url = '/auth/login'
    const body = { email: process.env.DRIME_EMAIL, password: process.env.DRIME_PASS, token_name: token }

    tokenRequestInFlight = (async (): Promise<DrimeTokenApiResponse> => {
      const response = await client.post<DrimeTokenApiResponse>(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      cachedToken = response.data
      cachedTokenExpiresAt = now() + tokenTtlMs
      return response.data
    })()

    try {
      return await tokenRequestInFlight
    } catch (err) {
      logError(err, { service: 'drime', action: 'getToken' })
      cachedToken = null
      cachedTokenExpiresAt = 0
      throw err
    } finally {
      tokenRequestInFlight = null
    }
  }

  const ensureToken = async () => {
    await getToken()
  }

  const getRetryAfterMs = (error: AxiosError) => {
    const retryAfter = error.response?.headers?.['retry-after']
    if (!retryAfter) return null
    const asNumber = Number(retryAfter)
    if (!Number.isNaN(asNumber)) {
      return asNumber * 1000
    }
    const asDate = Date.parse(retryAfter)
    if (Number.isNaN(asDate)) return null
    return Math.max(0, asDate - now())
  }

  const isRetryableStatus = (status?: number) => {
    if (!status) return false
    return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504
  }

  const isNetworkError = (error: AxiosError) => {
    if (error.response) return false
    const code = error.code ?? ''
    return code === 'ECONNABORTED' ||
      code === 'ENOTFOUND' ||
      code === 'ECONNRESET' ||
      code === 'EAI_AGAIN' ||
      code === 'ETIMEDOUT'
  }

  const shouldRetry = (error: AxiosError, method?: string, allowNonIdempotent?: boolean) => {
    const normalizedMethod = method?.toLowerCase() ?? 'get'
    const isSafeMethod = normalizedMethod === 'get' || normalizedMethod === 'head' || normalizedMethod === 'options'
    const isIdempotent = isSafeMethod || normalizedMethod === 'put' || normalizedMethod === 'delete'
    if (!isIdempotent && !allowNonIdempotent) return false
    return isNetworkError(error) || isRetryableStatus(error.response?.status)
  }

  const getRetryDelayMs = (attempt: number, error: AxiosError) => {
    const retryAfterMs = getRetryAfterMs(error)
    if (retryAfterMs !== null) return retryAfterMs
    const exponential = retryBaseDelayMs * Math.pow(2, attempt)
    const jitter = Math.floor(Math.random() * 100)
    return Math.min(retryMaxDelayMs, exponential + jitter)
  }

  const withRetry = async <T>(
    operation: () => Promise<T>,
    method?: string,
    allowNonIdempotent?: boolean
  ) => {
    let attempt = 0
    while (true) {
      try {
        return await operation()
      } catch (err) {
        if (!axios.isAxiosError(err)) throw err
        if (!shouldRetry(err, method, allowNonIdempotent) || attempt >= retryMaxAttempts) {
          throw err
        }
        const delayMs = getRetryDelayMs(attempt, err)
        attempt += 1
        await sleepFn(delayMs)
      }
    }
  }

  const responseUrlFrom = (response: AxiosResponse) => response.request.res.responseUrl

  const authedRequest = async <T>(
    config: AxiosRequestConfig,
    options?: { allowNonIdempotent?: boolean }
  ) => {
    await ensureToken()
    return withRetry(
      () => client.request<T>(config),
      config.method,
      options?.allowNonIdempotent
    )
  }

  const authedPostForm = async <T>(
    url: string,
    data: FormData,
    config?: AxiosRequestConfig,
    options?: { allowNonIdempotent?: boolean }
  ) => {
    await ensureToken()
    return withRetry(
      () => client.postForm<T>(url, data, config),
      'post',
      options?.allowNonIdempotent
    )
  }

  const getFiles = async (url: string = ''): Promise<{ url: string }> => {
    try {
      const response = await authedRequest<{ url: string }>({
        method: 'get',
        url
      })
      return { url: responseUrlFrom(response) }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return { url: '' }
      }
      throw err
    }
  }

  const getFileEntriesList = async (page = 1): Promise<DrimeFileEntriesListResponse> => {
    try {
      const response = await authedRequest<DrimeFileEntriesListResponse>({
        method: 'get',
        url: '/drive/file-entries',
        params: { perPage: 10, page }
      })
      return response.data
    } catch (err) {
      logError(err, { service: 'drime', action: 'getFileEntriesList', page })
      return { data: [], meta: {} }
    }
  }

  const updateFile = async (url: string = '', data: DrimeFileEntry): Promise<{ url: string }> => {
    try {
      const response = await authedRequest<{ url: string }>({
        method: 'put',
        url,
        data,
        params: {}
      })
      return { url: responseUrlFrom(response) }
    } catch (err) {
      logError(err, { service: 'drime', action: 'updateFile', url })
      return Promise.reject(err)
    }
  }

  const deleteFile = async (
    entryIds: string[],
    deleteForever = false
  ): Promise<void> => {
    if (entryIds.length === 0) return

    await authedRequest(
      {
        method: 'post',
        url: '/file-entries/delete',
        data: {
          entryIds: entryIds,
          deleteForever: deleteForever
        }
      },
      { allowNonIdempotent: true }
    )
  }

  const uploadFile = async (
    file: Buffer<ArrayBufferLike>,
    {
      fileName,
      mimetype,
      folder = folderNames.dev.full
    }: UploadPhotoInput
  ): Promise<DrimeFileEntry> => {
    if (!file) {
      throw Error('no file uploaded')
    }

    const blob = new Blob([new Uint8Array(file)], {
      type: mimetype
    })

    const formData = new FormData()
    formData.append('file', blob, fileName)
    formData.append('parentId', folder)
    formData.append('relativePath', `${folder}/`)

    const response = await authedPostForm<{ fileEntry: DrimeFileEntry }>(
      '/uploads',
      formData,
      { headers: { accept: 'application/json' } },
      { allowNonIdempotent: true }
    )

    return response.data.fileEntry
  }

  return {
    cropPhotoAndUpload,
    getToken,
    getFiles,
    getFilesList: getFileEntriesList,
    updateFile,
    uploadFile,
    deleteFile
  }
}

const drimeService = createDrimeService()

export default drimeService
