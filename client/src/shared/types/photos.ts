import type { IPhotoSearch as BaseIPhotoSearch } from '@shevdi-home/shared'

export type PhotoOrder = "orderDownByTakenAt" | "orderUpByTakenAt" | "orderDownByEdited" | ""

export interface IPhotoSearch extends BaseIPhotoSearch {
  dateFrom?: string
  dateTo?: string
  order?: PhotoOrder
}

export interface IPhotoSearchParams {
  dateFrom?: string | null
  dateTo?: string | null
  order?: PhotoOrder
  tags?: string[]
  country?: string[]
  city?: string[]
}
