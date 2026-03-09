import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FileMeta } from '../utils/uploadPhotoMeta'

export type UploadFileStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UploadFileEntry {
  id: string
  name: string
  status: UploadFileStatus
  photoId?: string
  error?: string
  meta?: FileMeta
  /** Server URL for uploaded photos */
  thumbnailUrl?: string
  /** Data URL for pending/uploading - persists across navigation */
  thumbnailDataUrl?: string
}

interface UploadState {
  uploadId: string | null
  files: UploadFileEntry[]
  isUploading: boolean
  currentBatchIndex: number
}

const initialState: UploadState = {
  uploadId: null,
  files: [],
  isUploading: false,
  currentBatchIndex: 0,
}

export const getFileId = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    startUpload: (
      state,
      action: PayloadAction<{ files: UploadFileEntry[]; uploadId: string }>,
    ) => {
      state.uploadId = action.payload.uploadId
      state.files = action.payload.files
      state.isUploading = true
      state.currentBatchIndex = 0
    },
    setFileUploading: (state, action: PayloadAction<string>) => {
      const entry = state.files.find((f) => f.id === action.payload)
      if (entry) entry.status = 'uploading'
    },
    setFileSuccess: (
      state,
      action: PayloadAction<{ id: string; photoId: string; thumbnailUrl?: string }>,
    ) => {
      const entry = state.files.find((f) => f.id === action.payload.id)
      if (entry) {
        entry.status = 'success'
        entry.photoId = action.payload.photoId
        if (action.payload.thumbnailUrl) entry.thumbnailUrl = action.payload.thumbnailUrl
        delete entry.error
      }
    },
    setFileThumbnail: (
      state,
      action: PayloadAction<{ id: string; thumbnailDataUrl: string }>,
    ) => {
      const entry = state.files.find((f) => f.id === action.payload.id)
      if (entry) entry.thumbnailDataUrl = action.payload.thumbnailDataUrl
    },
    setFileError: (
      state,
      action: PayloadAction<{ id: string; error: string }>,
    ) => {
      const entry = state.files.find((f) => f.id === action.payload.id)
      if (entry) {
        entry.status = 'error'
        entry.error = action.payload.error
        delete entry.photoId
      }
    },
    finishUpload: (state) => {
      state.uploadId = null
      state.isUploading = false
    },
    resetUpload: () => initialState,
  },
})

export const {
  startUpload,
  setFileUploading,
  setFileSuccess,
  setFileThumbnail,
  setFileError,
  finishUpload,
  resetUpload,
} = uploadSlice.actions

export const uploadReducer = uploadSlice.reducer
