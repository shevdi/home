import type { ILink } from './links'

export interface UploadFileResult {
  ok: boolean
  fileName: string
  photo?: ILink
  error?: string
}

export interface UploadResponse {
  ok: boolean
  successCount?: number
  errorsCount?: number
  totalCount?: number
  results?: UploadFileResult[]
  error?: string
}

export interface UploadProgressEvent {
  type: 'progress'
  fileIndex: number
  result: UploadFileResult
}

export interface UploadCompleteEvent {
  type: 'complete'
  successCount: number
  errorsCount: number
  totalCount: number
}
