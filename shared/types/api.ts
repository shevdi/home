import type { ILink } from './links'

export interface IPagination {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export interface IPhotosResponse {
  photos: ILink[]
  pagination: IPagination
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
