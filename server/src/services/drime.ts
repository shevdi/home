import sharp from 'sharp';
import { photoFolderNames } from '../config';
import { DrimeFileEntry, DrimeTokenApiResponse } from '../types/api';
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';

const token = process.env.DRIME_TOKEN as string
const TOKEN_TTL_MS = 5 * 60 * 1000
const RETRY_MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 300
const RETRY_MAX_DELAY_MS = 2000
let cachedToken: DrimeTokenApiResponse | null = null
let cachedTokenExpiresAt = 0
let tokenRequestInFlight: Promise<DrimeTokenApiResponse> | null = null

const createDrimeClient = () => {
  const client = axios.create({
    baseURL: process.env.DRIME_URL,
  })

  client.interceptors.request.use(
    config => {
      // Attach auth header and default content type.
      const accessToken = cachedToken?.user?.access_token
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

const drime = createDrimeClient()

const getPhotoFolder = (size?: number) =>
  size ? (size < 500 ? photoFolderNames.sm : photoFolderNames.md) : photoFolderNames.full

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
  const photoData = await uploadPhotos(cropped, {
    fileName: `${file.originalname}`,
    mimetype: file.mimetype,
    folder
  })
  const { url } = await getEntries(`/file-entries/${photoData.id}`)
  return { url, photoData }
}

async function getToken() {
  // Avoid duplicate logins by reusing a cached token and in-flight request.
  const now = Date.now()
  if (cachedToken && cachedTokenExpiresAt > now) {
    return cachedToken
  }

  if (tokenRequestInFlight) {
    return tokenRequestInFlight
  }

  const url = '/auth/login'
  const body = { email: process.env.DRIME_EMAIL, password: process.env.DRIME_PASS, token_name: token };

  tokenRequestInFlight = (async () => {
    const response = await drime.post<null, DrimeTokenApiResponse>(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })

    cachedToken = response.data
    cachedTokenExpiresAt = Date.now() + TOKEN_TTL_MS
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

const getRetryDelayMs = (attempt: number) => {
  // Exponential backoff with jitter, capped by max delay.
  const exponential = RETRY_BASE_DELAY_MS * Math.pow(2, attempt)
  const jitter = Math.floor(Math.random() * 100)
  return Math.min(RETRY_MAX_DELAY_MS, exponential + jitter)
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
      if (!shouldRetry(error, method, allowNonIdempotent) || attempt >= RETRY_MAX_ATTEMPTS) {
        throw error
      }
      const delayMs = getRetryDelayMs(attempt)
      attempt += 1
      await sleep(delayMs)
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
    () => drime.request<T>(config),
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
  // Ensure auth and apply retry for form uploads.
  await ensureToken()
  return withRetry(
    () => drime.postForm<T>(url, data, config),
    'post',
    options?.allowNonIdempotent
  )
}

async function getEntries(
  url: string = ''
): Promise<{ url: string }> {
  try {
    const response = await authedRequest<{ url: string }>({
      method: 'get',
      url,
    })
    return { url: responseUrlFrom(response) };
  } catch (err) {
    console.log(err)
    return Promise.resolve(err as any);
  }
}

async function updateEntry(
  url: string = '',
  data: DrimeFileEntry
): Promise<{ url: string }> {
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

type UploadPhotoInput = {
  fileName: string
  mimetype: string
  folder?: string
}

async function uploadPhotos(
  file: Buffer<ArrayBufferLike>,
  {
    fileName,
    mimetype,
    folder = photoFolderNames.full
  }: UploadPhotoInput
): Promise<DrimeFileEntry> {
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
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: 'application/json'
      }
    },
    { allowNonIdempotent: true }
  )

  return response.data.fileEntry;
}

export default {
  cropPhotoAndUpload,
  getToken,
  getEntries,
  updateEntry,
  uploadPhotos
}
