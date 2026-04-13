import type { Dispatch } from 'redux'
import type { RootState } from '@/app/store/store'
import { apiSlice } from '@/app/store/api'
import {
  startUpload,
  setFileUploading,
  setFileSuccess,
  setFileThumbnail,
  setFileError,
  finishUpload,
  getFileId,
  type UploadFileEntry,
} from '../model/uploadSlice'
import { createThumbnailDataUrl } from '../utils/createThumbnailDataUrl'
import type { FileMeta } from '../utils/uploadPhotoMeta'
import type { PerFileOptions } from '../utils/perFileOptions'
import type { UploadProgressEvent, UploadCompleteEvent } from '@shevdi-home/shared'
import { getBackendUrl } from '@/shared/utils/getBackendUrl'

const BATCH_SIZE = 5

const buildMetaPayload = ({ gps, make, model, takenAt }: FileMeta) => ({
  gpsLatitude: gps?.lat,
  gpsLongitude: gps?.lon,
  gpsAltitude: gps?.alt,
  make,
  model,
  takenAt,
})

const buildUploadFormData = (
  files: File[],
  meta: FileMeta[],
  perFileOptions: PerFileOptions[],
) => {
  const formData = new FormData()
  formData.append('meta', JSON.stringify(meta.map(buildMetaPayload)))
  const perFileJson = JSON.stringify(
    perFileOptions.map((opts) => ({
      title: opts.title || undefined,
      priority: opts.priority,
      private: opts.private,
      tags: opts.tags,
      country: opts.country,
      city: opts.city,
      accessedBy: opts.accessedBy.map((userId) => ({ userId })),
    })),
  )
  formData.append('perFileOptions', perFileJson)
  // #region agent log
  fetch('http://127.0.0.1:7915/ingest/9992f24d-00f6-41c9-bc27-a45102f4306c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd2a394' },
    body: JSON.stringify({
      sessionId: 'd2a394',
      location: 'uploadPhotos.ts:buildUploadFormData',
      message: 'formData perFileOptions',
      data: {
        filesLen: files.length,
        perFileLen: perFileOptions.length,
        jsonLen: perFileJson.length,
      },
      timestamp: Date.now(),
      hypothesisId: 'H2',
    }),
  }).catch(() => {})
  // #endregion
  files.forEach((file) => {
    formData.append('files', file)
  })
  return formData
}

function parseSSEEvent(line: string): UploadProgressEvent | UploadCompleteEvent | null {
  if (!line.startsWith('data: ')) return null
  try {
    return JSON.parse(line.slice(6)) as UploadProgressEvent | UploadCompleteEvent
  } catch {
    return null
  }
}

async function uploadBatch(
  files: File[],
  meta: FileMeta[],
  perFileOptions: PerFileOptions[],
  baseUrl: string,
  token: string | undefined,
  dispatch: Dispatch,
  fileEntries: UploadFileEntry[],
  globalOffset: number,
): Promise<void> {
  const formData = buildUploadFormData(
    files,
    meta,
    perFileOptions,
  )

  for (let i = 0; i < files.length; i++) {
    dispatch(setFileUploading(fileEntries[globalOffset + i].id))
  }

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}/photos/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const errText = await response.text()
    for (let i = 0; i < files.length; i++) {
      dispatch(
        setFileError({
          id: fileEntries[globalOffset + i].id,
          error: errText || `HTTP ${response.status}`,
        }),
      )
    }
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    for (let i = 0; i < files.length; i++) {
      dispatch(
        setFileError({
          id: fileEntries[globalOffset + i].id,
          error: 'No response body',
        }),
      )
    }
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''
    for (const block of lines) {
      const line = block.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      const event = parseSSEEvent(line)
      if (!event) continue
      if (event.type === 'progress') {
        const entry = fileEntries[globalOffset + event.fileIndex]
        if (entry) {
          if (event.result.ok && event.result.photo?._id) {
            const photo = event.result.photo as { _id: string; smSizeUrl?: string }
            dispatch(
              setFileSuccess({
                id: entry.id,
                photoId: photo._id,
                thumbnailUrl: photo.smSizeUrl,
              }),
            )
          } else {
            dispatch(
              setFileError({
                id: entry.id,
                error: event.result.error ?? 'Upload failed',
              }),
            )
          }
        }
      }
    }
  }
}

export async function uploadPhotosInBatches(
  files: File[],
  meta: FileMeta[],
  perFileOptions: PerFileOptions[],
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  const baseUrl = getBackendUrl();
  const token = (getState().auth as { token?: string })?.token

  const fileEntries: UploadFileEntry[] = files.map((file, i) => ({
    id: getFileId(file),
    name: file.name,
    status: 'pending',
    meta: meta[i],
  }))

  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`
  dispatch(startUpload({ files: fileEntries, uploadId }))

  // Create thumbnails in background for pending/uploading - persists across navigation
  Promise.all(
    files.map(async (file, i) => {
      const dataUrl = await createThumbnailDataUrl(file)
      if (dataUrl) {
        dispatch(setFileThumbnail({ id: fileEntries[i].id, thumbnailDataUrl: dataUrl }))
      }
    }),
  ).catch(() => {})

  try {
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batchFiles = files.slice(i, i + BATCH_SIZE)
      const batchMeta = meta.slice(i, i + BATCH_SIZE)
      const batchPerFileOptions = perFileOptions.slice(i, i + BATCH_SIZE)
      await uploadBatch(
        batchFiles,
        batchMeta,
        batchPerFileOptions,
        baseUrl,
        token,
        dispatch,
        fileEntries,
        i,
      )
    }

    dispatch(apiSlice.util.invalidateTags([{ type: 'Photos' as never, id: 'getPhotos' }]))
    dispatch(apiSlice.util.invalidateTags([{ type: 'Photos' as never, id: 'getInfinitePhotos' }]))
  } finally {
    dispatch(finishUpload())
  }
}
