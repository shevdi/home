import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { photoFolderNames } from '../../config'

// API response types
export interface DrimeTokenApiResponse {
  success: boolean
  data?: unknown
  message?: string
  user?: {
    access_token: string
  }
  request?: unknown
}

export interface DrimeFolder {
  id: 486993396
  name: (typeof photoFolderNames)[keyof typeof photoFolderNames]
  description: string | null
  file_name: (typeof photoFolderNames)[keyof typeof photoFolderNames]
  mime: string | null
  color: string | null
  backup: boolean
  tracked: 0 | 1
  file_size: number
  user_id: string | null
  parent_id: string | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
  is_deleted: 0 | 1
  path: string
  disk_prefix: string | null
  type: 'folder'
  extension: null
  file_hash: null
  public: boolean
  thumbnail: boolean
  mux_status: null
  thumbnail_url: null
  workspace_id: number
  is_encrypted: 0 | 1
  iv: null
  vault_id: number | null
  owner_id: number
  hash: string
  url: null
  users: object
}

export interface DrimeFileEntry {
  name: string
  file_name: string
  mime: string
  backup: boolean
  file_size: number
  parent_id: number
  disk_prefix: string
  type: string
  extension: string
  public: boolean
  workspace_id: number
  owner_id: number
  is_encrypted: 0 | 1
  vault_id: string | null
  iv: string | null
  file_hash: string | null
  updated_at: Date
  created_at: Date
  id: number
  path: string
  hash: string
  url: string
  parent: DrimeFolder
  users: object
}

// Client & service types
export type DrimeClientDeps = {
  axiosInstance?: typeof axios
  baseURL?: string
  getAccessToken?: () => string | undefined
}

export type UploadPhotoInput = {
  fileName: string
  mimetype: string
  folder?: string
}

export type RetryConfig = {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

export type TokenConfig = {
  token?: string
  ttlMs?: number
}

export type DrimeServiceDeps = {
  client?: AxiosInstance
  clientDeps?: DrimeClientDeps
  retryConfig?: RetryConfig
  tokenConfig?: TokenConfig
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

export type DrimeFileEntriesListResponse = {
  data?: Array<{ id: number; url?: string }>
  meta?: { last_page?: number; current_page?: number }
}

export type DrimeService = {
  cropPhotoAndUpload: (file: Express.Multer.File, size?: number) => Promise<{ url: string; photoData: DrimeFileEntry }>
  getToken: () => Promise<DrimeTokenApiResponse>
  getFiles: (url?: string) => Promise<{ url: string }>
  getFilesList: (page?: number) => Promise<DrimeFileEntriesListResponse>
  updateFile: (url: string, data: DrimeFileEntry) => Promise<{ url: string }>
  uploadFile: (file: Buffer<ArrayBufferLike>, input: UploadPhotoInput) => Promise<DrimeFileEntry>
  deleteFile: (entryIds: string[], deleteForever?: boolean) => Promise<void>
}
