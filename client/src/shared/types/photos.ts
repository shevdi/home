import type { IPhotoSearch as BaseIPhotoSearch, PhotoOrder } from '@shevdi-home/shared'

export type { PhotoOrder }

export interface IPhotoSearch extends BaseIPhotoSearch {
  dateFrom?: string
  dateTo?: string
  order?: PhotoOrder
}
