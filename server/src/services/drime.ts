import sharp from 'sharp';
import { photoFolderNames } from '../config';
import { DrimeFileEntry, DrimeTokenApiResponse } from '../types/api';
import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_TOKEN = process.env.DRIME_TOKEN as string
const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000
const DEFAULT_RETRY_MAX_ATTEMPTS = 3
const DEFAULT_RETRY_BASE_DELAY_MS = 300
const DEFAULT_RETRY_MAX_DELAY_MS = 2000

export type DrimeClientDeps = {
  axiosInstance?: typeof axios
  baseURL?: string
  getAccessToken?: () => string | undefined
}

export const createDrimeClient = ({
  axiosInstance = axios,
  baseURL = process.env.DRIME_URL,
  getAccessToken = () => undefined
}: DrimeClientDeps = {}): AxiosInstance => {
  const client = axiosInstance.create({
    baseURL,
  })

  client.interceptors.request.use(
    config => {
      // Attach auth header and default content type.
      const accessToken = getAccessToken()
      const headers = AxiosHeaders.from(config.headers ?? {})
      !headers['Content-Type'] && headers.set('Content-Type', 'application/json')
      accessToken && headers.set('Authorization', `Bearer ${accessToken}`)
      config.headers = headers
      return config
    },
    error => {
      return Promise.reject(error);
    }
  )

  return client
}

const getPhotoFolder = (size?: number) =>
  size ? (size < 500 ? photoFolderNames.sm : photoFolderNames.md) : photoFolderNames.full

type UploadPhotoInput = {
  fileName: string
  mimetype: string
  folder?: string
}

type RetryConfig = {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

type TokenConfig = {
  token?: string
  ttlMs?: number
}

type DrimeServiceDeps = {
  client?: AxiosInstance
  clientDeps?: DrimeClientDeps
  retryConfig?: RetryConfig
  tokenConfig?: TokenConfig
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

type DrimeFileEntriesListResponse = {
  data?: Array<{ id: number; url?: string }>
  meta?: { last_page?: number; current_page?: number }
}

type DrimeService = {
  cropPhotoAndUpload: (file: Express.Multer.File, size?: number) => Promise<{ url: string; photoData: DrimeFileEntry }>
  getToken: () => Promise<DrimeTokenApiResponse>
  getFiles: (url?: string) => Promise<{ url: string }>
  getFilesList: (page?: number) => Promise<DrimeFileEntriesListResponse>
  updateFile: (url: string, data: DrimeFileEntry) => Promise<{ url: string }>
  uploadFile: (file: Buffer<ArrayBufferLike>, input: UploadPhotoInput) => Promise<DrimeFileEntry>
  deleteFile: (entryIds: string[], deleteForever?: boolean) => Promise<void>
}

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
    // Store resized files by size tier (sm/md/full).
    const folder = getPhotoFolder(size)
    const cropped = !size
      ? file.buffer
      : await sharp(file.buffer)
        .rotate() // Auto-rotate based on EXIF orientation and remove orientation tag
        .resize(size, null, {
          fit: 'cover',
          position: 'center'
        })
        // .jpeg({ quality: 80 })
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
    // Avoid duplicate logins by reusing a cached token and in-flight request.
    const currentTime = now()
    if (cachedToken && cachedTokenExpiresAt > currentTime) {
      return cachedToken
    }

    if (tokenRequestInFlight) {
      return tokenRequestInFlight
    }

    const url = '/auth/login'
    const body = { email: process.env.DRIME_EMAIL, password: process.env.DRIME_PASS, token_name: token };

    tokenRequestInFlight = (async () => {
      const response = await client.post<null, DrimeTokenApiResponse>(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      cachedToken = response.data
      cachedTokenExpiresAt = now() + tokenTtlMs
      return response.data
    })()

    try {
      return await tokenRequestInFlight
    } catch (err) {
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
    // Honor Retry-After header when provided by the server.
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
    // Only retry idempotent/safe methods unless explicitly allowed.
    const normalizedMethod = method?.toLowerCase() ?? 'get'
    const isSafeMethod = normalizedMethod === 'get' || normalizedMethod === 'head' || normalizedMethod === 'options'
    const isIdempotent = isSafeMethod || normalizedMethod === 'put' || normalizedMethod === 'delete'
    if (!isIdempotent && !allowNonIdempotent) return false
    return isNetworkError(error) || isRetryableStatus(error.response?.status)
  }

  const getRetryDelayMs = (attempt: number, error: AxiosError) => {
    // Exponential backoff with jitter, capped by max delay.
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
    // Retry transient errors with backoff.
    let attempt = 0
    while (true) {
      try {
        return await operation()
      } catch (err) {
        const error = err as AxiosError
        if (!shouldRetry(error, method, allowNonIdempotent) || attempt >= retryMaxAttempts) {
          throw error
        }
        const delayMs = getRetryDelayMs(attempt, error)
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
    // Ensure auth and apply retry for transient failures.
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
    // Use postForm for multipart uploads; client.request() would serialize FormData as JSON.
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
        url,
      })
      return { url: responseUrlFrom(response) }
    } catch (err) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 404) {
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
        params: { perPage: 10, page },
      })
      return response.data
    } catch (err) {
      console.error('getFileEntriesList failed:', err)
      return { data: [], meta: {} }
    }
  }

  const updateFile = async (url: string = '', data: DrimeFileEntry): Promise<{ url: string }> => {
    try {
      const response = await authedRequest<{ url: string }>({
        method: 'put',
        url,
        data,
        params: {

        },
      })
      return { url: responseUrlFrom(response) };
    } catch (err) {
      console.log(err)
      return Promise.resolve(err as any);
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
      folder = photoFolderNames.full
    }: UploadPhotoInput
  ): Promise<DrimeFileEntry> => {
    if (!file) {
      throw Error('no file uploaded')
    }

    const blob = new Blob([file.buffer as any], {
      type: mimetype,
    });

    const formData = new FormData();
    formData.append('file', blob, fileName)
    formData.append('parentId', folder)
    formData.append('relativePath', `${folder}/`)

    const response = await authedPostForm<{ fileEntry: DrimeFileEntry }>(
      '/uploads',
      formData,
      { headers: { accept: 'application/json' } },
      { allowNonIdempotent: true }
    )

    return response.data.fileEntry;
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
