import sharp from 'sharp';
import { photoFolderNames } from '../config';
import { DrimeFileEntry, DrimeTokenApiResponse } from '../types/api';
import axios from 'axios';

const token = process.env.DRIME_TOKEN as string
const TOKEN_TTL_MS = 5 * 60 * 1000
let cachedToken: DrimeTokenApiResponse | null = null
let cachedTokenExpiresAt = 0
let tokenRequestInFlight: Promise<DrimeTokenApiResponse> | null = null

const drime = axios.create({
  baseURL: process.env.DRIME_URL,
  headers: {
    Authorization: `Bearer ${token}`
  }
})

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error);
  }
);

export const cropPhotoAndUpload = async (file: Express.Multer.File, token: string, size?: number) => {
  const folder = size ? (size < 500 ? photoFolderNames.sm : photoFolderNames.md) : photoFolderNames.full
  const cropped = !size ? file.buffer : await sharp(file.buffer)
    .rotate() // Auto-rotate based on EXIF orientation and remove orientation tag
    .resize(size, null, {
      fit: "cover",
      position: "center"
    })
    // .jpeg({ quality: 80 })
    .toBuffer()
  const photoData = await uploadPhotos(token, cropped, {
    fileName: `${file.originalname}`,
    mimetype: file.mimetype,
    folder
  })
  const { url } = await getEntries(`/file-entries/${photoData.id}`, token);
  return { url, photoData }
}

export async function getToken() {
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

export async function getEntries(
  url: string = '',
  token?: string
): Promise<{ url: string }> {
  try {
    const response = await drime<{ url: string, token: string }, DrimeTokenApiResponse>({
      method: 'get',
      url,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })
    return { url: response.request.res.responseUrl };
  } catch (err) {
    console.log(err)
    return Promise.resolve(err as any);
  }
}

export async function updateEntry(
  url: string = '',
  token: string,
  data: DrimeFileEntry
): Promise<{ url: string }> {
  try {
    const response = await drime<{ url: string, token: string }, DrimeTokenApiResponse>({
      method: 'put',
      url,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      data,
      params: {

      },
    })
    return { url: response.request.res.responseUrl };
  } catch (err) {
    console.log(err)
    return Promise.resolve(err as any);
  }
}

export async function uploadPhotos(
  token: string,
  file: Buffer<ArrayBufferLike>,
  {
    fileName,
    mimetype,
    folder = photoFolderNames.full
  }: {
    fileName: string,
    mimetype: string,
    folder?: string
  }
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

  const response = await drime.postForm('/uploads', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
      accept: 'application/json'
    }
  })

  return response.data.fileEntry;
}

